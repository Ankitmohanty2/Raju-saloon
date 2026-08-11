"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PlaylistTrack } from "@/types/playlist";

const VOLUME_KEY = "raju-saloon-volume";

type YoutubeMatch = {
  videoId: string;
  title: string;
  channel: string;
  thumbnail: string | null;
};

type YTPlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  setVolume: (volume: number) => void;
  getVolume: () => number;
  mute: () => void;
  unMute: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  cueVideoById: (videoId: string) => void;
  loadVideoById: (videoId: string) => void;
  destroy: () => void;
};

declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string,
        options: {
          height?: string | number;
          width?: string | number;
          host?: string;
          videoId?: string;
          playerVars?: Record<string, number | string>;
          events?: {
            onReady?: (e: { target: YTPlayer }) => void;
            onStateChange?: (e: { data: number; target: YTPlayer }) => void;
            onError?: (e: { data: number }) => void;
          };
        },
      ) => YTPlayer;
      PlayerState: {
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

function loadYoutubeApi(): Promise<void> {
  return new Promise((resolve) => {
    if (window.YT?.Player) {
      resolve();
      return;
    }
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    if (!document.getElementById("youtube-iframe-api")) {
      const script = document.createElement("script");
      script.id = "youtube-iframe-api";
      script.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(script);
    }
  });
}

type MusicPlayerProps = {
  tracks: PlaylistTrack[];
};

export function MusicPlayer({ tracks }: MusicPlayerProps) {
  const playerRef = useRef<YTPlayer | null>(null);
  const resolveCache = useRef<Map<string, YoutubeMatch>>(new Map());
  const indexRef = useRef(0);
  const autoplayRef = useRef(false);

  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [muted, setMuted] = useState(false);
  const [match, setMatch] = useState<YoutubeMatch | null>(null);
  const [loadingTrack, setLoadingTrack] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const track = tracks[index] ?? null;
  indexRef.current = index;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(VOLUME_KEY);
      if (saved != null) {
        const v = Number(saved);
        if (!Number.isNaN(v) && v >= 0 && v <= 1) setVolume(v);
      }
    } catch {
      
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(VOLUME_KEY, String(volume));
    } catch {
      
    }
  }, [volume]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      await loadYoutubeApi();
      if (cancelled || !window.YT) return;

      playerRef.current = new window.YT.Player("raju-yt-player", {
        height: 1,
        width: 1,
        host: "https://www.youtube-nocookie.com",
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          iv_load_policy: 3,
          origin: window.location.origin,
        },
        events: {
          onReady: (e) => {
            playerRef.current = e.target;
            e.target.setVolume(Math.round(volume * 100));
            setReady(true);
          },
          onStateChange: (e) => {
            const YT = window.YT;
            if (!YT) return;
            if (e.data === YT.PlayerState.PLAYING) {
              setPlaying(true);
              setDuration(e.target.getDuration() || 0);
            } else if (e.data === YT.PlayerState.PAUSED) {
              setPlaying(false);
            } else if (e.data === YT.PlayerState.ENDED) {
              setPlaying(false);
              autoplayRef.current = true;
              const next = (indexRef.current + 1) % Math.max(tracks.length, 1);
              setIndex(next);
            }
          },
          onError: () => {
            setError("Could not play this video, skipping…");
            autoplayRef.current = true;
            const next = (indexRef.current + 1) % Math.max(tracks.length, 1);
            setIndex(next);
          },
        },
      });
    })();

    return () => {
      cancelled = true;
      try {
        playerRef.current?.destroy();
      } catch {
        
      }
      playerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const player = playerRef.current;
    if (!player || !ready) return;
    if (muted) {
      player.mute();
    } else {
      player.unMute();
      player.setVolume(Math.round(volume * 100));
    }
  }, [volume, muted, ready]);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      setCurrentTime(player.getCurrentTime() || 0);
      setDuration(player.getDuration() || 0);
    }, 400);
    return () => window.clearInterval(id);
  }, [playing]);

  const resolveTrack = useCallback(async (t: PlaylistTrack) => {
    const cacheKey = t.id;
    const cached = resolveCache.current.get(cacheKey);
    if (cached) return cached;

    const q = `${t.name} ${t.artists}`;
    const res = await fetch(`/api/youtube/resolve?q=${encodeURIComponent(q)}`);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(data.error || "YouTube resolve failed");
    }
    const data = (await res.json()) as YoutubeMatch;
    resolveCache.current.set(cacheKey, data);
    return data;
  }, []);
  useEffect(() => {
    if (tracks.length === 0) return;
    const next = tracks[(index + 1) % tracks.length];
    if (!next || resolveCache.current.has(next.id)) return;
    void resolveTrack(next).catch(() => undefined);
  }, [index, tracks, resolveTrack]);

  useEffect(() => {
    if (!ready || !track) return;
    let cancelled = false;

    void (async () => {
      setLoadingTrack(true);
      setError(null);
      setCurrentTime(0);
      try {
        const found = await resolveTrack(track);
        if (cancelled) return;
        setMatch(found);
        const player = playerRef.current;
        if (!player) return;
        const shouldPlay = autoplayRef.current || playing;
        if (shouldPlay) {
          autoplayRef.current = false;
          player.loadVideoById(found.videoId);
        } else {
          player.cueVideoById(found.videoId);
        }
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : "Could not find YouTube video";
        setError(message);
        setMatch(null);
      } finally {
        if (!cancelled) setLoadingTrack(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, track?.id, resolveTrack]);

  const togglePlay = () => {
    const player = playerRef.current;
    if (!player || !match) return;
    if (playing) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  };

  const goTo = (nextIndex: number) => {
    if (tracks.length === 0) return;
    const wrapped = ((nextIndex % tracks.length) + tracks.length) % tracks.length;
    autoplayRef.current = true;
    setPlaying(true);
    setIndex(wrapped);
  };

  const seek = (value: number) => {
    setCurrentTime(value);
    playerRef.current?.seekTo(value, true);
  };

  const displayTitle = track?.name || "Loading…";
  const displayArtist = track?.artists || "Indian barber's playlist";
  const art = track?.albumArt;

  if (tracks.length === 0) {
    return (
      <div className="animate-fade-in-up absolute bottom-5 left-1/2 z-20 w-[min(96vw,560px)] -translate-x-1/2 sm:bottom-7">
        <div className="glass-pill rounded-full px-5 py-4 text-center text-sm text-white/80">
          Loading playlist…
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up absolute bottom-5 left-1/2 z-20 w-[min(96vw,640px)] -translate-x-1/2 sm:bottom-7">
      
      <div className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0">
        <div id="raju-yt-player" />
      </div>

      <div className="glass-pill flex items-center gap-3 rounded-full px-2.5 py-2 shadow-2xl sm:gap-4 sm:px-3 sm:py-2.5">
        <div
          className={`vinyl-disc relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-zinc-900 sm:h-[4.75rem] sm:w-[4.75rem] ${
            playing && match ? "is-spinning" : "is-paused"
          }`}
        >
          {art ? (
            <img
              key={track?.id ?? art}
              src={art}
              alt=""
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-white/50">
              ♪
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white sm:text-[15px]">
            {loadingTrack ? "Finding song…" : displayTitle}
          </p>
          <p className="truncate text-xs text-white/60 sm:text-sm">
            {displayArtist}
          </p>

          <div className="mt-1.5">
            <input
              type="range"
              className="progress-slider"
              min={0}
              max={duration || 1}
              step={0.25}
              value={Math.min(currentTime, duration || 1)}
              onChange={(e) => seek(Number(e.target.value))}
              aria-label="Seek"
              disabled={!match}
            />
          </div>
          <p className="mt-0.5 text-[10px] tabular-nums text-white/50 sm:text-xs">
            {formatTime(currentTime)} / {formatTime(duration)}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            className="cursor-pointer rounded-full p-1.5 text-white transition hover:bg-white/10"
            aria-label="Previous track"
          >
            <PrevIcon />
          </button>
          <button
            type="button"
            onClick={togglePlay}
            disabled={!match || !ready}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white text-black transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 sm:h-11 sm:w-11"
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            className="cursor-pointer rounded-full p-1.5 text-white transition hover:bg-white/10"
            aria-label="Next track"
          >
            <NextIcon />
          </button>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            className="rounded-full p-1.5 text-white transition hover:bg-white/10"
            aria-label={muted || volume === 0 ? "Unmute" : "Mute"}
          >
            {muted || volume === 0 ? <VolumeMuteIcon /> : <VolumeIcon />}
          </button>
          <input
            type="range"
            className="volume-slider w-20"
            min={0}
            max={1}
            step={0.01}
            value={muted ? 0 : volume}
            onChange={(e) => {
              const v = Number(e.target.value);
              setVolume(v);
              if (v > 0) setMuted(false);
            }}
            aria-label="Volume"
          />
        </div>

        <div className="flex items-center gap-1 sm:hidden">
          <button
            type="button"
            onClick={() => {
              if (muted || volume === 0) {
                setMuted(false);
                setVolume((v) => (v === 0 ? 0.7 : v));
              } else {
                setVolume((v) => Math.max(0, Math.round((v - 0.1) * 100) / 100));
              }
            }}
            className="rounded-full p-1.5 text-white transition hover:bg-white/10"
            aria-label="Volume down"
          >
            <VolumeDownIcon />
          </button>
          <button
            type="button"
            onClick={() => {
              setMuted(false);
              setVolume((v) => Math.min(1, Math.round((v + 0.1) * 100) / 100));
            }}
            className="rounded-full p-1.5 text-white transition hover:bg-white/10"
            aria-label="Volume up"
          >
            <VolumeUpIcon />
          </button>
        </div>
      </div>

      {error ? (
        <p className="mt-2 text-center text-[11px] text-amber-100/90 drop-shadow sm:text-xs">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6 5h4v14H6zm8 0h4v14h-4z" />
    </svg>
  );
}

function PrevIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
    </svg>
  );
}

function NextIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z" />
    </svg>
  );
}

function VolumeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3 10v4h4l5 5V5L7 10H3zm13.5 2c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  );
}

function VolumeMuteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v4h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z" />
    </svg>
  );
}

function VolumeDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
    </svg>
  );
}

function VolumeUpIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  );
}
