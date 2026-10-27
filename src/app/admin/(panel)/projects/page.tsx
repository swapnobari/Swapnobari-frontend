import type { Metadata } from "next";
import ResourceManager from "@/components/admin/ResourceManager";
import type { ResourceConfig } from "@/components/admin/types";
import { IMAGE_SPECS } from "@/lib/admin/imageSpecs";
import { activeField, AREA_UNITS, featuredField, orderField, seoFields, slugField } from "@/lib/admin/fields";

export const metadata: Metadata = { title: "Projects | Admin" };

const amenities: ResourceConfig = {
  title: "Amenities",
  singular: "amenity",
  endpoint: "", // filled in per project
  columns: [
    { key: "title", label: "Amenity", sub: "icon" },
    { key: "order", label: "Order", kind: "number" },
  ],
  fields: [
    { name: "title", label: "Name", type: "text", required: true, maxLength: 150 },
    {
      name: "icon",
      label: "Icon name",
      type: "text",
      maxLength: 60,
      help: "A name from lucide.dev/icons, for example shield-check, cctv, baby, building-2, car, trees.",
    },
    orderField,
  ],
};

const config: ResourceConfig = {
  title: "Projects",
  singular: "project",
  description: "Your projects. Use Gallery to add photos and Amenities to list the facilities of each project.",
  endpoint: "/projects",
  idKey: "slug",
  detail: true,
  searchKeys: ["title", "location", "category_name", "status_display"],
  filter: {
    key: "status",
    options: [
      { value: "upcoming", label: "Upcoming" },
      { value: "ongoing", label: "Ongoing" },
      { value: "completed", label: "Completed" },
    ],
  },
  extras: [
    { label: "Gallery", path: "images", kind: "gallery", spec: IMAGE_SPECS.gallery.spec },
    { label: "Amenities", path: "amenities", kind: "list", config: amenities },
  ],
  columns: [
    { key: "thumbnail", label: "Image", kind: "image" },
    { key: "title", label: "Project", sub: "location" },
    { key: "status_display", label: "Status" },
    { key: "category_name", label: "Category" },
    { key: "is_featured", label: "Featured", kind: "bool" },
    { key: "is_active", label: "Visible", kind: "bool" },
  ],
  fields: [
    { name: "title", label: "Project name", type: "text", required: true, maxLength: 200 },
    slugField,
    {
      name: "category",
      label: "Category",
      type: "select",
      required: true,
      optionsFrom: { endpoint: "/projects-categories", valueKey: "id", labelKey: "name" },
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      default: "upcoming",
      options: [
        { value: "upcoming", label: "Upcoming" },
        { value: "ongoing", label: "Ongoing" },
        { value: "completed", label: "Completed" },
      ],
    },
    { name: "thumbnail", label: "Main image", type: "image", required: true, image: IMAGE_SPECS.projectCover.spec },
    { name: "short_description", label: "Short description", type: "textarea", maxLength: 300, help: "Shown on project cards." },
    { name: "description", label: "Full description", type: "richtext" },
    { name: "location", label: "Location", type: "text", required: true, maxLength: 250 },
    { name: "latitude", label: "Latitude", type: "text", maxLength: 20, help: "Optional. Shows a map. In Google Maps, right-click the place and click the numbers to copy." },
    { name: "longitude", label: "Longitude", type: "text", maxLength: 20 },
    { name: "land_area", label: "Land area", type: "number", min: 0 },
    { name: "land_area_unit", label: "Area unit", type: "select", required: true, default: "katha", options: AREA_UNITS },
    { name: "total_units", label: "Total units", type: "number", min: 0 },
    { name: "floors", label: "Floors", type: "number", min: 0 },
    { name: "car_parking", label: "Car parking", type: "text", maxLength: 100 },
    { name: "start_date", label: "Start date", type: "date" },
    { name: "handover_date", label: "Handover date", type: "date" },
    {
      name: "brochure",
      label: "Brochure (PDF)",
      type: "file",
      file: { accept: ".pdf", maxMB: 4 },
      help: "PDF up to 4 MB. Compress larger files first.",
    },
    { name: "video_url", label: "Video link", type: "text", maxLength: 250, help: "A YouTube or Vimeo link plays on the page. Other links show as a button." },
    featuredField,
    { name: "accepts_land_share", label: "Accepts land-share requests", type: "boolean", default: false },
    {
      name: "land_share_terms",
      label: "Land-share terms",
      type: "richtext",
      help: "Shown to landowners when land sharing is on.",
    },
    ...seoFields,
    orderField,
    activeField,
  ],
};

export default function Page() {
  return <ResourceManager config={config} />;
}