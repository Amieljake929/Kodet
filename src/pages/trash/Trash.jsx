import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Code2, FolderTree, Info, RotateCcw, StickyNote, Trash2 } from "lucide-react";
import {
  EmptyState,
  Modal,
  PageHeader,
  SearchInput,
  btnDanger,
  btnOutline,
  hoursAgo,
  timeAgo,
} from "../shared/pageUi";

const RETENTION_DAYS = 30;

const TYPES = {
  snippet: { label: "Snippet", icon: Code2 },
  note: { label: "Note", icon: StickyNote },
  collection: { label: "Collection", icon: FolderTree },
};

// Placeholder content: replace with real data later
const initialItems = [
  { id: "d1", type: "snippet", title: "Old fetch wrapper", detail: "JavaScript", deletedAt: hoursAgo(5) },
  { id: "d2", type: "note", title: "Draft: launch announcement", detail: "128 words", deletedAt: hoursAgo(30) },
  { id: "d3", type: "collection", title: "Archive 2025", detail: "7 items", deletedAt: hoursAgo(24 * 9) },
  { id: "d4", type: "snippet", title: "Unused SQL join", detail: "SQL", deletedAt: hoursAgo(24 * 17) },
  { id: "d5", type: "note", title: "Random ideas", detail: "42 words", deletedAt: hoursAgo(24 * 27) },
];

const daysLeft = (deletedAt) =>
  Math.max(0, RETENTION_DAYS - Math.floor((Date.now() - deletedAt) / 86400000));

export default function Trash() {
  const [items, setItems] = useState(initialItems);
  const [query, setQuery] = useState("");
  const [confirm, setConfirm] = useState(null); // { kind: "one", id } | { kind: "all" }

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((i) => !q || `${i.title} ${i.detail}`.toLowerCase().includes(q))
      .sort((a, b) => b.deletedAt - a.deletedAt);
  }, [items, query]);

  const restore = (id) => setItems((all) => all.filter((i) => i.id !== id));

  const confirmDelete = () => {
    if (confirm?.kind === "all") setItems([]);
    if (confirm?.kind === "one") setItems((all) => all.filter((i) => i.id !== confirm.id));
    setConfirm(null);
  };

  const target = confirm?.kind === "one" ? items.find((i) => i.id === confirm.id) : null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <PageHeader
        title="Trash"
        subtitle={`${items.length} ${items.length === 1 ? "item" : "items"} in the trash.`}
        action={
          <button
            onClick={() => setConfirm({ kind: "all" })}
            disabled={items.length === 0}
            className={`${btnDanger} flex items-center gap-1.5 disabled:opacity-40`}
          >
            <Trash2 size={12} />
            Empty trash
          </button>
        }
      />

      <p className="mt-4 flex items-center gap-2 rounded-xl bg-neutral-100 px-4 py-2.5 text-[11px] text-neutral-600">
        <Info size={13} className="shrink-0" />
        Items are deleted permanently after {RETENTION_DAYS} days.
      </p>

      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Search trash"
        className="mt-4 sm:max-w-sm"
      />

      {visible.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Trash2}
            title={items.length === 0 ? "Trash is empty" : "Nothing found"}
            text={
              items.length === 0
                ? "Deleted snippets, notes and collections will wait here before they are removed for good."
                : "Try a different search."
            }
          />
        </div>
      ) : (
        <ul className="mt-5 divide-y divide-neutral-200 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          <AnimatePresence initial={false}>
            {visible.map((item) => {
              const type = TYPES[item.type];
              const Icon = type.icon;
              const left = daysLeft(item.deletedAt);
              return (
                <motion.li
                  key={item.id}
                  layout
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-wrap items-center gap-3 overflow-hidden px-4 py-3"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-neutral-200">
                    <Icon size={15} />
                  </span>

                  <div className="min-w-0 flex-1 basis-48">
                    <p className="truncate text-[13px]">{item.title}</p>
                    <p className="mt-0.5 text-[11px] text-neutral-500">
                      {type.label} · {item.detail} · deleted {timeAgo(item.deletedAt)}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 text-[10px] ${left <= 5 ? "text-red-500" : "text-neutral-400"}`}
                  >
                    {left} {left === 1 ? "day" : "days"} left
                  </span>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => restore(item.id)}
                      className={`${btnOutline} flex items-center gap-1.5`}
                    >
                      <RotateCcw size={12} />
                      Restore
                    </button>
                    <button
                      onClick={() => setConfirm({ kind: "one", id: item.id })}
                      aria-label={`Delete ${item.title} forever`}
                      title="Delete forever"
                      className="rounded-lg border border-neutral-200 p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-red-500"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}

      <AnimatePresence>
        {confirm && (
          <Modal
            title={confirm.kind === "all" ? "Empty the trash?" : "Delete forever?"}
            subtitle="This can't be undone."
            icon={Trash2}
            onClose={() => setConfirm(null)}
            footer={
              <>
                <button onClick={() => setConfirm(null)} className={btnOutline}>
                  Cancel
                </button>
                <button onClick={confirmDelete} className={btnDanger}>
                  {confirm.kind === "all" ? "Empty trash" : "Delete forever"}
                </button>
              </>
            }
          >
            <p className="text-xs leading-relaxed text-neutral-500">
              {confirm.kind === "all"
                ? `All ${items.length} items will be permanently deleted.`
                : `“${target?.title}” will be permanently deleted.`}
            </p>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
}