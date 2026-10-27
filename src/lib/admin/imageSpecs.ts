import type { ImageSpec } from "./image";

export type SpecMeta = { label: string; used: string; tip: string; spec: ImageSpec };

export const IMAGE_SPECS = {
  hero: {
    label: "Hero slide",
    used: "Full-screen slider on Home",
    tip: "Keep the subject in the middle. The headline sits bottom-left, so keep that area calm. Phones show only the center.",
    spec: { width: 2400, height: 1350 },
  },
  section: {
    label: "Section image (portrait)",
    used: "Home intro and investment, Mission/Vision",
    tip: "Portrait with one clear subject.",
    spec: { width: 1200, height: 1500 },
  },
  banner: {
    label: "Wide page image",
    used: "About page and Landowner page",
    tip: "Wide scene. Keep the important part in the middle.",
    spec: { width: 2000, height: 1125 },
  },
  founder: {
    label: "Founder portrait",
    used: "Managing Director on About",
    tip: "Head in the upper third.",
    spec: { width: 1200, height: 1600, focus: "top" },
  },
  projectCover: {
    label: "Project thumbnail",
    used: "Project card (portrait crop) and the full-width project hero",
    tip: "Used twice, so keep the subject centered and avoid important details near the edges.",
    spec: { width: 2400, height: 1800 },
  },
  cover: {
    label: "Cover image",
    used: "Plot, Flat, CSR and News cards and detail heroes",
    tip: "Landscape works best. Keep the subject centered.",
    spec: { width: 2000, height: 1500 },
  },
  gallery: {
    label: "Gallery photo",
    used: "Galleries on projects, plots, flats, CSR and news",
    tip: "Landscape is best. Portrait photos are cropped in the grid but shown fully when opened.",
    spec: { width: 2000, height: 1500 },
  },
  team: {
    label: "Team photo",
    used: "Team page",
    tip: "Face in the upper part of the photo.",
    spec: { width: 1000, height: 1250, focus: "top" },
  },
  testimonial: {
    label: "Client photo",
    used: "Testimonials on Home",
    tip: "Face centered, plain background.",
    spec: { width: 800, height: 800 },
  },
  partnerLogo: {
    label: "Partner logo",
    used: "Partner strip on Home",
    tip: "Transparent background, cropped tight with no empty margin. Never cropped by the site.",
    spec: { width: 640, height: 240, mode: "contain", format: "png" },
  },
  siteLogo: {
    label: "Site logo",
    used: "Header, footer and preloader",
    tip: "Transparent background, no outer outline.",
    spec: { width: 800, height: 800, mode: "contain", format: "png" },
  },
  avatar: {
    label: "Profile picture",
    used: "Admin top bar and profile page",
    tip: "Square photo with your face centered.",
    spec: { width: 400, height: 400 },
  },
} satisfies Record<string, SpecMeta>;