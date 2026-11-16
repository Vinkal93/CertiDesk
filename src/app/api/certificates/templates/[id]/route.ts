import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const template = await dataStore.getTemplateById(id);
    if (!template) {
      return NextResponse.json({ success: false, error: "Template not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, template });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await dataStore.deleteOrArchiveTemplate(id);
    if (!success) {
      return NextResponse.json({ success: false, error: "Template not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Template deleted or archived" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
