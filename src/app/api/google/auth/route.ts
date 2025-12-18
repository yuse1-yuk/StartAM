import { NextResponse } from "next/server";

import { buildAuthUrl } from "@/lib/google";

export async function GET() {
  try {
    const url = buildAuthUrl();
    return NextResponse.redirect(url);
  } catch (error) {
    const message = error instanceof Error ? error.message : "設定エラー";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
