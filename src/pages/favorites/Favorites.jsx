import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Code2, FolderTree, Star, StickyNote } from "lucide-react";
import { EmptyState, PageHeader, SearchInput, btnOutline, hoursAgo, timeAgo } from "../shared/pageUi";

const TYPES = {
  snippet: { label: "Snippet", plural: "Snippets", icon: Code2, to: "/dashboard/snippets" },
  note: { label: "Note", plural: "Notes", icon: StickyNote, to: "/dashboard/notes" },
  collection: {
    label: "Collection",
    plural: "Collections",
    icon: FolderTree,
    to: "/dashboard/collections",
  },
};

// Placeholder content: replace with real data later
const initialFavorites = [
  {
    id: "f1",
    type: "snippet",
    title: "Debounce function",
    excerpt: "Delay a function until the user stops typing.",
    updatedAt: hoursAgo(2),
  },
  {
    id: "f2",
    type: "note",
    title: "Sprint planning",
    excerpt: "Goals for this sprint: chat UI polish, snippets page, collections.",
    updatedAt: hoursAgo(1),
  },
  {
    id: "f3",
    type: "collection",
    title: "Project Kodet",
    excerpt: "Everything related to the Kodet dashboard build.",
    updatedAt: hoursAgo(5),
  },
  {
    id: "f4",
    type: "snippet",
    title: "Read a JSON file",
    excerpt: "Load a JSON file into a dictionary.",
    updatedAt: hoursAgo(72),
  },
  {
    id: "f5",
    type: "note",
    title: "React performance ideas",
    excerpt: "Memoize expensive lists, split routes, measure with the Profiler.",
    updatedAt: hoursAgo(9),
  },
];

export default function Favorites() {
  const [items, setItems] = useState(initialFavorites);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((i) => filter === "all" || i.type === filter)
      .filter((i) => !q || `${i.title} ${i.excerpt}`.toLowerCase().includes(q))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [items, filter, query]);

  const count = (type) => items.filter((i) => i.type === type).length;
  const chips = [
    { id: "all", label: "All", n: items.length },
    ...Object.entries(TYPES).map(([id, t]) => ({ id, label: t.plural, n: count(id) })),
  ];

  const unfavorite = (id) => setItems((all) => all.filter((i) => i.id !== id));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <PageHeader
        title="Favorites"
        subtitle={`${items.length} starred items · your most-used things, one click away.`}
      />

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search favorites"
          className="min-w-[220px] flex-1 sm:max-w-sm"
        />
        <div className="flex gap-1.5 overflow-x-auto">
          {chips.map((c) => (
            <button
              key={c.id}
              onClick={() => setFilter(c.id)}
              aria-pressed={filter === c.id}
              className={`shrink-0 rounded-full border px-3 py-1 text-[11px] transition-colors ${
                filter === c.id
                  ? "border-black bg-black text-white"
                  : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              {c.label} <span className="opacity-60">{c.n}</span>
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Star}
            title={items.length === 0 ? "No favorites yet" : "No favorites found"}
            text={
              items.length === 0
                ? "Star snippets, notes or collections and they will show up here."
                : "Try a different search or filter."
            }
          />
        </div>
      ) : (
        <ul className="mt-5 grid gap-3 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {visible.map((item) => {
              const type = TYPES[item.type];
              const Icon = type.icon;
              return (
                <motion.li
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-start gap-4 rounded-2xl border border-neutral-200 bg-white p-4"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200">
                    <Icon size={17} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-[13px]">{item.title}</h3>
                      <span className="shrink-0 rounded-full border border-neutral-200 px-2 py-0.5 text-[10px] text-neutral-600">
                        {type.label}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-neutral-500">
                      {item.excerpt}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-neutral-400">{timeAgo(item.updatedAt)}</span>
                      <Link to={type.to} className={btnOutline}>
                        Open
                      </Link>
                    </div>
                  </div>

                  <button
                    onClick={() => unfavorite(item.id)}
                    aria-label={`Remove ${item.title} from favorites`}
                    title="Remove from favorites"
                    className="rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-black"
                  >
                    <Star size={15} fill="currentColor" />
                  </button>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </motion.div>
  );
}