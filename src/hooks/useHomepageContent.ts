import { useEffect, useState } from "react";
import type { Language } from "../i18n";
import type { AboutUsApiItem, InfrastructureApiItem, SectionGridCardItem } from "../types";
import {
  fetchAbout,
  fetchAboutInfo,
  fetchBiohacking,
  fetchChoose,
  fetchCompanyProjects,
  fetchFinance,
  fetchInfrastructure,
  fetchOrigamiHolding,
  type BiohackingContent,
  type ChooseContent,
  type CompanyProjectsContent,
  type FinanceContent,
  type OrigamiHoldingContent
} from "../api/siteContent";

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

export function useHomepageContent(language: Language) {
  const [infrastructureItems, setInfrastructureItems] = useState<InfrastructureApiItem[]>([]);
  const [biohackingData, setBiohackingData] = useState<BiohackingContent | null>(null);
  const [origamiHoldingData, setOrigamiHoldingData] = useState<OrigamiHoldingContent | null>(null);
  const [chooseData, setChooseData] = useState<ChooseContent | null>(null);
  const [financeData, setFinanceData] = useState<FinanceContent | null>(null);
  const [companyProjectsData, setCompanyProjectsData] = useState<CompanyProjectsContent | null>(null);
  const [aboutData, setAboutData] = useState<AboutUsApiItem | null>(null);
  const [aboutInfoItems, setAboutInfoItems] = useState<SectionGridCardItem[]>([]);
  const [isCompanyProjectsLoading, setIsCompanyProjectsLoading] = useState(true);
  const [isAboutLoading, setIsAboutLoading] = useState(true);
  const [isAboutInfoLoading, setIsAboutInfoLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    setIsCompanyProjectsLoading(true);
    setIsAboutLoading(true);
    setIsAboutInfoLoading(true);

    const load = async <T,>(
      request: Promise<T>,
      setData: (value: T) => void,
      clearData: () => void,
      label: string,
      finishLoading?: () => void
    ) => {
      try {
        setData(await request);
      } catch (error) {
        if (!isAbortError(error)) {
          console.error(`Failed to load ${label}:`, error);
          clearData();
        }
      } finally {
        if (!signal.aborted) {
          finishLoading?.();
        }
      }
    };

    void load(fetchInfrastructure(language, signal), setInfrastructureItems, () => setInfrastructureItems([]), "infrastructure");
    void load(fetchBiohacking(language, signal), setBiohackingData, () => setBiohackingData(null), "biohacking");
    void load(fetchOrigamiHolding(language, signal), setOrigamiHoldingData, () => setOrigamiHoldingData(null), "origami holding");
    void load(fetchChoose(language, signal), setChooseData, () => setChooseData(null), "choose section");
    void load(fetchFinance(language, signal), setFinanceData, () => setFinanceData(null), "finance section");
    void load(
      fetchCompanyProjects(language, signal),
      setCompanyProjectsData,
      () => setCompanyProjectsData(null),
      "company projects",
      () => setIsCompanyProjectsLoading(false)
    );
    void load(fetchAbout(language, signal), setAboutData, () => setAboutData(null), "about us", () => setIsAboutLoading(false));
    void load(
      fetchAboutInfo(language, signal),
      setAboutInfoItems,
      () => setAboutInfoItems([]),
      "about section",
      () => setIsAboutInfoLoading(false)
    );

    return () => controller.abort();
  }, [language]);

  return {
    infrastructureItems,
    biohackingData,
    origamiHoldingData,
    chooseData,
    financeData,
    companyProjectsData,
    aboutData,
    aboutInfoItems,
    isCompanyProjectsLoading,
    isAboutLoading,
    isAboutInfoLoading
  };
}
