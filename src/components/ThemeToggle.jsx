import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";

const STORAGE_KEY = "kodet-theme";

function getInitialTheme() {
  let dark = false;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    dark =
      saved !== null
        ? saved === "dark"
        : window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    /* storage unavailable, fall back to light */
  }
  document.documentElement.classList.toggle("dark", dark);
  return dark;
}

export default function ThemeToggle() {
  const [dark, setDark] = useState(getInitialTheme);

  const applyTheme = (next) => {
    document.documentElement.classList.toggle("dark", next);
    setDark(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    } catch {
      /* ignore */
    }
  };

  const handleToggle = async (e) => {
    const next = !dark;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Browsers without the View Transitions API just switch instantly
    if (!document.startViewTransition || reduceMotion) {
      applyTheme(next);
      return;
    }

    const transition = document.startViewTransition(() => applyTheme(next));
    await transition.ready;

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${radius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 700,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      }
    );
  };

  return (
    <motion.button
      onClick={handleToggle}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="fixed bottom-6 right-6 z-[100] flex h-12 w-12 items-center justify-center rounded-full border border-neutral-300 bg-white text-black shadow-lg"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={dark ? "moon" : "sun"}
          initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.2 }}
          className="flex"
        >
          {dark ? <Moon size={20} /> : <Sun size={20} />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}