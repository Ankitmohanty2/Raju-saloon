import { NextRequest, NextResponse } from "next/server";
import { searchYoutubeVideo } from "@/lib/youtube";

const cache = new Map<string, { videoId: string; title: string; channel: string; thumbnail: string | null }>();

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json({ error: "Missing q" }, { status: 400 });
  }

  const key = q.toLowerCase();
  const hit = cache.get(key);
  if (hit) {
    return NextResponse.json(hit);
  }

  try {
    const match = await searchYoutubeVideo(q);
    if (!match) {
      return NextResponse.json({ error: "No video found" }, { status: 404 });
    }
    cache.set(key, match);
    return NextResponse.json(match);
  } catch (err) {
    const message = err instanceof Error ? err.message : "YouTube error";
    const status = message.includes("Missing YOUTUBE_API_KEY") ? 500 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
