import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Pencil, Plus, Tag, Tags as TagsIcon, Trash2, X } from "lucide-react";
import {
  EmptyState,
  Modal,
  PageHeader,
  SearchInput,
  btnDanger,
  btnOutline,
} from "../shared/pageUi";

// Dot colors a tag can cycle through (click the dot to change it)
const PALETTE = ["#569CD6", "#4EC9B0", "#C586C0", "#DCDCAA", "#CE9178", "#9CDCFE", "#B5CEA8"];

// Placeholder content: replace with real data later
const initialTags = [
  { id: "t1", name: "react", color: PALETTE[0], snippets: 6, notes: 2 },
  { id: "t2", name: "utils", color: PALETTE[1], snippets: 4, notes: 0 },
  { id: "t3", name: "css", color: PALETTE[2], snippets: 3, notes: 1 },
  { id: "t4", name: "performance", color: PALETTE[3], snippets: 2, notes: 3 },
  { id: "t5", name: "cli", color: PALETTE[4], snippets: 5, notes: 0 },
  { id: "t6", name: "meeting", color: PALETTE[5], snippets: 0, notes: 4 },
  { id: "t7", name: "sql", color: PALETTE[6], snippets: 2, notes: 0 },
  { id: "t8", name: "ideas", color: PALETTE[0], snippets: 0, notes: 5 },
];

const SORTS = [
  { id: "usage", label: "Most used" },
  { id: "name", label: "A–Z" },
];

const cleanName = (s) => s.trim().toLowerCase().replace(/^#/, "").replace(/\s+/g, "-");

export default function Tags() {
  const [tags, setTags] = useState(initialTags);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("usage");
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  const total = (t) => t.snippets + t.notes;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tags
      .filter((t) => !q || t.name.includes(q))
      .sort((a, b) => (sort === "name" ? a.name.localeCompare(b.name) : total(b) - total(a)));
  }, [tags, query, sort]);

  const mostUsed = useMemo(
    () => [...tags].sort((a, b) => total(b) - total(a))[0],
    [tags]
  );
  const unused = tags.filter((t) => total(t) === 0).length;

  const addTag = (e) => {
    e.preventDefault();
    const name = cleanName(newName);
    if (!name) return setError("Type a tag name.");
    if (tags.some((t) => t.name === name)) return setError("That tag already exists.");
    setTags((all) => [
      { id: `t${Date.now()}`, name, color: PALETTE[all.length % PALETTE.length], snippets: 0, notes: 0 },
      ...all,
    ]);
    setNewName("");
    setError("");
  };

  const cycleColor = (id) =>
    setTags((all) =>
      all.map((t) =>
        t.id === id ? { ...t, color: PALETTE[(PALETTE.indexOf(t.color) + 1) % PALETTE.length] } : t
      )
    );

  const startEdit = (t) => {
    setEditingId(t.id);
    setEditName(t.name);
    setError("");
  };

  const saveEdit = () => {
    const name = cleanName(editName);
    if (!name) return setEditingId(null);
    if (tags.some((t) => t.name === name && t.id !== editingId)) {
      return setError("That tag already exists.");
    }
    setTags((all) => all.map((t) => (t.id === editingId ? { ...t, name } : t)));
    setEditingId(null);
    setError("");
  };

  const deleteTag = () => {
    setTags((all) => all.filter((t) => t.id !== deleteId));
    setDeleteId(null);
  };

  const stats = [
    { label: "Total tags", value: tags.length },
    { label: "Most used", value: mostUsed ? `#${mostUsed.name}` : "–" },
    { label: "Unused", value: unused },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <PageHeader
        title="Tags"
        subtitle="Label snippets and notes so they are easy to find."
      />

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-neutral-200 bg-white px-5 py-4">
            <p className="text-[11px] text-neutral-500">{s.label}</p>
            <p className="mt-1 truncate text-lg">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <form onSubmit={addTag} className="flex flex-1 items-center gap-2 sm:max-w-sm">
          <input
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value);
              setError("");
            }}
            placeholder="New tag, e.g. frontend"
            aria-label="New tag name"
            maxLength={24}
            className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-xs outline-none placeholder:text-neutral-400 focus:border-black"
          />
          <button
            type="submit"
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-black px-3.5 py-2 text-xs text-white transition-opacity hover:opacity-80"
          >
            <Plus size={13} />
            Add
          </button>
        </form>

        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search tags"
          className="min-w-[180px] flex-1 sm:max-w-[240px]"
        />

        <div className="flex gap-1.5">
          {SORTS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSort(s.id)}
              aria-pressed={sort === s.id}
              className={`rounded-full border px-3 py-1 text-[11px] transition-colors ${
                sort === s.id
                  ? "border-black bg-black text-white"
                  : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="mt-2 text-[11px] text-red-500">{error}</p>}

      {visible.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={TagsIcon}
            title={tags.length === 0 ? "No tags yet" : "No tags found"}
            text={
              tags.length === 0
                ? "Create your first tag with the field above."
                : "Try a different search."
            }
          />
        </div>
      ) : (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((t) => {
            const editing = editingId === t.id;
            return (
              <li
                key={t.id}
                className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3.5"
              >
                <button
                  onClick={() => cycleColor(t.id)}
                  aria-label={`Change color of ${t.name}`}
                  title="Click to change color"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neutral-200"
                >
                  <Tag size={14} style={{ color: t.color }} />
                </button>

                <div className="min-w-0 flex-1">
                  {editing ? (
                    <input
                      autoFocus
                      value={editName}
                      maxLength={24}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit();
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      aria-label="Tag name"
                      className="w-full rounded-lg border border-neutral-200 bg-white px-2 py-1 text-[13px] outline-none focus:border-black"
                    />
                  ) : (
                    <p className="truncate text-[13px]">#{t.name}</p>
                  )}
                  <p className="mt-0.5 text-[11px] text-neutral-500">
                    {t.snippets} snippets · {t.notes} notes
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-0.5">
                  {editing ? (
                    <>
                      <button
                        onClick={saveEdit}
                        aria-label="Save tag"
                        className="rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-black"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        aria-label="Cancel rename"
                        className="rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-black"
                      >
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(t)}
                        aria-label={`Rename ${t.name}`}
                        className="rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-black"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteId(t.id)}
                        aria-label={`Delete ${t.name}`}
                        className="rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-red-500"
                      >
                        <Trash2 size={13} />
                      </button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <AnimatePresence>
        {deleteId && (
          <Modal
            title="Delete this tag?"
            subtitle="Items keep their content."
            icon={Trash2}
            onClose={() => setDeleteId(null)}
            footer={
              <>
                <button onClick={() => setDeleteId(null)} className={btnOutline}>
                  Cancel
                </button>
                <button onClick={deleteTag} className={btnDanger}>
                  Delete
                </button>
              </>
            }
          >
            <p className="text-xs leading-relaxed text-neutral-500">
              #{tags.find((t) => t.id === deleteId)?.name} will be removed from every snippet and
              note that uses it.
            </p>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
}