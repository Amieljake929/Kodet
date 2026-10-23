import { NavLink, Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  MessageSquare,
  Code2,
  StickyNote,
  FolderTree,
  Tags,
  Star,
  Trash2,
  X,
} from "lucide-react";

const mainLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/dashboard/chats", label: "Chats", icon: MessageSquare },
];

const libraryLinks = [
  { to: "/dashboard/snippets", label: "Snippets", icon: Code2 },
  { to: "/dashboard/notes", label: "Notes", icon: StickyNote },
  { to: "/dashboard/collections", label: "Collections", icon: FolderTree },
  { to: "/dashboard/tags", label: "Tags", icon: Tags },
];

const otherLinks = [
  { to: "/dashboard/favorites", label: "Favorites", icon: Star },
  { to: "/dashboard/trash", label: "Trash", icon: Trash2 },
];

function NavItem({ to, label, icon: Icon, end, onNavigate }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
          isActive
            ? "bg-neutral-100 text-black"
            : "text-neutral-600 hover:bg-neutral-50 hover:text-black"
        }`
      }
    >
      <Icon size={18} />
      {label}
    </NavLink>
  );
}

function SidebarContent({ onNavigate, showClose, onClose }) {
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-neutral-200 px-6">
        <Link to="/dashboard" className="text-[22px] tracking-tight">
          Kodet
        </Link>
        {showClose && (
          <button onClick={onClose} aria-label="Close menu" className="lg:hidden">
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {mainLinks.map((l) => (
            <NavItem key={l.to} {...l} onNavigate={onNavigate} />
          ))}
        </div>

        <p className="mb-2 mt-6 px-3 text-xs text-neutral-400">Library</p>
        <div className="space-y-1">
          {libraryLinks.map((l) => (
            <NavItem key={l.to} {...l} onNavigate={onNavigate} />
          ))}
        </div>

        <div className="my-4 border-t border-neutral-200" />
        <div className="space-y-1">
          {otherLinks.map((l) => (
            <NavItem key={l.to} {...l} onNavigate={onNavigate} />
          ))}
        </div>
      </nav>
    </div>
  );
}

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Desktop */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-neutral-200 lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            />
            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed inset-y-0 left-0 z-50 w-64 border-r border-neutral-200 lg:hidden"
            >
              <SidebarContent onNavigate={onClose} showClose onClose={onClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}