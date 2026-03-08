import Container from "@/components/Container";
import CTAButton from "@/components/CTAButton";

export default function NotFound() {
  return (
    <div className="relative py-16 sm:py-24 surface-dark">
      <Container>
        <div className="rounded-3xl border border-white/10 bg-white/4 p-10">
          <div className="text-xs font-semibold tracking-[0.20em] text-white/60">
            404
          </div>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tighter2 sm:text-5xl">
            Page not found.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/75 sm:text-base">
            The page you are looking for does not exist. It may have moved or the
            link may be old.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <CTAButton href="/work">Go to work</CTAButton>
            <CTAButton href="/" variant="secondary">
              Back home
            </CTAButton>
          </div>
        </div>
      </Container>
    </div>
  );
}


