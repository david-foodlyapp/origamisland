import { PropertyExplorer } from "./PropertyExplorer";
import "../../styles/properties.css";

type PropertiesPageProps = {
  propertySlug?: string;
  floorSlug?: string;
};

export function PropertiesPage({ propertySlug, floorSlug }: PropertiesPageProps) {
  return <PropertyExplorer propertySlug={propertySlug} floorSlug={floorSlug} />;
}
