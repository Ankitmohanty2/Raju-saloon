import { NextResponse } from "next/server";
import {
  challengeFromVerifier,
  generateRandomString,
  getRedirectUri,
  SPOTIFY_SCOPES,
} from "@/lib/spotify";

export async function GET() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "SPOTIFY_CLIENT_ID is not set" },
      { status: 500 },
    );
  }

  const verifier = generateRandomString(64);
  const state = generateRandomString(32);
  const challenge = challengeFromVerifier(verifier);

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: getRedirectUri(),
    scope: SPOTIFY_SCOPES,
    state,
    code_challenge_method: "S256",
    code_challenge: challenge,
  });

  const res = NextResponse.redirect(
    `https://accounts.spotify.com/authorize?${params.toString()}`,
  );

  res.cookies.set("raju_spotify_verifier", verifier, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
    secure: process.env.NODE_ENV === "production",
  });
  res.cookies.set("raju_spotify_state", state, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
    secure: process.env.NODE_ENV === "production",
  });

  return res;
}
