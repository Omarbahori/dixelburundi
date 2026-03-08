import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import { readSiteContent } from "@/lib/contentStore";
import PinnedServiceCard from "@/components/PinnedServiceCard";
import TrustedBrandsSection from "@/components/TrustedBrandsSection";
import PackagesSection from "@/app/services/PackagesSection";
import ServiceIcon from "@/components/ServiceIcon";
import { resolveServiceIcon } from "@/lib/serviceIcons";

export const metadata = {
  title: "Services | DIXEL",
  description: "Simple services to help your business look better and grow.",
};

export default async function ServicesPage() {
  const content = await readSiteContent();
  return (
    <div className="relative py-12 sm:py-16 surface-dark">
      <Container>
        <Reveal>
          <div className="space-y-4">
            <div className="text-xs font-semibold tracking-[0.20em] text-white/60">
              SERVICES
            </div>
            <h1 className="font-display text-4xl font-semibold tracking-tighter2 sm:text-6xl">
              Services that help your business grow.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-white/75">
              Choose one service or combine a few. We help your brand look clear,
              professional, and easy to trust.
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {content.services.map((s, idx) => {
            const iconKind = resolveServiceIcon(s);
            return (
              <Reveal key={s.id} delay={0.03 * idx}>
                <PinnedServiceCard
                  tone="dark"
                  title={s.title}
                  summary={s.summary}
                  inclusions={s.inclusions}
                  icon={<ServiceIcon kind={iconKind} />}
                  titleCardWhite
                  pinTiltClassName={
                    idx % 3 === 0 ? "-rotate-6" : idx % 3 === 1 ? "rotate-3" : "-rotate-2"
                  }
                  accent="red"
                />
              </Reveal>
            );
          })}
        </div>

        <PackagesSection packages={content.packages} />
      </Container>

      <TrustedBrandsSection clients={content.clients} className="mt-16" />
    </div>
  );
}


