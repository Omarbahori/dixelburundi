import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import CTAButton from "@/components/CTAButton";
import { readSiteContent } from "@/lib/contentStore";
import TrustedBrandsSection from "@/components/TrustedBrandsSection";
import { cn } from "@/lib/cn";
import type { AboutTool } from "@/lib/siteContent";

export const metadata = {
  title: "About | DIXEL",
  description: "Our story, what we believe, and how we help brands grow.",
};

function isVideoAsset(url: string) {
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
}

type ToolVisual = {
  mark: string;
  bg: string;
  fg: string;
  className?: string;
};

const TOOL_STYLE: Record<string, ToolVisual> = {
  Figma: { mark: "F", bg: "#111827", fg: "#ffffff", className: "tool-logo-figma" },
  "Adobe Illustrator": { mark: "Ai", bg: "#2a1400", fg: "#ff9a00" },
  "Adobe Photoshop": { mark: "Ps", bg: "#001e36", fg: "#31a8ff" },
  "After Effects": { mark: "Ae", bg: "#1f1133", fg: "#cf96fd" },
  "Premiere Pro": { mark: "Pr", bg: "#1f1133", fg: "#ea77ff" },
  "Google Ads": { mark: "G", bg: "#ffffff", fg: "#4285f4", className: "tool-logo-googleads" },
  "Meta Ads Manager": { mark: "M", bg: "#ffffff", fg: "#0866ff", className: "tool-logo-meta" },
  Analytics: { mark: "A", bg: "#ffffff", fg: "#f57c00", className: "tool-logo-analytics" },
  ChatGPT: { mark: "GPT", bg: "#0f172a", fg: "#10b981" },
  Gemini: { mark: "Gm", bg: "#0b1020", fg: "#60a5fa" },
  Claude: { mark: "Cl", bg: "#1f1b16", fg: "#f59e0b" },
  Midjourney: { mark: "Mj", bg: "#0f172a", fg: "#c4b5fd" },
};

function toolMark(tool: string) {
  return TOOL_STYLE[tool] ?? { mark: tool.slice(0, 2).toUpperCase(), bg: "#111827", fg: "#ffffff" };
}

function normalizeTools(tools: Array<string | AboutTool> | undefined): AboutTool[] {
  if (!Array.isArray(tools)) return [];

  return tools
    .map((tool) => {
      if (typeof tool === "string") {
        const name = tool.trim();
        return name ? { name } : null;
      }
      const name = (tool?.name || "").trim();
      if (!name) return null;
      return {
        name,
        logo: (tool.logo || "").trim() || undefined,
      };
    })
    .filter((item): item is AboutTool => Boolean(item));
}

