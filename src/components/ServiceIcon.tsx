import { cn } from "@/lib/cn";

export type ServiceIconKind = "spark" | "layers" | "megaphone" | "globe" | "camera" | "chart";

export const SERVICE_ICON_OPTIONS: ServiceIconKind[] = [
  "spark",
  "layers",
  "megaphone",
  "globe",
  "camera",
  "chart",
];

export default function ServiceIcon({
  kind,
  className,
}: {
  kind: ServiceIconKind;
  className?: string;
}) {
  const cls = cn("h-4 w-4", className);

  if (kind === "spark") {
    return (
      <svg viewBox="0 0 24 24" className={cls} aria-hidden="true" fill="none">
        <path d="M12 3 14.2 9.8 21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2L12 3Z" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }

  if (kind === "layers") {
    return (
      <svg viewBox="0 0 24 24" className={cls} aria-hidden="true" fill="none">
        <path d="m12 4 8 4-8 4-8-4 8-4Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="m4 12 8 4 8-4" stroke="currentColor" strokeWidth="1.8" />
        <path d="m4 16 8 4 8-4" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }

  if (kind === "megaphone") {
    return (
      <svg viewBox="0 0 24 24" className={cls} aria-hidden="true" fill="none">
        <path d="M4 12v-2.8c0-.9.7-1.6 1.6-1.6h2.2L17 4v16l-9.2-3.6H5.6C4.7 16.4 4 15.7 4 14.8V12Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M9 16.5 10.2 20" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }

  if (kind === "globe") {
    return (
      <svg viewBox="0 0 24 24" className={cls} aria-hidden="true" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3.7 9h16.6M3.7 15h16.6M12 3c2.5 2.5 2.5 15.5 0 18M12 3c-2.5 2.5-2.5 15.5 0 18" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }

  if (kind === "camera") {
    return (
      <svg viewBox="0 0 24 24" className={cls} aria-hidden="true" fill="none">
        <rect x="3" y="7" width="18" height="12" rx="2.6" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="13" r="3.3" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 7 9.4 5h5.2L16 7" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={cls} aria-hidden="true" fill="none">
      <path d="M4 18h16M7 18V9M12 18V6M17 18v-4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5.5 9.5 8 7.5l3.2 1.8 3.5-3L18.5 8" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
