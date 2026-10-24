import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  FolderPlus,
  MoreHorizontal,
  Pencil,
  Pin,
  PinOff,
  Plus,
  StickyNote,
  Trash2,
  X,
} from "lucide-react";
import {
  EmptyState,
  Modal,
  SearchInput,
  btnDanger,
  btnOutline,
  btnPrimary,
  fieldClass,
  hoursAgo,
} from "../shared/pageUi";

/* ------------------------------------------------------------------ */
/*  Colors: `note` = note card, `folder` = folder tint, `icon` = folder icon */
/* ------------------------------------------------------------------ */

const COLORS = [
  { id: "yellow", name: "Yellow", note: "#EBE57A", folder: "#FFFBD0", icon: "#DDD35A" },
  { id: "pink", name: "Pink", note: "#EFA7A7", folder: "#FFD7D2", icon: "#C97B54" },
  { id: "blue", name: "Blue", note: "#6CB4DE", folder: "#DDEEFF", icon: "#8F8FF5" },
  { id: "green", name: "Green", note: "#9ED9A8", folder: "#DDF5E2", icon: "#4FB36A" },
  { id: "purple", name: "Purple", note: "#B9A7E8", folder: "#E8E1FA", icon: "#8A6FD6" },
  { id: "orange", name: "Orange", note: "#F2B880", folder: "#FFE8D2", icon: "#E08A3C" },
  { id: "gray", name: "Gray", note: "#D4D4D4", folder: "#EDEDED", icon: "#8A8A8A" },
];
const getColor = (id) => COLORS.find((c) => c.id === id) || COLORS[0];

const INK = "#1f1f1f"; // text color on colored cards (always dark)

/* ------------------------------------------------------------------ */
/*  Placeholder content: replace with real data later                  */
/* ------------------------------------------------------------------ */

const initialFolders = [
  { id: "f1", name: "Work", color: "blue", createdAt: hoursAgo(50) },
  { id: "f2", name: "Study", color: "pink", createdAt: hoursAgo(24 * 3) },
  { id: "f3", name: "Ideas", color: "yellow", createdAt: hoursAgo(24 * 5) },
  { id: "f4", name: "Archive", color: "gray", createdAt: hoursAgo(24 * 40) },
];

const initialNotes = [
  {
    id: "n1",
    title: "Sprint planning",
    folderId: "f1",
    color: "yellow",
    pinned: true,
    updatedAt: hoursAgo(1),
    body: "Goals for this sprint:\n- Finish the chat UI polish\n- Snippets page with syntax colors\n- Start on collections\n\nBlockers: waiting on the API keys.",
  },
  {
    id: "n2",
    title: "React performance",
    folderId: "f2",
    color: "blue",
    pinned: false,
    updatedAt: hoursAgo(3),
    body: "1. Memoize expensive lists with useMemo\n2. Split routes with React.lazy\n3. Avoid inline objects in deps arrays\n4. Measure first with the Profiler.",
  },
  {
    id: "n3",
    title: "Design team meeting",
    folderId: "f1",
    color: "pink",
    pinned: false,
    updatedAt: hoursAgo(30),
    body: "Agreed on a neutral palette with one accent color. Mockups for the dashboard arrive Friday. Ask about dark mode contrast.",
  },
  {
    id: "n4",
    title: "Reading list",
    folderId: "f2",
    color: "green",
    pinned: false,
    updatedAt: hoursAgo(60),
    body: "- Refactoring UI\n- A Philosophy of Software Design\n- Designing Data-Intensive Applications",
  },
  {
    id: "n5",
    title: "Weekend project",
    folderId: "f3",
    color: "purple",
    pinned: false,
    updatedAt: hoursAgo(24 * 8),
    body: "Build a tiny CLI that turns a folder of markdown files into a searchable static site.",
  },
  {
    id: "n6",
    title: "Old roadmap",
    folderId: "f4",
    color: "gray",
    pinned: false,
    updatedAt: hoursAgo(24 * 40),
    body: "Q3 roadmap draft. Superseded by the new plan, kept for reference.",
  },
];

/* ------------------------------------------------------------------ */
/*  Date helpers                                                       */
/* ------------------------------------------------------------------ */

const sameDay = (a, b) => a.toDateString() === b.toDateString();

