import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Menu,
  X,
  Code2,
  StickyNote,
  FolderTree,
} from "lucide-react";

const serviceLinks = [
  { label: "Code snippets", desc: "Save and reuse your code", icon: Code2 },
  { label: "Developer notes", desc: "Write things down fast", icon: StickyNote },
  { label: "Collections", desc: "Group everything by project", icon: FolderTree },
];

const navLink = ({ isActive }) =>
  `text-[15px] transition-opacity hover:opacity-60 ${
    isActive ? "underline underline-offset-8 decoration-1" : ""
  }`;

export default function Navbar() {
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => {
    setServicesOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setServicesOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-[92px] max-w-[972px] items-center justify-between border-x border-neutral-200 bg-white px-6 md:px-10">
        <Link to="/" className="text-[26px] tracking-tight">
          Kodet
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setServicesOpen((v) => !v)}
              className="flex items-center gap-1 text-[15px] transition-opacity hover:opacity-60"
              aria-expanded={servicesOpen}
            >
              Services
              <motion.span
                animate={{ rotate: servicesOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="flex"
              >
                <ChevronDown size={16} />
              </motion.span>
            </button>

            <AnimatePresence>
              {servicesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full mt-4 w-72 rounded-2xl border border-neutral-200 bg-white p-2 shadow-lg"
                >
                  {serviceLinks.map(({ label, desc, icon: Icon }) => (
                    <Link
                      key={label}
                      to="/services"
                      className="flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-neutral-100"
                    >
                      <Icon size={18} className="mt-0.5 shrink-0" />
                      <span>
                        <span className="block text-sm">{label}</span>
                        <span className="block text-xs text-neutral-500">
                          {desc}
                        </span>
                      </span>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <NavLink to="/works" className={navLink}>
            Works
          </NavLink>
          <NavLink to="/about" className={navLink}>
            About
          </NavLink>
          <NavLink to="/faq" className={navLink}>
            FAQ
          </NavLink>

          <span className="h-6 w-px bg-neutral-300" />

          <Link
            to="/signin"
            className="text-[15px] transition-opacity hover:opacity-60"
          >
            Sign in
          </Link>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/signup"
              className="block rounded-xl bg-black px-4 py-2.5 text-xs text-white"
            >
              Get Started
            </Link>
          </motion.div>
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-neutral-200 bg-white md:hidden"
          >
            <div className="flex flex-col gap-4 px-6 py-6 text-[15px]">
              <Link to="/services">Services</Link>
              <Link to="/works">Works</Link>
              <Link to="/about">About</Link>
              <Link to="/faq">FAQ</Link>
              <Link to="/signin">Sign in</Link>
              <Link
                to="/signup"
                className="w-fit rounded-xl bg-black px-4 py-2.5 text-xs text-white"
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}