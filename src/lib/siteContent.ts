export type ProjectCategory = string;

export type Client = { name: string; industry: string; logo?: string };

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  bio: string;
  image?: string;
  video?: string;
};

export type Testimonial = {
  name: string;
  title: string;
  company: string;
  quote: string;
  image?: string;
};

export type Service = {
  id: string;
  title: string;
  summary: string;
  inclusions: string[];
  icon?: "spark" | "layers" | "megaphone" | "globe" | "camera" | "chart";
};

export type AboutTool = {
  name: string;
  logo?: string;
};

export type PackageTier = {
  id: string;
  name: string;
  monthlyPriceFbu?: number;
  priceNote: string;
  bestFor: string;
  includes: string[];
};

export type Project = {
  slug: string;
  clientSlug?: string;
  caseStudySlug?: string;
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
  previewVideoUrl?: string;
  previewEmbedUrl?: string;
  previewVideoWidth?: number;
  previewVideoHeight?: number;
  featured?: boolean;
};

export type SiteContent = {
  settings: {
    brandName: string;
    tagline: string;
    contact: {
      email: string;
      phone: string;
      whatsappNumber: string;
      whatsappPrefill: string;
      location: string;
    };
    socials: {
      instagram: string;
      behance: string;
      linkedin: string;
    };
    footer?: {
      backgroundImage?: string;
    };
  };
  home: {
    sharedBackgroundPool?: string[];
    hero: {
      eyebrow: string;
      headline: string;
      highlight: string;
      subheadline: string;
      backgroundImage?: string;
      ctaPrimary: { label: string; href: string };
      ctaSecondary: { label: string; href: string };
    };
    featuredWork?: {
      backgroundImage?: string;
    };
    servicesSection?: {
      backgroundImage?: string;
    };
    testimonialsSection?: {
      backgroundImage?: string;
    };
    pillars: Array<{ title: string; text: string }>;
    bigCta: {
      eyebrow: string;
      headline: string;
      subheadline: string;
      backgroundImage?: string;
      primary: { label: string; href: string };
      secondary: { label: string; href: string };
    };
  };
  about?: {
    eyebrow: string;
    title: string;
    intro: string[];
    vision: string;
    mission: string;
    howWeWork: Array<{ title: string; text: string }>;
    tools: Array<string | AboutTool>;
  };
  team?: {
    eyebrow: string;
    title: string;
    subtitle: string;
    backgroundImage?: string;
    members: TeamMember[];
  };
  clients: Client[];
  testimonials: Testimonial[];
  services: Service[];
  packages: PackageTier[];
  projects: Project[];
};
