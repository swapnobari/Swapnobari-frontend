const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME|| "ckyx87om";

export function mediaUrl(src?: string | null): string | null {
  if (!src) return null;
  if (/^https?:\/\//.test(src)) return src;
  return `https://res.cloudinary.com/${CLOUD}/${src.replace(/^\//, "")}`;
}

// Returns an embeddable URL for YouTube / Vimeo, otherwise null
export function videoEmbed(url?: string | null): string | null {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return null;
}