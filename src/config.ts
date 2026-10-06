export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "https://api.origamiholding.com/api"
).replace(/\/$/, "");

export const PLATFORM_SLUG = import.meta.env.VITE_PLATFORM_SLUG || "origamisland";
