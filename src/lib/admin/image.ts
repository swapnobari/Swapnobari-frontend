export type Focus = "center" | "top" | "bottom" | "left" | "right";

export type ImageSpec = {
  width: number;
  height: number;
  mode?: "cover" | "contain"; // cover = crop to exact ratio, contain = never crop
  format?: "jpeg" | "png";
  quality?: number;
  focus?: Focus;
  note?: string;
};

export type Prepared = {
  file: File;
  url: string;
  width: number;
  height: number;
  kb: number;
  warning?: string;
};

export const FOCUS_LABEL: Record<Focus, string> = {
  center: "Center",
  top: "Top",
  bottom: "Bottom",
  left: "Left",
  right: "Right",
};

const FOCUS_POINT: Record<Focus, [number, number]> = {
  center: [0.5, 0.5],
  top: [0.5, 0],
  bottom: [0.5, 1],
  left: [0, 0.5],
  right: [1, 0.5],
};

const ACCEPT = ["image/jpeg", "image/png", "image/webp"];
const MAX_UPLOAD = 3.5 * 1024 * 1024; // stays under the 4.5 MB request limit

async function load(file: File) {
  if (typeof createImageBitmap === "function") {
    try {
      const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
      return { src: bmp as CanvasImageSource, w: bmp.width, h: bmp.height, done: () => bmp.close() };
    } catch {}
  }
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.src = url;
  await img.decode();
  return {
    src: img as CanvasImageSource,
    w: img.naturalWidth,
    h: img.naturalHeight,
    done: () => URL.revokeObjectURL(url),
  };
}

const toBlob = (c: HTMLCanvasElement, type: string, q?: number) =>
  new Promise<Blob | null>((resolve) => c.toBlob(resolve, type, q));

export async function prepareImage(
  file: File,
  spec: ImageSpec,
  focus: Focus = spec.focus ?? "center"
): Promise<Prepared> {
  if (!ACCEPT.includes(file.type)) throw new Error("Please choose a JPG, PNG or WebP image.");
  if (file.size > 40 * 1024 * 1024) throw new Error("This image is over 40 MB. Please choose a smaller one.");

  let img;
  try {
    img = await load(file);
  } catch {
    throw new Error("This image could not be read. Try another file.");
  }

  try {
    const mode = spec.mode ?? "cover";
    const format = spec.format ?? "jpeg";
    let sx = 0;
    let sy = 0;
    let sw = img.w;
    let sh = img.h;
    let ow: number;
    let oh: number;
    let warning: string | undefined;

    if (mode === "cover") {
      const ratio = spec.width / spec.height;
      if (img.w / img.h > ratio) {
        sh = img.h;
        sw = Math.round(img.h * ratio);
      } else {
        sw = img.w;
        sh = Math.round(img.w / ratio);
      }
      const [fx, fy] = FOCUS_POINT[focus];
      sx = Math.round((img.w - sw) * fx);
      sy = Math.round((img.h - sh) * fy);
      ow = Math.min(spec.width, sw);
      oh = Math.round(ow / ratio);
      if (sw < spec.width * 0.7) {
        warning = `This image is small (${img.w}×${img.h}px) and may look soft. Use one at least ${spec.width}px wide if you can.`;
      }
    } else {
      const scale = Math.min(1, spec.width / img.w, spec.height / img.h);
      ow = Math.max(1, Math.round(img.w * scale));
      oh = Math.max(1, Math.round(img.h * scale));
    }

    const canvas = document.createElement("canvas");
    canvas.width = ow;
    canvas.height = oh;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Your browser could not process this image.");
    ctx.imageSmoothingQuality = "high";
    if (format === "jpeg") {
      ctx.fillStyle = "#ffffff"; // transparent PNGs would otherwise turn black
      ctx.fillRect(0, 0, ow, oh);
    }
    ctx.drawImage(img.src, sx, sy, sw, sh, 0, 0, ow, oh);

    const type = format === "png" ? "image/png" : "image/jpeg";
    let q = spec.quality ?? 0.85;
    let blob = await toBlob(canvas, type, q);
    while (blob && format === "jpeg" && blob.size > MAX_UPLOAD && q > 0.5) {
      q -= 0.1;
      blob = await toBlob(canvas, type, q);
    }
    if (!blob) throw new Error("Could not prepare this image. Try another file.");
    if (blob.size > MAX_UPLOAD) {
      throw new Error("This image is still over 3.5 MB after compression. Please choose a smaller one.");
    }

    const base =
      file.name.replace(/\.[^.]+$/, "").replace(/[^\w-]+/g, "-").slice(0, 60) || "image";
    const out = new File([blob], `${base}.${format === "png" ? "png" : "jpg"}`, { type });

    return {
      file: out,
      url: URL.createObjectURL(out),
      width: ow,
      height: oh,
      kb: Math.round(out.size / 1024),
      warning,
    };
  } finally {
    img.done();
  }
}