import Container from "@/components/Container";
import CTAButton from "@/components/CTAButton";
import Reveal from "@/components/Reveal";
import Marquee from "@/components/Marquee";
import Section from "@/components/Section";
import { readSiteContent } from "@/lib/contentStore";
import PinnedServiceCard from "@/components/PinnedServiceCard";
import LoopTypewriter from "@/components/LoopTypewriter";
import { preload } from "react-dom";
import PackagesSection from "@/app/services/PackagesSection";
import ServiceIcon from "@/components/ServiceIcon";
import ProjectGrid from "@/components/ProjectGrid";
import { resolveServiceIcon } from "@/lib/serviceIcons";
import { getPortfolioProjectsFromSanity } from "@/sanity/lib/caseStudies";

export const revalidate = 120;

function isVideoAsset(url: string) {
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
}

function pickRandom(items: string[]) {
  if (!items.length) return "";
  return items[Math.floor(Math.random() * items.length)]!;
}

export default async function HomePage() {
  const [content, sanityProjects] = await Promise.all([
    readSiteContent(),
    getPortfolioProjectsFromSanity(),
  ]);
  const projects = sanityProjects.length > 0 ? sanityProjects : content.projects;
  const featuredProjects = projects.filter((p) => p.featured);
  const featuredOrRecentProjects =
    featuredProjects.length > 0 ? featuredProjects : projects.slice(0, 3);
  const sharedPool = (content.home.sharedBackgroundPool || []).filter(Boolean);
  const sharedVideos = sharedPool.filter((item) => isVideoAsset(item));
  const sharedImages = sharedPool.filter((item) => !isVideoAsset(item));

  // Keep image fallback always present (especially important on slow mobile networks).
  const heroBackgroundVideo = pickRandom(sharedVideos);
  const heroBackgroundImage =
    pickRandom(sharedImages) || content.home.hero.backgroundImage || "";

  const bigCtaBackgroundVideo = pickRandom(sharedVideos);
  const bigCtaBackgroundImage =
    pickRandom(sharedImages) ||
    content.home.bigCta.backgroundImage ||
    content.home.hero.backgroundImage ||
    "";

  if (heroBackgroundImage) {
    preload(heroBackgroundImage, { as: "image" });
  }

  return (
    <div className="relative">
      {/* Hero */}
      <Section
        tone="dark"
        backgroundImage={heroBackgroundImage || undefined}
        backgroundVideo={heroBackgroundVideo || undefined}
        backgroundVideoPaused={Boolean(heroBackgroundVideo)}
        style={{ backgroundColor: "#22201e" }}
        className="min-h-[44vh] sm:min-h-[52vh] flex items-center"
      >
        <div className="pointer-events-none absolute inset-0 z-0 bg-black/52 backdrop-blur-[2.5px]" />
        <Container className="relative z-10 py-10 sm:py-12">
          <Reveal>
            <div className="mx-auto max-w-4xl text-center">
              <div className="space-y-6">
                <h1 className="font-display text-4xl font-extrabold leading-[1.06] tracking-tighter2 drop-shadow-[0_2px_18px_rgba(0,0,0,0.55)] sm:text-6xl">
                  <span data-dixel-slogan-marker>
                    Your brand{" "}
                  </span>
                  <br className="sm:hidden" />
                  <span data-dixel-slogan-marker>
                    can do better.
                  </span>
                </h1>
                <p className="mx-auto max-w-2xl text-base leading-6 text-white/80 drop-shadow-[0_2px_14px_rgba(0,0,0,0.55)] sm:text-lg sm:leading-7">
                  We design clear, professional visuals and marketing that help
                  your business grow.
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <CTAButton href="/contact" className="header-project-cta header-project-cta--auto">
                    Let’s Get Started
                  </CTAButton>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* The DIXEL Way */}
      <Section tone="dark" className="py-12 sm:py-16">
        <Container>
          <Reveal delay={0.1} className="-mt-2 sm:-mt-3">
            <div className="mb-4 text-center text-xs font-semibold tracking-[0.20em] text-white/70">
              TRUSTED BY LEADING BRANDS
            </div>
            <Marquee
              items={content.clients}
              sideTone="dark"
              className="mx-auto max-w-6xl"
            />
          </Reveal>
        </Container>
      </Section>

      {/* Featured Work */}
      <Section
        tone="light"
        className="relative z-20 -mt-6 overflow-hidden rounded-[22px] pt-14 pb-16 shadow-[0_10px_26px_rgba(0,0,0,0.08)] sm:rounded-[44px] sm:pt-20 sm:pb-24"
        backgroundImage={content.home.featuredWork?.backgroundImage || undefined}
      >
        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(900px_500px_at_15%_15%,rgba(226,34,40,0.10),transparent_60%)]" />
        <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-[#F6F8F5]/90 via-[#F6F8F5] to-[#F6F8F5]" />
        <Container className="relative z-10">
          <Reveal>
            <div className="flex items-end justify-between gap-6">
              <div className="space-y-3">
                <div className="text-xs font-semibold tracking-[0.20em] text-black/70">
                  FEATURED WORK
                </div>
                <h2 className="font-display text-3xl font-semibold tracking-tighter2 sm:text-4xl text-dixel-bg">
                  Work that helps brands grow.
                </h2>
              </div>
              <div className="hidden sm:block">
                <CTAButton
                  href="/work"
                  variant="secondary"
                  theme="light"
                >
                  See all
                </CTAButton>
              </div>
            </div>
          </Reveal>

          <div className="mt-10">
            <ProjectGrid
              projects={featuredOrRecentProjects}
              tone="light"
              compact
              gridClassName="grid grid-cols-1 gap-2 sm:grid-cols-2 md:gap-6 lg:grid-cols-3"
            />
          </div>

          <div className="mt-8 mb-6 sm:hidden">
            <CTAButton
              href="/work"
              variant="secondary"
              theme="light"
              className="w-full"
            >
              See all projects
            </CTAButton>
          </div>
        </Container>
      </Section>

      {/* Pillars */}
      <Section
        tone="dark"
        className="relative z-10 -mt-8 pt-20 pb-12 sm:-mt-10 sm:pt-24 sm:pb-16"
        backgroundImage={heroBackgroundImage || undefined}
        backgroundVideo={heroBackgroundVideo || undefined}
      >
        <Container>
          <Reveal>
            <div className="home-pillars-shell overflow-hidden rounded-[26px] border border-white/18 bg-gradient-to-br from-black/55 via-black/42 to-black/50 p-9 shadow-panel backdrop-blur-2xl sm:rounded-[32px] sm:p-12">
              <div className="pointer-events-none absolute inset-0 z-0 home-pillars-glow" />
              <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
                <div className="lg:col-span-5">
                  <div className="text-xs font-semibold tracking-[0.20em] text-white/60">
                    OUR PILLARS
                  </div>
                  <h2 className="mt-3 font-display text-3xl font-semibold tracking-tighter2 sm:text-4xl">
                    Strategy. Craft. Consistency.
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-white/75">
                    We help you build a strong brand, clean visuals, and steady
                    marketing that people remember.
                  </p>
                </div>

                <div className="grid gap-5 lg:col-span-7 md:grid-cols-3">
                  {[
                    {
                      title: "Strategy",
                      text: "Clear direction so your brand moves with confidence.",
                    },
                    {
                      title: "Craft",
                      text: "Clean, professional design that stands out.",
                    },
                    {
                      title: "Consistency",
                      text: "Content that stays on-brand across every channel.",
                    },
                  ].map((p, idx) => (
                    <Reveal key={p.title} delay={0.05 * idx}>
                      <div
                        className="home-pillars-card h-full rounded-2xl border border-white/18 bg-black/36 p-7"
                        style={{ animationDelay: `${idx * 220}ms` }}
                      >
                        <div className="text-xs font-semibold tracking-[0.20em] text-white/60">
                          0{idx + 1}
                        </div>
                        <div className="mt-3 font-display text-xl font-semibold tracking-tight">
                          {p.title}
                        </div>
                        <p className="mt-3 text-sm leading-7 text-white/75">
                          {p.text}
                        </p>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* Services */}
      <Section
        tone="light"
        className="relative z-20 -mt-6 overflow-hidden rounded-[22px] pt-14 pb-16 shadow-[0_18px_56px_rgba(0,0,0,0.14)] sm:rounded-[44px] sm:pt-20 sm:pb-24"
        backgroundImage={content.home.servicesSection?.backgroundImage || undefined}
      >
        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(900px_500px_at_85%_10%,rgba(226,34,40,0.12),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-[#F6F8F5]/92 via-[#F6F8F5] to-[#F6F8F5]" />
        <div className="pointer-events-none absolute inset-0 z-0 opacity-35 [background-image:linear-gradient(to_right,rgba(34,32,30,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(34,32,30,0.08)_1px,transparent_1px)] [background-size:64px_64px]" />
        <Container className="relative z-10">
          <Reveal>
            <div className="flex items-end justify-between gap-6">
              <div className="space-y-3">
                <div className="text-xs font-semibold tracking-[0.20em] text-black/70">
                  SERVICES
                </div>
                <h2 className="font-display text-3xl font-semibold tracking-tighter2 sm:text-4xl text-dixel-bg">
                  Services that help your business grow.
                </h2>
              </div>
              <div className="hidden sm:block">
                <CTAButton
                  href="/services"
                  variant="secondary"
                  theme="light"
                >
                  Packages
                </CTAButton>
              </div>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-6 pb-6 md:grid-cols-2 md:pb-0 lg:grid-cols-3">
            {content.services.map((s, idx) => (
              <Reveal key={s.id} delay={0.03 * idx}>
                <PinnedServiceCard
                  tone="light"
                  title={s.title}
                  summary={s.summary}
                  inclusions={s.inclusions}
                  icon={<ServiceIcon kind={resolveServiceIcon(s)} />}
                  pinTiltClassName={idx % 3 === 0 ? "-rotate-6" : idx % 3 === 1 ? "rotate-3" : "-rotate-2"}
                  accent="red"
                />
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* Packages Preview */}
      <Section tone="dark" className="relative z-10 -mt-px py-12 sm:py-16">
        <Container>
          <Reveal>
            <PackagesSection packages={content.packages} mode="home" />
          </Reveal>
        </Container>
      </Section>

      {/* Testimonials */}
      <Section tone="dark" className="py-12 sm:py-16" backgroundImage={content.home.testimonialsSection?.backgroundImage || undefined}>
        <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-dixel-bg/85 via-dixel-bg to-dixel-bg" />
        <Container className="relative z-10">
          <div className="space-y-3">
            <div className="text-xs font-semibold tracking-[0.20em] text-white/60">
              TESTIMONIALS
            </div>
            <h2 className="font-display text-3xl font-semibold tracking-tighter2 sm:text-4xl">
              Trusted by founders and business teams.
            </h2>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {content.testimonials.map((t, idx) => (
              <Reveal key={t.name} delay={Math.min(0.18, idx * 0.05)} variant="zoom">
                <div className="group h-full rounded-[24px] border border-white/12 bg-white/5 p-6 transition duration-200 hover:-translate-y-0.5 hover:border-white/18 hover:bg-white/8 hover:shadow-[0_14px_34px_rgba(0,0,0,0.25)] motion-reduce:transform-none motion-reduce:transition-none sm:rounded-3xl">
                  <p className="text-sm leading-6 text-white/80">
                    &quot;{t.quote}&quot;
                  </p>
                  <div className="mt-5 border-t border-white/10 pt-4">
                    <div className="flex items-center gap-3">
                      {t.image ? (
                        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-white/18 bg-white/8 aspect-square">
                          <img
                            src={t.image}
                            alt={t.name}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/18 bg-white/8 text-xs font-semibold text-white/80 aspect-square">
                          {t.name
                            .split(" ")
                            .slice(0, 2)
                            .map((part) => part[0])
                            .join("")
                            .toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-display text-base font-semibold tracking-tight">
                          {t.name}
                        </div>
                        <div className="text-xs font-semibold leading-5 tracking-normal whitespace-normal break-words text-white/60">
                          {t.title} · {t.company}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* Big CTA */}
      <Section
        tone="accent"
        className="py-14 sm:py-20"
        backgroundImage={bigCtaBackgroundImage || undefined}
        backgroundVideo={bigCtaBackgroundVideo || undefined}
      >
        <div className="pointer-events-none absolute inset-0 z-0 bg-black/34 backdrop-blur-[2px]" />
        <Container>
          <Reveal>
            <div
              className="overflow-hidden rounded-[26px] border border-white/18 bg-white/8 p-10 shadow-panel backdrop-blur-xl sm:rounded-[32px] sm:p-14"
              style={{ "--cta-cutout-bg": "transparent" } as React.CSSProperties}
            >
              <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
                <div className="space-y-5 lg:col-span-8">
                  <div className="text-xs font-semibold tracking-[0.20em] text-white/60">
                    {content.home.bigCta.eyebrow}
                  </div>
                  <h2 className="font-display text-3xl font-semibold tracking-tighter2 sm:text-5xl">
                    <LoopTypewriter text={content.home.bigCta.headline} />
                  </h2>
                  <p className="max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
                    {content.home.bigCta.subheadline}
                  </p>
                </div>
                <div className="flex flex-col gap-3 lg:col-span-4">
                  <CTAButton
                    href={content.home.bigCta.primary.href}
                    className="header-project-cta"
                  >
                    {content.home.bigCta.primary.label}
                  </CTAButton>
                  <CTAButton
                    href={content.home.bigCta.secondary.href}
                    variant="secondary"
                    className="header-project-cta justify-center"
                  >
                    {content.home.bigCta.secondary.label}
                  </CTAButton>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>
    </div>
  );
}



