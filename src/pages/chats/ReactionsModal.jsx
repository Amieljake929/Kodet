import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import Avatar from "../../components/Avatar";
import { REACTIONS } from "./chatOptions";

// data: { heart: [ids], haha: [ids], ok: [ids] }  ("me" = the current user)
export default function ReactionsModal({ data, initialTab = "all", me, peopleById, onClose }) {
  const [tab, setTab] = useState(initialTab);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const all = REACTIONS.flatMap((r) =>
    (data[r.id] || []).map((id) => ({ id, reaction: r }))
  );
  const rows = tab === "all" ? all : all.filter((x) => x.reaction.id === tab);

  const tabs = [
    { id: "all", label: "All", count: all.length },
    ...REACTIONS.map((r) => ({
      id: r.id,
      label: r.emoji,
      count: (data[r.id] || []).length,
    })),
  ].filter((t) => t.id === "all" || t.count > 0);

  const resolve = (id) =>
    id === "me"
      ? { name: "You", avatar: me.avatar }
      : { name: peopleById[id]?.name ?? "Unknown", avatar: peopleById[id]?.avatar };

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/30 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        role="dialog"
        aria-label="Reactions"
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-sm overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl"
      >
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-[13px]">Reactions</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 transition-colors hover:bg-neutral-100"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex gap-1 border-b border-neutral-200 px-3">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`border-b-2 px-3 py-2 text-xs transition-colors ${
                tab === t.id
                  ? "border-black"
                  : "border-transparent text-neutral-500 hover:text-black"
              }`}
            >
              {t.label} <span className="text-neutral-400">{t.count}</span>
            </button>
          ))}
        </div>

        <ul className="max-h-72 overflow-y-auto p-2">
          {rows.map(({ id, reaction }) => {
            const who = resolve(id);
            return (
              <li key={`${id}-${reaction.id}`} className="flex items-center gap-3 rounded-lg px-2 py-2">
                <Avatar seed={who.avatar} size={32} />
                <span className="min-w-0 flex-1 truncate text-[13px]">{who.name}</span>
                <span className="text-base" title={reaction.label}>
                  {reaction.emoji}
                </span>
              </li>
            );
          })}
          {rows.length === 0 && (
            <li className="px-2 py-6 text-center text-xs text-neutral-500">
              No reactions yet.
            </li>
          )}
        </ul>
      </motion.div>
    </div>,
    document.body
  );
}