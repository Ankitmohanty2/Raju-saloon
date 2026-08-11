"use client";

import { useEffect, useState } from "react";

const SPOTIFY_PLAYLIST_URL =
  process.env.NEXT_PUBLIC_SPOTIFY_PLAYLIST_URL ||
  "https://open.spotify.com/playlist/6GRco1SVVhOWKd82dviVeb";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatDateTime(date: Date): { time: string; dateLine: string } {
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  const period = hours >= 12 ? "pm" : "am";
  const hour12 = hours % 12 || 12;
  const day = DAYS[date.getDay()];
  const month = MONTHS[date.getMonth()];
  const dateNum = date.getDate();
  const year = date.getFullYear();

  return {
    time: `${hour12}:${minutes}:${seconds} ${period}`,
    dateLine: `${day}, ${month} ${dateNum}, ${year}`,
  };
}

type TopBarProps = {
  ytMusicUrl: string;
  onlineCount: number;
};

export function TopBar({ ytMusicUrl, onlineCount }: TopBarProps) {
  const [clock, setClock] = useState({ time: "", dateLine: "" });

  useEffect(() => {
    const tick = () => setClock(formatDateTime(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <header className="animate-fade-in-up absolute inset-x-0 top-0 z-20 px-4 py-4 sm:px-6">
      <div className="relative flex items-start justify-between gap-3">
        <div className="z-10 min-w-0 max-w-[42%] text-left text-white/95 drop-shadow-sm">
          <p className="text-sm font-medium tracking-wide tabular-nums sm:text-base">
            {clock.time || "—"}
          </p>
          <p className="mt-0.5 truncate text-[11px] text-white/75 sm:text-xs">
            {clock.dateLine || "—"}
          </p>
        </div>

        <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 text-sm text-white/95 drop-shadow-sm sm:text-base">
          <span
            className="animate-soft-pulse inline-block h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
            aria-hidden
          />
          <span className="pointer-events-auto whitespace-nowrap">
            {onlineCount} online
          </span>
        </div>

        <div className="z-10 flex shrink-0 items-center gap-2">
          <a
            href={SPOTIFY_PLAYLIST_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-pill flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/15 sm:text-sm"
          >
            <SpotifyIcon />
            Spotify
            <ExternalIcon />
          </a>
          <a
            href={ytMusicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-pill flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/15 sm:text-sm"
          >
            <YtMusicIcon />
            YT Music
            <ExternalIcon />
          </a>
        </div>
      </div>
    </header>
  );
}

function ExternalIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="opacity-70"
    >
      <path d="M7 17L17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

function SpotifyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}

function YtMusicIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm0 19.104c-3.924 0-7.104-3.18-7.104-7.104S8.076 4.896 12 4.896s7.104 3.18 7.104 7.104-3.18 7.104-7.104 7.104zm0-13.332c-3.432 0-6.228 2.796-6.228 6.228S8.568 18.228 12 18.228s6.228-2.796 6.228-6.228S15.432 5.772 12 5.772zM9.684 15.54V8.46L16.5 12l-6.816 3.54z" />
    </svg>
  );
}
