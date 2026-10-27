// export type NavItem = { href: string; label: string; ready: boolean };
// export type NavGroup = { group: string; items: NavItem[] };

// export const ADMIN_NAV: NavGroup[] = [
//   {
//     group: "Overview",
//     items: [{ href: "/admin", label: "Dashboard", ready: true }],
//   },
//   {
//     group: "Home page",
//     items: [
//       { href: "/admin/hero-slides", label: "Hero slides", ready: true },
//       { href: "/admin/home-sections", label: "Home sections", ready: true },
//       { href: "/admin/testimonials", label: "Testimonials", ready: true },
//       { href: "/admin/partners", label: "Partners", ready: true },
//     ],
//   },
//   {
//     group: "Company",
//     items: [
//       { href: "/admin/about", label: "About page", ready: false },
//       { href: "/admin/mission-vision", label: "Mission & vision", ready: true },
//       { href: "/admin/values", label: "Core values", ready: true },
//       { href: "/admin/team", label: "Team", ready: true },
//       { href: "/admin/banners", label: "Page banners", ready: false },
//     ],
//   },
//   {
//     group: "Listings",
//     items: [
//       { href: "/admin/projects", label: "Projects", ready: false },
//       { href: "/admin/categories", label: "Project categories", ready: true },
//       { href: "/admin/plots", label: "Plots", ready: false },
//       { href: "/admin/flats", label: "Flats", ready: false },
//     ],
//   },
//   {
//     group: "Content",
//     items: [
//       { href: "/admin/csr", label: "CSR", ready: false },
//       { href: "/admin/news", label: "News & events", ready: false },
//       { href: "/admin/careers", label: "Jobs", ready: false },
//     ],
//   },
//   {
//     group: "Landowners",
//     items: [
//       { href: "/admin/landowner", label: "Landowner page", ready: false },
//       { href: "/admin/landowner-benefits", label: "Benefits", ready: true },
//       { href: "/admin/landowner-steps", label: "Steps", ready: true },
//     ],
//   },
//   {
//     group: "Inbox",
//     items: [
//       { href: "/admin/bookings", label: "Site visits", ready: false },
//       { href: "/admin/land-share", label: "Land-share requests", ready: false },
//       { href: "/admin/messages", label: "Contact messages", ready: false },
//       { href: "/admin/applications", label: "Job applications", ready: false },
//     ],
//   },
//   {
//     group: "Settings",
//     items: [
//       { href: "/admin/profile", label: "My profile", ready: true },
//       { href: "/admin/footer", label: "Footer & contact", ready: false },
//       { href: "/admin/image-guide", label: "Image guide", ready: true },
//     ],
//   },
// ];

export type NavItem = { href: string; label: string; ready: boolean };
export type NavGroup = { group: string; items: NavItem[] };

export const ADMIN_NAV: NavGroup[] = [
  { group: "Overview", items: [{ href: "/admin", label: "Dashboard", ready: true }] },
  {
    group: "Inbox",
    items: [
      { href: "/admin/bookings", label: "Site visits", ready: true },
      { href: "/admin/land-share", label: "Land-share requests", ready: true },
      { href: "/admin/messages", label: "Contact messages", ready: true },
      { href: "/admin/applications", label: "Job applications", ready: true },
    ],
  },
  {
    group: "Home page",
    items: [
      { href: "/admin/hero-slides", label: "Hero slides", ready: true },
      { href: "/admin/home-sections", label: "Home sections", ready: true },
      { href: "/admin/testimonials", label: "Testimonials", ready: true },
      { href: "/admin/partners", label: "Partners", ready: true },
    ],
  },
  {
    group: "Listings",
    items: [
      { href: "/admin/projects", label: "Projects", ready: true },
      { href: "/admin/categories", label: "Project categories", ready: true },
      { href: "/admin/plots", label: "Plots", ready: true },
      { href: "/admin/flats", label: "Flats", ready: true },
    ],
  },
  {
    group: "Content",
    items: [
      { href: "/admin/csr", label: "CSR", ready: true },
      { href: "/admin/news", label: "News & events", ready: true },
      { href: "/admin/careers", label: "Jobs", ready: true },
    ],
  },
  {
    group: "Company",
    items: [
      { href: "/admin/about", label: "About page", ready: true },
      { href: "/admin/mission-vision", label: "Mission & vision", ready: true },
      { href: "/admin/values", label: "Core values", ready: true },
      { href: "/admin/team", label: "Team", ready: true },
      { href: "/admin/banners", label: "Page banners", ready: true },
    ],
  },
  {
    group: "Landowners",
    items: [
      { href: "/admin/landowner", label: "Landowner page", ready: true },
      { href: "/admin/landowner-benefits", label: "Benefits", ready: true },
      { href: "/admin/landowner-steps", label: "Steps", ready: true },
    ],
  },
  {
    group: "Settings",
    items: [
      { href: "/admin/profile", label: "My profile", ready: true },
      { href: "/admin/footer", label: "Footer & contact", ready: true },
      { href: "/admin/image-guide", label: "Image guide", ready: true },
    ],
  },
];