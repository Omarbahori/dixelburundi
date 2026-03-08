import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import CTAButton from "@/components/CTAButton";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { readSiteContent } from "@/lib/contentStore";

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function projectSlugValue(p: { slug?: string; title: string }) {
  return normalizeSlug(p.slug?.trim() || p.title);
}

type CaseStudyPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: CaseStudyPageProps) {
  const { slug } = await params;
  const content = await readSiteContent();
  const target = normalizeSlug(decodeURIComponent(slug));
  const project = content.projects.find((p) => projectSlugValue(p) === target);
  if (!project) return { title: "Case Study | DIXEL" };
  return { title: `${project.title} | DIXEL`, description: project.tagline };
}

export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const { slug } = await params;
  const content = await readSiteContent();
  const projects = content.projects;
  const target = normalizeSlug(decodeURIComponent(slug));
  const index = projects.findIndex((p) => projectSlugValue(p) === target);
  const project = projects[index];
  if (!project) return notFound();

  const prev = projects[index - 1];
  const next = projects[index + 1];
  const gallery = project.gallery.length ? project.gallery : [project.coverImage];

  return (
    <div className="relative py-12 sm:py-16 surface-dark">
      <Container>
        <Reveal>
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold tracking-[0.18em] text-white/60">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/4 px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-dixel-accent" />
                {project.category.toUpperCase()}
              </span>
              <span>{project.year}</span>
            </div>
            <h1 className="font-display text-4xl font-semibold tracking-tighter2 sm:text-6xl">
              {project.title}
            </h1>
            <p className="max-w-3xl text-base leading-7 text-white/75 sm:text-lg sm:leading-8">
              {project.brief}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <CTAButton href="/contact">Start a project like this</CTAButton>
              <CTAButton href="/work" variant="secondary">
                Back to work
              </CTAButton>
            </div>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-12">
          <Reveal className="lg:col-span-8">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/4">
              <div className="relative aspect-[16/10]">
                <Image
                  src={project.coverImage}
                  alt={`${project.title} cover`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </Reveal>

          <Reveal className="lg:col-span-4" delay={0.05}>
            <div className="space-y-6 rounded-3xl border border-white/10 bg-white/4 p-7">
              <div className="space-y-2">
                <div className="text-xs font-semibold tracking-[0.20em] text-white/60">
                  WHAT YOU GET
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.deliverables.map((d) => (
                    <span
                      key={d}
                      className="rounded-full border border-white/12 bg-white/3 px-3 py-1 text-xs font-semibold text-white/80"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold tracking-[0.20em] text-white/60">
                  USED IN THIS PROJECT
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.tools.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-white/12 bg-white/3 px-3 py-1 text-xs font-semibold text-white/80"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold tracking-[0.20em] text-white/60">
                  RESULTS
                </div>
                <div className="space-y-2 text-sm text-white/75">
                  {project.results.map((r) => (
                    <div key={r} className="flex items-start gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-dixel-accent/90" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="mt-10">
          <Reveal>
            <div className="space-y-4">
              <div className="text-xs font-semibold tracking-[0.20em] text-white/60">
                GALLERY
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {gallery.map((src, idx) => (
                  <div
                    key={`${src}-${idx}`}
                    className="overflow-hidden rounded-3xl border border-white/10 bg-white/4"
                  >
                    <div className="relative aspect-[16/11]">
                      <Image
                        src={src}
                        alt={`${project.title} image ${idx + 1}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-4 border-t border-white/10 pt-8 sm:grid-cols-2">
          <div>
            {prev ? (
              <Link
                href={`/work/${projectSlugValue(prev)}`}
                className="group block rounded-3xl border border-white/10 bg-white/4 p-6 hover:border-white/18"
              >
                <div className="text-xs font-semibold tracking-[0.18em] text-white/60">
                  PREVIOUS
                </div>
                <div className="mt-2 font-display text-xl font-semibold tracking-tight">
                  {prev.title}
                </div>
                <div className="mt-3 text-sm font-semibold text-dixel-accent">
                  View project
                </div>
              </Link>
            ) : (
              <div className="rounded-3xl border border-white/10 bg-white/2 p-6 text-sm text-white/60">
                Start of the list
              </div>
            )}
          </div>
          <div className="sm:text-right">
            {next ? (
              <Link
                href={`/work/${projectSlugValue(next)}`}
                className="group block rounded-3xl border border-white/10 bg-white/4 p-6 hover:border-white/18"
              >
                <div className="text-xs font-semibold tracking-[0.18em] text-white/60">
                  NEXT
                </div>
                <div className="mt-2 font-display text-xl font-semibold tracking-tight">
                  {next.title}
                </div>
                <div className="mt-3 text-sm font-semibold text-dixel-accent">
                  View project
                </div>
              </Link>
            ) : (
              <div className="rounded-3xl border border-white/10 bg-white/2 p-6 text-sm text-white/60">
                End of the list
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}

