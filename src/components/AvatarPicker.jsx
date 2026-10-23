import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";
import Avatar from "./Avatar";
import { avatars } from "../lib/avatars";

function PickerBody({ current, onClose, onSave }) {
  const [selected, setSelected] = useState(current);

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
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4"
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Choose your avatar"
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-3xl border border-neutral-200 bg-white"
      >
        <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-6 py-5">
          <div>
            <h2 className="text-lg">Choose your avatar</h2>
            <p className="mt-1 text-xs text-neutral-500">
              Pick one of the {avatars.length} Notionists avatars by DiceBear.
            </p>
          </div>
          <button onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="grid max-h-[50vh] grid-cols-3 gap-3 overflow-y-auto p-6 sm:grid-cols-4 md:grid-cols-6">
          {avatars.map((a) => {
            const active = selected === a.name;
            return (
              <button
                key={a.name}
                type="button"
                onClick={() => setSelected(a.name)}
                aria-pressed={active}
                className={`relative flex flex-col items-center gap-2 rounded-2xl border p-3 transition-colors ${
                  active
                    ? "border-black bg-neutral-100"
                    : "border-neutral-200 hover:bg-neutral-50"
                }`}
              >
                <Avatar seed={a.name} size={64} />
                <span className="text-xs">{a.name}</span>
                {active && (
                  <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-black text-white">
                    <Check size={12} />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-neutral-200 px-6 py-4">
          <p className="text-xs text-neutral-500">
            {selected && avatars.some((a) => a.name === selected)
              ? `Selected: ${selected}`
              : "No avatar selected"}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="rounded-xl border border-neutral-300 px-4 py-2.5 text-sm transition-colors hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(selected)}
              disabled={!selected || selected === current}
              className="rounded-xl bg-black px-5 py-2.5 text-sm text-white disabled:opacity-40"
            >
              Use avatar
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AvatarPicker({ open, current, onClose, onSave }) {
  return (
    <AnimatePresence>
      {open && <PickerBody current={current} onClose={onClose} onSave={onSave} />}
    </AnimatePresence>
  );
}