function inRange(ts, tab, monthOffset = 0) {
  const d = new Date(ts);
  const now = new Date();
  if (tab === "today") return sameDay(d, now);
  if (tab === "week") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - start.getDay());
    return d >= start;
  }
  const target = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  return d.getFullYear() === target.getFullYear() && d.getMonth() === target.getMonth();
}

const fmtDate = (ts) =>
  new Date(ts).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });

const fmtStamp = (ts) => {
  const d = new Date(ts);
  const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  return `${time}, ${d.toLocaleDateString("en-US", { weekday: "long" })}`;
};

const monthLabel = (offset) =>
  new Date(new Date().getFullYear(), new Date().getMonth() + offset, 1).toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric" }
  );

const TABS = [
  { id: "today", label: "Today" },
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
];

/* ------------------------------------------------------------------ */
/*  Small pieces                                                       */
/* ------------------------------------------------------------------ */

function Tabs({ value, onChange }) {
  return (
    <div role="tablist" className="flex gap-5">
      {TABS.map((t) => {
        const active = value === t.id;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.id)}
            className={`relative pb-2 text-xs transition-colors ${
              active ? "text-black" : "text-neutral-400 hover:text-neutral-600"
            }`}
          >
            {t.label}
            {active && (
              <span className="absolute inset-x-0 bottom-0 mx-auto h-0.5 w-7 rounded-full bg-black" />
            )}
          </button>
        );
      })}
    </div>
  );
}

