import type { Metadata } from "next";
import SingletonForm from "@/components/admin/SingletonForm";
import ResourceManager from "@/components/admin/ResourceManager";
import type { Field, ResourceConfig } from "@/components/admin/types";
import { IMAGE_SPECS } from "@/lib/admin/imageSpecs";
import { activeField, orderField } from "@/lib/admin/fields";

export const metadata: Metadata = { title: "Footer & contact | Admin" };

const brand: Field[] = [
  { name: "show_logo", label: "Show the logo", type: "boolean", default: true },
  { name: "logo", label: "Footer logo", type: "image", image: IMAGE_SPECS.siteLogo.spec },
  { name: "logo_alt_text", label: "Logo description", type: "text", maxLength: 200, help: "For search engines and screen readers." },
  { name: "logo_width", label: "Logo width (px)", type: "number", min: 72, max: 112, help: "Between 72 and 112." },
  { name: "show_about", label: "Show the About text", type: "boolean", default: true },
  { name: "about_heading", label: "About heading", type: "text", maxLength: 100 },
  { name: "about_text", label: "About text", type: "textarea", maxLength: 500 },
];

const contact: Field[] = [
  { name: "show_contact", label: "Show contact details", type: "boolean", default: true },
  { name: "contact_heading", label: "Heading", type: "text", maxLength: 100 },
  { name: "address", label: "Address", type: "textarea", wide: true },
  { name: "phone_1", label: "Phone 1", type: "text", maxLength: 30 },
  { name: "phone_2", label: "Phone 2", type: "text", maxLength: 30 },
  { name: "whatsapp_number", label: "WhatsApp number", type: "text", maxLength: 30, help: "With country code, for example +8801XXXXXXXXX." },
  { name: "email", label: "Email", type: "text", maxLength: 150 },
  { name: "working_hours", label: "Working hours", type: "text", maxLength: 200 },
];

const map: Field[] = [
  { name: "show_map", label: "Show the map", type: "boolean", default: true },
  { name: "map_heading", label: "Map heading", type: "text", maxLength: 100 },
  {
    name: "google_maps_link",
    label: "Google Maps link",
    type: "text",
    maxLength: 300,
    help: "The Share link from Google Maps. Used for the “Open in Google Maps” button and as the map source.",
  },
  {
    name: "google_map_embed_url",
    label: "Map embed link (optional)",
    type: "text",
    maxLength: 1000,
    wide: true,
    help: "In Google Maps: Share, Embed a map, Copy HTML. You can paste the whole code.",
  },
  { name: "latitude", label: "Latitude (optional)", type: "text", maxLength: 20, skipEmpty: true },
  { name: "longitude", label: "Longitude (optional)", type: "text", maxLength: 20, skipEmpty: true },
  { name: "map_height", label: "Map height (px)", type: "number", min: 150, max: 700 },
];

const options: Field[] = [
  { name: "show_links", label: "Show quick links", type: "boolean", default: true },
  { name: "show_social", label: "Show social links", type: "boolean", default: true },
  { name: "social_heading", label: "Social heading", type: "text", maxLength: 100 },
  {
    name: "copyright_text",
    label: "Copyright text",
    type: "text",
    maxLength: 250,
    wide: true,
    help: "Write {year} to show the current year automatically.",
  },
  { name: "developed_by_text", label: "“Developed by” text", type: "text", maxLength: 200 },
  { name: "developed_by_url", label: "“Developed by” link", type: "text", maxLength: 250 },
];

const social: ResourceConfig = {
  title: "Social links",
  singular: "social link",
  endpoint: "/footer/social-links",
  searchKeys: ["label", "platform_display", "url"],
  columns: [
    { key: "label", label: "Name", sub: "url" },
    { key: "platform_display", label: "Platform" },
    { key: "order", label: "Order", kind: "number" },
    { key: "is_active", label: "Visible", kind: "bool" },
  ],
  fields: [
    {
      name: "platform",
      label: "Platform",
      type: "select",
      required: true,
      default: "facebook",
      options: [
        { value: "facebook", label: "Facebook" },
        { value: "instagram", label: "Instagram" },
        { value: "youtube", label: "YouTube" },
        { value: "linkedin", label: "LinkedIn" },
        { value: "twitter", label: "X (Twitter)" },
        { value: "tiktok", label: "TikTok" },
        { value: "whatsapp", label: "WhatsApp" },
      ],
    },
    { name: "label", label: "Text shown on the website", type: "text", maxLength: 80 },
    { name: "url", label: "Link", type: "text", required: true, maxLength: 300, help: "Starts with https://" },
    orderField,
    activeField,
  ],
};

const groups: ResourceConfig = {
  title: "Link groups",
  singular: "link group",
  endpoint: "/footer/link-groups",
  searchKeys: ["title"],
  columns: [
    { key: "title", label: "Group" },
    { key: "order", label: "Order", kind: "number" },
    { key: "is_active", label: "Visible", kind: "bool" },
  ],
  fields: [{ name: "title", label: "Group title", type: "text", required: true, maxLength: 100 }, orderField, activeField],
};

const links: ResourceConfig = {
  title: "Footer links",
  singular: "link",
  endpoint: "/footer/links",
  searchKeys: ["label", "url", "group__label"],
  lookups: [{ key: "group", endpoint: "/footer/link-groups", valueKey: "id", labelKey: "title" }],
  columns: [
    { key: "label", label: "Link", sub: "url" },
    { key: "group__label", label: "Group" },
    { key: "order", label: "Order", kind: "number" },
    { key: "is_active", label: "Visible", kind: "bool" },
  ],
  fields: [
    {
      name: "group",
      label: "Group",
      type: "select",
      required: true,
      optionsFrom: { endpoint: "/footer/link-groups", valueKey: "id", labelKey: "title" },
    },
    { name: "label", label: "Text shown", type: "text", required: true, maxLength: 100 },
    {
      name: "url",
      label: "Link",
      type: "text",
      required: true,
      maxLength: 300,
      help: "Use /about for a page on this site, or https://… for another website.",
    },
    orderField,
    activeField,
  ],
};

export default function Page() {
  return (
    <div>
      <h1 className="font-display text-4xl text-brand">Footer & contact</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted">
        Everything shown in the footer at the bottom of every page, and the contact details on the Contact page.
      </p>

      <div className="mt-8 space-y-8">
        <SingletonForm title="Logo & about" endpoint="/footer" fields={brand} />
        <SingletonForm title="Contact details" description="Also shown on the Contact page." endpoint="/footer" fields={contact} />
        <SingletonForm title="Map" endpoint="/footer" fields={map} />
        <SingletonForm title="Footer options" endpoint="/footer" fields={options} />

        <section>
          <h2 className="font-display text-3xl text-brand">Social links</h2>
          <p className="mb-4 mt-1 text-sm text-muted">Shown under “Follow Us” in the footer.</p>
          <ResourceManager embedded config={social} />
        </section>

        <section>
          <h2 className="font-display text-3xl text-brand">Footer links</h2>
          <p className="mb-4 mt-1 max-w-2xl text-sm text-muted">
            Create a group first (for example “Quick Links”), then add links to it. While there are no groups, the footer
            shows the website menu instead. Once you create a group, only your groups are shown.
          </p>
          <div className="space-y-8">
            <ResourceManager embedded config={groups} />
            <ResourceManager embedded config={links} />
          </div>
        </section>
      </div>
    </div>
  );
}