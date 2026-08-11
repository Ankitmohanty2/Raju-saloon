import { NextResponse } from "next/server";
import { FALLBACK_TRACKS } from "@/data/playlist";
import { env, requireSpotifyCredentials } from "@/lib/env";
import type { PlaylistTrack } from "@/types/playlist";

type TokenCache = {
  accessToken: string;
  expiresAt: number;
};

let tokenCache: TokenCache | null = null;

async function getAccessToken(): Promise<string> {
  const { clientId, clientSecret } = requireSpotifyCredentials();

  if (tokenCache && Date.now() < tokenCache.expiresAt - 60_000) {
    return tokenCache.accessToken;
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Spotify token failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };

  tokenCache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return data.access_token;
}

type SpotifyTrackItem = {
  track: {
    id: string;
    name: string;
    preview_url: string | null;
    duration_ms: number;
    artists: { name: string }[];
    album: {
      images: { url: string }[];
    };
  } | null;
};

type SpotifyPlaylistTracks = {
  items: SpotifyTrackItem[];
};

async function fetchTracks(accessToken: string): Promise<PlaylistTrack[]> {
  const playlistId = env.spotify.playlistId();
  const market = env.spotify.market();
  const limit = env.spotify.trackLimit();

  const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?market=${encodeURIComponent(market)}&limit=${limit}&fields=items(track(id,name,preview_url,duration_ms,artists(name),album(images)))`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Spotify playlist failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as SpotifyPlaylistTracks;
  const tracks: PlaylistTrack[] = [];

  for (const item of data.items) {
    const t = item.track;
    if (!t?.id) continue;
    tracks.push({
      id: t.id,
      name: t.name,
      artists: t.artists.map((a) => a.name).join(", "),
      albumArt: t.album.images[0]?.url ?? null,
      durationMs: t.duration_ms,
      previewUrl: t.preview_url,
    });
  }

  return tracks;
}

function playlistResponse(
  tracks: PlaylistTrack[],
  source: "spotify" | "fallback",
) {
  const playlistId = env.spotify.playlistId();
  return NextResponse.json({
    tracks,
    playlistId,
    playlistUri: env.spotify.playlistUri(),
    source,
  });
}

export async function GET() {
  try {
    const accessToken = await getAccessToken();
    const tracks = await fetchTracks(accessToken);
    if (tracks.length === 0) {
      return playlistResponse(FALLBACK_TRACKS, "fallback");
    }
    return playlistResponse(tracks, "spotify");
  } catch {
    return playlistResponse(FALLBACK_TRACKS, "fallback");
  }
}
