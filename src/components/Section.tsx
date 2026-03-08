import { cn } from "@/lib/cn";
import SectionVideo from "@/components/SectionVideo";

type Tone = "dark" | "light" | "accent";

export default function Section({
  children,
  tone = "dark",
  className,
  style,
  backgroundImage,
  backgroundVideo,
  backgroundVideoPaused = false,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
  style?: React.CSSProperties;
  backgroundImage?: string;
  backgroundVideo?: string;
  backgroundVideoPaused?: boolean;
}) {
  const toneClass =
    tone === "light"
      ? "bg-dixel-ink text-dixel-bg"
      : tone === "accent"
        ? "bg-dixel-accent text-dixel-ink"
        : "bg-dixel-bg text-dixel-ink";
  const surfaceClass =
    tone === "light"
      ? "surface-light"
      : tone === "accent"
        ? "surface-red"
        : "surface-dark";

  return (
    <section
      className={cn("relative", toneClass, surfaceClass, className)}
      style={{
        ...style,
        ...(backgroundImage
          ? {
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }
          : null),
      }}
    >
      {backgroundVideo ? (
        <SectionVideo src={backgroundVideo} pausedAtMiddle={backgroundVideoPaused} />
      ) : null}
      {children}
    </section>
  );
}
