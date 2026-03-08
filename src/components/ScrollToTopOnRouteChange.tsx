"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollToTopOnRouteChange() {
  const pathname = usePathname();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const scrollToHashTarget = () => {
      const { hash } = window.location;
      if (!hash) return false;
      let id = "";
      try {
        id = decodeURIComponent(hash.slice(1));
      } catch {
        return false;
      }
      if (!id) return false;
      const target = document.getElementById(id);
      if (!target) return false;
      target.scrollIntoView({ block: "start" });
      return true;
    };

    const scrollTopNow = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    if (!scrollToHashTarget()) {
      scrollTopNow();
    }
    const raf1 = window.requestAnimationFrame(() => {
      if (!scrollToHashTarget()) {
        scrollTopNow();
      }
    });
    const raf2 = window.requestAnimationFrame(() => {
      if (!scrollToHashTarget()) {
        scrollTopNow();
      }
    });

    return () => {
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
    };
  }, [pathname]);

  useEffect(() => {
    const onPageShow = () => {
      if (window.location.hash) return;
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  return null;
}
