import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/spotify";
import { saveTokens } from "@/lib/spotify-session";

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  const origin = url.origin;
  const home = new URL("/", origin);

  if (error) {
    home.searchParams.set("auth_error", error);
    return NextResponse.redirect(home);
  }

  const jar = await cookies();
  const savedState = jar.get("raju_spotify_state")?.value;
  const verifier = jar.get("raju_spotify_verifier")?.value;

  if (!code || !state || !savedState || state !== savedState || !verifier) {
    home.searchParams.set("auth_error", "invalid_state");
    return NextResponse.redirect(home);
  }

  try {
    const tokens = await exchangeCodeForTokens(code, verifier);
    await saveTokens(tokens);
  } catch {
    home.searchParams.set("auth_error", "token_exchange");
    return NextResponse.redirect(home);
  }

  const res = NextResponse.redirect(home);
  res.cookies.delete("raju_spotify_state");
  res.cookies.delete("raju_spotify_verifier");
  return res;
}