function ColorPicker({ value, onChange, label = "Color" }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {COLORS.map((c) => {
        const active = value === c.id;
        return (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={c.name}
            title={c.name}
            onClick={() => onChange(c.id)}
            style={{ backgroundColor: c.note }}
            className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition-transform hover:scale-110 ${
              active ? "border-neutral-500" : "border-transparent"
            }`}
          >
            {active && <Check size={13} color={INK} />}
          </button>
        );
      })}
    </div>
  );
}

function DashedCard({ icon: Icon, label, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-neutral-300 text-xs text-neutral-600 transition-colors hover:border-neutral-400 hover:bg-neutral-50 ${className}`}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-white">
        <Icon size={16} />
      </span>
      {label}
    </button>
  );
}

function FolderCard({ folder, count, active, menuOpen, onOpen, onMenu, onRename, onDelete }) {
  const color = getColor(folder.color);
  return (
    <div className="relative">
      <button
        onClick={onOpen}
        aria-pressed={active}
        style={{ backgroundColor: color.folder, color: INK }}
        className={`flex h-[150px] w-full flex-col justify-between rounded-2xl p-4 text-left transition-shadow ${
          active ? "ring-2 ring-neutral-400" : "hover:shadow-md"
        }`}
      >
        <span
          style={{ backgroundColor: color.icon }}
          className="flex h-9 w-9 items-center justify-center rounded-lg"
        >
          <StickyNote size={18} color="#fff" />
        </span>
        <span>
          <span className="block truncate text-[15px]">{folder.name}</span>
          <span className="mt-1 block text-[10px] opacity-60">
            {fmtDate(folder.createdAt)} · {count} {count === 1 ? "note" : "notes"}
          </span>
        </span>
      </button>

      <div data-menu className="absolute right-3 top-3">
        <button
          onClick={onMenu}
          aria-label={`Options for ${folder.name}`}
          aria-expanded={menuOpen}
          style={{ color: INK }}
          className="rounded-lg p-1 transition-colors hover:bg-black/10"
        >
          <MoreHorizontal size={16} />
        </button>
        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 top-full z-10 mt-1 w-36 rounded-xl border border-neutral-200 bg-white p-1 shadow-lg"
          >
            <button
              role="menuitem"
              onClick={onRename}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors hover:bg-neutral-100"
            >
              <Pencil size={12} /> Edit folder
            </button>
            <button
              role="menuitem"
              onClick={onDelete}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-red-500 transition-colors hover:bg-neutral-100"
            >
              <Trash2 size={12} /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function NoteCard({ note, onOpen }) {
  const color = getColor(note.color);
  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      onClick={onOpen}
      style={{ backgroundColor: color.note, color: INK }}
      className="flex h-[240px] flex-col rounded-2xl p-4 text-left transition-shadow hover:shadow-lg"
    >
      <span className="flex items-center justify-between text-[10px] opacity-70">
        {fmtDate(note.updatedAt)}
        {note.pinned && <Pin size={11} />}
      </span>

      <span className="mt-2 flex items-center justify-between gap-2">
        <span className="truncate text-[15px]">{note.title || "Untitled note"}</span>
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-black text-white">
          <Pencil size={11} />
        </span>
      </span>

      <span className="mt-2 border-t border-black/15" />

      <span className="mt-3 line-clamp-6 flex-1 whitespace-pre-line text-[11px] leading-relaxed opacity-70">
        {note.body || "No content yet."}
      </span>

      <span className="mt-2 flex items-center gap-1.5 text-[10px] opacity-70">
        <Clock size={12} />
        {fmtStamp(note.updatedAt)}
      </span>
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function Notes() {
  const [notes, setNotes] = useState(initialNotes);
  const [folders, setFolders] = useState(initialFolders);

  const [folderTab, setFolderTab] = useState("month");
  const [noteTab, setNoteTab] = useState("week");
  const [monthOffset, setMonthOffset] = useState(0);
  const [activeFolder, setActiveFolder] = useState(null);
  const [query, setQuery] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [folderForm, setFolderForm] = useState(null); // { id?, name, color }
  const [folderError, setFolderError] = useState("");
  const [menuId, setMenuId] = useState(null);
  const [deleteFolderId, setDeleteFolderId] = useState(null);

  // Close the folder menu when clicking elsewhere
  useEffect(() => {
    const onDown = (e) => !e.target.closest?.("[data-menu]") && setMenuId(null);
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const editing = notes.find((n) => n.id === editingId) || null;
  const activeFolderObj = folders.find((f) => f.id === activeFolder) || null;

  const visibleFolders = useMemo(
    () =>
      folders
        .filter((f) => inRange(f.createdAt, folderTab, 0))
        .sort((a, b) => b.createdAt - a.createdAt),
    [folders, folderTab]
  );

  const visibleNotes = useMemo(() => {
    const q = query.trim().toLowerCase();
    return notes
      .filter((n) => inRange(n.updatedAt, noteTab, monthOffset))
      .filter((n) => !activeFolder || n.folderId === activeFolder)
      .filter((n) => !q || `${n.title} ${n.body}`.toLowerCase().includes(q))
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt);
  }, [notes, noteTab, monthOffset, activeFolder, query]);

  const countIn = (fid) => notes.filter((n) => n.folderId === fid).length;

  /* ---------- notes ---------- */

  const updateNote = (id, patch) =>
    setNotes((all) => all.map((n) => (n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n)));

  const newNote = () => {
    const note = {
      id: `n${Date.now()}`,
      title: "",
      body: "",
      folderId: activeFolder,
      color: COLORS[notes.length % COLORS.length].id,
      pinned: false,
      updatedAt: Date.now(),
    };
    setNotes((all) => [note, ...all]);
    setNoteTab("week");
    setMonthOffset(0);
    setQuery("");
    setConfirmDelete(false);
    setEditingId(note.id);
  };

  const closeEditor = () => {
    // Discard notes that were never written
    if (editing && !editing.title.trim() && !editing.body.trim()) {
      setNotes((all) => all.filter((n) => n.id !== editing.id));
    }
    setEditingId(null);
    setConfirmDelete(false);
  };

  const deleteNote = () => {
    setNotes((all) => all.filter((n) => n.id !== editingId));
    setEditingId(null);
    setConfirmDelete(false);
  };

  /* ---------- folders ---------- */

  const openFolderForm = (folder) => {
    setFolderError("");
    setMenuId(null);
    setFolderForm(
      folder
        ? { id: folder.id, name: folder.name, color: folder.color }
        : { name: "", color: COLORS[folders.length % COLORS.length].id }
    );
  };

  const saveFolder = () => {
    const name = folderForm.name.trim();
    if (!name) return setFolderError("Give your folder a name.");
    if (folderForm.id) {
      setFolders((all) =>
        all.map((f) => (f.id === folderForm.id ? { ...f, name, color: folderForm.color } : f))
      );
    } else {
      setFolders((all) => [
        { id: `f${Date.now()}`, name, color: folderForm.color, createdAt: Date.now() },
        ...all,
      ]);
      setFolderTab("week");
    }
    setFolderForm(null);
  };

  const deleteFolder = () => {
    setNotes((all) => all.map((n) => (n.folderId === deleteFolderId ? { ...n, folderId: null } : n)));
    setFolders((all) => all.filter((f) => f.id !== deleteFolderId));
    if (activeFolder === deleteFolderId) setActiveFolder(null);
    setDeleteFolderId(null);
  };

  /* ---------- month navigation ---------- */

  const prevMonth = () => {
    setMonthOffset((o) => (noteTab === "month" ? o - 1 : -1));
    setNoteTab("month");
  };
  const nextMonth = () => setMonthOffset((o) => Math.min(0, o + 1));
  const canNext = noteTab === "month" && monthOffset < 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* ---------------- Recent folders ---------------- */}
      <section>
        <h1 className="text-lg">Recent Folders</h1>
        <div className="mt-3">
          <Tabs value={folderTab} onChange={setFolderTab} />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleFolders.map((f) => (
            <FolderCard
              key={f.id}
              folder={f}
              count={countIn(f.id)}
              active={activeFolder === f.id}
              menuOpen={menuId === f.id}
              onOpen={() => setActiveFolder((cur) => (cur === f.id ? null : f.id))}
              onMenu={() => setMenuId((cur) => (cur === f.id ? null : f.id))}
              onRename={() => openFolderForm(f)}
              onDelete={() => {
                setMenuId(null);
                setDeleteFolderId(f.id);
              }}
            />
          ))}
          <DashedCard
            icon={FolderPlus}
            label="New folder"
            onClick={() => openFolderForm(null)}
            className="h-[150px]"
          />
        </div>
      </section>

      {/* ---------------- My notes ---------------- */}
      <section className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg">My Notes</h2>
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search notes"
            className="w-full sm:w-64"
          />
        </div>

        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <Tabs
            value={noteTab}
            onChange={(t) => {
              setNoteTab(t);
              setMonthOffset(0);
            }}
          />

          <div className="flex items-center gap-1 pb-1.5 text-[11px] text-neutral-500">
            <button
              onClick={prevMonth}
              aria-label="Previous month"
              className="rounded-md p-1 transition-colors hover:bg-neutral-100 hover:text-black"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="min-w-[100px] text-center">
              {monthLabel(noteTab === "month" ? monthOffset : 0)}
            </span>
            <button
              onClick={nextMonth}
              disabled={!canNext}
              aria-label="Next month"
              className="rounded-md p-1 transition-colors hover:bg-neutral-100 hover:text-black disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {activeFolderObj && (
          <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-neutral-200 py-1 pl-3 pr-1.5 text-[11px] text-neutral-600">
            Folder: {activeFolderObj.name}
            <button
              onClick={() => setActiveFolder(null)}
              aria-label="Clear folder filter"
              className="rounded-full p-0.5 transition-colors hover:bg-neutral-100"
            >
              <X size={12} />
            </button>
          </p>
        )}

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {visibleNotes.map((n) => (
              <NoteCard
                key={n.id}
                note={n}
                onOpen={() => {
                  setConfirmDelete(false);
                  setEditingId(n.id);
                }}
              />
            ))}
          </AnimatePresence>
          <DashedCard icon={Plus} label="New Note" onClick={newNote} className="h-[240px]" />
        </div>

        {visibleNotes.length === 0 && (
          <div className="mt-4">
            <EmptyState
              icon={StickyNote}
              title="No notes here"
              text="Nothing matches this period, folder or search. Try another tab or create a new note."
            />
          </div>
        )}
      </section>

      {/* ---------------- Modals ---------------- */}
      <AnimatePresence>
        {editing && (
          <Modal
            key="editor"
            title={editing.title.trim() || "New note"}
            subtitle={`Edited ${fmtStamp(editing.updatedAt)}`}
            icon={Pencil}
            maxWidth="max-w-2xl"
            onClose={closeEditor}
            footer={
              <>
                {confirmDelete ? (
                  <div className="mr-auto flex items-center gap-2">
                    <span className="text-[11px] text-neutral-500">Delete this note?</span>
                    <button onClick={deleteNote} className={btnDanger}>
                      Yes, delete
                    </button>
                    <button onClick={() => setConfirmDelete(false)} className={btnOutline}>
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className={`${btnOutline} mr-auto flex items-center gap-1.5 hover:text-red-500`}
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                )}
                <button
                  onClick={() => updateNote(editing.id, { pinned: !editing.pinned })}
                  aria-pressed={editing.pinned}
                  className={`${btnOutline} flex items-center gap-1.5`}
                >
                  {editing.pinned ? <PinOff size={12} /> : <Pin size={12} />}
                  {editing.pinned ? "Unpin" : "Pin"}
                </button>
                <button onClick={closeEditor} className={btnPrimary}>
                  Done
                </button>
              </>
            }
          >
            <input
              autoFocus
              value={editing.title}
              onChange={(e) => updateNote(editing.id, { title: e.target.value })}
              placeholder="Title"
              aria-label="Note title"
              maxLength={60}
              className="w-full bg-transparent text-lg outline-none placeholder:text-neutral-400"
            />
            <textarea
              value={editing.body}
              onChange={(e) => updateNote(editing.id, { body: e.target.value })}
              placeholder="Start writing…"
              aria-label="Note body"
              rows={9}
              className="mt-3 w-full resize-none rounded-xl border border-neutral-200 bg-transparent p-3.5 text-[13px] leading-relaxed outline-none placeholder:text-neutral-400 focus:border-black"
            />

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <span className="mb-2 block text-[11px] text-neutral-500">Note color</span>
                <ColorPicker
                  value={editing.color}
                  onChange={(c) => updateNote(editing.id, { color: c })}
                  label="Note color"
                />
              </div>
              <div>
                <span className="mb-2 block text-[11px] text-neutral-500">Folder</span>
                <div className="flex flex-wrap gap-1.5">
                  {[{ id: null, name: "None" }, ...folders].map((f) => (
                    <button
                      key={f.id ?? "none"}
                      type="button"
                      aria-pressed={editing.folderId === f.id}
                      onClick={() => updateNote(editing.id, { folderId: f.id })}
                      className={`rounded-full border px-3 py-1 text-[11px] transition-colors ${
                        editing.folderId === f.id
                          ? "border-black bg-black text-white"
                          : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                      }`}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Modal>
        )}

        {folderForm && (
          <Modal
            key="folder"
            title={folderForm.id ? "Edit folder" : "New folder"}
            subtitle="Folders keep related notes together."
            icon={FolderPlus}
            onClose={() => setFolderForm(null)}
            footer={
              <>
                {folderError && <p className="mr-auto text-[11px] text-red-500">{folderError}</p>}
                <button onClick={() => setFolderForm(null)} className={btnOutline}>
                  Cancel
                </button>
                <button onClick={saveFolder} className={btnPrimary}>
                  {folderForm.id ? "Save" : "Create"}
                </button>
              </>
            }
          >
            <div className="space-y-4">
              <div>
                <label htmlFor="folder-name" className="mb-1.5 block text-[11px] text-neutral-500">
                  Name
                </label>
                <input
                  id="folder-name"
                  autoFocus
                  value={folderForm.name}
                  maxLength={30}
                  onChange={(e) => {
                    setFolderForm({ ...folderForm, name: e.target.value });
                    setFolderError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && saveFolder()}
                  placeholder="e.g. Movie Review"
                  className={fieldClass}
                />
              </div>
              <div>
                <span className="mb-2 block text-[11px] text-neutral-500">Color</span>
                <ColorPicker
                  value={folderForm.color}
                  onChange={(c) => setFolderForm({ ...folderForm, color: c })}
                  label="Folder color"
                />
              </div>
            </div>
          </Modal>
        )}

        {deleteFolderId && (
          <Modal
            key="delete-folder"
            title="Delete this folder?"
            subtitle="Its notes are kept."
            icon={Trash2}
            onClose={() => setDeleteFolderId(null)}
            footer={
              <>
                <button onClick={() => setDeleteFolderId(null)} className={btnOutline}>
                  Cancel
                </button>
                <button onClick={deleteFolder} className={btnDanger}>
                  Delete
                </button>
              </>
            }
          >
            <p className="text-xs leading-relaxed text-neutral-500">
              “{folders.find((f) => f.id === deleteFolderId)?.name}” will be removed. Notes inside it
              stay in My Notes without a folder.
            </p>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
}