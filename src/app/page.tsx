"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { MusicPlayer } from "@/components/MusicPlayer";
import { TopBar } from "@/components/TopBar";
import { FALLBACK_TRACKS } from "@/data/playlist";
import type { PlaylistTrack } from "@/types/playlist";

const SPOTIFY_PLAYLIST_URL =
  process.env.NEXT_PUBLIC_SPOTIFY_PLAYLIST_URL ||
  `https://open.spotify.com/playlist/${process.env.NEXT_PUBLIC_SPOTIFY_PLAYLIST_ID || "6GRco1SVVhOWKd82dviVeb"}`;

function buildYtMusicUrl(track: PlaylistTrack | null): string {
  const configured = process.env.NEXT_PUBLIC_YT_MUSIC_URL;
  if (configured) return configured;
  if (track) {
    const q = encodeURIComponent(`${track.name} ${track.artists}`);
    return `https://music.youtube.com/search?q=${q}`;
  }
  return "https://music.youtube.com/";
}

export default function Home() {
  const [tracks, setTracks] = useState<PlaylistTrack[]>(FALLBACK_TRACKS);
  const [onlineCount, setOnlineCount] = useState(30);

  useEffect(() => {
    setOnlineCount(24 + Math.floor(Math.random() * 18));
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/playlist");
        const data = (await res.json()) as {
          tracks: PlaylistTrack[];
          error?: string;
        };
        if (!cancelled && data.tracks?.length) {
          setTracks(data.tracks);
        }
      } catch {
        if (!cancelled) setTracks(FALLBACK_TRACKS);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const ytMusicUrl = useMemo(
    () => buildYtMusicUrl(tracks[0] ?? null),
    [tracks],
  );

  return (
    <div className="relative h-dvh w-full overflow-hidden">
      <Image
        src="/images/background.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/45"
        aria-hidden
      />

      <TopBar ytMusicUrl={ytMusicUrl} onlineCount={onlineCount} />

      <main className="relative z-10 flex h-full items-center justify-center px-4 pb-28 pt-16">
        <h1
          className="notranslate animate-title-in text-center text-4xl font-normal leading-tight tracking-wide text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)] sm:text-6xl md:text-7xl lg:text-8xl"
          style={{ fontFamily: "var(--font-tiro-devanagari), serif" }}
          lang="hi"
          translate="no"
        >
          राजू भाई का सैलून
        </h1>
      </main>

      <MusicPlayer tracks={tracks} />

      <a
        href={SPOTIFY_PLAYLIST_URL}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
      >
        Spotify playlist
      </a>
    </div>
  );
}
