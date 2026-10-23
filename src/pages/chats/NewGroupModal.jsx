import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Search, X } from "lucide-react";
import Avatar from "../../components/Avatar";

function ModalBody({ connections, onClose, onCreate }) {
  const [name, setName] = useState("");
  const [selected, setSelected] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const toggle = (id) => {
    setError("");
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const visible = connections.filter((p) =>
    `${p.name} ${p.username}`.toLowerCase().includes(query.toLowerCase())
  );

  const handleCreate = () => {
    if (!name.trim()) return setError("Give your group a name.");
    if (selected.length < 2) return setError("Select at least 2 people.");
    onCreate({ name: name.trim(), memberIds: selected });
  };

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
        aria-label="New group chat"
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-md flex-col rounded-3xl border border-neutral-200 bg-white"
      >
        <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-6 py-5">
          <div>
            <h2 className="text-lg">New group chat</h2>
            <p className="mt-1 text-xs text-neutral-500">
              You can add people you're connected with.
            </p>
          </div>
          <button onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto px-6 py-5">
          <div>
            <label htmlFor="group-name" className="mb-2 block text-xs text-neutral-500">
              Group name
            </label>
            <input
              id="group-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              placeholder="e.g. Frontend crew"
              maxLength={40}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none placeholder:text-neutral-400 focus:border-black"
            />
          </div>

          <div>
            <p className="mb-2 text-xs text-neutral-500">
              Add people ({selected.length} selected)
            </p>

            <label className="mb-2 flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm focus-within:border-black">
              <Search size={16} className="shrink-0 text-neutral-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your connections"
                className="w-full bg-transparent outline-none placeholder:text-neutral-400"
              />
            </label>

            {connections.length === 0 ? (
              <p className="py-6 text-center text-xs text-neutral-500">
                You have no connections yet. Send a request from the Discover tab first.
              </p>
            ) : (
              <ul className="max-h-[260px] space-y-1 overflow-y-auto">
                {visible.map((p) => {
                  const active = selected.includes(p.id);
                  return (
                    <li key={p.id}>
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={active}
                        onClick={() => toggle(p.id)}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-neutral-50"
                      >
                        <Avatar seed={p.avatar} size={36} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm">{p.name}</span>
                          <span className="block truncate text-xs text-neutral-500">
                            {p.role}
                          </span>
                        </span>
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                            active
                              ? "border-black bg-black text-white"
                              : "border-neutral-300"
                          }`}
                        >
                          {active && <Check size={12} />}
                        </span>
                      </button>
                    </li>
                  );
                })}
                {visible.length === 0 && (
                  <li className="py-4 text-center text-xs text-neutral-500">
                    No one matches your search.
                  </li>
                )}
              </ul>
            )}
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        <div className="flex justify-end gap-3 border-t border-neutral-200 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-neutral-300 px-4 py-2.5 text-sm transition-colors hover:bg-neutral-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="rounded-xl bg-black px-5 py-2.5 text-sm text-white"
          >
            Create group
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function NewGroupModal({ open, connections, onClose, onCreate }) {
  return (
    <AnimatePresence>
      {open && (
        <ModalBody connections={connections} onClose={onClose} onCreate={onCreate} />
      )}
    </AnimatePresence>
  );
}