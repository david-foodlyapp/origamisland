export function normalizeApiImageUrl(image: string) {
  const markdownMatch = image.match(/\((https?:\/\/[^)]+)\)/);
  if (markdownMatch?.[1]) {
    return markdownMatch[1];
  }

  return image.trim();
}

type OptimizedImageOptions = {
  width: number;
  height?: number;
  crop?: "fill" | "fit" | "limit";
  gravity?: string;
  quality?: "auto" | "auto:eco" | "auto:good";
};

export function getOptimizedImageUrl(image: string, options: OptimizedImageOptions) {
  const url = normalizeApiImageUrl(image);
  if (!url || !url.includes("res.cloudinary.com") || !url.includes("/image/upload/")) {
    return url;
  }

  const transform = [
    "f_auto",
    `q_${options.quality || "auto:eco"}`,
    `c_${options.crop || "fill"}`,
    `w_${options.width}`,
    options.height ? `h_${options.height}` : "",
    options.gravity ? `g_${options.gravity}` : ""
  ].filter(Boolean).join(",");

  return url.replace(/\/image\/upload\/(?:[^/]+\/)?(?=v\d+\/)/, `/image/upload/${transform}/`);
}

export function getResponsiveImageSrcSet(image: string, widths: number[], options: Omit<OptimizedImageOptions, "width"> = {}) {
  const url = normalizeApiImageUrl(image);
  if (!url || !url.includes("res.cloudinary.com") || !url.includes("/image/upload/")) {
    return undefined;
  }

  return widths
    .map((width) => `${getOptimizedImageUrl(url, { ...options, width })} ${width}w`)
    .join(", ");
}
