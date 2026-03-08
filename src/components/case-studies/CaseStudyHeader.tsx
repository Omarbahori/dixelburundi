import Image from "next/image";

export type CaseStudyHeaderClient = {
  name: string;
  shortDescription: string;
  logo?: {
    src: string;
    width: number;
    height: number;
  };
};

export default function CaseStudyHeader({ client }: { client: CaseStudyHeaderClient }) {
  return (
    <header className="space-y-4">
      <div className="space-y-4">
        {client.logo ? (
          <div className="inline-block overflow-hidden rounded-2xl border border-white/15 bg-white/5 p-3 sm:p-4">
            <Image
              src={client.logo.src}
              alt={`${client.name} logo`}
              width={client.logo.width}
              height={client.logo.height}
              sizes="(max-width: 768px) 220px, 320px"
              unoptimized
              className="h-auto w-auto max-h-24 max-w-[220px] object-contain sm:max-h-28 sm:max-w-[320px]"
              priority
            />
          </div>
        ) : null}

        <h1 className="font-display text-4xl font-semibold tracking-tighter2 sm:text-6xl">
          {client.name}
        </h1>
        <p className="max-w-3xl text-base leading-7 text-white/75 sm:text-lg sm:leading-8">
          {client.shortDescription}
        </p>
      </div>
    </header>
  );
}
