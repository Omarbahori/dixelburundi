import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import Marquee from "@/components/Marquee";
import type { Client } from "@/lib/siteContent";

export default function TrustedBrandsSection({
  clients,
  className = "mt-14",
}: {
  clients: Client[];
  className?: string;
}) {
  if (!clients.length) return null;

  return (
    <div className={className}>
      <Container>
        <Reveal>
          <div className="space-y-4 text-center">
            <div className="text-xs font-semibold tracking-[0.20em] text-white/60">
              TRUSTED BY LEADING BRANDS
            </div>
            <Marquee items={clients} className="mx-auto max-w-6xl" />
          </div>
        </Reveal>
      </Container>
    </div>
  );
}

