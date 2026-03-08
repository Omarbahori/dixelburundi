"use client";

import {
  useEffect,
  useMemo,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { TeamMember } from "@/lib/siteContent";

const FALLBACK_IMAGE = "/placeholders/work-01.svg";
const FALLBACK_MEMBERS: TeamMember[] = [
  {
    id: "fallback-1",
    name: "DIXEL Team",
    role: "Creative",
    bio: "",
    image: FALLBACK_IMAGE,
  },
  {
    id: "fallback-2",
    name: "DIXEL Team",
    role: "Creative",
    bio: "",
    image: FALLBACK_IMAGE,
  },
  {
    id: "fallback-3",
    name: "DIXEL Team",
    role: "Creative",
    bio: "",
    image: FALLBACK_IMAGE,
  },
];
const STEP_INTERVAL_MS = 5000;
const POST_READ_DELAY_MS = 2200;
const STORAGE_KEY = "dixel.team.carousel.position.v1";
const MOBILE_SWIPE_THRESHOLD = 38;
const LOOP_ANCHOR_MULTIPLIER = 20;
const LOOP_REBASE_MIN_MULTIPLIER = 12;
const LOOP_REBASE_MAX_MULTIPLIER = 108;

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

function getLoopAnchor(baseCount: number) {
  return Math.max(1, baseCount) * LOOP_ANCHOR_MULTIPLIER;
}

function normalizeLoopIndex(index: number, baseCount: number) {
  const safeBase = Math.max(1, baseCount);
  const anchor = getLoopAnchor(safeBase);
  return anchor + mod(index - anchor, safeBase);
}

export default function CurvedDragCarousel({ members }: { members: TeamMember[] }) {
  const sourceMembers = members.length ? members : FALLBACK_MEMBERS;
  const reduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const repeated = useMemo(
    () =>
      Array.from({ length: 120 }, () => sourceMembers).flat(),
    [sourceMembers],
  );
  const baseCount = sourceMembers.length;
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [stepWidth, setStepWidth] = useState(0);
  const [index, setIndex] = useState(baseCount * 20);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [bootNoTransition, setBootNoTransition] = useState(true);
  const [typedRole, setTypedRole] = useState("");
  const [typedName, setTypedName] = useState("");
  const [typedBio, setTypedBio] = useState("");
  const [typingReadyForNextSlide, setTypingReadyForNextSlide] = useState(false);
  const [showMobileSwipeHint, setShowMobileSwipeHint] = useState(true);

  const dragRef = useRef({
    pointerId: -1,
    startClientX: 0,
    startOffset: 0,
    active: false,
  });
  const mobileSwipeRef = useRef({
    pointerId: -1,
    startX: 0,
    startY: 0,
    active: false,
  });
  const centerIndex = index + 1;
  const activeMember = sourceMembers[mod(centerIndex, baseCount)] ?? sourceMembers[0];
  const x = -(index * stepWidth) + dragOffset;
  const mobileVars = isMobile
    ? ({ "--band-gap": "0px", "--band-card-w": "100vw" } as React.CSSProperties)
    : undefined;

  useLayoutEffect(() => {
    if (!baseCount) return;
    const fallback = getLoopAnchor(baseCount);
    let nextIndex = fallback;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          index?: number;
          updatedAt?: number;
          baseCount?: number;
        };
        if (
          typeof parsed.index === "number" &&
          typeof parsed.updatedAt === "number" &&
          (typeof parsed.baseCount !== "number" || parsed.baseCount === baseCount)
        ) {
          const elapsed = Math.max(0, Date.now() - parsed.updatedAt);
          const elapsedSteps = Math.floor(elapsed / STEP_INTERVAL_MS);
          nextIndex = parsed.index + elapsedSteps;
        }
      }
    } catch {
      nextIndex = fallback;
    }

    setIndex(normalizeLoopIndex(nextIndex, baseCount));
    requestAnimationFrame(() => setBootNoTransition(false));
  }, [baseCount]);

  useEffect(() => {
    if (!baseCount || isDragging) return;
    const min = baseCount * LOOP_REBASE_MIN_MULTIPLIER;
    const max = baseCount * LOOP_REBASE_MAX_MULTIPLIER;
    if (index >= min && index <= max) return;

    const rebased = normalizeLoopIndex(index, baseCount);
    setBootNoTransition(true);
    setIndex(rebased);
    const raf = requestAnimationFrame(() => setBootNoTransition(false));
    return () => cancelAnimationFrame(raf);
  }, [index, baseCount, isDragging]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (typeof window.matchMedia !== "function") {
      setIsMobile(false);
      return;
    }
    const media = window.matchMedia("(max-width: 1024px), (hover: none) and (pointer: coarse)");
    const sync = () => setIsMobile(media.matches);
    sync();
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", sync);
      return () => media.removeEventListener("change", sync);
    }
    media.addListener(sync);
    return () => media.removeListener(sync);
  }, []);

  useEffect(() => {
    const updateMeasure = () => {
      const track = trackRef.current;
      const firstCard = track?.querySelector(".cdc-card") as HTMLElement | null;
      if (!track || !firstCard) return;
      const computed = window.getComputedStyle(track);
      const gap =
        Number.parseFloat(computed.columnGap || "") ||
        Number.parseFloat(computed.gap || "") ||
        0;
      const cardWidth = firstCard.getBoundingClientRect().width;
      if (cardWidth > 0) setStepWidth(cardWidth + gap);
    };

    updateMeasure();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateMeasure);
      return () => window.removeEventListener("resize", updateMeasure);
    }
    const ro = new ResizeObserver(updateMeasure);
    if (trackRef.current) ro.observe(trackRef.current);
    return () => ro.disconnect();
  }, [sourceMembers.length, repeated.length, isMobile]);

  useEffect(() => {
    if (!stepWidth || baseCount <= 1 || isDragging || !typingReadyForNextSlide) return;
    const id = setTimeout(() => {
      setIndex((prev) => prev + 1);
    }, STEP_INTERVAL_MS);
    return () => clearTimeout(id);
  }, [stepWidth, baseCount, isDragging, typingReadyForNextSlide]);

  useEffect(() => {
    if (!baseCount) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          index,
          updatedAt: Date.now(),
          baseCount,
        }),
      );
    } catch {
      // Ignore localStorage failures.
    }
  }, [index, baseCount]);

  useEffect(() => {
    const role = activeMember?.role || "Creative Team";
    const name = activeMember?.name || "DIXEL Team";
    const bio = activeMember?.bio || "DIXEL team member.";
    setTypingReadyForNextSlide(false);

    if (reduceMotion) {
      setTypedRole(role);
      setTypedName(name);
      setTypedBio(bio);
      const doneId = setTimeout(() => setTypingReadyForNextSlide(true), POST_READ_DELAY_MS);
      return () => clearTimeout(doneId);
    }

    if (!role && !name && !bio) {
      setTypingReadyForNextSlide(true);
      return;
    }

    setTypedRole("");
    setTypedName("");
    setTypedBio("");

    let disposed = false;
    let t1: ReturnType<typeof setTimeout> | null = null;
    let t2: ReturnType<typeof setTimeout> | null = null;
    let t3: ReturnType<typeof setTimeout> | null = null;
    let doneId: ReturnType<typeof setTimeout> | null = null;

    const typeLine = (
      text: string,
      setter: (value: string) => void,
      speed: number,
      onDone?: () => void,
    ) => {
      let i = 0;
      const step = () => {
        if (disposed) return;
        i += 1;
        setter(text.slice(0, i));
        if (i < text.length) {
          const id = setTimeout(step, speed);
          if (setter === setTypedRole) t1 = id;
          if (setter === setTypedName) t2 = id;
          if (setter === setTypedBio) t3 = id;
        } else if (onDone) {
          onDone();
        }
      };
      step();
    };

    typeLine(name, setTypedName, 16, () => {
      typeLine(role, setTypedRole, 14, () => {
        typeLine(bio, setTypedBio, 10, () => {
          doneId = setTimeout(() => {
            if (!disposed) setTypingReadyForNextSlide(true);
          }, POST_READ_DELAY_MS);
        });
      });
    });

    return () => {
      disposed = true;
      if (t1) clearTimeout(t1);
      if (t2) clearTimeout(t2);
      if (t3) clearTimeout(t3);
      if (doneId) clearTimeout(doneId);
    };
  }, [activeMember, reduceMotion]);

  useEffect(() => {
    if (!isMobile) return;
    let offTimer: ReturnType<typeof setTimeout> | null = null;
    let loopTimer: ReturnType<typeof setInterval> | null = null;

    const flashHint = () => {
      setShowMobileSwipeHint(true);
      if (offTimer) clearTimeout(offTimer);
      offTimer = setTimeout(() => setShowMobileSwipeHint(false), 3000);
    };

    flashHint();
    loopTimer = setInterval(flashHint, 9000);

    return () => {
      if (offTimer) clearTimeout(offTimer);
      if (loopTimer) clearInterval(loopTimer);
    };
  }, [isMobile]);

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!stepWidth) return;
    setIsDragging(true);
    dragRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startOffset: dragOffset,
      active: true,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragRef.current.active || dragRef.current.pointerId !== event.pointerId) return;
    const delta = event.clientX - dragRef.current.startClientX;
    setDragOffset(dragRef.current.startOffset + delta);
  }

  function settleFromDrag() {
    if (!stepWidth) return;
    const moveSteps = Math.round(-dragOffset / stepWidth);
    setIndex((prev) => prev + moveSteps);
    setDragOffset(0);
  }

  function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragRef.current.active || dragRef.current.pointerId !== event.pointerId) return;
    dragRef.current.active = false;
    setIsDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
    settleFromDrag();
  }

  function onPointerCancel(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragRef.current.active || dragRef.current.pointerId !== event.pointerId) return;
    dragRef.current.active = false;
    setIsDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
    settleFromDrag();
  }

  function onMobilePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    mobileSwipeRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      active: true,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onMobilePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (!mobileSwipeRef.current.active || mobileSwipeRef.current.pointerId !== event.pointerId) return;
    const dx = event.clientX - mobileSwipeRef.current.startX;
    const dy = event.clientY - mobileSwipeRef.current.startY;
    mobileSwipeRef.current.active = false;
    event.currentTarget.releasePointerCapture(event.pointerId);

    // Only treat clearly horizontal gestures as staff navigation.
    if (Math.abs(dx) < MOBILE_SWIPE_THRESHOLD || Math.abs(dx) <= Math.abs(dy)) return;
    setIndex((prev) => prev + (dx < 0 ? 1 : -1));
  }

  function onMobilePointerCancel(event: ReactPointerEvent<HTMLDivElement>) {
    if (!mobileSwipeRef.current.active || mobileSwipeRef.current.pointerId !== event.pointerId) return;
    mobileSwipeRef.current.active = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  function goToPrevMobileMember() {
    setIndex((prev) => prev - 1);
  }

  function goToNextMobileMember() {
    setIndex((prev) => prev + 1);
  }

  if (isMobile) {
    return (
      <div className="curved-carousel-bleed">
        <div className="curvedWrap cdc-shell cdc-mobile-single" style={mobileVars}>
          <div className="cdc-band">
            <div
              className="cdc-viewport"
              onPointerDown={onMobilePointerDown}
              onPointerUp={onMobilePointerUp}
              onPointerCancel={onMobilePointerCancel}
            >
              <AnimatePresence mode="wait">
                <motion.article
                  key={activeMember?.id ?? "fallback-member-mobile"}
                  className="cdc-card is-center"
                  style={{ width: "min(86vw, 420px)", margin: "0 auto" }}
                  initial={reduceMotion ? { opacity: 1 } : { opacity: 0, x: 28 }}
                  animate={reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -28 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                >
                  <figure className="panel cdc-panel cdc-mobile-frame">
                    <img
                      src={activeMember?.image || FALLBACK_IMAGE}
                      alt={activeMember?.name || "DIXEL Team"}
                      className="curvedImg cdc-media cdc-image"
                      loading="eager"
                      decoding="async"
                      fetchPriority="high"
                      draggable={false}
                    />
                  </figure>
                </motion.article>
              </AnimatePresence>
              <div
                className={`cdc-swipe-fab-row${showMobileSwipeHint ? " is-visible" : ""}`}
                aria-hidden="true"
              >
                <button
                  type="button"
                  className="cdc-swipe-fab cdc-swipe-fab--left"
                  onClick={goToPrevMobileMember}
                  aria-label="Previous staff"
                >
                  <span className="cdc-swipe-fab-icon" aria-hidden="true">
                    <svg viewBox="0 0 20 20" className="cdc-swipe-fab-svg">
                      <path d="M12.5 4.5L7 10l5.5 5.5" />
                    </svg>
                  </span>
                </button>
                <button
                  type="button"
                  className="cdc-swipe-fab cdc-swipe-fab--right"
                  onClick={goToNextMobileMember}
                  aria-label="Next staff"
                >
                  <span className="cdc-swipe-fab-icon" aria-hidden="true">
                    <svg viewBox="0 0 20 20" className="cdc-swipe-fab-svg">
                      <path d="M12.5 4.5L7 10l5.5 5.5" />
                    </svg>
                  </span>
                </button>
              </div>
            </div>
            <div className="cdc-active-anchor">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeMember?.id ?? "fallback-member-mobile-info"}
                  className="cdc-active-info cdc-active-info--overlay"
                  initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -10, x: 10 }}
                  animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, x: 0 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, x: 8 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                >
                  <h3 className="cdc-active-name">{typedName}</h3>
                  <div className="cdc-active-role">{typedRole}</div>
                  <p className="cdc-active-bio">{typedBio}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="curved-carousel-bleed">
      <div className="curvedWrap cdc-shell" style={mobileVars}>
        <div className="cdc-fx-grid" />
        <div className="cdc-fx-glow" />
        <div className="cdc-band">
          <div
            className={`cdc-viewport${isDragging ? " is-dragging" : ""}`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
          >
            <div
              className={`cdc-track${bootNoTransition ? " is-no-transition" : ""}`}
              style={{ transform: `translate3d(${x}px, 0, 0)` }}
              ref={trackRef}
            >
              {repeated.map((member, i) => (
                (() => {
                  const isCenter = i === centerIndex;

                  return (
                <article
                  className={`cdc-card${isCenter ? " is-center" : " is-soft"}`}
                  key={`${member.id}-${i}`}
                >
                  <figure className="panel cdc-panel">
                    <img
                      src={member.image || FALLBACK_IMAGE}
                      alt={member.name}
                      className="curvedImg cdc-media cdc-image"
                      loading={isCenter ? "eager" : "lazy"}
                      decoding="async"
                      fetchPriority={isCenter ? "high" : "low"}
                      draggable={false}
                    />
                  </figure>
                </article>
                  );
                })()
              ))}
            </div>
          </div>
          <div className="aperture top" />
          <div className="aperture bottom" />
          <div className="cdc-active-anchor">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeMember?.id ?? "fallback-member"}
                className="cdc-active-info cdc-active-info--overlay"
                initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -10, x: 10 }}
                animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, x: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, x: 8 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <h3 className="cdc-active-name">{typedName}</h3>
                <div className="cdc-active-role">{typedRole}</div>
                <p className="cdc-active-bio">{typedBio}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
