import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import WorkGrid from "@/app/work/WorkGrid";
import { readSiteContent } from "@/lib/contentStore";
import TrustedBrandsSection from "@/components/TrustedBrandsSection";
import { getPortfolioProjectsFromSanity } from "@/sanity/lib/caseStudies";

export const revalidate = 120;

export const metadata = {
  title: "Work | DIXEL",
  description: "A selection of DIXEL projects across design, content, and web.",
};

export default async function WorkPage() {
  const [content, sanityProjects] = await Promise.all([
    readSiteContent(),
    getPortfolioProjectsFromSanity(),
  ]);
  const projects = sanityProjects.length > 0 ? sanityProjects : content.projects;

  return (
    <div className="relative py-12 sm:py-16">
      <Container>
        <Reveal>
          <div className="space-y-4">
            <div className="text-xs font-semibold tracking-[0.20em] text-white/60">
              PORTFOLIO
            </div>
            <h1 className="font-display text-4xl font-semibold tracking-tighter2 sm:text-6xl">
              Work that builds strong brands.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-white/75">
              Filter by category and explore our projects in detail.
            </p>
          </div>
        </Reveal>

        <div className="mt-10">
          <WorkGrid projects={projects} />
        </div>
      </Container>

      <TrustedBrandsSection clients={content.clients} className="mt-16" />
    </div>
  );
}
