export type Service = {
  id: string;
  title: string;
  summary: string;
  inclusions: string[];
};

export type PackageTier = {
  id: string;
  name: string;
  priceNote: string;
  bestFor: string;
  includes: string[];
};

export const services: Service[] = [
  {
    id: "brand",
    title: "Branding & Identity",
    summary: "We help your brand look clear, professional, and easy to remember.",
    inclusions: [
      "Logo and visual style",
      "Brand colors and fonts",
      "Simple brand guide",
    ],
  },
  {
    id: "design",
    title: "Design & Marketing Visuals",
    summary: "We create visuals that help your business stand out and look trusted.",
    inclusions: [
      "Social templates",
      "Presentation slides",
      "Print-ready designs",
    ],
  },
  {
    id: "content",
    title: "Photo & Video",
    summary: "We create photos and videos that show your business at its best.",
    inclusions: [
      "Product and team photos",
      "Short promo videos",
      "Editing for social media",
    ],
  },
  {
    id: "social",
    title: "Social Management",
    summary: "We keep your pages active so more people see and trust your brand.",
    inclusions: [
      "Monthly content plan",
      "Posting + scheduling",
      "Monthly report",
    ],
  },
  {
    id: "web",
    title: "Website Design",
    summary: "We build websites that look great and help customers contact you.",
    inclusions: [
      "Website design and setup",
      "Mobile-friendly pages",
      "Basic SEO setup",
    ],
  },
  {
    id: "print",
    title: "Printing Design",
    summary: "We design print materials that make your business look polished.",
    inclusions: [
      "Posters and flyers",
      "Brochures and menus",
      "Business cards",
    ],
  },
];

export const packages: PackageTier[] = [
  {
    id: "starter",
    name: "Starter",
    priceNote: "From $950 / month",
    bestFor: "Great for new businesses that need regular design support.",
    includes: [
      "8 social posts (static)",
      "2 story sets",
      "Brand visuals",
      "Fast delivery",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    priceNote: "From $1,950 / month",
    bestFor: "Great for growing brands that need weekly content.",
    includes: [
      "12 social posts",
      "4 reels edits",
      "1 on-site shoot (half day)",
      "Monthly results update",
    ],
  },
  {
    id: "signature",
    name: "Signature",
    priceNote: "Custom quote",
    bestFor: "Great for businesses that want full creative support.",
    includes: [
      "Complete content support",
      "Ad creative support",
      "Priority support",
    ],
  },
];
