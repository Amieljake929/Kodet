import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpDown,
  Check,
  ChevronDown,
  Copy,
  Download,
  Folder,
  FolderPlus,
  PanelLeftClose,
  PanelLeftOpen,
  Pin,
  Plus,
  Star,
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
  fieldClass,
  hoursAgo,
  timeAgo,
} from "../shared/pageUi";

/* ------------------------------ shared styles ------------------------------ */

// Brand button colors: cream #fbf2ef on charcoal #1a1a1a
const btnAccent =
  "rounded-xl bg-[#fbf2ef] px-4 py-2.5 text-xs text-[#1a1a1a] transition-opacity hover:opacity-80";
const accentActive = "bg-[#fbf2ef] text-[#1a1a1a]";

const iconBtn =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-black";

// Slim pill scrollbar (Chrome, Edge, Safari). Firefox keeps its default one.
const scrollbar =
  "[&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar]:w-1.5 " +
  "[&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[#fbf2ef]/5 " +
  "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#fbf2ef]/25 " +
  "hover:[&::-webkit-scrollbar-thumb]:bg-[#fbf2ef]/40";

// Desktop placement: fills the whole main area, below the top bar (70px)
// and to the right of the app sidebar (16rem). Tweak these two values if
// there is a gap or overlap in your layout.
const FULL_BLEED =
  "lg:fixed lg:bottom-0 lg:left-64 lg:right-0 lg:top-[70px] lg:h-auto lg:min-h-0";

const SORTS = {
  updated: "Last edited",
  created: "Date created",
  title: "Title",
};

/* ----------------------------- placeholder data ---------------------------- */
// Placeholder content: replace with real data later

const initialFolders = [
  { id: "f1", name: "Dev cheatsheets" },
  { id: "f2", name: "Kodet" },
];

const initialNotes = [
  {
    id: "n1",
    title: "Debounce vs throttle",
    body: `# Debounce vs throttle

**Debounce** waits until the user stops triggering the event.
**Throttle** runs at most once per interval.

- Search input: debounce
- Scroll and resize: throttle

\`\`\`js
function debounce(fn, delay = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}
\`\`\``,
    tags: ["javascript", "performance"],
    folderId: "f1",
    pinned: true,
    favorite: true,
    createdAt: hoursAgo(120),
    updatedAt: hoursAgo(2),
  },
  {
    id: "n2",
    title: "Git rebase cheatsheet",
    body: `## Common commands

- \`git rebase -i HEAD~3\` squash or reword the last 3 commits
- \`git rebase --abort\` cancel and go back
- \`git pull --rebase\` keep history linear

Never rebase commits that are already shared on a public branch.`,
    tags: ["git"],
    folderId: "f1",
    pinned: false,
    favorite: false,
    createdAt: hoursAgo(290),
    updatedAt: hoursAgo(26),
  },
  {
    id: "n3",
    title: "Sprint planning",
    body: `Things to build next:

- Snippet sharing with a public link
- Keyboard shortcuts for quick capture
- Tag colors
- Export notes as .md`,
    tags: ["kodet", "ideas"],
    folderId: "f2",
    pinned: false,
    favorite: false,
    createdAt: hoursAgo(480),
    updatedAt: hoursAgo(96),
  },
  {
    id: "n4",
    title: "Reading list",
    body: "Books and articles to get through this month.",
    tags: [],
    folderId: null,
    pinned: false,
    favorite: false,
    createdAt: hoursAgo(600),
    updatedAt: hoursAgo(200),
  },
];

/* --------------------------------- helpers --------------------------------- */

const wordCount = (text) => (text.trim() ? text.trim().split(/\s+/).length : 0);

const previewText = (body) =>
  body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#*`>-]/g, "")
    .replace(/\s+/g, " ")
    .trim();

/* ------------- tiny, safe markdown renderer (no HTML injection) ------------- */

