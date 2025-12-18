import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    env: {
      GOOGLE_CLIENT_ID: Boolean(process.env.GOOGLE_CLIENT_ID),
      GOOGLE_CLIENT_SECRET: Boolean(process.env.GOOGLE_CLIENT_SECRET),
      GOOGLE_REDIRECT_URI: Boolean(process.env.GOOGLE_REDIRECT_URI),
      NEWS_API_KEY: Boolean(process.env.NEWS_API_KEY),
      GEMINI_API_KEY: Boolean(process.env.GEMINI_API_KEY),
    },
    hasTokensCookie: Boolean(request.cookies.get("g_tokens")?.value),
  });
}
