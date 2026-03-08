import Link from "next/link";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import DashboardClient, { type AdminView } from "@/app/admin/dashboard/DashboardClient";

const NAV_ITEMS: Array<{
  key: Exclude<AdminView, "all">;
  label: string;
  helper: string;
}> = [
  { key: "overview", label: "Overview", helper: "Status and quick checks" },
  { key: "services-content", label: "Services", helper: "Service copy and icons" },
  { key: "testimonials", label: "Testimonials", helper: "Client feedback section" },
  { key: "about-tools", label: "About Tools", helper: "Tool badges and order" },
  { key: "media", label: "Media", helper: "Backgrounds and uploads" },
  { key: "clients", label: "Clients", helper: "Trusted brands and logos" },
  { key: "works", label: "Works", helper: "Portfolio and case studies" },
  { key: "team", label: "Team", helper: "Members and images" },
  { key: "packages", label: "Packages", helper: "Pricing and plans" },
  { key: "json", label: "JSON", helper: "Raw content editor" },
];

export default function AdminDashboardShell({ view }: { view: AdminView }) {
  return (
    <div className="relative py-10 sm:py-14 surface-dark">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(780px_360px_at_8%_12%,rgba(226,34,40,0.20),transparent_62%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(680px_300px_at_92%_86%,rgba(255,255,255,0.10),transparent_65%)]" />
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-[30px] border border-white/12 bg-[linear-gradient(160deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.03)_35%,rgba(255,255,255,0.02)_100%)] shadow-[0_24px_80px_rgba(0,0,0,0.42)]">
            <div className="pointer-events-none absolute inset-0 dixel-grid opacity-15" />
            <div className="relative grid gap-0 lg:grid-cols-[300px_minmax(0,1fr)]">
              <aside className="border-b border-white/10 bg-black/24 p-6 backdrop-blur-xl lg:border-b-0 lg:border-r">
                <div className="rounded-2xl border border-white/12 bg-white/5 px-4 py-4">
                  <div className="text-[11px] font-semibold tracking-[0.24em] text-white/55">
                    DIXEL CMS
                  </div>
                  <div className="mt-2 font-display text-2xl font-semibold tracking-tight text-white">
                    Admin
                  </div>
                  <p className="mt-2 text-xs leading-5 text-white/65">
                    Manage your site in focused sections. Changes are live after save.
                  </p>
                </div>

                <nav className="mt-5 space-y-2">
                  {NAV_ITEMS.map((item, idx) => {
                    const active = view === item.key;
                    return (
                      <Link
                        key={item.key}
                        href={`/admin/dashboard/${item.key}`}
                        className={`group relative flex items-start gap-3 rounded-2xl border px-3 py-3 transition ${
                          active
                            ? "border-dixel-accent/55 bg-dixel-accent/18 text-white shadow-[0_12px_30px_rgba(226,34,40,0.18)]"
                            : "border-white/10 bg-white/4 text-white/78 hover:border-white/25 hover:bg-white/9 hover:text-white"
                        }`}
                      >
                        <span
                          className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[11px] font-semibold ${
                            active
                              ? "border-white/35 bg-white/12 text-white"
                              : "border-white/18 bg-white/6 text-white/75"
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold tracking-tight">{item.label}</span>
                          <span className="block text-[11px] text-white/58">{item.helper}</span>
                        </span>
                      </Link>
                    );
                  })}
                </nav>

                <div className="mt-5">
                  <Link
                    href="/studio"
                    target="_blank"
                    rel="noreferrer"
                    className="group relative flex items-start gap-3 rounded-2xl border border-white/10 bg-white/4 px-3 py-3 text-white/78 transition hover:border-white/25 hover:bg-white/9 hover:text-white"
                  >
                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-white/18 bg-white/6 text-[11px] font-semibold text-white/75">
                      S
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold tracking-tight">Open Studio</span>
                      <span className="block text-[11px] text-white/58">Manage Sanity content</span>
                    </span>
                  </Link>
                </div>
              </aside>

              <main className="p-4 sm:p-6">
                <div className="rounded-2xl border border-white/12 bg-black/22 p-4 sm:p-6">
                  <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                    <div className="text-[11px] font-semibold tracking-[0.24em] text-white/55">
                      ADMIN DASHBOARD
                    </div>
                    <div className="rounded-full border border-white/14 bg-white/6 px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-white/75">
                      {view.toUpperCase()}
                    </div>
                  </div>
                  <DashboardClient initialView={view} />
                </div>
              </main>
            </div>
          </div>
        </Reveal>
      </Container>
    </div>
  );
}
