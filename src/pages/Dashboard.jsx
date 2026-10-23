import { motion } from "framer-motion";
import { useOutletContext } from "react-router-dom";
import {
  Code2,
  StickyNote,
  FolderTree,
  Tags,
  Plus,
  ArrowUpRight,
} from "lucide-react";

const stats = [
  { label: "Snippets", value: 48, icon: Code2 },
  { label: "Notes", value: 21, icon: StickyNote },
  { label: "Collections", value: 6, icon: FolderTree },
  { label: "Tags", value: 14, icon: Tags },
];

const recent = [
  { name: "useDebounce.js", type: "Snippet", time: "2 hours ago" },
  { name: "Docker deploy notes", type: "Note", time: "Yesterday" },
  { name: "fetchWithRetry.js", type: "Snippet", time: "Yesterday" },
  { name: "SQL joins cheatsheet", type: "Note", time: "3 days ago" },
  { name: "Tailwind patterns", type: "Collection", time: "Last week" },
];

const actions = ["New snippet", "New note", "New collection"];

export default function Dashboard() {
  const { user } = useOutletContext();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <h1 className="text-3xl font-medium tracking-tight">
        Welcome back, {user.name}
      </h1>
      <p className="mt-2 text-sm text-neutral-600">
        Here's what's in your workspace.
      </p>

      {/* Stats */}
      <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-2xl border border-neutral-200 bg-white p-5"
          >
            <Icon size={18} className="text-neutral-500" />
            <p className="mt-6 text-3xl font-medium tracking-tight">{value}</p>
            <p className="mt-1 text-sm text-neutral-600">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Recent */}
        <section className="rounded-2xl border border-neutral-200 bg-white">
          <h2 className="border-b border-neutral-200 px-5 py-4 text-sm">
            Recent activity
          </h2>
          <ul className="divide-y divide-neutral-200">
            {recent.map((r) => (
              <li
                key={r.name}
                className="group flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-neutral-50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm">{r.name}</p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {r.type} · {r.time}
                  </p>
                </div>
                <ArrowUpRight
                  size={16}
                  className="shrink-0 text-neutral-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-black"
                />
              </li>
            ))}
          </ul>
        </section>

        {/* Quick actions */}
        <section className="h-fit rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="text-sm">Quick actions</h2>
          <div className="mt-4 space-y-2">
            {actions.map((a) => (
              <button
                key={a}
                className="flex w-full items-center justify-between rounded-xl border border-neutral-200 px-4 py-3 text-sm transition-colors hover:bg-neutral-50"
              >
                {a}
                <Plus size={16} />
              </button>
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
}