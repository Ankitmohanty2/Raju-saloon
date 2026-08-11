export type YoutubeMatch = {
  videoId: string;
  title: string;
  channel: string;
  thumbnail: string | null;
};

export async function searchYoutubeVideo(
  query: string,
): Promise<YoutubeMatch | null> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    throw new Error("Missing YOUTUBE_API_KEY");
  }

  const params = new URLSearchParams({
    part: "snippet",
    type: "video",
    maxResults: "1",
    videoCategoryId: "10",
    q: query,
    key,
  });

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?${params.toString()}`,
    { cache: "force-cache", next: { revalidate: 86400 } },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`YouTube search failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as {
    items?: {
      id: { videoId: string };
      snippet: {
        title: string;
        channelTitle: string;
        thumbnails?: { medium?: { url: string }; default?: { url: string } };
      };
    }[];
  };

  const item = data.items?.[0];
  if (!item?.id?.videoId) return null;

  return {
    videoId: item.id.videoId,
    title: item.snippet.title,
    channel: item.snippet.channelTitle,
    thumbnail:
      item.snippet.thumbnails?.medium?.url ??
      item.snippet.thumbnails?.default?.url ??
      null,
  };
}
