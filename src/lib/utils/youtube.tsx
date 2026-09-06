import React from "react";

/**
 * YouTube Utility Functions
 * Handles URL parsing, ID extraction, thumbnail generation, and embed URL building.
 */

/**
 * Extracts 11-character YouTube video ID from various URL formats:
 * - https://www.youtube.com/watch?v=dQw4w9WgXcQ
 * - https://youtu.be/dQw4w9WgXcQ
 * - https://www.youtube.com/embed/dQw4w9WgXcQ
 * - https://www.youtube.com/shorts/dQw4w9WgXcQ
 * - https://m.youtube.com/watch?v=dQw4w9WgXcQ
 * - dQw4w9WgXcQ (raw ID)
 */
export function extractYoutubeVideoId(urlOrId: string | null | undefined): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();

  // If already an 11-character ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = trimmed.match(regExp);

  return match && match[1] && match[1].length === 11 ? match[1] : null;
}

/**
 * Checks if a string is a valid YouTube URL or ID
 */
export function isValidYoutubeUrl(url: string | null | undefined): boolean {
  return extractYoutubeVideoId(url) !== null;
}

/**
 * Builds an optimized, distraction-free YouTube embed URL
 */
export function getYoutubeEmbedUrl(
  urlOrId: string | null | undefined,
  options?: {
    autoplay?: boolean;
    rel?: number;
    modestbranding?: number;
    controls?: number;
  }
): string | null {
  const videoId = extractYoutubeVideoId(urlOrId);
  if (!videoId) return null;

  const params = new URLSearchParams({
    rel: String(options?.rel ?? 0),
    modestbranding: String(options?.modestbranding ?? 1),
    iv_load_policy: "3",
    playsinline: "1",
    controls: String(options?.controls ?? 1),
  });

  if (options?.autoplay) {
    params.set("autoplay", "1");
  }

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

/**
 * Returns the highest resolution available thumbnail for a YouTube video
 */
export function getYoutubeThumbnailUrl(urlOrId: string | null | undefined): string | null {
  const videoId = extractYoutubeVideoId(urlOrId);
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Standard YouTube Icon SVG component
 */
export function YoutubeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}
