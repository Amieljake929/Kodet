import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Full-screen loading overlay.
 *
 * Theme: colors come from the CSS variables remapped in index.css under
 * `html.dark` (--color-white, --color-black, --color-neutral-*), so no
 * `dark:` variants are needed here. They would follow the OS setting in
 * Tailwind v4 instead of the site's theme toggle.
 *
 * Props
 * - show:     boolean, mounts/unmounts the overlay with a fade
 * - done:     boolean, when true the bar jumps to 100% and the last step is shown
 * - steps:    string[], status lines cycled while loading (the last one is shown when `done`)
 * - duration: seconds the bar takes to crawl to ~90% while waiting
 */
export default function LoadingOverlay({
  show,
  done = false,
  steps = ["Signing you in"],
  duration = 1.6,
}) {
  const [stepIndex, setStepIndex] = useState(0);

  // Lock page scroll while the overlay is visible
  useEffect(() => {
    if (!show) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [show]);

  // Cycle through the status lines
  useEffect(() => {
    if (!show) {
      setStepIndex(0);
      return;
    }
    if (steps.length < 2) return;
    const id = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, steps.length - 1));
    }, (duration * 1000) / steps.length);
    return () => clearInterval(id);
  }, [show, steps.length, duration]);

  const label = done ? steps[steps.length - 1] : steps[stepIndex];

  // Portal to <body> so `position: fixed` isn't trapped by a parent with
  // backdrop-blur / transform (the dashboard header has backdrop-blur).
  return createPortal(
    <AnimatePresence>
      {show && (
        <motion.div
          key="loading-overlay"
          role="status"
          aria-live="polite"
          aria-busy={!done}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35 } }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white text-black"
        >
          {/* Soft dot grid that fades out toward the edges */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]"
          />

          <div className="relative flex w-full max-w-[320px] flex-col items-center px-6">
            {/* Wordmark with a blinking code caret */}
            <motion.div
              initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              className="flex items-end text-5xl font-medium tracking-tight"
            >
              <span>Kodet</span>
              <motion.span
                aria-hidden
                animate={{ opacity: [1, 1, 0, 0] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  times: [0, 0.5, 0.5, 1],
                }}
                className="mb-1.5 ml-1 inline-block h-9 w-[3px] bg-current"
              />
            </motion.div>

            {/* Progress bar */}
            <div className="mt-10 h-1 w-full overflow-hidden rounded-full bg-neutral-200">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: done ? "100%" : "90%" }}
                transition={
                  done
                    ? { duration: 0.35, ease: "easeOut" }
                    : { duration, ease: [0.22, 1, 0.36, 1] }
                }
                className="relative h-full rounded-full bg-black"
              >
                {/* Shimmer sweep */}
                <motion.span
                  aria-hidden
                  animate={{ x: ["-100%", "250%"] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/60 to-transparent"
                />
              </motion.div>
            </div>

            {/* Status line */}
            <div className="mt-6 h-6 overflow-hidden text-sm text-neutral-600">
              <AnimatePresence mode="wait">
                <motion.p
                  key={label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {label}
                  {!done && <span className="ml-0.5 animate-pulse">...</span>}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}