import type { Metadata } from "next";
import ResourceManager from "@/components/admin/ResourceManager";
import type { ResourceConfig } from "@/components/admin/types";
import { IMAGE_SPECS } from "@/lib/admin/imageSpecs";
import {
  activeField,
  AREA_UNITS,
  AVAILABILITY,
  featuredField,
  orderField,
  seoFields,
  slugField,
} from "@/lib/admin/fields";

export const metadata: Metadata = { title: "Flats | Admin" };

const config: ResourceConfig = {
  title: "Flats",
  singular: "flat",
  description: "Flats for sale. Use Gallery to add photos.",
  endpoint: "/flats",
  idKey: "slug",
  detail: true,
  searchKeys: ["title", "location", "project_title"],
  filter: { key: "status", options: AVAILABILITY },
  extras: [{ label: "Gallery", path: "images", kind: "gallery", spec: IMAGE_SPECS.gallery.spec }],
  columns: [
    { key: "thumbnail", label: "Image", kind: "image" },
    { key: "title", label: "Flat", sub: "project_title" },
    { key: "size_sft", label: "Size (sft)", kind: "number" },
    { key: "status_display", label: "Status" },
    { key: "is_featured", label: "Featured", kind: "bool" },
    { key: "is_active", label: "Visible", kind: "bool" },
  ],
  fields: [
    { name: "title", label: "Title", type: "text", required: true, maxLength: 200 },
    slugField,
    {
      name: "project",
      label: "Project",
      type: "select",
      optionsFrom: { endpoint: "/projects", valueKey: "id", labelKey: "title" },
      help: "Optional. Links the flat to a project.",
    },
    {
      name: "flat_type",
      label: "Type",
      type: "select",
      required: true,
      default: "residential",
      options: [
        { value: "residential", label: "Residential" },
        { value: "commercial", label: "Commercial" },
      ],
    },
    { name: "status", label: "Status", type: "select", required: true, default: "available", options: AVAILABILITY },
    { name: "thumbnail", label: "Main image", type: "image", required: true, image: IMAGE_SPECS.cover.spec },
    { name: "location", label: "Location", type: "text", required: true, maxLength: 250 },
    { name: "price_per_sft", label: "Price per sft (Tk)", type: "number", required: true, min: 0 },
    { name: "size_sft", label: "Size (sft)", type: "number", min: 0 },
    { name: "total_land", label: "Total land", type: "number", min: 0 },
    { name: "total_land_unit", label: "Land unit", type: "select", default: "decimal", options: AREA_UNITS },
    { name: "number_of_units", label: "Number of units", type: "number", min: 0 },
    { name: "car_parking", label: "Car parking", type: "text", maxLength: 100 },
    { name: "floor", label: "Floor", type: "number", min: 0 },
    { name: "bedrooms", label: "Bedrooms", type: "number", min: 0 },
    { name: "bathrooms", label: "Bathrooms", type: "number", min: 0 },
    { name: "balconies", label: "Balconies", type: "number", min: 0 },
    { name: "facing", label: "Facing", type: "text", maxLength: 50 },
    { name: "handover_date", label: "Handover date", type: "date" },
    { name: "description", label: "Description", type: "richtext" },
    featuredField,
    ...seoFields,
    orderField,
    activeField,
  ],
};

export default function Page() {
  return <ResourceManager config={config} />;
}