export function normalizeApiImageUrl(image: string) {
  const markdownMatch = image.match(/\((https?:\/\/[^)]+)\)/);
  if (markdownMatch?.[1]) {
    return markdownMatch[1];
  }

  return image.trim();
}
