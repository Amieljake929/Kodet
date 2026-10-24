import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Code2,
  Copy,
  Maximize2,
  Plus,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";

const LANGUAGES = ["JavaScript", "React", "CSS", "Python", "SQL", "Bash"];

const btnPrimary =
  "rounded-lg bg-black px-3 py-1.5 text-xs text-white transition-opacity hover:opacity-80";

/* ------------------------------------------------------------------ */
/*  Tiny syntax highlighter (VS Code "Dark+" colors, no dependencies)  */
/* ------------------------------------------------------------------ */

const C = {
  ctrl: "#C586C0", // import, return, if ...
  kw: "#569CD6", // const, function, def ...
  fn: "#DCDCAA", // function calls
  type: "#4EC9B0", // Classes / components
  variable: "#9CDCFE",
  string: "#CE9178",
  number: "#B5CEA8",
  comment: "#6A9955",
  selector: "#D7BA7D",
};

const words = (s) => new Set(s.split(" "));

const JS_CTRL = words(
  "import export from return if else for while do try catch finally throw await async switch case break continue default new yield"
);
const JS_KW = words(
  "const let var function class extends typeof instanceof in of void delete true false null undefined this super static get set"
);
const PY_CTRL = words(
  "import from return if elif else for while try except finally raise with yield pass break continue"
);
const PY_KW = words(
  "def class as in not and or is lambda None True False async await global self"
);
const SQL_KW = words(
  "SELECT FROM WHERE JOIN LEFT RIGHT INNER OUTER FULL ON GROUP BY ORDER LIMIT OFFSET AS AND OR NOT INSERT INTO VALUES UPDATE SET DELETE CREATE TABLE ALTER DROP INDEX DISTINCT HAVING NULL IN LIKE BETWEEN ASC DESC UNION ALL CASE WHEN THEN ELSE END IS PRIMARY KEY"
);
const SH_CTRL = words("if then else elif fi for do done while case esac function in");

const COMMENT_C = /\/\/[^\n]*|\/\*[\s\S]*?\*\//y;
const STRING_JS = /"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`/y;
const STRING_Q = /"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/y;
const NUMBER = /\b\d[\d_]*(?:\.\d+)?\b/y;

const isCall = (code, end) => code[end] === "(";

const jsIdent = (w, code, i) => {
  if (JS_CTRL.has(w)) return C.ctrl;
  if (JS_KW.has(w)) return C.kw;
  if (isCall(code, i + w.length)) return C.fn;
  if (/^[A-Z]/.test(w)) return C.type;
  return C.variable;
};

const jsRules = [
  [COMMENT_C, C.comment],
  [STRING_JS, C.string],
  [NUMBER, C.number],
  [/[A-Za-z_$][\w$]*/y, jsIdent],
];

