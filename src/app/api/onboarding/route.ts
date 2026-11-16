import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth/token";
import { dataStore } from "@/lib/db";
import { adminDb } from "@/lib/firebase/admin";
import { OnboardingState } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("cdp_session_token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const payload = await verifySessionToken(token);
    if (!payload || !payload.instituteId) {
      return NextResponse.json({ success: false, error: "Invalid session or no institute associated." }, { status: 401 });
    }

    const instituteId = payload.instituteId;
    let state = await dataStore.getOnboardingState(instituteId);

    // If state doesn't exist yet, initialize it
    if (!state) {
      const inst = await dataStore.getInstitute(instituteId);
      state = {
        instituteId,
        step: 1,
        isCompleted: inst?.onboarding_completed ?? false,
        personalInfo: {
          ownerName: inst?.ownerName || "",
          directorName: inst?.ownerName || "",
          contactNumber: inst?.mobile || "",
          email: inst?.email || "",
          designation: "Director",
        },
        instituteInfo: {
          name: inst?.name || "",
          address: inst?.address || "",
          officialEmail: inst?.email || "",
          establishedYear: "2020",
          instituteType: inst?.institute_type || "Computer Education Institute",
        },
        academicConfig: {
          academicSession: "2026-2027",
          studentIdPrefix: inst?.code || "SBCI",
          courseCategories: ["Diploma", "Typing", "Certificate"],
        },
        branding: {
          primaryColor: "#0F172A",
          secondaryColor: "#4F46E5",
        },
        updatedAt: new Date().toISOString(),
      };
      await dataStore.saveOnboardingState(state);
    }

    const responseState = {
      ...state,
      personalInfoCompleted: Boolean(state.personalInfo?.ownerName || state.personalInfoCompleted),
      instituteInfoCompleted: Boolean(state.instituteInfo?.name || state.instituteInfoCompleted),
      academicConfigCompleted: Boolean(state.academicConfig?.academicSession || state.academicConfigCompleted),
      brandingCompleted: Boolean(state.branding?.primaryColor || state.brandingCompleted),
      isSkipped: Boolean(state.isSkipped),
    };

    return NextResponse.json({ success: true, onboarding: responseState });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("cdp_session_token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    const payload = await verifySessionToken(token);
    if (!payload || !payload.instituteId) {
      return NextResponse.json({ success: false, error: "Invalid session." }, { status: 401 });
    }

    const instituteId = payload.instituteId;
    const body = await request.json();

    const currentState = (await dataStore.getOnboardingState(instituteId)) || {
      instituteId,
      step: 1,
      isCompleted: false,
      updatedAt: new Date().toISOString(),
    };

    const action = body.action || (body.skipForLater ? "skip" : body.isCompleted ? "complete" : "save_step");

    if (action === "skip" || body.skipForLater) {
      // Skip for later: preserve all entered info, mark incomplete, and allow redirect
      currentState.isCompleted = false;
      currentState.isSkipped = true;
      await dataStore.saveOnboardingState(currentState);

      dataStore.logAudit({
        instituteId,
        userId: payload.displayName || "Admin",
        userEmail: payload.email,
        action: "ONBOARDING_SKIPPED",
        targetType: "institute",
        targetId: instituteId,
        details: `Institute skipped onboarding setup at step ${currentState.step}. Resumable from dashboard.`,
      });

      return NextResponse.json({
        success: true,
        message: "Onboarding deferred. You can complete setup anytime from your dashboard.",
        onboarding: {
          ...currentState,
          isSkipped: true,
          personalInfoCompleted: Boolean(currentState.personalInfo?.ownerName || currentState.personalInfoCompleted),
          instituteInfoCompleted: Boolean(currentState.instituteInfo?.name || currentState.instituteInfoCompleted),
          academicConfigCompleted: Boolean(currentState.academicConfig?.academicSession || currentState.academicConfigCompleted),
          brandingCompleted: Boolean(currentState.branding?.primaryColor || currentState.brandingCompleted),
        },
        redirectUrl: "/dashboard",
      });
    }

    // Merge Step Data
    if (body.personalInfo) {
      currentState.personalInfo = { ...currentState.personalInfo, ...body.personalInfo };
      currentState.personalInfoCompleted = true;
    }
    if (body.instituteInfo) {
      currentState.instituteInfo = { ...currentState.instituteInfo, ...body.instituteInfo };
      currentState.instituteInfoCompleted = true;
      if (body.instituteInfo.name || body.instituteInfo.logoUrl) {
        await dataStore.updateInstitute(instituteId, {
          name: body.instituteInfo.name || undefined,
          logoUrl: body.instituteInfo.logoUrl || undefined,
        });
      }
    }
    if (body.academicConfig) {
      currentState.academicConfig = { ...currentState.academicConfig, ...body.academicConfig };
      currentState.academicConfigCompleted = true;
    }
    if (body.branding) {
      currentState.branding = { ...currentState.branding, ...body.branding };
      currentState.brandingCompleted = true;
    }

    if (body.step) {
      currentState.step = Number(body.step);
    }

    const isCompletion = action === "complete" || body.isCompleted === true;
    if (isCompletion) {
      currentState.isCompleted = true;
      currentState.step = 6;
      await dataStore.updateInstitute(instituteId, { onboarding_completed: true });
    }

    currentState.updatedAt = new Date().toISOString();
    await dataStore.saveOnboardingState(currentState);

    // Sync to Firestore if available
    if (adminDb) {
      try {
        const instRef = adminDb.collection("institutes").doc(instituteId);
        await instRef.set({ onboarding_completed: currentState.isCompleted }, { merge: true });

        if (body.personalInfo) {
          await instRef.collection("settings").doc("general").set(body.personalInfo, { merge: true });
        }
        if (body.academicConfig) {
          await instRef.collection("settings").doc("academic").set(body.academicConfig, { merge: true });
        }
        if (body.branding) {
          await instRef.collection("settings").doc("branding").set(body.branding, { merge: true });
        }
      } catch (dbErr: any) {
        console.warn("Firestore onboarding sync warning:", dbErr.message);
      }
    }

    dataStore.logAudit({
      instituteId,
      userId: payload.displayName || "Admin",
      userEmail: payload.email,
      action: isCompletion ? "ONBOARDING_COMPLETED" : "ONBOARDING_PROGRESS",
      targetType: "institute",
      targetId: instituteId,
      details: isCompletion
        ? `Institute setup 100% completed by ${payload.email}.`
        : `Onboarding progress saved for step ${currentState.step}.`,
    });

    return NextResponse.json({
      success: true,
      message: isCompletion ? "Onboarding completed successfully!" : "Progress saved.",
      onboarding: currentState,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
