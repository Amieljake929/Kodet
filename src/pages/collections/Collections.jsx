import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Code2,
  FolderTree,
  Plus,
  Rocket,
  Server,
  StickyNote,
  Trash2,
  X,
} from "lucide-react";
import {
  EmptyState,
  Modal,
  PageHeader,
  SearchInput,
  btnDanger,
  btnOutline,
  btnPrimary,
  fieldClass,
  hoursAgo,
  timeAgo,
} from "../shared/pageUi";

const ICONS = {
  folder: { label: "Folder", icon: FolderTree },
  code: { label: "Code", icon: Code2 },
  book: { label: "Study", icon: BookOpen },
  server: { label: "DevOps", icon: Server },
  rocket: { label: "Project", icon: Rocket },
};

const TYPE_ICON = { snippet: Code2, note: StickyNote };

// Placeholder content: replace with real data later
const initialCollections = [
  {
    id: "c1",
    name: "Frontend utilities",
    description: "Hooks and helpers I reuse in every React project.",
    icon: "code",
    updatedAt: hoursAgo(3),
    items: [
      { id: "i1", type: "snippet", title: "Debounce function" },
      { id: "i2", type: "snippet", title: "useLocalStorage hook" },
      { id: "i3", type: "note", title: "React performance ideas" },
    ],
  },
  {
    id: "c2",
    name: "Interview prep",
    description: "Notes and algorithms to review before interviews.",
    icon: "book",
    updatedAt: hoursAgo(26),
    items: [
      { id: "i4", type: "note", title: "Reading list" },
      { id: "i5", type: "snippet", title: "Read a JSON file" },
    ],
  },
  {
    id: "c3",
    name: "DevOps cheatsheets",
    description: "Shell one-liners and deployment notes.",
    icon: "server",
    updatedAt: hoursAgo(70),
    items: [{ id: "i6", type: "snippet", title: "Find large files" }],
  },
  {
    id: "c4",
    name: "Project Kodet",
    description: "Everything related to the Kodet dashboard build.",
    icon: "rocket",
    updatedAt: hoursAgo(5),
    items: [
      { id: "i7", type: "note", title: "Sprint planning" },
      { id: "i8", type: "note", title: "Meeting with design team" },
      { id: "i9", type: "snippet", title: "Center anything with grid" },
      { id: "i10", type: "snippet", title: "Top customers by revenue" },
    ],
  },
];

