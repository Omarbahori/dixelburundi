export default function CaseStudyIntro({
  headline,
  text,
}: {
  headline: string;
  text: string;
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{headline}</h2>
      <p className="max-w-3xl text-sm leading-7 text-white/75 sm:text-base">{text}</p>
    </section>
  );
}
