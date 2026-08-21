import { NextResponse } from "next/server";
import { parseAndImportXlsx } from "../../../../server/services/importService";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const commit = String(form.get("commit") || "false") === "true";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();

    const result = await parseAndImportXlsx(buffer, { commit });

    return NextResponse.json(
      { message: commit ? "Import completed" : "Preview generated", ...result },
      { status: 201 },
    );
  } catch (err: unknown) {
    console.error("Import failed:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: message || "Import failed" },
      { status: 500 },
    );
  }
}
