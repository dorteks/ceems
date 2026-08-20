import { NextResponse } from "next/server";
import { parseAndImportXlsx } from "../../../../server/services/importService";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();

    const result = await parseAndImportXlsx(buffer);

    return NextResponse.json(
      { message: "Import completed", ...result },
      { status: 201 },
    );
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error("Import failed:", err);
    return NextResponse.json(
      { error: err?.message || "Import failed" },
      { status: 500 },
    );
  }
}
