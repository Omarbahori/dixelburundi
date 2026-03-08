"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Container from "@/components/Container";
import DixelWordmark from "@/components/DixelWordmark";
import CTAButton from "@/components/CTAButton";
import { cn } from "@/lib/cn";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/team", label: "Team" },
];

export default function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [menuTapPulse, setMenuTapPulse] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pauseBrandLoop, setPauseBrandLoop] = useState(false);
  const [packagesNavActive, setPackagesNavActive] = useState(false);
  const [packagesBilling, setPackagesBilling] = useState<"monthly" | "quarterly">("monthly");
  const [workFiltersNavActive, setWorkFiltersNavActive] = useState(false);
  const [workCategories, setWorkCategories] = useState<string[]>([]);
  const [workSelectedCategory, setWorkSelectedCategory] = useState("All");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const isVisible = (el: Element) => {
      const rect = el.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < window.innerHeight;
    };

    const check = () => {
      const markers = Array.from(document.querySelectorAll("[data-dixel-slogan-marker]"));
      const visible = markers.some((marker) => isVisible(marker));
      setPauseBrandLoop(visible);
    };

    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);

    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [pathname]);

  useEffect(() => {
    const onActive = (event: Event) => {
      const custom = event as CustomEvent<{ active?: boolean }>;
      const nextActive = Boolean(custom.detail?.active);
      setPackagesNavActive(nextActive);
      if (nextActive) {
        setOpen(false);
      }
    };

    const onBilling = (event: Event) => {
      const custom = event as CustomEvent<{ billing?: "monthly" | "quarterly" }>;
      if (custom.detail?.billing === "monthly" || custom.detail?.billing === "quarterly") {
        setPackagesBilling(custom.detail.billing);
      }
    };

    window.addEventListener("dixel:packages-nav-active", onActive as EventListener);
    window.addEventListener("dixel:packages-billing", onBilling as EventListener);

    return () => {
      window.removeEventListener("dixel:packages-nav-active", onActive as EventListener);
      window.removeEventListener("dixel:packages-billing", onBilling as EventListener);
    };
  }, []);

  useEffect(() => {
    const onActive = (event: Event) => {
      const custom = event as CustomEvent<{ active?: boolean }>;
      const nextActive = Boolean(custom.detail?.active);
      setWorkFiltersNavActive(nextActive);
      if (nextActive) {
        setOpen(false);
        window.dispatchEvent(new CustomEvent("dixel:request-work-filters-sync"));
      }
    };

    const onSync = (event: Event) => {
      const custom = event as CustomEvent<{ categories?: string[]; selectedCategory?: string }>;
      const categories = Array.isArray(custom.detail?.categories)
        ? custom.detail.categories.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
        : [];
      setWorkCategories(categories);

      const selectedCategory = custom.detail?.selectedCategory;
      if (typeof selectedCategory === "string" && selectedCategory.trim().length > 0) {
        setWorkSelectedCategory(selectedCategory);
      }
    };

    window.addEventListener("dixel:work-filters-nav-active", onActive as EventListener);
    window.addEventListener("dixel:work-filters-sync", onSync as EventListener);

    return () => {
      window.removeEventListener("dixel:work-filters-nav-active", onActive as EventListener);
      window.removeEventListener("dixel:work-filters-sync", onSync as EventListener);
    };
  }, []);

  useEffect(() => {
    if (pathname.startsWith("/work")) return;
    setWorkFiltersNavActive(false);
    setWorkCategories([]);
    setWorkSelectedCategory("All");
  }, [pathname]);

  function togglePackagesBilling() {
    const next = packagesBilling === "monthly" ? "quarterly" : "monthly";
    setPackagesBilling(next);
    window.dispatchEvent(
      new CustomEvent("dixel:set-packages-billing", {
        detail: { billing: next },
      }),
    );
  }

  function handleMobileMenuToggle() {
    setMenuTapPulse(true);
    setOpen((v) => !v);
    window.setTimeout(() => setMenuTapPulse(false), 460);
  }

  function setWorkCategory(category: string) {
    setWorkSelectedCategory(category);
    window.dispatchEvent(
      new CustomEvent("dixel:set-work-category", {
        detail: { category },
      }),
    );
  }

  const showWorkHeaderFilters =
    !packagesNavActive &&
    pathname.startsWith("/work") &&
    workFiltersNavActive &&
    workCategories.length > 0;

  const primaryRowTransitionClass = packagesNavActive
    ? "pointer-events-none -translate-y-2 opacity-0"
    : "translate-y-0 opacity-100";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 surface-dark transition duration-200",
        scrolled
          ? "border-b border-white/10 bg-black/40 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <Container className="py-3 sm:py-4">
        <div
          className={cn(
            "rounded-[24px] border border-white/18 bg-black/35 px-4 py-3 shadow-[0_12px_42px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-all duration-200 sm:rounded-[28px] sm:px-5",
            scrolled && "border-white/22 bg-black/42 py-2.5 shadow-[0_14px_48px_rgba(0,0,0,0.4)]",
          )}
        >
          <div className="relative min-h-[40px]">
            <div
              className={cn(
                "transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                primaryRowTransitionClass,
              )}
            >
              <div className="flex items-center justify-between gap-5">
                <div
                  className={cn(
                    "relative ml-2 h-10 min-w-[168px] sm:ml-10",
                    pauseBrandLoop && "brand-loop-paused",
                    showWorkHeaderFilters && "hidden md:block",
                  )}
                >
                  <div className="brand-loop-logo absolute inset-0 flex items-center">
                    <DixelWordmark />
                  </div>
                  <Link
                    href="/"
                    aria-label="DIXEL Home"
                    className="brand-loop-slogan absolute inset-0 flex flex-col items-start justify-center text-[11px] font-extrabold tracking-[0.04em] text-white sm:text-xs"
                  >
                    <span>Be Visible.</span>
                    <span>Be Digital.</span>
                  </Link>
                </div>

                {showWorkHeaderFilters ? (
                  <div className="min-w-0 flex-1 md:hidden">
                    <div className="w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      <div className="inline-flex min-w-max items-center gap-1.5 rounded-full border border-white/12 bg-black/30 px-1.5 py-1">
                        {workCategories.map((category) => (
                          <button
                            key={category}
                            type="button"
                            onClick={() => setWorkCategory(category)}
                            className={cn(
                              "whitespace-nowrap rounded-full border px-2.5 py-1.5 text-[11px] font-semibold tracking-tight transition-colors",
                              workSelectedCategory === category
                                ? "border-white/20 bg-white/12 text-white"
                                : "border-white/12 bg-white/4 text-white/75 hover:border-white/18 hover:bg-white/8 hover:text-white",
                            )}
                            aria-label={`Filter work by ${category}`}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="hidden min-w-0 flex-1 items-center justify-center md:flex">
                  {showWorkHeaderFilters ? (
                    <div className="inline-flex max-w-full items-center gap-2 overflow-x-auto rounded-full border border-white/12 bg-black/30 px-2 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      {workCategories.map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => setWorkCategory(category)}
                          className={cn(
                            "whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold tracking-tight transition-colors sm:px-4 sm:py-2 sm:text-sm",
                            workSelectedCategory === category
                              ? "border-white/20 bg-white/12 text-white"
                              : "border-white/12 bg-white/4 text-white/75 hover:border-white/18 hover:bg-white/8 hover:text-white",
                          )}
                          aria-label={`Filter work by ${category}`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <nav className="hidden items-center gap-6 transition-all duration-300 md:flex">
                      {navItems.map((item) => {
                        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                              "relative text-sm font-semibold tracking-tight text-white/92 [text-shadow:0_1px_12px_rgba(0,0,0,0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:text-white",
                              "after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:rounded-full after:bg-dixel-accent after:transition-transform after:duration-200",
                              "hover:after:scale-x-100",
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black/60",
                              active &&
                                "!font-extrabold !text-white after:scale-x-100 after:bg-white [text-shadow:0_0_12px_rgba(255,255,255,0.28)]",
                            )}
                          >
                            {item.label}
                          </Link>
                        );
                      })}
                    </nav>
                  )}
                </div>

                <div className="hidden items-center gap-3 rounded-full border border-white/14 bg-black/20 p-1.5 md:flex">
                  <CTAButton href="/contact" size="sm" className="header-project-cta">
                    Start a project
                  </CTAButton>
                </div>

                <button
                  className={cn(
                    "mobile-menu-button mobile-menu-button--loop inline-flex h-10 w-10 shrink-0 aspect-square items-center justify-center rounded-full border border-white/14 bg-white/4 p-0 text-white/90 md:hidden",
                    open && "is-open",
                    menuTapPulse && "mobile-menu-button--pulse",
                  )}
                  aria-label="Open menu"
                  onClick={handleMobileMenuToggle}
                >
                  <span className="sr-only">Menu</span>
                  <div className="flex flex-col gap-1.5">
                    <span className={cn("h-0.5 w-5 bg-white transition-transform", open && "translate-y-2 rotate-45")} />
                    <span className={cn("h-0.5 w-5 bg-white transition-opacity", open && "opacity-0")} />
                    <span className={cn("h-0.5 w-5 bg-white transition-transform", open && "-translate-y-2 -rotate-45")} />
                  </div>
                </button>
              </div>
            </div>

            {packagesNavActive ? (
              <div className="absolute inset-0 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none translate-y-0 opacity-100">
                <div className="pointer-events-auto inline-flex max-w-full items-center gap-2 px-2 py-1 sm:gap-3">
                  <span className={cn("whitespace-nowrap text-[11px] font-semibold sm:text-sm", packagesBilling === "monthly" ? "text-white" : "text-white/65")}>
                    Monthly
                  </span>
                  <button
                    type="button"
                    onClick={togglePackagesBilling}
                    className={cn(
                      "relative h-9 w-16 rounded-full transition sm:h-11 sm:w-20",
                      packagesBilling === "quarterly"
                        ? "bg-dixel-accent ring-1 ring-dixel-accent/60"
                        : "bg-[#dddddf] ring-1 ring-black/8",
                    )}
                    aria-label="Toggle billing mode"
                  >
                    <span
                      className={cn(
                        "absolute left-1 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.25)] transition-transform sm:h-8 sm:w-8",
                        packagesBilling === "quarterly" ? "translate-x-8 sm:translate-x-10" : "translate-x-0",
                      )}
                    />
                  </button>
                  <span className={cn("whitespace-nowrap text-[11px] font-semibold sm:text-sm", packagesBilling === "quarterly" ? "text-white" : "text-white/65")}>
                    Quarterly
                  </span>
                  <span className="rounded-md border border-[#f4d07f]/35 bg-[#f4d07f] px-3 py-1 text-xs font-semibold text-[#2b2623] shadow-[0_10px_24px_rgba(0,0,0,0.16)]">
                    Save Money
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {open && !packagesNavActive && (
          <div className="mobile-nav-sheet mt-4 rounded-[24px] border border-white/10 bg-dixel-bg/70 p-4 md:hidden">
            <div className="flex flex-col gap-1">
              {navItems.map((item, idx) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "mobile-nav-item rounded-2xl px-4 py-3 text-sm font-semibold text-white/85 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/6 hover:text-dixel-accent",
                    (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)) &&
                      "!text-white !font-extrabold !bg-white/12 !border-white/24 shadow-[0_8px_20px_rgba(0,0,0,0.26)]",
                  )}
                  style={{ animationDelay: `${260 + idx * 70}ms` }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="mobile-nav-cta mt-3 grid grid-cols-1 gap-2">
              <CTAButton href="/contact" size="sm" className="w-full header-project-cta">
                Start a project
              </CTAButton>
            </div>
          </div>
        )}
      </Container>
    </header>
  );
}

