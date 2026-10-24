import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  Code2,
  Layers,
  LifeBuoy,
  Mail,
  MessageSquare,
  Rocket,
  Settings,
  StickyNote,
  Tag,
  X,
} from "lucide-react";
import { EmptyState, SearchInput } from "../shared/pageUi";

/* ------------------------------------------------------------------ */
/*  Content: edit these lists to change what the page shows            */
/* ------------------------------------------------------------------ */

// Replace with your real support address
const SUPPORT_EMAIL = "support@example.com";

const CATEGORIES = [
  { id: "start", label: "Getting started", icon: Rocket, text: "Set up your workspace and learn the basics." },
  { id: "snippets", label: "Snippets", icon: Code2, text: "Save, organize and reuse your code." },
  { id: "notes", label: "Notes", icon: StickyNote, text: "Text notes, checklists, colors and folders." },
  { id: "organize", label: "Collections & tags", icon: Layers, text: "Keep everything grouped and easy to find." },
  { id: "chats", label: "Chats & people", icon: MessageSquare, text: "Talk with your connections inside Kodet." },
  { id: "account", label: "Account & settings", icon: Settings, text: "Profile, theme and preferences." },
];

const ARTICLES = [
  /* Getting started */
  {
    id: "a1",
    cat: "start",
    q: "What is Kodet?",
    a: "Kodet is a workspace for developers and students to keep code snippets, notes, collections and conversations in one place, so you can find what you saved without digging through scattered files.",
  },
  {
    id: "a2",
    cat: "start",
    q: "How do I find something quickly?",
    a: "Use the search bar at the top of the dashboard to look through your snippets and notes. Inside the Notes page there is also a search box that filters by title, text and checklist items.",
  },
  {
    id: "a3",
    cat: "start",
    q: "Where do I get around the app?",
    a: "The sidebar has everything: Dashboard and Chats at the top, your Library (Snippets, Notes, Collections, Tags) in the middle, and Favorites and Trash at the bottom.",
  },

  /* Snippets */
  {
    id: "a4",
    cat: "snippets",
    q: "How do I save a code snippet?",
    a: "Open Snippets from the sidebar, choose to add a new snippet, give it a title, pick the language and paste your code. Syntax colors are applied automatically.",
  },
  {
    id: "a5",
    cat: "snippets",
    q: "Can I mark a snippet as a favorite?",
    a: "Yes. Favorite the snippets you use most and they will show up on the Favorites page for quick access.",
  },

  /* Notes */
  {
    id: "a6",
    cat: "notes",
    q: "How do I create a note or a checklist?",
    a: "On the Notes page, click “Take a note…” for a text note, or the checkbox icon on the right of that bar for a checklist. You can switch a note between text and checklist at any time with the checkbox button in the note’s toolbar.",
  },
  {
    id: "a7",
    cat: "notes",
    q: "How do checklists work?",
    a: "Press Enter to add a new item below the current one, press Backspace on an empty item to delete it, and drag the handle on the left of an item to reorder. Ticked items move into a “Completed items” section that you can collapse. You can also tick items straight from the note card.",
  },
  {
    id: "a8",
    cat: "notes",
    q: "Can I change the size of the note when it is open?",
    a: "Yes. Drag the small grip in the bottom-right corner of an open note to make it wider or taller. Double-click the grip to reset it. The size you choose is kept for the next notes you open until you reload the page.",
  },
  {
    id: "a9",
    cat: "notes",
    q: "How do colors, pins and folders work?",
    a: "Use the palette button in the note to change its color; the note opens in that color. The pin button keeps important notes at the top, under a “Pinned” label. The folder button moves a note into a folder, and you can filter by a folder by clicking it in Recent Folders.",
  },
  {
    id: "a10",
    cat: "notes",
    q: "What happens when I delete a folder?",
    a: "Only the folder is removed. The notes inside it are kept and stay in My Notes without a folder.",
  },
  {
    id: "a11",
    cat: "notes",
    q: "Why did my empty note disappear?",
    a: "A note with no title and no content is discarded when you close it, so you don’t end up with blank notes. Add a title or some text and it will be kept.",
  },

  /* Collections & tags */
  {
    id: "a12",
    cat: "organize",
    q: "What is the difference between collections and tags?",
    a: "A collection groups related items together, like a project. Tags are short labels you can attach to many items, so you can find them across collections.",
  },
  {
    id: "a13",
    cat: "organize",
    q: "How do I restore something I deleted?",
    a: "Deleted items go to the Trash page, where you can review them. Open Trash from the sidebar to find what you removed.",
  },

  /* Chats */
  {
    id: "a14",
    cat: "chats",
    q: "How do I start a chat?",
    a: "Open People to find and connect with other users, then open Chats to message the people you are connected with.",
  },

  /* Account */
  {
    id: "a15",
    cat: "account",
    q: "How do I switch between dark and light mode?",
    a: "Open the profile menu in the top-right corner of the dashboard and use the theme toggle. Your choice is saved for next time.",
  },
  {
    id: "a16",
    cat: "account",
    q: "Where can I edit my profile?",
    a: "Open the profile menu in the top-right corner and choose Profile for your details, or Settings for preferences.",
  },
];