export default async function AboutPage() {
  const content = await readSiteContent();
  const about = content.about;
  const sharedVideoPool = (content.home.sharedBackgroundPool || []).filter((item) =>
    isVideoAsset(item),
  );
  const storyVideo =
    sharedVideoPool.length > 0
      ? sharedVideoPool[Math.floor(Math.random() * sharedVideoPool.length)]!
      : "";
  const sourceTools = normalizeTools(about?.tools);
  const allToolsMap = new Map<string, AboutTool>();
  for (const tool of sourceTools) allToolsMap.set(tool.name, tool);
  const allTools = Array.from(allToolsMap.values());

  return (
    <div className="relative py-12 sm:py-16">
      <Container className="space-y-10 sm:space-y-14">
        <Reveal>
          <section className="relative overflow-hidden rounded-[36px] border border-white/20 bg-gradient-to-br from-[#e22228] via-[#c81921] to-[#7f0f16] p-8 text-white shadow-[0_30px_80px_rgba(0,0,0,0.35)] sm:p-12">
            {storyVideo ? (
              <video
                className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-45 blur-md"
                src={storyVideo}
                autoPlay
                muted
                loop
                playsInline
                preload="none"
                aria-hidden="true"
              />
            ) : null}
            <div className="pointer-events-none absolute inset-0 bg-black/28 backdrop-blur-[1px]" />
            <div className="relative z-10 grid gap-10 lg:grid-cols-12 lg:items-start">
              <div className="space-y-4 lg:col-span-8">
                <div className="text-xs font-semibold tracking-[0.20em] text-white/80">
                  {about?.eyebrow || "ABOUT"}
                </div>
                <h1 className="font-display text-4xl font-semibold tracking-tighter2 sm:text-6xl">
                  {about?.title || "A team that helps your brand grow."}
                </h1>
                <div className="space-y-4 text-base leading-7 text-white/90 sm:text-lg sm:leading-8">
                  {(about?.intro?.length ? about.intro : []).map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <CTAButton href="/contact" className="header-project-cta">
                    Work with DIXEL
                  </CTAButton>
                  <CTAButton href="/work" variant="secondary" className="header-project-cta">
                    See work
                  </CTAButton>
                </div>
              </div>

              <div className="lg:col-span-4">
                <div className="space-y-4 rounded-3xl border border-white/30 bg-black/20 p-6 backdrop-blur">
                  <div>
                    <div className="text-xs font-semibold tracking-[0.20em] text-white/75">
                      VISION
                    </div>
                    <p className="mt-2 text-sm leading-7 text-white/90">
                      {about?.vision ||
                        "To help more businesses stand out and grow."}
                    </p>
                  </div>
                  <div className="border-t border-white/20 pt-4">
                    <div className="text-xs font-semibold tracking-[0.20em] text-white/75">
                      MISSION
                    </div>
                    <p className="mt-2 text-sm leading-7 text-white/90">
                      {about?.mission ||
                        "To make your brand clear, professional, and easy to trust."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="rounded-[36px] border border-black/10 bg-[#f6f8f5] p-8 text-[#22201e] shadow-[0_24px_70px_rgba(0,0,0,0.14)] sm:p-12">
            <div className="space-y-3">
              <div className="text-xs font-semibold tracking-[0.20em] text-black/60">
                HOW WE WORK
              </div>
              <h2 className="font-display text-3xl font-semibold tracking-tighter2 sm:text-4xl">
                How we work with you
              </h2>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-5">
              {(about?.howWeWork || []).map((p, idx) => (
                <Reveal key={p.title} delay={0.03 * idx}>
                  <article className="h-full rounded-3xl border border-black/12 bg-white p-6">
                    <div className="font-display text-lg font-semibold tracking-tight text-[#22201e]">
                      {p.title}
                    </div>
                    <p className="mt-3 text-sm leading-7 text-black/75">
                      {p.text}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="rounded-[36px] border border-white/10 bg-[#22201e] p-8 text-white shadow-[0_30px_80px_rgba(0,0,0,0.35)] sm:p-12">
            <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
              <div className="space-y-3 lg:col-span-5">
                <div className="text-xs font-semibold tracking-[0.20em] text-white/60">
                  OUR TOOLS
                </div>
                <h2 className="font-display text-3xl font-semibold tracking-tighter2 sm:text-4xl">
                  Tools we use every day
                </h2>
                <p className="text-sm leading-7 text-white/75">
                  These tools help us create great visuals, videos, and campaigns
                  for your brand.
                </p>
              </div>
              <div className="lg:col-span-7">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {allTools.map((tool) => {
                    const icon = toolMark(tool.name);
                    return (
                      <div
                        key={tool.name}
                        className="flex items-center gap-3 rounded-2xl border border-white/12 bg-white/6 px-3 py-3"
                      >
                        {tool.logo ? (
                          <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/20 bg-white/90">
                            <img
                              src={tool.logo}
                              alt={`${tool.name} logo`}
                              className="h-full w-full object-contain p-1"
                              loading="lazy"
                              decoding="async"
                            />
                          </div>
                        ) : (
                          <div
                            className={cn(
                              "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-black/10 text-sm font-bold",
                              icon.className,
                            )}
                            style={{ backgroundColor: icon.bg, color: icon.fg }}
                            aria-hidden="true"
                          >
                            {icon.mark}
                          </div>
                        )}
                        <span className="text-sm font-semibold text-white/90">
                          {tool.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        </Reveal>
      </Container>

      <TrustedBrandsSection clients={content.clients} className="mt-16" />
    </div>
  );
}
