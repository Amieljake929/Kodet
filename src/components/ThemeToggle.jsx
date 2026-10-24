import { useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";

const STORAGE_KEY = "kodet-theme";

/* ------------------------------------------------------------------ */
/* Shared theme store                                                  */
/* One source of truth (the <html> "dark" class) so every ThemeToggle  */
/* instance stays in sync, e.g. the floating button on the landing     */
/* page and the menu item in the dashboard dropdown.                   */
/* ------------------------------------------------------------------ */

const listeners = new Set();
let initialized = false;

function initTheme() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

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
}

function applyTheme(next) {
  document.documentElement.classList.toggle("dark", next);
  try {
    localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
  } catch {
    /* ignore */
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => document.documentElement.classList.contains("dark");
const getServerSnapshot = () => false;

export function useTheme() {
  initTheme();
  const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = async (e) => {
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

  return { dark, toggle };
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/*                                                                     */
/* variant="floating"  fixed round button, bottom-right (website)      */
/* variant="menu"      row with a switch, for the profile dropdown     */
/* hidden              keeps the theme initialised but renders nothing */
/* ------------------------------------------------------------------ */

function ThemeIcon({ dark, size }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={dark ? "moon" : "sun"}
        initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
        transition={{ duration: 0.2 }}
        className="flex"
      >
        {dark ? <Moon size={size} /> : <Sun size={size} />}
      </motion.span>
    </AnimatePresence>
  );
}

export default function ThemeToggle({ variant = "floating", hidden = false }) {
  const { dark, toggle } = useTheme();

  if (hidden) return null;

  if (variant === "menu") {
    return (
      <button
        role="menuitemcheckbox"
        aria-checked={dark}
        onClick={toggle}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-neutral-100"
      >
        <ThemeIcon dark={dark} size={16} />
        <span className="flex-1 text-left">Dark mode</span>

        {/* Switch */}
        <span
          aria-hidden="true"
          className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
            dark ? "bg-black" : "bg-neutral-300"
          }`}
        >
          <motion.span
            initial={false}
            animate={{ x: dark ? 16 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 32 }}
            className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full shadow ${
              dark ? "bg-white" : "bg-white"
            }`}
          />
        </span>
      </button>
    );
  }

  return (
    <motion.button
      onClick={toggle}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="fixed bottom-6 right-6 z-[100] flex h-12 w-12 items-center justify-center rounded-full border border-neutral-300 bg-white text-black shadow-lg"
    >
      <ThemeIcon dark={dark} size={20} />
    </motion.button>
  );
}