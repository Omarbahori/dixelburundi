"use client";

import { AnimatePresence, motion } from "framer-motion";

export default function Toast({
  message,
  show,
}: {
  message: string;
  show: boolean;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed bottom-6 left-1/2 z-[60] w-[min(520px,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border border-white/12 bg-dixel-bg/85 px-4 py-3 text-sm font-semibold text-white backdrop-blur"
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          role="status"
        >
          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-dixel-accent align-middle" />
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
