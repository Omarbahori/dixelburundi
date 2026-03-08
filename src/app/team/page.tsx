import Container from "@/components/Container";
import Section from "@/components/Section";
import Reveal from "@/components/Reveal";
import { readSiteContent } from "@/lib/contentStore";
import CurvedDragCarousel from "@/components/CurvedDragCarousel";
import TeamJoinForm from "@/components/TeamJoinForm";
import LoopTypewriter from "@/components/LoopTypewriter";

export const metadata = {
  title: "Team | DIXEL",
  description: "Meet the DIXEL team.",
};

export default async function TeamPage() {
  const content = await readSiteContent();
  const team = content.team;

  return (
    <div className="relative">
      <Section
        tone="dark"
        backgroundImage={team?.backgroundImage || undefined}
        className="pt-14 pb-3 sm:pt-20 sm:pb-4"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-dixel-bg/88 via-dixel-bg/80 to-dixel-bg" />
        <Container className="relative z-10">
          <Reveal>
            <div className="space-y-5">
              <div className="text-xs font-semibold tracking-[0.20em] text-white/60">
                {team?.eyebrow || "THE TEAM"}
              </div>
              <h1 className="font-display text-4xl font-semibold tracking-tighter2 sm:text-6xl">
                {team?.title || "The minds behind DIXEL."}
              </h1>
              <p className="max-w-2xl text-base leading-7 text-white/75 sm:text-lg sm:leading-8">
                {team?.subtitle ||
                  "A friendly team helping brands look better and grow faster."}
              </p>
            </div>
          </Reveal>
        </Container>
      </Section>

      <Section tone="dark" className="pt-0 pb-8 sm:pt-0 sm:pb-10">
        <div className="pb-4 sm:pb-6 lg:pb-8">
          <CurvedDragCarousel members={team?.members || []} />
        </div>

        <Container>
          <Reveal delay={0.1} className="mt-0 sm:mt-1">
            <div className="rounded-3xl border border-white/10 bg-white/4 p-7 sm:p-10">
              <div className="text-xs font-semibold tracking-[0.20em] text-white/60">
                JOIN THE CREW
              </div>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tighter2 text-[#e22228] sm:text-4xl">
                <LoopTypewriter
                  text="Join the DIXEL team."
                  className="text-[#e22228]"
                />
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
                Send your details and your work. If there is a good fit, we will
                contact you.
              </p>
              <div className="mt-6">
                <TeamJoinForm toEmail={content.settings.contact.email} />
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>
    </div>
  );
}
