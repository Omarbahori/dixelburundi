import type { Metadata } from "next";
import "./globals.css";
import SiteNav from "@/components/SiteNav";
import Footer from "@/components/Footer";
import { readSiteContent } from "@/lib/contentStore";
import WhatsAppChatWidget from "@/components/WhatsAppChatWidget";
import ScrollToTopOnRouteChange from "@/components/ScrollToTopOnRouteChange";
import type { SiteContent } from "@/lib/siteContent";

export const metadata: Metadata = {
  title: "DIXEL | Premium Creative Agency",
  description:
    "DIXEL helps startups and companies look professional, reach more people, and grow.",
};

export const revalidate = 300;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = await readSiteContent();

  return (
    <html lang="en" className="bg-dixel-bg text-dixel-ink">
      <body className="antialiased font-body">
        <div className="relative min-h-dvh overflow-x-clip bg-dixel-bg text-dixel-ink">
          <div className="pointer-events-none absolute inset-0 bg-dixel-radial opacity-100" />

          <SiteNavShell />
          <ScrollToTopOnRouteChange />
          <WhatsAppWidgetShell content={content} />
          <main className="relative surface-default">
            {children}
          </main>
          <Footer content={content} />
        </div>
      </body>
    </html>
  );
}

function SiteNavShell() {
  return <SiteNav />;
}

function WhatsAppWidgetShell({ content }: { content: SiteContent }) {
  return (
    <WhatsAppChatWidget
      whatsappNumber={content.settings.contact.whatsappNumber}
      whatsappPrefill={content.settings.contact.whatsappPrefill}
      agentName={content.settings.brandName}
      introMessage={`Hi, this is ${content.settings.brandName}. Need help growing your brand?`}
    />
  );
}
