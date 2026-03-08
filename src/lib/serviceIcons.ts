import type { Service } from "@/lib/siteContent";
import type { ServiceIconKind } from "@/components/ServiceIcon";

const serviceIconFallbackById: Record<string, ServiceIconKind> = {
  branding: "spark",
  "photo-video": "camera",
  "graphic-design": "layers",
  social: "megaphone",
  "digital-marketing": "chart",
  "web-seo": "globe",
};

export function resolveServiceIcon(service: Service): ServiceIconKind {
  return service.icon || serviceIconFallbackById[service.id] || "spark";
}
