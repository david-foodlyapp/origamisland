export interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

const UTM_STORAGE_KEY = "origami_utm_params";

export function getUtmParams(): UtmParams {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const fromUrl: UtmParams = {};

    const utmKeys: (keyof UtmParams)[] = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
    ];

    let hasUrlUtm = false;
    for (const key of utmKeys) {
      const val = urlParams.get(key);
      if (val && val.trim()) {
        fromUrl[key] = val.trim();
        hasUrlUtm = true;
      }
    }

    if (hasUrlUtm) {
      sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(fromUrl));
      return fromUrl;
    }

    const stored = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as UtmParams;
    }
  } catch (err) {
    console.warn("Failed to retrieve UTM parameters:", err);
  }

  return {};
}
