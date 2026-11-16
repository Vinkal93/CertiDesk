import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/db";

export async function GET() {
  try {
    const templates = await dataStore.getTemplates();
    return NextResponse.json({ success: true, templates });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const template = await req.json();
    if (!template.title || !template.id) {
      return NextResponse.json(
        { success: false, error: "Template title and ID are required" },
        { status: 400 }
      );
    }
    const saved = await dataStore.saveTemplate(template);
    return NextResponse.json({
      success: true,
      message: "Template saved and versioned successfully",
      template: saved,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
