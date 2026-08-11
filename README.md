# राजू भाई का सैलून

## Setup

1. `npm install`
2. `copy .env.example .env.local`
3. Fill in keys in `.env.local`
4. `npm run dev`

## Environment

All config lives in `.env.local` (see `.env.example`).

| Variable | Required | Purpose |
|---|---|---|
| `SPOTIFY_CLIENT_ID` | for live Spotify sync | Spotify app client id |
| `SPOTIFY_CLIENT_SECRET` | for live Spotify sync | Spotify app secret |
| `SPOTIFY_PLAYLIST_ID` | no | playlist id (default set) |
| `SPOTIFY_MARKET` | no | market code (`IN`) |
| `SPOTIFY_TRACK_LIMIT` | no | tracks to fetch (max 100) |
| `YOUTUBE_API_KEY` | yes for audio | YouTube Data API key |
| `NEXT_PUBLIC_SPOTIFY_PLAYLIST_URL` | no | Spotify button link |
| `NEXT_PUBLIC_YT_MUSIC_URL` | no | YT Music button link |
| `NEXT_PUBLIC_SITE_NAME` | no | site title |
| `NEXT_PUBLIC_SITE_URL` | no | site url |

Server code reads env through `src/lib/env.ts`.

## License

Proprietary — All Rights Reserved. See [LICENSE](LICENSE).