const LANG_RULES = {
  JavaScript: jsRules,
  React: [
    [COMMENT_C, C.comment],
    [STRING_JS, C.string],
    // JSX tags: <div, </Button, <Avatar
    [/<\/?(?=[A-Za-z])[\w.]*/y, (m) => (/^<\/?[A-Z]/.test(m) ? C.type : C.kw)],
    [NUMBER, C.number],
    [/[A-Za-z_$][\w$]*/y, jsIdent],
  ],
  CSS: [
    [/\/\*[\s\S]*?\*\//y, C.comment],
    [STRING_Q, C.string],
    [/@[\w-]+/y, C.ctrl],
    [/#[0-9a-fA-F]{3,8}\b/y, C.number],
    [/-?\d*\.?\d+(?:px|rem|em|vh|vw|vmin|vmax|%|ms|s|deg|fr|ch)?/y, C.number],
    [/[.#][A-Za-z_-][\w-]*/y, C.selector],
    [/[A-Za-z-]+(?=\s*:)/y, C.variable],
    [/[A-Za-z-]+/y, (w, code, i) => (isCall(code, i + w.length) ? C.fn : C.string)],
  ],
  Python: [
    [/#[^\n]*/y, C.comment],
    [
      /(?:[fFrRbB]{1,2})?(?:"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')/y,
      C.string,
    ],
    [/@[\w.]+/y, C.fn],
    [NUMBER, C.number],
    [
      /[A-Za-z_]\w*/y,
      (w, code, i) => {
        if (PY_CTRL.has(w)) return C.ctrl;
        if (PY_KW.has(w)) return C.kw;
        if (isCall(code, i + w.length)) return C.fn;
        if (/^[A-Z]/.test(w)) return C.type;
        return C.variable;
      },
    ],
  ],
  SQL: [
    [/--[^\n]*|\/\*[\s\S]*?\*\//y, C.comment],
    [STRING_Q, C.string],
    [NUMBER, C.number],
    [
      /[A-Za-z_]\w*/y,
      (w, code, i) => {
        if (SQL_KW.has(w.toUpperCase())) return C.kw;
        if (isCall(code, i + w.length)) return C.fn;
        return C.variable;
      },
    ],
  ],
  Bash: [
    [/(?<![\w$])#[^\n]*/y, C.comment],
    [STRING_Q, C.string],
    [/\$\{[^}]*\}|\$[\w@#?*!]+/y, C.variable],
    [/(?<=\s)-{1,2}[A-Za-z][\w-]*/y, C.string],
    [NUMBER, C.number],
    [
      /[A-Za-z_.\/~][\w.\/~-]*/y,
      (w, code, i) => {
        if (SH_CTRL.has(w)) return C.ctrl;
        // A word at the start of a command is the command name
        let j = i - 1;
        while (j >= 0 && (code[j] === " " || code[j] === "\t")) j--;
        const prev = code[j];
        return j < 0 || "\n|;&(".includes(prev) ? C.fn : null;
      },
    ],
  ],
};

function highlight(code, language) {
  const rules = LANG_RULES[language] || [];
  const tokens = [];
  let plain = "";
  let i = 0;

  const flush = () => {
    if (plain) tokens.push({ text: plain });
    plain = "";
  };

  while (i < code.length) {
    let hit = false;
    for (const [re, type] of rules) {
      re.lastIndex = i;
      const m = re.exec(code);
      if (!m || m[0].length === 0) continue;
      const color = typeof type === "function" ? type(m[0], code, i) : type;
      if (color) {
        flush();
        tokens.push({ text: m[0], color });
      } else {
        plain += m[0];
      }
      i += m[0].length;
      hit = true;
      break;
    }
    if (!hit) {
      plain += code[i];
      i += 1;
    }
  }
  flush();
  return tokens;
}

function CodeBlock({ code, language, lineNumbers = false, className = "" }) {
  const tokens = useMemo(() => highlight(code, language), [code, language]);
  const lines = useMemo(() => code.split("\n").length, [code]);

  return (
    <div
      style={{ backgroundColor: "#1e1e1e", color: "#d4d4d4" }}
      className={`flex overflow-auto font-mono leading-relaxed ${className}`}
    >
      {lineNumbers && (
        <pre
          aria-hidden="true"
          style={{ color: "#6e7681" }}
          className="sticky left-0 shrink-0 select-none border-r border-white/10 bg-[#1e1e1e] py-3 pl-4 pr-3 text-right"
        >
          {Array.from({ length: lines }, (_, n) => n + 1).join("\n")}
        </pre>
      )}
      <pre className="min-w-0 flex-1 px-4 py-3">
        <code>
          {tokens.map((t, n) =>
            t.color ? (
              <span key={n} style={{ color: t.color }}>
                {t.text}
              </span>
            ) : (
              t.text
            )
          )}
        </code>
      </pre>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Placeholder data                                                   */
/* ------------------------------------------------------------------ */

const hoursAgo = (h) => Date.now() - h * 3600000;

// Placeholder content: replace with real data later
const initialSnippets = [
  {
    id: "s1",
    title: "Debounce function",
    language: "JavaScript",
    description: "Delay a function until the user stops typing.",
    tags: ["utils", "performance"],
    favorite: true,
    updatedAt: hoursAgo(2),
    code: `export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}`,
  },
  {
    id: "s2",
    title: "useLocalStorage hook",
    language: "React",
    description: "Persist state to localStorage with a useState-like API.",
    tags: ["hooks", "storage"],
    favorite: false,
    updatedAt: hoursAgo(20),
    code: `import { useState } from "react";

export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initial;
    } catch {
      return initial;
    }
  });

  const set = (next) => {
    setValue(next);
    localStorage.setItem(key, JSON.stringify(next));
  };

  return [value, set];
}`,
  },
  {
    id: "s3",
    title: "Center anything with grid",
    language: "CSS",
    description: "The shortest way to center content both ways.",
    tags: ["layout"],
    favorite: false,
    updatedAt: hoursAgo(48),
    code: `/* Center content both ways */
.center {
  display: grid;
  place-items: center;
  min-height: 100vh;
  background: #1e1e1e;
}`,
  },
  {
    id: "s4",
    title: "Read a JSON file",
    language: "Python",
    description: "Load a JSON file into a dictionary.",
    tags: ["files", "json"],
    favorite: true,
    updatedAt: hoursAgo(72),
    code: `import json

# Load the file into a dict
with open("data.json", encoding="utf-8") as f:
    data = json.load(f)

print(data["name"])`,
  },
  {
    id: "s5",
    title: "Top customers by revenue",
    language: "SQL",
    description: "Group orders by customer and rank by total spent.",
    tags: ["reports"],
    favorite: false,
    updatedAt: hoursAgo(120),
    code: `SELECT c.name, SUM(o.total) AS revenue
FROM customers c
JOIN orders o ON o.customer_id = c.id
GROUP BY c.id
ORDER BY revenue DESC
LIMIT 10;`,
  },
  {
    id: "s6",
    title: "Find large files",
    language: "Bash",
    description: "List the 10 biggest files in the current folder tree.",
    tags: ["cli", "disk"],
    favorite: false,
    updatedAt: hoursAgo(200),
    code: `# 10 biggest files under the current folder
find . -type f -exec du -h {} + | sort -rh | head -n 10`,
  },
];

function timeAgo(ts) {
  const mins = Math.max(1, Math.round((Date.now() - ts) / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

/* ------------------------------------------------------------------ */
/*  Card                                                               */
/* ------------------------------------------------------------------ */

const iconBtn =
  "rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-black";

function SnippetCard({ snippet, onCopy, onFavorite, onDelete, onExpand, copied }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white"
    >
      <header className="flex items-start justify-between gap-3 px-4 pt-4">
        <div className="min-w-0">
          <h3 className="truncate text-[13px]">{snippet.title}</h3>
          <p className="mt-0.5 line-clamp-2 text-[11px] text-neutral-500">
            {snippet.description || "No description"}
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-neutral-200 px-2 py-0.5 text-[10px] text-neutral-600">
          {snippet.language}
        </span>
      </header>

      <div className="group relative mx-4 mt-3 flex-1">
        <CodeBlock
          code={snippet.code}
          language={snippet.language}
          className="h-full max-h-44 rounded-xl border border-white/10 text-[11px]"
        />
        <button
          onClick={() => onExpand(snippet)}
          aria-label="Enlarge snippet"
          title="Enlarge"
          className="absolute right-2 top-2 rounded-lg border border-white/10 bg-[#2a2a2a] p-1.5 text-neutral-300 opacity-0 transition-opacity hover:text-white focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
        >
          <Maximize2 size={12} />
        </button>
      </div>

      <footer className="mt-3 flex items-center justify-between gap-2 px-4 pb-4">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          {snippet.tags.map((t) => (
            <span key={t} className="text-[10px] text-neutral-400">
              #{t}
            </span>
          ))}
          <span className="text-[10px] text-neutral-400">· {timeAgo(snippet.updatedAt)}</span>
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          <button
            onClick={() => onFavorite(snippet.id)}
            aria-label={snippet.favorite ? "Remove from favorites" : "Add to favorites"}
            aria-pressed={snippet.favorite}
            className={iconBtn}
          >
            <Star size={14} fill={snippet.favorite ? "currentColor" : "none"} />
          </button>
          <button onClick={() => onCopy(snippet)} aria-label="Copy code" className={iconBtn}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
          <button
            onClick={() => onExpand(snippet)}
            aria-label="Enlarge snippet"
            title="Enlarge"
            className={iconBtn}
          >
            <Maximize2 size={14} />
          </button>
          <button
            onClick={() => onDelete(snippet.id)}
            aria-label="Delete snippet"
            className={`${iconBtn} hover:text-red-500`}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </footer>
    </motion.article>
  );
}

/* ------------------------------------------------------------------ */
/*  Modals (blur-only backdrop)                                        */
/* ------------------------------------------------------------------ */

const backdropClass =
  "fixed inset-0 z-[110] flex items-center justify-center p-4 backdrop-blur-md";

const modalMotion = {
  initial: { opacity: 0, y: 14, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 14, scale: 0.98 },
  transition: { duration: 0.2 },
};

function useEscape(onClose) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
}

function ViewSnippetModal({ snippet, copied, onCopy, onClose }) {
  useEscape(onClose);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className={backdropClass}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={snippet.title}
        {...modalMotion}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between gap-4 px-6 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-neutral-200">
              <Code2 size={16} />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-sm">{snippet.title}</h2>
              <p className="truncate text-[11px] text-neutral-500">
                {snippet.description || "No description"}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span className="rounded-full border border-neutral-200 px-2.5 py-1 text-[11px] text-neutral-600">
              {snippet.language}
            </span>
            <button
              onClick={() => onCopy(snippet)}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs transition-colors hover:bg-neutral-100"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              onClick={onClose}
              aria-label="Close"
              className="rounded-lg p-1.5 transition-colors hover:bg-neutral-100"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 px-6 pb-2">
          <CodeBlock
            code={snippet.code}
            language={snippet.language}
            lineNumbers
            className="max-h-[62vh] rounded-2xl border border-white/10 text-[13px]"
          />
        </div>

        <div className="flex items-center justify-between gap-3 px-6 py-4 text-[11px] text-neutral-400">
          <span className="truncate">
            {snippet.tags.map((t) => `#${t}`).join("  ")}
          </span>
          <span className="shrink-0">Updated {timeAgo(snippet.updatedAt)} · Esc to close</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

function AddSnippetModal({ onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  useEscape(onClose);

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim()) return setError("Give your snippet a title.");
    if (!code.trim()) return setError("Paste some code first.");
    onCreate({
      title: title.trim(),
      language,
      description: description.trim(),
      tags: tags
        .split(",")
        .map((t) => t.trim().replace(/^#/, ""))
        .filter(Boolean),
      code,
    });
  };

  const field =
    "w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-[13px] outline-none placeholder:text-neutral-400 transition-colors focus:border-black";
  const label = "mb-1.5 block text-[11px] text-neutral-500";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className={backdropClass}
    >
      <motion.form
        onSubmit={submit}
        onKeyDown={(e) => (e.ctrlKey || e.metaKey) && e.key === "Enter" && submit(e)}
        role="dialog"
        aria-modal="true"
        aria-label="New snippet"
        {...modalMotion}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between gap-4 border-b border-neutral-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200">
              <Plus size={16} />
            </span>
            <div>
              <h2 className="text-sm">New snippet</h2>
              <p className="text-[11px] text-neutral-500">Save code you want to reuse.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 transition-colors hover:bg-neutral-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid min-h-0 gap-5 overflow-y-auto px-6 py-5 md:grid-cols-[1fr_1.3fr]">
          {/* Details */}
          <div className="space-y-4">
            <div>
              <label htmlFor="sn-title" className={label}>
                Title
              </label>
              <input
                id="sn-title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setError("");
                }}
                maxLength={60}
                placeholder="e.g. Debounce function"
                className={field}
                autoFocus
              />
            </div>

            <div>
              <span className={label}>Language</span>
              <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Language">
                {LANGUAGES.map((l) => (
                  <button
                    key={l}
                    type="button"
                    role="radio"
                    aria-checked={language === l}
                    onClick={() => setLanguage(l)}
                    className={`rounded-full border px-3 py-1 text-[11px] transition-colors ${
                      language === l
                        ? "border-black bg-black text-white"
                        : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="sn-desc" className={label}>
                Description (optional)
              </label>
              <input
                id="sn-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={120}
                placeholder="What does it do?"
                className={field}
              />
            </div>

            <div>
              <label htmlFor="sn-tags" className={label}>
                Tags (comma separated)
              </label>
              <input
                id="sn-tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="utils, hooks"
                className={field}
              />
            </div>
          </div>

          {/* Code */}
          <div className="flex min-h-[240px] flex-col">
            <label htmlFor="sn-code" className={label}>
              Code
            </label>
            <textarea
              id="sn-code"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError("");
              }}
              spellCheck={false}
              placeholder="Paste your code here"
              style={{ backgroundColor: "#1e1e1e", color: "#d4d4d4" }}
              className="min-h-[220px] w-full flex-1 resize-none rounded-xl border border-white/10 p-4 font-mono text-xs leading-relaxed outline-none placeholder:text-neutral-500 focus:border-neutral-400"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-neutral-200 px-6 py-3.5">
          <p className={`text-[11px] ${error ? "text-red-500" : "text-neutral-400"}`}>
            {error || "Ctrl + Enter to save"}
          </p>
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-neutral-300 px-4 py-2 text-xs transition-colors hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button type="submit" className="rounded-xl bg-black px-5 py-2 text-xs text-white">
              Save snippet
            </button>
          </div>
        </div>
      </motion.form>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function Snippet() {
  const [snippets, setSnippets] = useState(initialSnippets);
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState("All");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewingId, setViewingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const copyTimer = useRef(null);

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  const viewing = snippets.find((s) => s.id === viewingId) || null;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return snippets
      .filter((s) => language === "All" || s.language === language)
      .filter((s) => !onlyFavorites || s.favorite)
      .filter(
        (s) =>
          !q ||
          `${s.title} ${s.description} ${s.tags.join(" ")} ${s.code}`
            .toLowerCase()
            .includes(q)
      )
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [snippets, query, language, onlyFavorites]);

  const handleCopy = async (snippet) => {
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopiedId(snippet.id);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopiedId(null), 1500);
    } catch {
      /* clipboard unavailable: ignore */
    }
  };

  const handleFavorite = (id) =>
    setSnippets((list) =>
      list.map((s) => (s.id === id ? { ...s, favorite: !s.favorite } : s))
    );

  const handleDelete = (id) => {
    setSnippets((list) => list.filter((s) => s.id !== id));
    if (viewingId === id) setViewingId(null);
  };

  const handleCreate = (data) => {
    setSnippets((list) => [
      { id: `s${Date.now()}`, favorite: false, updatedAt: Date.now(), ...data },
      ...list,
    ]);
    setModalOpen(false);
  };

  const chips = ["All", ...LANGUAGES];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl">Snippets</h1>
          <p className="mt-1 text-xs text-neutral-500">
            {snippets.length} saved · keep the code you reuse in one place.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-xs text-white transition-opacity hover:opacity-80"
        >
          <Plus size={14} />
          New snippet
        </button>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <label className="flex min-w-[220px] flex-1 items-center gap-2.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 focus-within:border-black sm:max-w-sm">
          <Search size={14} className="shrink-0 text-neutral-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, tag or code"
            aria-label="Search snippets"
            className="w-full bg-transparent text-xs outline-none placeholder:text-neutral-400"
          />
        </label>

        <button
          onClick={() => setOnlyFavorites((v) => !v)}
          aria-pressed={onlyFavorites}
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs transition-colors ${
            onlyFavorites
              ? "border-black bg-black text-white"
              : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
          }`}
        >
          <Star size={13} fill={onlyFavorites ? "currentColor" : "none"} />
          Favorites
        </button>
      </div>

      <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
        {chips.map((c) => (
          <button
            key={c}
            onClick={() => setLanguage(c)}
            className={`shrink-0 rounded-full border px-3 py-1 text-[11px] transition-colors ${
              language === c
                ? "border-black bg-black text-white"
                : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-neutral-300 px-6 py-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-neutral-200">
            <Code2 size={22} />
          </span>
          <h2 className="mt-5 text-sm">
            {snippets.length === 0 ? "No snippets yet" : "No snippets found"}
          </h2>
          <p className="mt-2 max-w-[260px] text-xs leading-relaxed text-neutral-500">
            {snippets.length === 0
              ? "Save your first piece of reusable code."
              : "Try a different search or filter."}
          </p>
          {snippets.length === 0 && (
            <button onClick={() => setModalOpen(true)} className={`${btnPrimary} mt-5`}>
              New snippet
            </button>
          )}
        </div>
      ) : (
        <motion.div layout className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visible.map((s) => (
              <SnippetCard
                key={s.id}
                snippet={s}
                copied={copiedId === s.id}
                onCopy={handleCopy}
                onFavorite={handleFavorite}
                onDelete={handleDelete}
                onExpand={(sn) => setViewingId(sn.id)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <AnimatePresence>
        {modalOpen && (
          <AddSnippetModal onClose={() => setModalOpen(false)} onCreate={handleCreate} />
        )}
        {viewing && (
          <ViewSnippetModal
            key="view"
            snippet={viewing}
            copied={copiedId === viewing.id}
            onCopy={handleCopy}
            onClose={() => setViewingId(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}