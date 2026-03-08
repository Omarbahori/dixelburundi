import Container from "@/components/Container";
import DixelWordmark from "@/components/DixelWordmark";
import Link from "next/link";
import { readSiteContent } from "@/lib/contentStore";
import type { SiteContent } from "@/lib/siteContent";

function InstagramIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.1" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.5" cy="6.7" r="1.2" fill="currentColor" />
    </svg>
  );
}

function FacebookIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none">
      <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M13.2 20v-6.2h2.1l.4-2.4h-2.5V9.9c0-.8.3-1.4 1.4-1.4h1.2V6.3c-.2 0-.9-.1-1.8-.1-2 0-3.2 1.2-3.2 3.4v1.8H9v2.4h2V20h2.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function TikTokIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none">
      <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M14.4 7.2c.5 1.1 1.4 1.9 2.6 2.2v2.3c-.9-.1-1.8-.4-2.6-.9v4.2c0 2.3-1.8 4-4.1 4a4 4 0 0 1 0-8c.3 0 .6 0 .9.1v2.4a1.6 1.6 0 1 0 1 1.5V5.8h2.2v1.4Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default async function Footer({ content: preloadedContent }: { content?: SiteContent }) {
  const content = preloadedContent ?? (await readSiteContent());
  const year = new Date().getFullYear();
  const platformLinks = {
    facebook: "https://www.facebook.com/dixelburundi",
    instagram: "https://www.instagram.com/dixelburundi",
    tiktok: "https://www.tiktok.com/@dixelburundi",
  };
  const footerBg =
    content.settings.footer?.backgroundImage || content.home.hero.backgroundImage || "";

  return (
    <footer
      className="relative overflow-hidden border-t border-white/10 bg-dixel-bg"
      style={
        footerBg
          ? {
              backgroundImage: `url(${footerBg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }
          : undefined
      }
    >
      <div className="pointer-events-none absolute inset-0 bg-dixel-radial opacity-100" />
      <div className="pointer-events-none absolute inset-0 dixel-grid opacity-25" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-dixel-bg/70 via-dixel-bg to-dixel-bg" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_500px_at_15%_10%,rgba(226,34,40,0.22),transparent_60%)]" />

      <Container className="relative z-10 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-3">
            <DixelWordmark className="text-white" />
            <p className="max-w-sm text-sm leading-6 text-white/72">
              We build strong brands and digital experiences that help businesses grow.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 md:col-span-2">
            <div className="space-y-2">
              <div className="text-xs font-semibold tracking-[0.20em] text-white/65">
                CONTACT
              </div>
              <div className="space-y-1.5 text-sm">
                <a
                  className="text-white/90 underline-offset-4 transition duration-200 hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-dixel-bg"
                  href={`mailto:${content.settings.contact.email}`}
                >
                  {content.settings.contact.email}
                </a>
                <div className="text-white/78">{content.settings.contact.phone}</div>
                <div className="text-white/78">{content.settings.contact.location}</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold tracking-[0.20em] text-white/65">
                LINKS
              </div>
              <div className="flex flex-col gap-1.5 text-sm">
                <Link className="text-white/90 underline-offset-4 transition duration-200 hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-dixel-bg" href="/work">
                  Work
                </Link>
                <Link className="text-white/90 underline-offset-4 transition duration-200 hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-dixel-bg" href="/services">
                  Services
                </Link>
                <Link className="text-white/90 underline-offset-4 transition duration-200 hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-dixel-bg" href="/about">
                  About
                </Link>
                <Link className="text-white/90 underline-offset-4 transition duration-200 hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-dixel-bg" href="/team">
                  Team
                </Link>
                <Link className="text-white/90 underline-offset-4 transition duration-200 hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-dixel-bg" href="/contact">
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/62 sm:flex-row">
          <div className="min-w-0">
            <p className="whitespace-nowrap text-[11px] sm:text-xs">
              <Link
                href="/admin"
                className="inline transition duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-dixel-bg"
                aria-label="Admin"
                title="Admin"
              >
                &copy; {year} {content.settings.brandName}
              </Link>
              <span className="pl-1.5">All rights reserved.</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              className="footer-social-circle inline-flex h-8 w-8 shrink-0 aspect-square items-center justify-center rounded-full border border-white/30 p-0 text-white/80 transition duration-200 hover:scale-[1.12] hover:border-white/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-dixel-bg motion-reduce:transform-none motion-reduce:transition-none"
              href={platformLinks.facebook}
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
            >
              <FacebookIcon />
            </a>
            <a
              className="footer-social-circle inline-flex h-8 w-8 shrink-0 aspect-square items-center justify-center rounded-full border border-white/30 p-0 text-white/80 transition duration-200 hover:scale-[1.12] hover:border-white/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-dixel-bg motion-reduce:transform-none motion-reduce:transition-none"
              href={platformLinks.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
            >
              <InstagramIcon />
            </a>
            <a
              className="footer-social-circle inline-flex h-8 w-8 shrink-0 aspect-square items-center justify-center rounded-full border border-white/30 p-0 text-white/80 transition duration-200 hover:scale-[1.12] hover:border-white/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-dixel-bg motion-reduce:transform-none motion-reduce:transition-none"
              href={platformLinks.tiktok}
              target="_blank"
              rel="noreferrer"
              aria-label="TikTok"
            >
              <TikTokIcon />
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
