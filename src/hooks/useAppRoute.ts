import { useEffect, useState } from "react";
import { getExplorerRoute, type ExplorerRoute } from "../propertyExplorer";
import { getUnitCatalogRoute } from "../unitCatalog";

type NewsDetailRoute = { name: "newsDetail"; slug: string };
type AboutUsRoute = { name: "aboutUs" };
export type AppRouteState = ReturnType<typeof getUnitCatalogRoute> | ExplorerRoute | NewsDetailRoute | AboutUsRoute;

function getAppRoute(): AppRouteState {
  const path = window.location.pathname;
  const normalized = path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path;

  if (normalized === "/coming-soon") {
    window.history.replaceState(null, "", "/");
  }
  if (normalized === "/about-us") {
    return { name: "aboutUs" };
  }

  const unitRoute = getUnitCatalogRoute();
  if (unitRoute.name === "home" || unitRoute.name === "unitList" || unitRoute.name === "unitDetail") {
    return unitRoute;
  }

  const newsMatch = normalized.match(/^\/news\/([^/]+)$/);
  if (newsMatch) {
    return { name: "newsDetail", slug: decodeURIComponent(newsMatch[1]) };
  }

  const explorerRoute = getExplorerRoute();
  return explorerRoute.name !== "unknown" && explorerRoute.name !== "home" ? explorerRoute : unitRoute;
}

export function useAppRoute() {
  const [routeState, setRouteState] = useState<AppRouteState>(getAppRoute);

  useEffect(() => {
    const handleRouteChange = () => setRouteState(getAppRoute());
    window.addEventListener("popstate", handleRouteChange);
    return () => window.removeEventListener("popstate", handleRouteChange);
  }, []);

  return routeState;
}
