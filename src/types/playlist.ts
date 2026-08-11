export type PlaylistTrack = {
  id: string;
  name: string;
  artists: string;
  albumArt: string | null;
  durationMs: number;
  previewUrl: string | null;
};

export type PlaylistResponse = {
  tracks: PlaylistTrack[];
  error?: string;
};
