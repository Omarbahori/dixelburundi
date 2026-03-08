import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "secondaryLight" | "ghost";

const styles: Record<Variant, string> = {
  primary:
    // CTA: filled red front with white text.
    "bg-dixel-accent text-dixel-ink border-dixel-ink shadow-glow hover:brightness-110",
  secondary:
    // CTA: filled black front with white text.
    "bg-dixel-bg text-dixel-ink border-dixel-ink hover:brightness-110",
  // Use on light/off-white panels where default `secondary` would be invisible.
  secondaryLight:
    // Keep the white plate only as the BACK layer; front stays dark for contrast.
    "bg-dixel-bg text-dixel-ink border-dixel-bg hover:brightness-110",
  ghost:
    "bg-dixel-bg/60 text-dixel-ink border-dixel-ink hover:bg-dixel-bg/75 hover:brightness-110",
};

export function Button({
  href,
  target,
  rel,
  onClick,
  type = "button",
  children,
  variant = "primary",
  className,
}: {
  href?: string;
  target?: string;
  rel?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}) {
  const cls = cn(
    // 3D pill: a second outline sits behind, offset down-right (like the reference).
    "relative z-0 isolate inline-flex h-11 items-center justify-center gap-2 overflow-visible rounded-full border-2 px-5 text-sm font-semibold tracking-tight transition-colors",
    // Back plate (offset): pure white fill + pure white stroke.
    // Label is wrapped in a z-10 span below, so it always stays above both plates.
    "before:pointer-events-none before:absolute before:inset-0 before:z-[-1] before:rounded-full before:border-2 before:border-white before:bg-white before:content-['']",
    // Nudge the back plate a bit upward.
    "before:translate-x-[6px] before:translate-y-[3px]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dixel-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
    styles[variant],
    className,
  );

  if (href) {
    const isExternal = href.startsWith("http") || href.startsWith("mailto:");
    if (isExternal) {
      return (
        <a href={href} className={cls} target={target} rel={rel}>
          <span className="relative z-10 inline-flex items-center gap-2">
            {children}
          </span>
        </a>
      );
    }

    return (
      <Link href={href} className={cls}>
        <span className="relative z-10 inline-flex items-center gap-2">
          {children}
        </span>
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={cls}>
      <span className="relative z-10 inline-flex items-center gap-2">
        {children}
      </span>
    </button>
  );
}
