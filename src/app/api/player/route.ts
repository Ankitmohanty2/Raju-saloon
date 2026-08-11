import { NextRequest, NextResponse } from "next/server";
import { PLAYLIST_URI } from "@/lib/spotify";
import { getValidAccessToken } from "@/lib/spotify-session";

export async function PUT(req: NextRequest) {
  const token = await getValidAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = (await req.json()) as {
    device_id?: string;
    action?: "play" | "pause" | "next" | "previous" | "seek";
    position_ms?: number;
  };

  const deviceId = body.device_id;
  const qs = deviceId ? `?device_id=${encodeURIComponent(deviceId)}` : "";

  if (body.action === "pause") {
    const res = await fetch(`https://api.spotify.com/v1/me/player/pause${qs}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    return NextResponse.json({ ok: res.ok || res.status === 204 }, { status: res.ok || res.status === 204 ? 200 : res.status });
  }

  if (body.action === "next") {
    const res = await fetch(`https://api.spotify.com/v1/me/player/next${qs}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    return NextResponse.json({ ok: res.ok || res.status === 204 }, { status: res.ok || res.status === 204 ? 200 : res.status });
  }

  if (body.action === "previous") {
    const res = await fetch(`https://api.spotify.com/v1/me/player/previous${qs}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    return NextResponse.json({ ok: res.ok || res.status === 204 }, { status: res.ok || res.status === 204 ? 200 : res.status });
  }

  if (body.action === "seek" && typeof body.position_ms === "number") {
    const seekQs = new URLSearchParams({ position_ms: String(body.position_ms) });
    if (deviceId) seekQs.set("device_id", deviceId);
    const res = await fetch(
      `https://api.spotify.com/v1/me/player/seek?${seekQs.toString()}`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return NextResponse.json({ ok: res.ok || res.status === 204 }, { status: res.ok || res.status === 204 ? 200 : res.status });
  }

  const res = await fetch(`https://api.spotify.com/v1/me/player/play${qs}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      context_uri: PLAYLIST_URI,
    }),
  });

  if (res.status === 204 || res.ok) {
    return NextResponse.json({ ok: true });
  }

  const text = await res.text();
  return NextResponse.json({ error: text || "Play failed" }, { status: res.status });
}
