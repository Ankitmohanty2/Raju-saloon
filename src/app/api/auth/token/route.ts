import { NextResponse } from "next/server";
import { getValidAccessToken } from "@/lib/spotify-session";

export async function GET() {
  const token = await getValidAccessToken();
  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, access_token: token });
}
