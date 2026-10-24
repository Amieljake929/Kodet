import { useEffect } from "react";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";

export const btnPrimary =
  "rounded-lg bg-black px-3 py-1.5 text-xs text-white transition-opacity hover:opacity-80";
export const btnOutline =
  "rounded-lg border border-neutral-300 px-3 py-1.5 text-xs transition-colors hover:bg-neutral-100";
export const btnDanger =
  "rounded-lg border border-red-300 px-3 py-1.5 text-xs text-red-500 transition-colors hover:bg-red-50";
export const fieldClass =
  "w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[13px] outline-none placeholder:text-neutral-400 transition-colors focus:border-black";

export const hoursAgo = (h) => Date.now() - h * 3600000;

export function timeAgo(ts) {
  const mins = Math.max(1, Math.round((Date.now() - ts) / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-xl">{title}</h1>
        {subtitle && <p className="mt-1 text-xs text-neutral-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder, className = "" }) {
  return (
    <label
      className={`flex items-center gap-2.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 focus-within:border-black ${className}`}
    >
      <Search size={14} className="shrink-0 text-neutral-500" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full bg-transparent text-xs outline-none placeholder:text-neutral-400"
      />
    </label>
  );
}

export function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-neutral-300 px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-neutral-200">
        <Icon size={22} />
      </span>
      <h2 className="mt-5 text-sm">{title}</h2>
      <p className="mt-2 max-w-[260px] text-xs leading-relaxed text-neutral-500">{text}</p>
      {action}
    </div>
  );
}

// Blur-only modal. Wrap in <AnimatePresence> where it is rendered.
export function Modal({ title, subtitle, icon: Icon, onClose, children, footer, maxWidth = "max-w-md" }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 backdrop-blur-md"
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 14, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className={`flex max-h-[88vh] w-full ${maxWidth} flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl`}
      >
        <div className="flex items-center justify-between gap-4 border-b border-neutral-200 px-6 py-4">
          <div className="flex items-center gap-3">
            {Icon && (
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200">
                <Icon size={16} />
              </span>
            )}
            <div>
              <h2 className="text-sm">{title}</h2>
              {subtitle && <p className="text-[11px] text-neutral-500">{subtitle}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 transition-colors hover:bg-neutral-100"
          >
            <X size={18} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2.5 border-t border-neutral-200 px-6 py-3.5">
            {footer}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}