export type ProjectCategory =
  | "Design"
  | "Photo"
  | "Video"
  | "Social"
  | "Printing"
  | "Web";

export type Project = {
  slug: string;
  title: string;
  category: ProjectCategory;
  year: string;
  tagline: string;
  brief: string;
  deliverables: string[];
  tools: string[];
  results: string[];
  coverImage: string;
  gallery: string[];
  featured?: boolean;
};

export const categories: Array<ProjectCategory | "All"> = [
  "All",
  "Design",
  "Photo",
  "Video",
  "Social",
  "Printing",
  "Web",
];

export const projects: Project[] = [
  {
    slug: "nile-roasters-rebrand",
    title: "Nile Roasters Rebrand",
    category: "Design",
    year: "2025",
    tagline: "A clean new brand look for packaging, cafés, and social media.",
    brief:
      "Nile Roasters needed a clean brand look that works on packaging, menus, and social media.",
    deliverables: [
      "Brand planning",
      "Logo design",
      "Packaging + menu design",
      "Social templates",
    ],
    tools: ["Figma", "Illustrator", "InDesign"],
    results: ["+32% repeat purchases (90 days)", "Higher shelf standout in retail"],
    coverImage: "/placeholders/work-01.svg",
    gallery: [
      "/placeholders/work-01.svg",
      "/placeholders/gallery-01.svg",
      "/placeholders/gallery-02.svg",
    ],
    featured: true,
  },
  {
    slug: "karma-atelier-campaign",
    title: "Karma Atelier Campaign",
    category: "Photo",
    year: "2025",
    tagline: "Product photos that feel clean, sharp, and premium.",
    brief:
      "A seasonal capsule launch that needed fast, consistent visuals for e-comm and paid social.",
    deliverables: ["Creative direction", "Product shoot", "Photo edits", "Ad versions"],
    tools: ["Lightroom", "Photoshop", "Capture One"],
    results: ["2.1x ROAS on launch week", "+18% add-to-cart rate"],
    coverImage: "/placeholders/work-02.svg",
    gallery: [
      "/placeholders/work-02.svg",
      "/placeholders/gallery-03.svg",
      "/placeholders/gallery-01.svg",
    ],
    featured: true,
  },
  {
    slug: "cedar-clinics-explainer",
    title: "Cedar Clinics Explainer",
    category: "Video",
    year: "2024",
    tagline: "A short video that explains services in a simple way.",
    brief:
      "Cedar Clinics needed a short piece for reception screens, web landing pages, and social.",
    deliverables: ["Script updates", "Motion graphics", "Editing", "Subtitles"],
    tools: ["After Effects", "Premiere Pro"],
    results: ["Lowered support questions", "Improved landing page engagement"],
    coverImage: "/placeholders/work-03.svg",
    gallery: [
      "/placeholders/work-03.svg",
      "/placeholders/gallery-02.svg",
      "/placeholders/gallery-03.svg",
    ],
    featured: true,
  },
  {
    slug: "atlas-logistics-social-plan",
    title: "Atlas Logistics Social Plan",
    category: "Social",
    year: "2024",
    tagline: "A social content plan built for clear and steady posting.",
    brief:
      "We created a simple weekly plan so content stays clear, consistent, and on brand.",
    deliverables: ["Template kit", "Posting plan", "Content guide", "Monthly update"],
    tools: ["Figma", "Notion"],
    results: ["+46% engagement rate", "Consistent weekly output (12 weeks)"],
    coverImage: "/placeholders/work-04.svg",
    gallery: [
      "/placeholders/work-04.svg",
      "/placeholders/gallery-01.svg",
      "/placeholders/gallery-02.svg",
    ],
    featured: true,
  },
  {
    slug: "mint-studio-site",
    title: "Mint Studio Website",
    category: "Web",
    year: "2025",
    tagline: "A portfolio website that looks bold, clean, and easy to browse.",
    brief:
      "The goal was a fast and clean site that shows projects clearly and brings more inquiries.",
    deliverables: ["Page planning", "UI design", "Responsive website", "Easy content updates"],
    tools: ["Figma", "Next.js", "TailwindCSS"],
    results: ["Faster load times", "More inquiries from portfolio traffic"],
    coverImage: "/placeholders/work-05.svg",
    gallery: [
      "/placeholders/work-05.svg",
      "/placeholders/gallery-03.svg",
      "/placeholders/gallery-02.svg",
    ],
    featured: true,
  },
  {
    slug: "oasis-real-estate-print-suite",
    title: "Oasis Real Estate Print Suite",
    category: "Printing",
    year: "2024",
    tagline: "Signage and brochures that make the brand feel premium.",
    brief:
      "We designed print materials that match the brand and look consistent across every branch.",
    deliverables: ["Brochure design", "Signage", "Business cards", "Print-ready files"],
    tools: ["InDesign", "Illustrator"],
    results: ["Consistent brand presence across branches"],
    coverImage: "/placeholders/work-06.svg",
    gallery: [
      "/placeholders/work-06.svg",
      "/placeholders/gallery-01.svg",
      "/placeholders/gallery-03.svg",
    ],
    featured: true,
  },
  {
    slug: "pulse-fitness-launch-reels",
    title: "Pulse Fitness Launch Reels",
    category: "Video",
    year: "2025",
    tagline: "Short videos edited to keep attention and explain the offer clearly.",
    brief:
      "A launch sequence of short-form videos for a new class lineup and membership offer.",
    deliverables: ["Reels edits", "Captions", "Thumbnail set"],
    tools: ["Premiere Pro", "After Effects"],
    results: ["Top 3 performing month", "Higher story replies"],
    coverImage: "/placeholders/work-03.svg",
    gallery: ["/placeholders/work-03.svg", "/placeholders/gallery-02.svg"],
  },
  {
    slug: "brightline-academy-brand-kit",
    title: "Brightline Academy Brand Kit",
    category: "Design",
    year: "2024",
    tagline: "A friendly but sharp identity kit for education.",
    brief:
      "A brand kit that works clearly across print and digital channels.",
    deliverables: ["Logo refresh", "Icon set", "Brand guide", "Template kit"],
    tools: ["Figma", "Illustrator"],
    results: ["Improved consistency across departments"],
    coverImage: "/placeholders/work-02.svg",
    gallery: ["/placeholders/work-02.svg", "/placeholders/gallery-01.svg"],
  },
  {
    slug: "vanta-tech-landing-page",
    title: "Vanta Tech Landing Page",
    category: "Web",
    year: "2025",
    tagline: "Landing page built to attract signups and new leads.",
    brief:
      "We built a clear, fast landing page that helps more visitors sign up.",
    deliverables: ["Page copy", "UI design", "Website build"],
    tools: ["Next.js", "TailwindCSS"],
    results: ["+22% waitlist conversion", "Lower bounce rate"],
    coverImage: "/placeholders/work-05.svg",
    gallery: ["/placeholders/work-05.svg", "/placeholders/gallery-03.svg"],
  },
];

export const featuredProjects = projects.filter((p) => p.featured);
