import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import CTAButton from "@/components/CTAButton";
import ContactForm from "@/app/contact/ContactForm";
import { buildWhatsappHrefWithMessage, readSiteContent } from "@/lib/contentStore";
import Image from "next/image";

export const metadata = {
  title: "Contact | DIXEL",
  description: "Send a request, open a mailto draft, or reach us via WhatsApp.",
};

type ContactPageProps = {
  searchParams?: Promise<{
    package?: string | string[];
  }>;
};

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const content = await readSiteContent();
  const params = (await searchParams) || {};
  const packageParam = Array.isArray(params.package) ? params.package[0] : params.package;
  const requestedPackage = (packageParam || "").toLowerCase();
  const matchedPackage =
    content.packages.find((pkg) => pkg.id.toLowerCase() === requestedPackage) || null;
  const initialPackage = matchedPackage?.name || "Not sure yet";
  const packageOptions = content.packages.map((pkg) => pkg.name);
  const whatsappDirectHref = buildWhatsappHrefWithMessage(
    content,
    `Hi ${content.settings.brandName}, I am reaching out from your Contact page and would like to discuss my project.`,
  );
  const whatsappCtaHref = buildWhatsappHrefWithMessage(
    content,
    `Hi ${content.settings.brandName}, I would like to talk about my project and get started.`,
  );

  return (
    <div className="relative pb-10 pt-12 sm:pb-14 sm:pt-16 surface-dark">
      <Container>
        <Reveal>
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="order-2 space-y-4 lg:order-1 lg:col-span-5">
              <div className="text-xs font-semibold tracking-[0.20em] text-white/60">
                CONTACT
              </div>
              <h1 className="font-display text-4xl font-semibold tracking-tighter2 sm:text-6xl">
                Let&apos;s build something that works.
              </h1>
              <p className="max-w-xl text-base leading-7 text-white/75">
                Click send and your email app will open with a ready-to-send message.
              </p>

              <div className="mt-6 rounded-[24px] border border-white/10 bg-white/4 p-7 sm:rounded-3xl">
                <div className="text-xs font-semibold tracking-[0.20em] text-white/60">
                  DIRECT
                </div>
                <div className="mt-4 space-y-2 text-sm text-white/75">
                  <div>
                    Email:{" "}
                    <a
                      className="font-semibold text-white/90 hover:text-white"
                      href={`mailto:${content.settings.contact.email}`}
                    >
                      <span className="inline-flex items-center gap-2">
                        <Image
                          src="/images/icon_email.png"
                          alt=""
                          width={16}
                          height={16}
                          className="opacity-90"
                        />
                        <span>{content.settings.contact.email}</span>
                      </span>
                    </a>
                  </div>
                  <div>
                    WhatsApp:{" "}
                    <a
                      className="font-semibold text-white/90 hover:text-white"
                      href={whatsappDirectHref}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {content.settings.contact.phone}
                    </a>
                  </div>
                  <div>Location: {content.settings.contact.location}</div>
                </div>

                <div className="mt-6">
                  <CTAButton
                    href={whatsappCtaHref}
                    target="_blank"
                    rel="noreferrer"
                    variant="secondary"
                    className="w-full"
                  >
                    Message on WhatsApp
                  </CTAButton>
                </div>
              </div>
            </div>

            <Reveal className="order-1 lg:order-2 lg:col-span-7" delay={0.05}>
              <div className="rounded-[24px] border border-white/10 bg-white/4 p-8 shadow-panel sm:rounded-3xl">
                <div className="text-xs font-semibold tracking-[0.20em] text-white/60">
                  SEND A REQUEST
                </div>
                <div className="mt-6">
                  <ContactForm
                    toEmail={content.settings.contact.email}
                    packageOptions={packageOptions}
                    initialPackage={initialPackage}
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </Reveal>
      </Container>
    </div>
  );
}
