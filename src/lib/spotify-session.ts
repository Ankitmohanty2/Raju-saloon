import { cookies } from "next/headers";
import {
  refreshAccessToken,
  type SpotifyTokens,
} from "@/lib/spotify";

const COOKIE_NAME = "raju_spotify_tokens";

export async function saveTokens(tokens: SpotifyTokens): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE_NAME, JSON.stringify(tokens), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearTokens(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function readTokens(): Promise<SpotifyTokens | null> {
  const jar = await cookies();
  const raw = jar.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SpotifyTokens;
  } catch {
    return null;
  }
}

export async function getValidAccessToken(): Promise<string | null> {
  const tokens = await readTokens();
  if (!tokens) return null;

  if (Date.now() < tokens.expires_at - 60_000) {
    return tokens.access_token;
  }

  try {
    const next = await refreshAccessToken(tokens.refresh_token);
    await saveTokens(next);
    return next.access_token;
  } catch {
    await clearTokens();
    return null;
  }
}