function renderInline(text) {
  return text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.length > 2 && part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-[0.9em]">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.length > 4 && part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

const HEADING_CLASS = {
  1: "mb-3 mt-6 text-xl first:mt-0",
  2: "mb-3 mt-6 text-base first:mt-0",
  3: "mb-2 mt-5 text-sm first:mt-0",
};

function Markdown({ text }) {
  const lines = text.split("\n");
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("```")) {
      const code = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        code.push(lines[i]);
        i++;
      }
      i++;
      blocks.push(
        <pre
          key={blocks.length}
          className={`mb-5 overflow-x-auto rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-xs leading-relaxed ${scrollbar}`}
        >
          <code>{code.join("\n")}</code>
        </pre>
      );
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.*)/);
    if (heading) {
      const level = heading[1].length;
      const Tag = `h${level}`;
      blocks.push(
        <Tag key={blocks.length} className={HEADING_CLASS[level]}>
          {renderInline(heading[2])}
        </Tag>
      );
      i++;
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ""));
        i++;
      }
      blocks.push(
        <ul key={blocks.length} className="mb-5 list-disc space-y-1.5 pl-5">
          {items.map((item, k) => (
            <li key={k}>{renderInline(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    if (line.trim() === "") {
      i++;
      continue;
    }

    const para = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^(```|#{1,3}\s|[-*]\s)/.test(lines[i])
    ) {
      para.push(lines[i]);
      i++;
    }
    blocks.push(
      <p key={blocks.length} className="mb-5">
        {renderInline(para.join(" "))}
      </p>
    );
  }

  return <div className="text-[13px] leading-7">{blocks}</div>;
}

/* ------------------------- small reusable UI pieces ------------------------ */

// Animated popover menu that closes on outside click or Escape.
function Dropdown({ renderTrigger, children, align = "left", width = "w-56" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative w-fit">
      {renderTrigger({ open, toggle: () => setOpen((o) => !o) })}
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className={`absolute top-full z-30 mt-2 max-h-72 max-w-[calc(100vw-3rem)] overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-1.5 shadow-xl ${width} ${
              align === "right" ? "right-0" : "left-0"
            } ${scrollbar}`}
          >
            {children({ close: () => setOpen(false) })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuItem({ icon: Icon, selected, muted, onClick, children }) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs transition-colors hover:bg-neutral-50 ${
        selected ? "bg-neutral-100" : ""
      } ${muted ? "text-neutral-500 hover:text-black" : ""}`}
    >
      {Icon && <Icon size={14} className="shrink-0 text-neutral-500" />}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {selected && <Check size={13} className="shrink-0" />}
    </button>
  );
}

// One row of the mini sidebar. Labels hide when the sidebar is collapsed (desktop).
function NavItem({ icon: Icon, label, count, active, collapsed, muted, onClick }) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-current={active ? "page" : undefined}
      className={`relative flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs transition-colors ${
        collapsed ? "lg:justify-center lg:px-0" : ""
      } ${
        active
          ? "bg-neutral-100 text-black"
          : `${muted ? "text-neutral-400" : "text-neutral-500"} hover:bg-neutral-50 hover:text-black`
      }`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-[#fbf2ef]" />
      )}
      <Icon size={15} className="shrink-0" />
      <span className={`min-w-0 flex-1 truncate ${collapsed ? "lg:hidden" : ""}`}>{label}</span>
      {count !== undefined && (
        <span className={`text-[10px] text-neutral-400 ${collapsed ? "lg:hidden" : ""}`}>
          {count}
        </span>
      )}
    </button>
  );
}

/* ----------------------------------- page ---------------------------------- */

export default function Notes() {
  const [notes, setNotes] = useState(initialNotes);
  const [folders, setFolders] = useState(initialFolders);
  const [selectedId, setSelectedId] = useState(initialNotes[0].id);
  const [showEditor, setShowEditor] = useState(false); // small screens only
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState("all"); // all | pinned | favorites | folder:<id>
  const [sort, setSort] = useState("updated");
  const [mode, setMode] = useState("edit");
  const [tagDraft, setTagDraft] = useState("");
  const [copied, setCopied] = useState(false);

  const [navCollapsed, setNavCollapsed] = useState(false); // desktop: full sidebar or icon rail
  const [drawerOpen, setDrawerOpen] = useState(false); // mobile: sidebar as overlay

  const [deleteId, setDeleteId] = useState(null);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [assignOnCreate, setAssignOnCreate] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [folderError, setFolderError] = useState("");
  const [deleteFolderId, setDeleteFolderId] = useState(null);

  const selected = notes.find((n) => n.id === selectedId) || null;
  const currentFolder = selected ? folders.find((f) => f.id === selected.folderId) : null;
  const activeFolder = scope.startsWith("folder:")
    ? folders.find((f) => f.id === scope.slice(7)) || null
    : null;

  const scopeLabel = activeFolder
    ? activeFolder.name
    : { all: "All notes", pinned: "Pinned", favorites: "Favorites" }[scope] || "All notes";

  const views = [
    { id: "all", label: "All notes", icon: StickyNote, count: notes.length },
    { id: "pinned", label: "Pinned", icon: Pin, count: notes.filter((n) => n.pinned).length },
    { id: "favorites", label: "Favorites", icon: Star, count: notes.filter((n) => n.favorite).length },
  ];

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^#/, "");
    return notes
      .filter((n) => {
        if (scope === "pinned" && !n.pinned) return false;
        if (scope === "favorites" && !n.favorite) return false;
        if (scope.startsWith("folder:") && n.folderId !== scope.slice(7)) return false;
        if (!q) return true;
        return `${n.title} ${n.body} ${n.tags.join(" ")}`.toLowerCase().includes(q);
      })
      .sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        if (sort === "title") return a.title.localeCompare(b.title);
        if (sort === "created") return b.createdAt - a.createdAt;
        return b.updatedAt - a.updatedAt;
      });
  }, [notes, query, scope, sort]);

  /* ------------------------------- note actions ------------------------------ */

  // patchNote: metadata only (pin, favorite, folder), keeps "last edited"
  const patchNote = (id, patch) =>
    setNotes((all) => all.map((n) => (n.id === id ? { ...n, ...patch } : n)));

  // updateNote: real content edit, bumps "last edited"
  const updateNote = (id, patch) => patchNote(id, { ...patch, updatedAt: Date.now() });

  const selectNote = (id) => {
    setSelectedId(id);
    setShowEditor(true);
  };

  const pickScope = (next) => {
    setScope(next);
    setShowEditor(false);
    setDrawerOpen(false);
  };

  const createNote = () => {
    const note = {
      id: `n${Date.now()}`,
      title: "",
      body: "",
      tags: [],
      folderId: activeFolder?.id ?? null,
      pinned: false,
      favorite: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes((all) => [note, ...all]);
    setQuery("");
    if (!activeFolder) setScope("all");
    setMode("edit");
    setDrawerOpen(false);
    selectNote(note.id);
  };

  const deleteNote = () => {
    const remaining = notes.filter((n) => n.id !== deleteId);
    setNotes(remaining);
    if (selectedId === deleteId) {
      setSelectedId(remaining[0]?.id ?? null);
      setShowEditor(false);
    }
    setDeleteId(null);
  };

  const addTag = (raw) => {
    const tag = raw.trim().replace(/^#/, "").toLowerCase();
    if (!tag || !selected || selected.tags.includes(tag)) return;
    updateNote(selected.id, { tags: [...selected.tags, tag] });
  };

  const removeTag = (tag) =>
    updateNote(selected.id, { tags: selected.tags.filter((t) => t !== tag) });

  const onTagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagDraft);
      setTagDraft("");
    } else if (e.key === "Backspace" && !tagDraft && selected.tags.length) {
      removeTag(selected.tags[selected.tags.length - 1]);
    }
  };

  const copyNote = async () => {
    try {
      await navigator.clipboard.writeText(selected.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // clipboard can be blocked by the browser, ignore
    }
  };

  const exportNote = () => {
    const name = (selected.title || "untitled").replace(/[^\w-]+/g, "-");
    const blob = new Blob([`# ${selected.title || "Untitled"}\n\n${selected.body}`], {
      type: "text/markdown",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ------------------------------ folder actions ----------------------------- */

  // assign = true when opened from a note's folder menu: the note moves into the new folder
  const openFolderModal = (assign = false) => {
    setDrawerOpen(false);
    setAssignOnCreate(assign);
    setFolderName("");
    setFolderError("");
    setCreatingFolder(true);
  };

  const createFolder = () => {
    const name = folderName.trim();
    if (!name) return setFolderError("Give your folder a name.");
    if (folders.some((f) => f.name.toLowerCase() === name.toLowerCase())) {
      return setFolderError("A folder with this name already exists.");
    }
    const folder = { id: `f${Date.now()}`, name };
    setFolders((all) => [...all, folder]);
    if (assignOnCreate && selected) patchNote(selected.id, { folderId: folder.id });
    else pickScope(`folder:${folder.id}`);
    setCreatingFolder(false);
  };

  const deleteFolder = () => {
    // notes are kept, they just move back to "No folder"
    setNotes((all) =>
      all.map((n) => (n.folderId === deleteFolderId ? { ...n, folderId: null } : n))
    );
    setFolders((all) => all.filter((f) => f.id !== deleteFolderId));
    if (scope === `folder:${deleteFolderId}`) pickScope("all");
    setDeleteFolderId(null);
  };

  /* ---------------------------------- render --------------------------------- */

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`relative grid h-[calc(100vh-12rem)] min-h-[520px] grid-cols-1 grid-rows-[minmax(0,1fr)] overflow-hidden lg:grid-cols-[auto_300px_minmax(0,1fr)] ${FULL_BLEED}`}
      >
        {/* mobile backdrop for the sidebar drawer */}
        {drawerOpen && (
          <button
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 z-20 bg-black/50 lg:hidden"
          />
        )}

        {/* ------------------------------- mini sidebar ------------------------------ */}
        <aside
          className={`${
            drawerOpen ? "absolute inset-y-0 left-0 z-30 flex w-60 shadow-2xl" : "hidden"
          } min-h-0 flex-col border-r border-neutral-200 bg-white lg:static lg:z-auto lg:flex lg:bg-transparent lg:shadow-none lg:transition-[width] lg:duration-200 ${
            navCollapsed ? "lg:w-[60px]" : "lg:w-56"
          }`}
        >
          <div
            className={`flex h-16 shrink-0 items-center justify-between border-b border-neutral-200 px-4 ${
              navCollapsed ? "lg:justify-center lg:px-0" : ""
            }`}
          >
            <span className={`text-sm ${navCollapsed ? "lg:hidden" : ""}`}>Notes</span>
            <button
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
              className={`${iconBtn} lg:hidden`}
            >
              <X size={15} />
            </button>
            <button
              onClick={() => setNavCollapsed((c) => !c)}
              aria-label={navCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={navCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className={`${iconBtn} hidden lg:flex`}
            >
              {navCollapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-4 p-3">
          <button
            onClick={createNote}
            title="New note"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#fbf2ef] py-2.5 text-xs text-[#1a1a1a] transition-opacity hover:opacity-80"
          >
            <Plus size={15} className="shrink-0" />
            <span className={navCollapsed ? "lg:hidden" : ""}>New note</span>
          </button>

          <nav
            className={`-mx-1 flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-1 ${scrollbar}`}
          >
            {views.map((v) => (
              <NavItem
                key={v.id}
                icon={v.icon}
                label={v.label}
                count={v.count}
                active={scope === v.id}
                collapsed={navCollapsed}
                onClick={() => pickScope(v.id)}
              />
            ))}

            <div className="my-3 border-t border-neutral-200" />
            <p className={`px-3 pb-1 text-[10px] text-neutral-400 ${navCollapsed ? "lg:hidden" : ""}`}>
              Folders
            </p>

            {folders.length === 0 && (
              <p className={`px-3 py-1 text-[11px] text-neutral-500 ${navCollapsed ? "lg:hidden" : ""}`}>
                No folders yet.
              </p>
            )}

            {folders.map((f) => (
              <NavItem
                key={f.id}
                icon={Folder}
                label={f.name}
                count={notes.filter((n) => n.folderId === f.id).length}
                active={scope === `folder:${f.id}`}
                collapsed={navCollapsed}
                onClick={() => pickScope(`folder:${f.id}`)}
              />
            ))}

            <NavItem
              icon={FolderPlus}
              label="New folder"
              muted
              collapsed={navCollapsed}
              onClick={() => openFolderModal()}
            />
          </nav>
          </div>
        </aside>

        {/* ----------------------------------- list ---------------------------------- */}
        <section
          className={`min-h-0 min-w-0 flex-col lg:flex lg:border-r lg:border-neutral-200 ${
            showEditor ? "hidden" : "flex"
          }`}
        >
          <div className="shrink-0">
            <div className="flex h-16 items-center justify-between gap-2 border-b border-neutral-200 px-4">
              <div className="flex min-w-0 items-center gap-2">
                <button
                  onClick={() => setDrawerOpen(true)}
                  aria-label="Open menu"
                  className={`${iconBtn} lg:hidden`}
                >
                  <PanelLeftOpen size={15} />
                </button>
                <div className="min-w-0">
                  <h2 className="truncate text-sm">{scopeLabel}</h2>
                  <p className="text-[11px] text-neutral-500">
                    {visible.length} {visible.length === 1 ? "note" : "notes"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {activeFolder && (
                  <button
                    onClick={() => setDeleteFolderId(activeFolder.id)}
                    title="Delete folder"
                    aria-label="Delete folder"
                    className={iconBtn}
                  >
                    <Trash2 size={15} />
                  </button>
                )}

                <Dropdown
                  align="right"
                  width="w-44"
                  renderTrigger={({ open, toggle }) => (
                    <button
                      onClick={toggle}
                      aria-haspopup="menu"
                      aria-expanded={open}
                      title={`Sort by: ${SORTS[sort]}`}
                      aria-label="Sort notes"
                      className={`${iconBtn} ${open ? "bg-neutral-100 text-black" : ""}`}
                    >
                      <ArrowUpDown size={15} />
                    </button>
                  )}
                >
                  {({ close }) => (
                    <>
                      <p className="px-3 pb-1 pt-1.5 text-[10px] text-neutral-400">Sort by</p>
                      {Object.entries(SORTS).map(([id, label]) => (
                        <MenuItem
                          key={id}
                          selected={sort === id}
                          onClick={() => {
                            setSort(id);
                            close();
                          }}
                        >
                          {label}
                        </MenuItem>
                      ))}
                    </>
                  )}
                </Dropdown>

                <button
                  onClick={createNote}
                  aria-label="New note"
                  className={`${iconBtn} ${accentActive} lg:hidden`}
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>

            <div className="p-3">
              <SearchInput value={query} onChange={setQuery} placeholder="Search notes" />
            </div>
          </div>

          <div className={`min-h-0 flex-1 overflow-y-auto px-2 pb-2 ${scrollbar}`}>
            {visible.length === 0 ? (
              <p className="px-4 py-12 text-center text-xs leading-relaxed text-neutral-500">
                {notes.length === 0
                  ? "No notes yet. Create your first one."
                  : activeFolder && !query
                    ? "This folder is empty."
                    : "No notes found."}
              </p>
            ) : (
              <ul className="space-y-1">
                {visible.map((n) => {
                  const folder = folders.find((f) => f.id === n.folderId);
                  return (
                    <li key={n.id}>
                      <button
                        onClick={() => selectNote(n.id)}
                        className={`flex w-full flex-col gap-1.5 rounded-xl px-4 py-3.5 text-left transition-colors hover:bg-neutral-50 ${
                          n.id === selectedId ? "bg-neutral-100" : ""
                        }`}
                      >
                        <span className="flex items-center justify-between gap-3">
                          <span className="truncate text-[13px]">{n.title || "Untitled"}</span>
                          <span className="flex shrink-0 items-center gap-1.5 text-neutral-400">
                            {n.pinned && <Pin size={11} className="fill-current" />}
                            {n.favorite && <Star size={11} className="fill-current" />}
                          </span>
                        </span>
                        <span className="line-clamp-1 text-[11px] text-neutral-500">
                          {previewText(n.body) || "No content yet"}
                        </span>
                        <span className="flex items-center gap-3 text-[10px] text-neutral-400">
                          <span>{timeAgo(n.updatedAt)}</span>
                          {folder && !activeFolder && (
                            <span className="flex min-w-0 items-center gap-1">
                              <Folder size={10} className="shrink-0" />
                              <span className="truncate">{folder.name}</span>
                            </span>
                          )}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        {/* ---------------------------------- editor --------------------------------- */}
        <section
          className={`min-h-0 min-w-0 flex-col lg:flex ${showEditor ? "flex" : "hidden"}`}
        >
          {!selected ? (
            <div className="flex flex-1 items-center justify-center p-6">
              <EmptyState
                icon={StickyNote}
                title="No note selected"
                text="Pick a note from the list or create a new one."
              />
            </div>
          ) : (
            <>
              <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-neutral-200 px-5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowEditor(false)}
                    aria-label="Back to notes"
                    className={`${iconBtn} lg:hidden`}
                  >
                    <ArrowLeft size={15} />
                  </button>
                  <div className="inline-flex rounded-xl border border-neutral-200 p-0.5" role="tablist">
                    {["edit", "preview"].map((m) => (
                      <button
                        key={m}
                        role="tab"
                        aria-selected={mode === m}
                        onClick={() => setMode(m)}
                        className={`rounded-lg px-3.5 py-1 text-xs capitalize transition-colors ${
                          mode === m ? accentActive : "text-neutral-500 hover:text-black"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => patchNote(selected.id, { pinned: !selected.pinned })}
                    aria-pressed={selected.pinned}
                    title={selected.pinned ? "Unpin" : "Pin to top"}
                    className={`${iconBtn} ${selected.pinned ? accentActive : ""}`}
                  >
                    <Pin size={15} className={selected.pinned ? "fill-current" : ""} />
                  </button>
                  <button
                    onClick={() => patchNote(selected.id, { favorite: !selected.favorite })}
                    aria-pressed={selected.favorite}
                    title={selected.favorite ? "Remove from favorites" : "Add to favorites"}
                    className={`${iconBtn} ${selected.favorite ? accentActive : ""}`}
                  >
                    <Star size={15} className={selected.favorite ? "fill-current" : ""} />
                  </button>
                  <span className="mx-1.5 h-4 w-px bg-neutral-200" />
                  <button onClick={copyNote} title="Copy content" aria-label="Copy content" className={iconBtn}>
                    {copied ? <Check size={15} /> : <Copy size={15} />}
                  </button>
                  <button onClick={exportNote} title="Export as .md" aria-label="Export as Markdown" className={iconBtn}>
                    <Download size={15} />
                  </button>
                  <span className="mx-1.5 h-4 w-px bg-neutral-200" />
                  <button
                    onClick={() => setDeleteId(selected.id)}
                    title="Delete note"
                    aria-label="Delete note"
                    className={iconBtn}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </header>

              <div className={`min-h-0 flex-1 overflow-y-auto ${scrollbar}`}>
                <div className="mx-auto flex min-h-full max-w-2xl flex-col gap-5 px-6 py-8 sm:px-10">
                  <input
                    value={selected.title}
                    onChange={(e) => updateNote(selected.id, { title: e.target.value })}
                    placeholder="Untitled"
                    aria-label="Note title"
                    className="w-full bg-transparent text-2xl outline-none placeholder:text-neutral-400"
                  />

                  <div className="flex flex-col items-start gap-3">
                    <Dropdown
                      renderTrigger={({ open, toggle }) => (
                        <button
                          onClick={toggle}
                          aria-haspopup="menu"
                          aria-expanded={open}
                          className={`flex items-center gap-2 rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs transition-colors hover:bg-neutral-50 hover:text-black ${
                            open ? "bg-neutral-50 text-black" : "text-neutral-500"
                          }`}
                        >
                          <Folder size={13} className="shrink-0" />
                          <span className="max-w-[180px] truncate">
                            {currentFolder?.name ?? "No folder"}
                          </span>
                          <ChevronDown
                            size={13}
                            className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
                          />
                        </button>
                      )}
                    >
                      {({ close }) => (
                        <>
                          <p className="px-3 pb-1 pt-1.5 text-[10px] text-neutral-400">Move to</p>
                          <MenuItem
                            icon={Folder}
                            selected={!currentFolder}
                            onClick={() => {
                              patchNote(selected.id, { folderId: null });
                              close();
                            }}
                          >
                            No folder
                          </MenuItem>
                          {folders.map((f) => (
                            <MenuItem
                              key={f.id}
                              icon={Folder}
                              selected={currentFolder?.id === f.id}
                              onClick={() => {
                                patchNote(selected.id, { folderId: f.id });
                                close();
                              }}
                            >
                              {f.name}
                            </MenuItem>
                          ))}
                          <div className="my-1.5 border-t border-neutral-200" />
                          <MenuItem
                            icon={FolderPlus}
                            muted
                            onClick={() => {
                              close();
                              openFolderModal(true);
                            }}
                          >
                            New folder
                          </MenuItem>
                        </>
                      )}
                    </Dropdown>

                    <div className="flex w-full flex-wrap items-center gap-2">
                      {selected.tags.map((t) => (
                        <span
                          key={t}
                          className="flex items-center gap-1 rounded-lg border border-neutral-200 py-0.5 pl-2.5 pr-1.5 text-[11px] text-neutral-500"
                        >
                          {t}
                          <button
                            onClick={() => removeTag(t)}
                            aria-label={`Remove tag ${t}`}
                            className="px-0.5 text-sm leading-none text-neutral-400 hover:text-black"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      <input
                        value={tagDraft}
                        onChange={(e) => setTagDraft(e.target.value)}
                        onKeyDown={onTagKeyDown}
                        onBlur={() => {
                          addTag(tagDraft);
                          setTagDraft("");
                        }}
                        placeholder="Add a tag"
                        aria-label="Add tag"
                        className="min-w-[90px] flex-1 bg-transparent py-1 text-[11px] outline-none placeholder:text-neutral-400"
                      />
                    </div>
                  </div>

                  <div className="border-t border-neutral-200" />

                  {mode === "edit" ? (
                    <textarea
                      value={selected.body}
                      onChange={(e) => updateNote(selected.id, { body: e.target.value })}
                      placeholder="Start writing. Markdown is supported."
                      spellCheck={false}
                      aria-label="Note content"
                      className={`min-h-[280px] w-full flex-1 resize-none bg-transparent text-[13px] leading-7 outline-none placeholder:text-neutral-400 ${scrollbar}`}
                    />
                  ) : selected.body.trim() ? (
                    <Markdown text={selected.body} />
                  ) : (
                    <p className="text-xs text-neutral-500">Nothing to preview yet.</p>
                  )}
                </div>
              </div>

              <footer className="flex items-center justify-between border-t border-neutral-200 px-5 py-3 text-[10px] text-neutral-400">
                <span>{wordCount(selected.body)} words</span>
                <span>Edited {timeAgo(selected.updatedAt)}</span>
              </footer>
            </>
          )}
        </section>
      </motion.div>

      <AnimatePresence>
        {creatingFolder && (
          <Modal
            key="create-folder"
            title="New folder"
            subtitle={
              assignOnCreate && selected
                ? "This note will move into the new folder."
                : "Group related notes together."
            }
            icon={FolderPlus}
            onClose={() => setCreatingFolder(false)}
            footer={
              <>
                {folderError && <p className="mr-auto text-[11px] text-red-500">{folderError}</p>}
                <button onClick={() => setCreatingFolder(false)} className={btnOutline}>
                  Cancel
                </button>
                <button onClick={createFolder} className={btnAccent}>
                  Create
                </button>
              </>
            }
          >
            <label htmlFor="folder-name" className="mb-1.5 block text-[11px] text-neutral-500">
              Name
            </label>
            <input
              id="folder-name"
              autoFocus
              value={folderName}
              maxLength={40}
              onChange={(e) => {
                setFolderName(e.target.value);
                setFolderError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && createFolder()}
              placeholder="e.g. Meeting notes"
              className={fieldClass}
            />
          </Modal>
        )}

        {deleteId && (
          <Modal
            key="delete-note"
            title="Delete this note?"
            subtitle="This can't be undone."
            icon={Trash2}
            onClose={() => setDeleteId(null)}
            footer={
              <>
                <button onClick={() => setDeleteId(null)} className={btnOutline}>
                  Cancel
                </button>
                <button onClick={deleteNote} className={btnDanger}>
                  Delete
                </button>
              </>
            }
          >
            <p className="text-xs leading-relaxed text-neutral-500">
              “{notes.find((n) => n.id === deleteId)?.title || "Untitled"}” will be removed.
            </p>
          </Modal>
        )}

        {deleteFolderId && (
          <Modal
            key="delete-folder"
            title="Delete this folder?"
            subtitle="Its notes are not deleted."
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
              “{folders.find((f) => f.id === deleteFolderId)?.name}” will be removed and its notes
              will move to No folder.
            </p>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}