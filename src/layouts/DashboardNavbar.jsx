import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu,
  Search,
  ChevronDown,
  User,
  Settings,
  LifeBuoy,
  LogOut,
} from "lucide-react";
import Avatar from "../components/Avatar";
import LoadingOverlay from "../components/LoadingOverlay";
import ThemeToggle from "../components/ThemeToggle";

const menuLinks = [
  { to: "/dashboard/profile", label: "Profile", icon: User },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
  { to: "/dashboard/help", label: "Help center", icon: LifeBuoy },
];

const SIGN_OUT_STEPS = ["Saving your workspace", "Signing you out", "Signed out"];

export default function DashboardNavbar({ user, onOpenMenu, onSignOut }) {
  const [open, setOpen] = useState(false);
  const [signOutStatus, setSignOutStatus] = useState("idle"); // idle | loading | done
  const ref = useRef(null);
  const timers = useRef([]);
  const { pathname } = useLocation();

  // Close on route change
  useEffect(() => setOpen(false), [pathname]);

  // Close on outside click or Escape
  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Clear pending timers if the navbar unmounts
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const handleSignOut = () => {
    if (signOutStatus !== "idle") return;
    setOpen(false);
    setSignOutStatus("loading");

    // Frontend-only for now: replace with your real sign-out request later.
    timers.current.push(
      setTimeout(() => setSignOutStatus("done"), 1500),
      setTimeout(() => onSignOut?.(), 2000)
    );
  };

  return (
    <>
      <LoadingOverlay
        show={signOutStatus !== "idle"}
        done={signOutStatus === "done"}
        steps={SIGN_OUT_STEPS}
        duration={1.5}
      />

      <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between gap-4 border-b border-neutral-200 bg-white/85 px-4 backdrop-blur md:px-10">
        {/* Left: mobile menu + logo, desktop search */}
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <button
            onClick={onOpenMenu}
            aria-label="Open menu"
            className="lg:hidden"
          >
            <Menu size={22} />
          </button>
          <Link to="/dashboard" className="text-lg tracking-tight lg:hidden">
            Kodet
          </Link>

          <label className="hidden w-full max-w-[360px] items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm focus-within:border-black md:flex">
            <Search size={16} className="shrink-0 text-neutral-500" />
            <input
              type="search"
              placeholder="Search snippets and notes"
              className="w-full bg-transparent outline-none placeholder:text-neutral-400"
            />
          </label>
        </div>

        {/* Right: profile dropdown */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={open}
            className="flex items-center gap-3 rounded-full border border-neutral-200 bg-white py-1.5 pl-1.5 pr-3 transition-colors hover:bg-neutral-50"
          >
            <Avatar seed={user?.avatar || user?.name || user?.email} size={32} />
            <span className="hidden max-w-[140px] truncate text-sm sm:block">
              {user?.name}
            </span>
            <motion.span
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex"
            >
              <ChevronDown size={16} />
            </motion.span>
          </button>

          <AnimatePresence>
            {open && (
              <motion.div
                role="menu"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-3 w-64 rounded-2xl border border-neutral-200 bg-white p-2 shadow-lg"
              >
                <div className="px-3 py-3">
                  <p className="truncate text-sm">{user?.name}</p>
                  <p className="truncate text-xs text-neutral-500">
                    {user?.email}
                  </p>
                </div>

                <div className="border-t border-neutral-200 pt-2">
                  {menuLinks.map(({ to, label, icon: Icon }) => (
                    <Link
                      key={to}
                      to={to}
                      role="menuitem"
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-neutral-100"
                    >
                      <Icon size={16} />
                      {label}
                    </Link>
                  ))}
                </div>

                {/* Theme: stays open after toggling so the change is visible */}
                <div className="mt-2 border-t border-neutral-200 pt-2">
                  <ThemeToggle variant="menu" />
                </div>

                <div className="mt-2 border-t border-neutral-200 pt-2">
                  <button
                    role="menuitem"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-neutral-100"
                  >
                    <LogOut size={16} />
                    Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>
    </>
  );
}