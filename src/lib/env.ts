const DEFAULT_PLAYLIST_ID = "6GRco1SVVhOWKd82dviVeb";

function read(name: string): string {
  return (process.env[name] || "").trim();
}

function readOr(name: string, fallback: string): string {
  const value = read(name);
  return value || fallback;
}

export const env = {
  spotify: {
    clientId: () => read("SPOTIFY_CLIENT_ID"),
    clientSecret: () => read("SPOTIFY_CLIENT_SECRET"),
    playlistId: () =>
      readOr(
        "SPOTIFY_PLAYLIST_ID",
        readOr("NEXT_PUBLIC_SPOTIFY_PLAYLIST_ID", DEFAULT_PLAYLIST_ID),
      ),
    market: () => readOr("SPOTIFY_MARKET", "IN"),
    trackLimit: () => {
      const raw = Number(readOr("SPOTIFY_TRACK_LIMIT", "50"));
      if (!Number.isFinite(raw) || raw <= 0) return 50;
      return Math.min(Math.floor(raw), 100);
    },
    redirectUri: () =>
      readOr(
        "SPOTIFY_REDIRECT_URI",
        "http://127.0.0.1:3000/api/auth/callback",
      ),
    playlistUri: () => `spotify:playlist:${env.spotify.playlistId()}`,
    hasCredentials: () =>
      Boolean(env.spotify.clientId() && env.spotify.clientSecret()),
  },
  youtube: {
    apiKey: () => read("YOUTUBE_API_KEY"),
    hasApiKey: () => Boolean(env.youtube.apiKey()),
  },
  public: {
    playlistId: () =>
      readOr("NEXT_PUBLIC_SPOTIFY_PLAYLIST_ID", DEFAULT_PLAYLIST_ID),
    playlistUrl: () =>
      readOr(
        "NEXT_PUBLIC_SPOTIFY_PLAYLIST_URL",
        `https://open.spotify.com/playlist/${readOr("NEXT_PUBLIC_SPOTIFY_PLAYLIST_ID", DEFAULT_PLAYLIST_ID)}`,
      ),
    ytMusicUrl: () => read("NEXT_PUBLIC_YT_MUSIC_URL"),
    siteName: () =>
      readOr("NEXT_PUBLIC_SITE_NAME", "Raju Bhai Ka Saloon"),
    siteUrl: () => read("NEXT_PUBLIC_SITE_URL"),
  },
  isProd: () => process.env.NODE_ENV === "production",
};

export function requireSpotifyCredentials(): {
  clientId: string;
  clientSecret: string;
} {
  const clientId = env.spotify.clientId();
  const clientSecret = env.spotify.clientSecret();
  if (!clientId || !clientSecret) {
    throw new Error("Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET");
  }
  return { clientId, clientSecret };
}

export function requireYoutubeApiKey(): string {
  const key = env.youtube.apiKey();
  if (!key) throw new Error("Missing YOUTUBE_API_KEY");
  return key;
}
