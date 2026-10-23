import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, Lock, CheckCircle2 } from "lucide-react";
import FormField from "../components/FormField";
import { clearUser } from "../lib/auth";

const STORAGE_KEY = "kodet-settings";

const options = [
  {
    key: "emailNotifications",
    title: "Email notifications",
    text: "Get an email about important account activity.",
  },
  {
    key: "weeklySummary",
    title: "Weekly summary",
    text: "A short recap of the snippets and notes you added.",
  },
  {
    key: "autoSave",
    title: "Auto-save",
    text: "Save snippets and notes as you type.",
  },
  {
    key: "compactView",
    title: "Compact view",
    text: "Show more items on screen with tighter spacing.",
  },
];

const defaults = {
  emailNotifications: true,
  weeklySummary: false,
  autoSave: true,
  compactView: false,
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaults, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return defaults;
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? "bg-black" : "bg-neutral-300"
      }`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
        className={`absolute top-1 h-4 w-4 rounded-full bg-white ${
          checked ? "right-1" : "left-1"
        }`}
      />
    </button>
  );
}

const emptyPasswords = { current: "", next: "", confirm: "" };

export default function Settings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(loadSettings);

  // Change password
  const [pw, setPw] = useState(emptyPasswords);
  const [pwErrors, setPwErrors] = useState({});
  const [pwStatus, setPwStatus] = useState("idle"); // idle | loading | saved

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* ignore */
    }
  }, [settings]);

  const setPwField = (key) => (e) => {
    setPw((v) => ({ ...v, [key]: e.target.value }));
    if (pwErrors[key]) setPwErrors((er) => ({ ...er, [key]: undefined }));
    if (pwStatus === "saved") setPwStatus("idle");
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (!pw.current) next.current = "Enter your current password.";
    if (!pw.next) next.next = "Enter a new password.";
    else if (pw.next.length < 8) next.next = "Use at least 8 characters.";
    else if (pw.next === pw.current)
      next.next = "Use a different password than your current one.";
    if (!pw.confirm) next.confirm = "Confirm your new password.";
    else if (pw.confirm !== pw.next) next.confirm = "Passwords don't match.";
    setPwErrors(next);
    if (Object.keys(next).length) return;

    // TODO: send to your backend once it exists (it should verify the current password)
    setPwStatus("loading");
    setTimeout(() => {
      setPw(emptyPasswords);
      setPwStatus("saved");
      setTimeout(() => setPwStatus("idle"), 3000);
    }, 700);
  };

  const handleDelete = () => {
    if (window.confirm("Delete your account? This can't be undone.")) {
      // TODO: call your backend once it exists
      clearUser();
      navigate("/signup");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <h1 className="text-3xl font-medium tracking-tight">Settings</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Choose how Kodet works for you.
      </p>

      {/* Preferences */}
      <section className="mt-10 max-w-[640px] divide-y divide-neutral-200 rounded-2xl border border-neutral-200 bg-white">
        {options.map((o) => (
          <div
            key={o.key}
            className="flex items-center justify-between gap-6 px-5 py-5"
          >
            <div>
              <p className="text-sm">{o.title}</p>
              <p className="mt-1 text-xs text-neutral-500">{o.text}</p>
            </div>
            <Toggle
              label={o.title}
              checked={settings[o.key]}
              onChange={(v) => setSettings((s) => ({ ...s, [o.key]: v }))}
            />
          </div>
        ))}
      </section>

      {/* Change password */}
      <section className="mt-6 max-w-[640px] rounded-2xl border border-neutral-200 bg-white p-5 md:p-6">
        <h2 className="text-sm">Change password</h2>
        <p className="mt-1 text-xs text-neutral-500">
          Use at least 8 characters that you don't use anywhere else.
        </p>

        <form onSubmit={handlePasswordSubmit} noValidate className="mt-5">
          <div className="divide-y divide-neutral-200 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
            <FormField
              id="current-password"
              label="Current password"
              type="password"
              icon={Lock}
              placeholder="Enter your current password"
              autoComplete="current-password"
              value={pw.current}
              onChange={setPwField("current")}
              error={pwErrors.current}
            />
            <FormField
              id="new-password"
              label="New password"
              hint="At least 8 characters"
              type="password"
              icon={Lock}
              placeholder="Create a new password"
              autoComplete="new-password"
              value={pw.next}
              onChange={setPwField("next")}
              error={pwErrors.next}
            />
            <FormField
              id="confirm-password"
              label="Confirm new password"
              type="password"
              icon={Lock}
              placeholder="Repeat your new password"
              autoComplete="new-password"
              value={pw.confirm}
              onChange={setPwField("confirm")}
              error={pwErrors.confirm}
            />
          </div>

          <div className="mt-5 flex items-center gap-4">
            <motion.button
              type="submit"
              disabled={pwStatus === "loading"}
              whileHover={pwStatus === "idle" ? { scale: 1.02 } : undefined}
              whileTap={pwStatus === "idle" ? { scale: 0.98 } : undefined}
              className="rounded-xl bg-black px-6 py-3 text-sm text-white disabled:opacity-80"
            >
              {pwStatus === "loading" ? "Saving" : "Save password"}
            </motion.button>

            <AnimatePresence>
              {pwStatus === "saved" && (
                <motion.span
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5 text-sm text-neutral-600"
                >
                  <CheckCircle2 size={16} />
                  Password updated
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </form>
      </section>

      {/* Danger zone */}
      <section className="mt-6 flex max-w-[640px] items-center justify-between gap-6 rounded-2xl border border-red-500/40 bg-white px-5 py-5">
        <div>
          <p className="text-sm">Delete account</p>
          <p className="mt-1 text-xs text-neutral-500">
            Remove your account and everything in it.
          </p>
        </div>
        <button
          onClick={handleDelete}
          className="flex shrink-0 items-center gap-2 rounded-xl border border-red-500 px-4 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-500 hover:text-white"
        >
          <Trash2 size={16} />
          Delete
        </button>
      </section>
    </motion.div>
  );
}