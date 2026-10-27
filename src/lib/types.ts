export type MissionVision = {
  id: number;
  type: "mission" | "vision";
  type_display: string;
  title: string;
  description: string;
  image: string | null;
  is_active: boolean;
};

export type CoreValue = {
  id: number;
  title: string;
  description: string;
  order: number;
  is_active: boolean;
};

export type AboutData = {
  title: string;
  subtitle: string;
  description: string;
  image: string | null;
  established_year: number | null;
  years_of_experience: number | null;
  total_projects_delivered: number | null;
  happy_families: number | null;
  mission_vision: MissionVision[];
  values: CoreValue[];
  updated_at: string;
};

export type FoundersMessage = {
  founder_name: string;
  designation: string;
  message: string;
  image: string | null;
  updated_at: string;
};

// Items inside social_links and link_groups were empty in the sample,
// so they are typed loosely until we see real data.
export type Loose = Record<string, unknown>;

export type FooterData = {
  show_logo: boolean;
  logo: string | null;
  logo_alt_text: string;
  logo_link: string;
  logo_width: number | null;
  show_about: boolean;
  about_heading: string;
  about_text: string;
  show_contact: boolean;
  contact_heading: string;
  address: string;
  phone_1: string;
  phone_2: string;
  whatsapp_number: string;
  email: string;
  working_hours: string;
  show_map: boolean;
  map_heading: string;
  google_map_embed_url: string;
  google_maps_link: string;
  latitude: string;
  longitude: string;
  map_height: number;
  show_links: boolean;
  show_social: boolean;
  social_heading: string;
  copyright_display: string;
  developed_by_text: string;
  developed_by_url: string;
  social_links: Loose[];
  link_groups: Loose[];
};

export type HeroSlide = {
  id: number;
  title: string;
  subtitle: string;
  image: string | null;
  button_text: string;
  button_link: string;
  order: number;
  is_active: boolean;
};

export type HomeSection = {
  id: number;
  key: string; 
  key_display: string;
  title: string;
  subtitle: string;
  body: string; 
  image: string | null; 
  button_text: string;
  button_link: string;
  is_active: boolean;
};

export type ProjectStatus = "upcoming" | "ongoing" | "completed";

export type ProjectListItem = {
  id: number;
  title: string;
  slug: string;
  category: number;
  category_name: string;
  category_slug: string;
  status: ProjectStatus;
  status_display: string;
  short_description: string;
  location: string;
  land_area: string;
  land_area_unit: string;
  handover_date: string | null;
  thumbnail: string | null;
  is_featured: boolean;
  accepts_land_share: boolean;
  is_active: boolean;
  order: number;
};

export type ProjectImage = {
  id: number;
  image: string;
  caption: string;
  order: number;
};

export type ProjectAmenity = {
  id: number;
  title: string;
  icon: string; 
  order: number;
};

export type ProjectDetail = {
  id: number;
  title: string;
  slug: string;
  category: number;
  category_detail: { id: number; name: string; slug: string };
  status: ProjectStatus;
  status_display: string;
  short_description: string;
  description: string; // HTML
  location: string;
  latitude: string | null;
  longitude: string | null;
  land_area: string;
  land_area_unit: string;
  total_units: number | null;
  floors: number | null;
  car_parking: string;
  start_date: string | null;
  handover_date: string | null;
  thumbnail: string | null;
  brochure: string | null;
  video_url: string;
  is_featured: boolean;
  accepts_land_share: boolean;
  land_share_terms: string; // HTML
  meta_title: string;
  meta_description: string;
  is_active: boolean;
  order: number;
  images: ProjectImage[];
  amenities: ProjectAmenity[];
};

export type LandownerBenefit = {
  id: number;
  title: string;
  description: string;
  icon: string;
  order: number;
  is_active: boolean;
};

export type LandownerStep = {
  id: number;
  title: string;
  description: string;
  order: number;
  is_active: boolean;
};

export type LandownerPageData = {
  title: string;
  subtitle: string;
  description: string; // HTML
  image: string | null;
  benefits: LandownerBenefit[];
  steps: LandownerStep[];
  updated_at: string;
};

export type Testimonial = {
  id: number;
  name: string;
  designation: string;
  photo: string | null;
  rating: number;
  message: string;
  order: number;
  is_active: boolean;
};

export type Partner = {
  id: number;
  name: string;
  logo: string | null;
  website_url: string;
  order: number;
  is_active: boolean;
};

export type TeamMember = {
  id: number;
  name: string;
  designation: string;
  bio: string;
  photo: string | null;
  email: string;
  phone: string;
  facebook_url: string;
  linkedin_url: string;
  order: number;
  is_active: boolean;
};

export type GalleryItem = { id: number; image: string; caption: string; order: number };
export type ProjectRef = { id: number; title: string; slug: string };

export type PlotListItem = {
  id: number;
  title: string;
  slug: string;
  project: number | null;
  project_title: string | null;
  location: string;
  size_katha: string;
  price: string | null;
  price_note: string;
  status: string;
  status_display: string;
  thumbnail: string | null;
  is_featured: boolean;
  is_active: boolean;
  order: number;
};

export type PlotDetail = Omit<PlotListItem, "project_title"> & {
  project_detail: ProjectRef | null;
  facing: string;
  road_width: string;
  description: string;
  meta_title: string;
  meta_description: string;
  images: GalleryItem[];
};

export type FlatListItem = {
  id: number;
  title: string;
  slug: string;
  project: number | null;
  project_title: string | null;
  flat_type: string;
  flat_type_display: string;
  location: string;
  price_per_sft: string;
  size_sft: string | null;
  total_land: string;
  total_land_unit: string;
  number_of_units: number | null;
  car_parking: string;
  status: string;
  status_display: string;
  thumbnail: string | null;
  is_featured: boolean;
  is_active: boolean;
  order: number;
};

export type FlatDetail = Omit<FlatListItem, "project_title"> & {
  project_detail: ProjectRef | null;
  floor: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  balconies: number | null;
  facing: string;
  handover_date: string | null;
  description: string;
  meta_title: string;
  meta_description: string;
  images: GalleryItem[];
};

export type CsrListItem = {
  id: number;
  title: string;
  slug: string;
  cover_image: string | null;
  activity_date: string | null;
  location: string;
  is_active: boolean;
  order: number;
};

export type CsrDetail = CsrListItem & { description: string; images: GalleryItem[] };

export type NewsListItem = {
  id: number;
  title: string;
  slug: string;
  post_type: string;
  post_type_display: string;
  excerpt: string;
  cover_image: string | null;
  published_at: string;
  event_date: string | null;
  event_location: string;
  is_featured: boolean;
  is_published: boolean;
};

export type NewsDetail = NewsListItem & {
  content: string;
  meta_title: string;
  meta_description: string;
  images: GalleryItem[];
};

export type JobListItem = {
  id: number;
  title: string;
  slug: string;
  department: string;
  location: string;
  employment_type: string;
  employment_type_display: string;
  vacancies: number | null;
  salary_note: string;
  deadline: string | null;
  is_open: boolean;
  is_active: boolean;
};

export type JobDetail = JobListItem & {
  description: string;
  requirements: string;
};