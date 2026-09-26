import { API_BASE_URL } from "../config";
import type { Language } from "../i18n";
import type {
  BrandingSettings,
  BrandingSettingsResponse,
  ContactSettings,
  ContactSettingsResponse,
  FooterMenuApiItem,
  FooterMenuSectionResponse,
  SectionGridCardItem,
  SocialNetworkItem,
  SocialNetworksResponse,
  WebsiteSectionResponse
} from "../types";

async function fetchApi<T>(path: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, { signal });
  if (!response.ok) {
    throw new Error(`${path} request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function fetchBranding(signal: AbortSignal): Promise<BrandingSettings | null> {
  const payload = await fetchApi<BrandingSettingsResponse>("/settings/branding", signal);
  return payload.data || null;
}

export async function fetchContactSettings(signal: AbortSignal): Promise<ContactSettings | null> {
  const payload = await fetchApi<ContactSettingsResponse>("/settings/contact", signal);
  return payload.data || null;
}

export async function fetchSocialNetworks(signal: AbortSignal): Promise<SocialNetworkItem[]> {
  const payload = await fetchApi<SocialNetworksResponse>("/social-networks", signal);
  return payload.data.filter((item) => item.status).sort((a, b) => a.rank - b.rank);
}

export async function fetchFooterDescription(language: Language, signal: AbortSignal): Promise<string> {
  const payload = await fetchApi<WebsiteSectionResponse>(`/sections/footer?locale=${language}`, signal);
  const item = payload.data.items.filter((entry) => entry.status).sort((a, b) => a.rank - b.rank)[0];
  const title = item?.title?.trim() || "";
  const subtitle = item?.subtitle?.trim() || "";
  return title && subtitle && title !== subtitle ? `${title}- ${subtitle}` : title || subtitle;
}

export async function fetchFooterMenu(language: Language, signal: AbortSignal): Promise<FooterMenuApiItem[]> {
  const payload = await fetchApi<FooterMenuSectionResponse>(`/sections/menu?locale=${language}`, signal);
  return payload.data.items.filter((item) => item.status).sort((a, b) => a.rank - b.rank);
}

export async function fetchRequestCallDescription(language: Language, signal: AbortSignal): Promise<string> {
  const payload = await fetchApi<{ data: { description?: string } }>(
    `/sections/menu/item/request-a-call?locale=${language}`,
    signal
  );
  return payload.data?.description?.trim() || "";
}

export async function fetchFooterLegalItems(language: Language, signal: AbortSignal): Promise<SectionGridCardItem[]> {
  const payload = await fetchApi<WebsiteSectionResponse>(`/sections/footer-menu?locale=${language}`, signal);
  return payload.data.items.filter((item) => item.status).sort((a, b) => a.rank - b.rank);
}