/* ------------------------------------------------------------------ */
/*  Pieces                                                             */
/* ------------------------------------------------------------------ */

function CategoryCard({ cat, count, active, onClick }) {
  const Icon = cat.icon;
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition-colors ${
        active
          ? "border-neutral-400 bg-neutral-50"
          : "border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50"
      }`}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black text-white">
        <Icon size={16} />
      </span>
      <span className="min-w-0">
        <span className="block text-[13px]">{cat.label}</span>
        <span className="mt-0.5 block text-[11px] leading-relaxed text-neutral-500">{cat.text}</span>
        <span className="mt-1.5 block text-[10px] text-neutral-400">
          {count} {count === 1 ? "article" : "articles"}
        </span>
      </span>
    </button>
  );
}

function Article({ item, open, onToggle, catLabel }) {
  const panelId = `help-${item.id}`;
  return (
    <div className="rounded-2xl border border-neutral-200">
      <button
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-4 rounded-2xl px-4 py-3.5 text-left transition-colors hover:bg-neutral-50"
      >
        <span className="min-w-0">
          <span className="block text-[13px]">{item.q}</span>
          <span className="mt-0.5 block text-[10px] text-neutral-400">{catLabel}</span>
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-neutral-500 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            key="panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="px-4 pb-4 text-xs leading-relaxed text-neutral-500">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function HelpCenter() {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("all");
  const [openId, setOpenId] = useState(null);

  const catLabel = (id) => CATEGORIES.find((c) => c.id === id)?.label ?? "";
  const countIn = (id) => ARTICLES.filter((a) => a.cat === id).length;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ARTICLES.filter((a) => activeCat === "all" || a.cat === activeCat).filter(
      (a) => !q || `${a.q} ${a.a}`.toLowerCase().includes(q)
    );
  }, [query, activeCat]);

  const heading =
    activeCat === "all" ? "Popular questions" : catLabel(activeCat);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* ---------------- Header ---------------- */}
      <header>
        <h1 className="text-3xl">Help center</h1>
        <p className="mt-2 text-sm text-neutral-500">Guides and answers for using Kodet.</p>

        <SearchInput
          value={query}
          onChange={(v) => {
            setQuery(v);
            setOpenId(null);
          }}
          placeholder="Search help articles"
          className="mt-5 w-full sm:max-w-md"
        />
      </header>

      {/* ---------------- Categories ---------------- */}
      <section className="mt-8" aria-label="Browse by topic">
        <h2 className="text-lg">Browse by topic</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => (
            <CategoryCard
              key={c.id}
              cat={c}
              count={countIn(c.id)}
              active={activeCat === c.id}
              onClick={() => {
                setActiveCat((cur) => (cur === c.id ? "all" : c.id));
                setOpenId(null);
              }}
            />
          ))}
        </div>
      </section>

      {/* ---------------- Articles ---------------- */}
      <section className="mt-10" aria-label="Help articles">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg">{heading}</h2>
          {activeCat !== "all" && (
            <button
              onClick={() => {
                setActiveCat("all");
                setOpenId(null);
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 py-1 pl-3 pr-2 text-[11px] text-neutral-600 transition-colors hover:bg-neutral-50"
            >
              Show all topics <X size={12} />
            </button>
          )}
        </div>

        <div className="mt-3 space-y-2.5">
          {results.map((a) => (
            <Article
              key={a.id}
              item={a}
              catLabel={catLabel(a.cat)}
              open={openId === a.id}
              onToggle={() => setOpenId((cur) => (cur === a.id ? null : a.id))}
            />
          ))}
        </div>

        {results.length === 0 && (
          <EmptyState
            icon={BookOpen}
            title="No articles found"
            text="Try different words, or clear the search and browse by topic."
          />
        )}
      </section>

      {/* ---------------- Contact ---------------- */}
      <section className="mt-10 rounded-2xl border border-dashed border-neutral-300 p-6">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black text-white">
              <LifeBuoy size={18} />
            </span>
            <div>
              <h2 className="text-[15px]">Still need help?</h2>
              <p className="mt-1 max-w-md text-xs leading-relaxed text-neutral-500">
                Check the FAQ page for more answers, or reach out to support and tell us what you
                were trying to do.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-black px-4 py-2 text-xs text-white transition-opacity hover:opacity-80"
            >
              <Mail size={13} /> Contact support
            </a>
          </div>
        </div>
      </section>
    </motion.div>
  );
}