import { useEffect, useState } from "react";
import type { Language } from "../i18n";
import type {
  BrandingSettings,
  ContactSettings,
  FooterMenuApiItem,
  SectionGridCardItem,
  SocialNetworkItem
} from "../types";
import {
  fetchBranding,
  fetchContactSettings,
  fetchFooterDescription,
  fetchFooterLegalItems,
  fetchFooterMenu,
  fetchRequestCallDescription,
  fetchSocialNetworks
} from "../api/siteChrome";

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

async function loadResource<T>(
  request: Promise<T>,
  setData: (value: T) => void,
  fallback: T,
  label: string
) {
  try {
    setData(await request);
  } catch (error) {
    if (!isAbortError(error)) {
      console.error(`Failed to load ${label}:`, error);
      setData(fallback);
    }
  }
}

export function useSiteChrome(language: Language) {
  const [branding, setBranding] = useState<BrandingSettings | null>(null);
  const [contactSettings, setContactSettings] = useState<ContactSettings | null>(null);
  const [socialNetworks, setSocialNetworks] = useState<SocialNetworkItem[]>([]);
  const [footerDescription, setFooterDescription] = useState("");
  const [footerMenuItems, setFooterMenuItems] = useState<FooterMenuApiItem[]>([]);
  const [requestCallDescription, setRequestCallDescription] = useState("");
  const [footerLegalItems, setFooterLegalItems] = useState<SectionGridCardItem[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    void loadResource(fetchBranding(signal), setBranding, null, "branding settings");
    void loadResource(fetchContactSettings(signal), setContactSettings, null, "contact settings");
    void loadResource(fetchSocialNetworks(signal), setSocialNetworks, [], "social networks");

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    void loadResource(fetchFooterDescription(language, signal), setFooterDescription, "", "footer content");
    void loadResource(fetchFooterMenu(language, signal), setFooterMenuItems, [], "footer menu");
    void loadResource(
      fetchRequestCallDescription(language, signal),
      setRequestCallDescription,
      "",
      "request-a-call menu item"
    );
    void loadResource(fetchFooterLegalItems(language, signal), setFooterLegalItems, [], "footer legal menu");

    return () => controller.abort();
  }, [language]);

  return {
    branding,
    contactSettings,
    socialNetworks,
    footerDescription,
    footerMenuItems,
    requestCallDescription,
    footerLegalItems
  };
}
