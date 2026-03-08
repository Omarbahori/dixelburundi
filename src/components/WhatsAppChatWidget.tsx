"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

type Props = {
  whatsappNumber: string;
  whatsappPrefill: string;
  agentName?: string;
  introMessage?: string;
};

const INITIAL_OPEN_DELAY_MS = 7000;
const VISIBLE_DURATION_MS = 60000;
const REOPEN_DELAY_MS = 25000;
const DISMISS_COOLDOWN_MS = 5 * 60 * 1000;
const DISMISS_UNTIL_KEY = "dixel.whatsapp.dismissUntil";

function MessageIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none">
      <path
        d="M4.5 6.5h15a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5H9.7l-3.9 3.3a.6.6 0 0 1-1-.46V17.5H4.5A1.5 1.5 0 0 1 3 16V8a1.5 1.5 0 0 1 1.5-1.5Z"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 11.3h8M8 14h5.2"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function WhatsAppChatWidget({
  whatsappNumber,
  whatsappPrefill,
  agentName = "DIXEL Team",
  introMessage = "Hi, this is DIXEL. Need help with branding, content, or web?",
}: Props) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [popupMessage, setPopupMessage] = useState(introMessage);
  const [typedMessage, setTypedMessage] = useState(reduceMotion ? introMessage : "");
  const [showTyping, setShowTyping] = useState(false);
  const [dismissedUntil, setDismissedUntil] = useState(0);
  const [hasReachedHalfScroll, setHasReachedHalfScroll] = useState(false);

  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typeStartRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const hasOpenedOnceRef = useRef(false);
  const isAdminRoute = useMemo(() => pathname?.startsWith("/admin"), [pathname]);

  function pageLabel(path: string) {
    if (path.startsWith("/services")) return "Services";
    if (path.startsWith("/case-studies")) return "Case Studies";
    if (path.startsWith("/work")) return "Work";
    if (path.startsWith("/about")) return "About";
    if (path.startsWith("/team")) return "Team";
    if (path.startsWith("/contact")) return "Contact";
    return "Home";
  }

  function normalizeSectionLabel(raw: string) {
    return raw.replace(/\s+/g, " ").trim().slice(0, 64);
  }

  function whatsappLink(number: string, message: string) {
    const text = encodeURIComponent(message || "");
    const n = (number || "").replace(/[^\d]/g, "");
    return `https://wa.me/${n}?text=${text}`;
  }

  function resolveContextMessage(path: string) {
    const page = pageLabel(path);
    if (page === "Services") {
      return `Hi from ${agentName}. Looking for the right service package? We can guide you in a minute.`;
    }
    if (page === "Work") {
      return `Hi from ${agentName}. Want a result like this for your brand? Let's talk about your next campaign.`;
    }
    if (page === "Case Studies") {
      return `Hi from ${agentName}. Interested in a similar case study result for your brand? Share your goal and we will guide you.`;
    }
    if (page === "About") {
      return `Hi from ${agentName}. If our approach fits your goals, we would love to discuss your project.`;
    }
    if (page === "Team") {
      return `Hi from ${agentName}. Want to become a DIXEL team member? Send your role, experience, and portfolio on WhatsApp.`;
    }
    if (page === "Contact") {
      return `Hi from ${agentName}. Share your goal and timeline, and we will reply quickly on WhatsApp.`;
    }
    return `Hi from ${agentName}. Need support with branding, content, or web? We are ready when you are.`;
  }

  function resolveContextPrefill(path: string, sectionLabel: string) {
    const page = pageLabel(path);
    const sectionNote = sectionLabel ? ` We are interested in: ${sectionLabel}.` : "";

    if (page === "Services") {
      return `Hi ${agentName}, I saw your Services page and I want help choosing the right package for my business.${sectionNote}`;
    }
    if (page === "Work") {
      return `Hi ${agentName}, I saw your Work page and I want similar results for my brand.${sectionNote}`;
    }
    if (page === "Case Studies") {
      return `Hi ${agentName}, I saw your Case Studies page and I want similar results for my brand.${sectionNote}`;
    }
    if (page === "About") {
      return `Hi ${agentName}, I saw your About page and I would like to discuss a project.${sectionNote}`;
    }
    if (page === "Team") {
      return `Hi ${agentName}, I want to apply to join your team.${sectionNote}`;
    }
    if (page === "Contact") {
      return `Hi ${agentName}, I am reaching out from your Contact page and would like to discuss my project.${sectionNote}`;
    }
    return `Hi ${agentName}, I visited your website and I would like to discuss my project.${sectionNote}`;
  }

  const contextualWhatsappHref = useMemo(() => {
    const message =
      resolveContextPrefill(pathname || "/", activeSection) || whatsappPrefill || introMessage;
    return whatsappLink(whatsappNumber, message);
  }, [pathname, activeSection, whatsappNumber, whatsappPrefill, introMessage]);

  function refreshActiveSection() {
    if (typeof window === "undefined") return;
    const vh = window.innerHeight || 800;
    const sections = Array.from(document.querySelectorAll("main section"));
    let best = "";
    let bestScore = Number.POSITIVE_INFINITY;

    sections.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.bottom < 72 || rect.top > vh - 72) return;
      const heading = el.querySelector("h1, h2, [data-section-title]");
      const label = normalizeSectionLabel(heading?.textContent || "");
      if (!label) return;
      const score = Math.abs(rect.top - vh * 0.32);
      if (score < bestScore) {
        bestScore = score;
        best = label;
      }
    });

    setActiveSection((prev) => (prev === best ? prev : best));
  }

  function reachedHalfPage() {
    if (typeof window === "undefined") return false;
    const root = document.documentElement;
    const maxScroll = Math.max(0, root.scrollHeight - window.innerHeight);
    if (maxScroll <= 0) return false;
    return window.scrollY >= maxScroll * 0.5;
  }

  function openPopupWithContext() {
    const nextMessage = resolveContextMessage(pathname || "/");
    setPopupMessage(nextMessage);
    setIsOpen(true);
  }

  useEffect(() => {
    if (isAdminRoute) return;
    const nextMessage = resolveContextMessage(pathname || "/");
    setPopupMessage((prev) => (prev === nextMessage ? prev : nextMessage));
  }, [pathname, activeSection, agentName, isAdminRoute]);

  function clearTimers() {
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    if (typeStartRef.current) clearTimeout(typeStartRef.current);
    openTimerRef.current = null;
    closeTimerRef.current = null;
    typeStartRef.current = null;
  }

  function scheduleOpen(delayMs: number) {
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
    openTimerRef.current = setTimeout(() => openPopupWithContext(), delayMs);
  }

  function scheduleClose(delayMs: number) {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => setIsOpen(false), delayMs);
  }

  function setDismissCooldown() {
    const until = Date.now() + DISMISS_COOLDOWN_MS;
    setDismissedUntil(until);
    try {
      window.sessionStorage.setItem(DISMISS_UNTIL_KEY, String(until));
    } catch {
      // Ignore storage failures.
    }
  }

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(DISMISS_UNTIL_KEY);
      const parsed = raw ? Number(raw) : 0;
      if (Number.isFinite(parsed) && parsed > Date.now()) {
        setDismissedUntil(parsed);
      }
    } catch {
      // Ignore storage failures.
    }
  }, []);

  useEffect(() => {
    if (isAdminRoute) return;
    refreshActiveSection();
    setHasReachedHalfScroll(reachedHalfPage());
    const onScrollOrResize = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        refreshActiveSection();
        setHasReachedHalfScroll((prev) => {
          const next = reachedHalfPage();
          return prev === next ? prev : next;
        });
      });
    };
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [pathname, isAdminRoute]);

  useEffect(() => {
    if (reduceMotion) {
      setShowTyping(false);
      setTypedMessage(popupMessage);
      return;
    }

    if (!isOpen) {
      setShowTyping(false);
      setTypedMessage("");
      return;
    }

    setTypedMessage("");
    setShowTyping(true);

    let typeInterval: ReturnType<typeof setInterval> | null = null;

    typeStartRef.current = setTimeout(() => {
      setShowTyping(false);
      let i = 0;
      typeInterval = setInterval(() => {
        i += 1;
        setTypedMessage(popupMessage.slice(0, i));
        if (i >= popupMessage.length && typeInterval) {
          clearInterval(typeInterval);
        }
      }, 24);
    }, 900);

    return () => {
      if (typeStartRef.current) clearTimeout(typeStartRef.current);
      if (typeInterval) clearInterval(typeInterval);
    };
  }, [isOpen, popupMessage, reduceMotion]);

  useEffect(() => {
    if (isAdminRoute) {
      clearTimers();
      setIsOpen(false);
      return;
    }

    if (!hasReachedHalfScroll) {
      clearTimers();
      return;
    }

    const now = Date.now();
    if (dismissedUntil > now) {
      setIsOpen(false);
      scheduleOpen(dismissedUntil - now);
      return;
    }

    if (!hasOpenedOnceRef.current && !isOpen) {
      scheduleOpen(INITIAL_OPEN_DELAY_MS);
    } else if (isOpen) {
      hasOpenedOnceRef.current = true;
      scheduleClose(VISIBLE_DURATION_MS);
    } else if (hasOpenedOnceRef.current) {
      scheduleOpen(REOPEN_DELAY_MS);
    }

    return () => {
      clearTimers();
    };
  }, [isOpen, isAdminRoute, pathname, dismissedUntil, hasReachedHalfScroll]);

  useEffect(() => {
    if (isAdminRoute) return;
    const onScroll = () => {
      if (Date.now() < dismissedUntil) return;
      if (!hasReachedHalfScroll) return;
      if (!isOpen) {
        openPopupWithContext();
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [isOpen, isAdminRoute, dismissedUntil, pathname, activeSection, hasReachedHalfScroll]);

  if (isAdminRoute) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[80] sm:bottom-6 sm:right-6">
      <div
        className={cn(
          "absolute bottom-[calc(100%+0.5rem)] right-0 w-[320px] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl border border-transparent bg-transparent shadow-[0_24px_60px_rgba(0,0,0,0.35)] transition-all duration-300 sm:bottom-[calc(100%+0.75rem)]",
          isOpen
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "pointer-events-none translate-y-4 opacity-0",
        )}
      >
        <div className="flex items-center justify-between bg-[#075e54] px-4 py-3 text-white">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-visible">
              <div className="h-10 w-10 overflow-hidden rounded-full bg-white/90">
                <Image
                  src="/icon.png"
                  alt="DIXEL"
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="absolute bottom-0 right-0 h-3 w-3 translate-x-[34%] translate-y-[18%] rounded-full border-2 border-[#0f766e] bg-[#22c55e]" />
            </div>
            <div>
              <div className="font-semibold leading-none">{agentName}</div>
              <div className="mt-1 text-xs text-white/85">Typically replies in minutes</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setDismissCooldown();
            }}
            className="rounded-md px-2 py-1 text-white/80 hover:bg-white/10 hover:text-white"
            aria-label="Close WhatsApp popup"
          >
            x
          </button>
        </div>

        <div
          className="bg-[#ece5dd] p-4"
          style={{
            backgroundImage:
              "radial-gradient(rgba(0,0,0,0.045) 1px, transparent 1px), radial-gradient(rgba(0,0,0,0.03) 1px, transparent 1px)",
            backgroundSize: "18px 18px, 24px 24px",
            backgroundPosition: "0 0, 9px 9px",
          }}
        >
          <div className="max-w-[88%] rounded-2xl rounded-tl-md bg-white px-3 py-2 text-[#1f2937]">
            <div className="text-sm font-semibold text-black/45">{agentName}</div>
            <div className="mt-1 min-h-[48px] text-base leading-6">
              {showTyping ? (
                <div className="inline-flex items-center gap-1 text-black/60">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-black/55" />
                  <span
                    className="h-1.5 w-1.5 animate-pulse rounded-full bg-black/55"
                    style={{ animationDelay: "120ms" }}
                  />
                  <span
                    className="h-1.5 w-1.5 animate-pulse rounded-full bg-black/55"
                    style={{ animationDelay: "240ms" }}
                  />
                </div>
              ) : (
                <p>{typedMessage}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-3">
          <a
            href={contextualWhatsappHref}
            target="_blank"
            rel="noreferrer"
            className="block w-full rounded-xl border border-[#25d366] bg-[#25d366] px-4 py-3 text-center text-base font-semibold text-white transition hover:bg-[#20ba57]"
          >
            Start Chat
          </a>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          if (isOpen) {
            setIsOpen(false);
            return;
          }
          openPopupWithContext();
          setDismissedUntil(0);
          try {
            window.sessionStorage.removeItem(DISMISS_UNTIL_KEY);
          } catch {
            // Ignore storage failures.
          }
        }}
        className="group relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-transparent bg-white text-dixel-accent shadow-[0_12px_26px_rgba(0,0,0,0.32)] transition hover:scale-[1.03] sm:h-14 sm:w-14"
        aria-label="Toggle WhatsApp popup"
      >
        <span className="absolute bottom-0 right-0 h-3 w-3 translate-x-[8%] translate-y-[6%] rounded-full bg-[#22c55e] ring-2 ring-white sm:h-3.5 sm:w-3.5" />
        <span className="absolute inset-0 rounded-full bg-white/40 opacity-0 group-hover:opacity-100" />
        <MessageIcon className="relative z-10 h-5 w-5 sm:h-6 sm:w-6" />
      </button>
    </div>
  );
}