export default function Collections() {
  const [collections, setCollections] = useState(initialCollections);
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", icon: "folder" });
  const [error, setError] = useState("");

  const open = collections.find((c) => c.id === openId) || null;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return collections
      .filter((c) => !q || `${c.name} ${c.description}`.toLowerCase().includes(q))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [collections, query]);

  const openCreate = () => {
    setForm({ name: "", description: "", icon: "folder" });
    setError("");
    setCreating(true);
  };

  const create = () => {
    if (!form.name.trim()) return setError("Give your collection a name.");
    const c = {
      id: `c${Date.now()}`,
      name: form.name.trim(),
      description: form.description.trim(),
      icon: form.icon,
      updatedAt: Date.now(),
      items: [],
    };
    setCollections((all) => [c, ...all]);
    setCreating(false);
  };

  const removeItem = (cid, iid) =>
    setCollections((all) =>
      all.map((c) =>
        c.id === cid ? { ...c, items: c.items.filter((i) => i.id !== iid), updatedAt: Date.now() } : c
      )
    );

  const deleteCollection = () => {
    setCollections((all) => all.filter((c) => c.id !== deleteId));
    if (openId === deleteId) setOpenId(null);
    setDeleteId(null);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {open ? (
        <>
          <button
            onClick={() => setOpenId(null)}
            className="mb-4 flex items-center gap-1.5 text-xs text-neutral-500 transition-colors hover:text-black"
          >
            <ArrowLeft size={14} />
            All collections
          </button>

          <PageHeader
            title={open.name}
            subtitle={open.description || `${open.items.length} items`}
            action={
              <button onClick={() => setDeleteId(open.id)} className={`${btnDanger} flex items-center gap-1.5`}>
                <Trash2 size={12} />
                Delete collection
              </button>
            }
          />

          {open.items.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                icon={FolderTree}
                title="This collection is empty"
                text="Add snippets and notes to keep related things together."
              />
            </div>
          ) : (
            <ul className="mt-6 divide-y divide-neutral-200 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
              {open.items.map((item) => {
                const Icon = TYPE_ICON[item.type];
                return (
                  <li key={item.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-neutral-200">
                      <Icon size={15} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px]">{item.title}</span>
                      <span className="block text-[11px] capitalize text-neutral-500">{item.type}</span>
                    </span>
                    <button
                      onClick={() => removeItem(open.id, item.id)}
                      aria-label={`Remove ${item.title}`}
                      className="rounded-lg border border-neutral-200 p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-black"
                    >
                      <X size={13} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      ) : (
        <>
          <PageHeader
            title="Collections"
            subtitle={`${collections.length} collections · group snippets and notes by topic.`}
            action={
              <button
                onClick={openCreate}
                className="flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-xs text-white transition-opacity hover:opacity-80"
              >
                <Plus size={14} />
                New collection
              </button>
            }
          />

          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search collections"
            className="mt-5 sm:max-w-sm"
          />

          {visible.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                icon={FolderTree}
                title={collections.length === 0 ? "No collections yet" : "No collections found"}
                text={
                  collections.length === 0
                    ? "Create a collection to organize your library."
                    : "Try a different search."
                }
                action={
                  collections.length === 0 && (
                    <button onClick={openCreate} className={`${btnPrimary} mt-5`}>
                      New collection
                    </button>
                  )
                }
              />
            </div>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((c) => {
                const Icon = ICONS[c.icon]?.icon || FolderTree;
                const snippets = c.items.filter((i) => i.type === "snippet").length;
                const notes = c.items.length - snippets;
                return (
                  <button
                    key={c.id}
                    onClick={() => setOpenId(c.id)}
                    className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-5 text-left transition-colors hover:bg-neutral-50"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200">
                      <Icon size={18} />
                    </span>
                    <span className="mt-4 text-sm">{c.name}</span>
                    <span className="mt-1 line-clamp-2 min-h-[32px] text-[11px] leading-relaxed text-neutral-500">
                      {c.description || "No description"}
                    </span>
                    <span className="mt-4 flex items-center justify-between text-[10px] text-neutral-400">
                      <span>
                        {snippets} snippets · {notes} notes
                      </span>
                      <span>{timeAgo(c.updatedAt)}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {creating && (
          <Modal
            title="New collection"
            subtitle="Group related snippets and notes."
            icon={FolderTree}
            onClose={() => setCreating(false)}
            footer={
              <>
                {error && <p className="mr-auto text-[11px] text-red-500">{error}</p>}
                <button onClick={() => setCreating(false)} className={btnOutline}>
                  Cancel
                </button>
                <button onClick={create} className={btnPrimary}>
                  Create
                </button>
              </>
            }
          >
            <div className="space-y-4">
              <div>
                <label htmlFor="col-name" className="mb-1.5 block text-[11px] text-neutral-500">
                  Name
                </label>
                <input
                  id="col-name"
                  autoFocus
                  value={form.name}
                  maxLength={40}
                  onChange={(e) => {
                    setForm({ ...form, name: e.target.value });
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && create()}
                  placeholder="e.g. Frontend utilities"
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="col-desc" className="mb-1.5 block text-[11px] text-neutral-500">
                  Description (optional)
                </label>
                <input
                  id="col-desc"
                  value={form.description}
                  maxLength={100}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="What goes in here?"
                  className={fieldClass}
                />
              </div>
              <div>
                <span className="mb-1.5 block text-[11px] text-neutral-500">Icon</span>
                <div className="flex gap-2">
                  {Object.entries(ICONS).map(([id, { label, icon: Icon }]) => (
                    <button
                      key={id}
                      type="button"
                      title={label}
                      aria-label={label}
                      aria-pressed={form.icon === id}
                      onClick={() => setForm({ ...form, icon: id })}
                      className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${
                        form.icon === id
                          ? "border-black bg-neutral-100"
                          : "border-neutral-200 hover:bg-neutral-50"
                      }`}
                    >
                      <Icon size={16} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Modal>
        )}

        {deleteId && (
          <Modal
            title="Delete this collection?"
            subtitle="Its items are not deleted."
            icon={Trash2}
            onClose={() => setDeleteId(null)}
            footer={
              <>
                <button onClick={() => setDeleteId(null)} className={btnOutline}>
                  Cancel
                </button>
                <button onClick={deleteCollection} className={btnDanger}>
                  Delete
                </button>
              </>
            }
          >
            <p className="text-xs leading-relaxed text-neutral-500">
              “{collections.find((c) => c.id === deleteId)?.name}” will be removed.
            </p>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
}