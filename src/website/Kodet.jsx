import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Code2,
  StickyNote,
  FolderTree,
  Search,
  Tags,
  CloudUpload,
  Quote,
} from "lucide-react";

function GithubIcon({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1-.02-1.96-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.69 1.25 3.35.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.69 5.4-5.26 5.68.41.36.78 1.06.78 2.14 0 1.55-.01 2.8-.01 3.18 0 .31.21.68.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

/* ----------------------------- data ----------------------------- */

const features = [
  {
    icon: Code2,
    title: "Code snippets",
    text: "Save the code you reuse, with syntax highlighting and one-click copy.",
    span: "md:col-span-2",
  },
  {
    icon: StickyNote,
    title: "Developer notes",
    text: "Write markdown notes right next to your code.",
    span: "",
  },
  {
    icon: FolderTree,
    title: "Collections",
    text: "Group everything by project, stack, or client.",
    span: "",
  },
  {
    icon: Search,
    title: "Instant search",
    text: "Find any snippet or note by title, tag, or content as you type.",
    span: "md:col-span-2",
  },
];

const steps = [
  {
    title: "Capture",
    text: "Paste a snippet or write a note. Kodet saves it the moment you stop typing.",
  },
  {
    title: "Organize",
    text: "Add tags and drop it into a collection so it lands where you expect it.",
  },
  {
    title: "Find it again",
    text: "Search your workspace and copy what you need in seconds.",
  },
];

const languages = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Go",
  "Rust",
  "PHP",
  "SQL",
  "Bash",
  "HTML",
  "CSS",
  "Java",
  "C#",
];

const stats = [
  { value: "40+", label: "Languages highlighted" },
  { value: "1 click", label: "To copy any snippet" },
  { value: "100%", label: "Open source" },
];

const quotes = [
  {
    text: "I stopped digging through old projects for that one regex. It's in Kodet.",
    name: "Alex R.",
    role: "Frontend developer",
  },
  {
    text: "My Docker and deploy notes finally live next to the snippets they belong to.",
    name: "Mina T.",
    role: "Full-stack developer",
  },
  {
    text: "Search is fast enough that I use it instead of Googling my own code.",
    name: "Jon P.",
    role: "Backend developer",
  },
];

/* -------------------------- animation --------------------------- */

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const reveal = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5, ease: "easeOut" },
};

/* ---------------------------- page ------------------------------ */

export default function Kodet() {
  return (
    <>
      {/* ───────────── Hero ───────────── */}
      <section className="mx-auto max-w-[972px] border-x border-neutral-200 bg-white/70 px-6">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center pb-20 pt-16 text-center"
        >
          <motion.p variants={item} className="text-[15px] text-neutral-700">
            Your personal developer workspace
          </motion.p>

          <motion.h1
            variants={item}
            className="mt-8 text-[60px] font-medium leading-none tracking-tight sm:text-[100px] md:text-[108px]"
          >
            Kodet
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-10 max-w-[560px] text-[14px] leading-relaxed text-neutral-800"
          >
            Your personal space for code snippets, developer notes, and
            everything worth keeping.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-14 flex items-stretch divide-x divide-neutral-300"
          >
            <Link
              to="/services"
              className="group flex items-center gap-2 px-8 py-4 text-[16px]"
            >
              Start Organizing
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-2 px-8 py-4 text-[16px]"
            >
              View on GitHub
              <ArrowUpRight
                size={16}
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* ───────────── Features panel ───────────── */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }}
        className="mx-auto max-w-[1150px] px-4 md:px-0"
      >
        <div className="rounded-t-[36px] bg-neutral-100 p-6 pb-10 md:p-12 md:pb-14">
          <h2 className="max-w-[520px] text-1xl font-normal tracking-tight md:text-2xl">
            Everything you keep, in one place.
          </h2>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {features.map(({ icon: Icon, title, text, span }) => (
              <div
                key={title}
                className={`rounded-2xl border border-neutral-200 bg-white p-6 ${span}`}
              >
                <Icon size={22} />
                <h3 className="mt-8 text-base">{title}</h3>
                <p className="mt-2 max-w-[360px] text-sm leading-relaxed text-neutral-600">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ───────────── Languages marquee ───────────── */}
      <section className="border-y border-neutral-200 bg-white/80 py-6">
        <div className="relative overflow-hidden">
          <motion.div
            className="flex w-max gap-12 whitespace-nowrap text-sm text-neutral-500"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 28, ease: "linear", repeat: Infinity }}
          >
            {[...languages, ...languages].map((lang, i) => (
              <span key={`${lang}-${i}`}>{lang}</span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ───────────── How it works ───────────── */}
      <section className="mx-auto max-w-[972px] border-x border-neutral-200 bg-white/70 px-6 py-24 md:px-10">
        <motion.div {...reveal}>
          <h2 className="max-w-[560px] text-3xl font-medium tracking-tight md:text-4xl">
            From scattered to sorted in three steps.
          </h2>
        </motion.div>

        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              {...reveal}
              transition={{ ...reveal.transition, delay: i * 0.1 }}
              className="border-t border-neutral-300 pt-6"
            >
              <span className="text-xs text-neutral-400">Step {i + 1}</span>
              <h3 className="mt-3 text-lg">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                {s.text}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ───────────── Stats ───────────── */}
      <section className="mx-auto max-w-[972px] border-x border-t border-neutral-200 bg-white/70">
        <div className="grid divide-y divide-neutral-200 md:grid-cols-3 md:divide-x md:divide-y-0">
          {stats.map((s) => (
            <div key={s.label} className="px-6 py-12 text-center md:px-10">
              <p className="text-4xl font-medium tracking-tight">{s.value}</p>
              <p className="mt-2 text-sm text-neutral-600">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────── Tags & sync highlight ───────────── */}
      <section className="mx-auto max-w-[972px] border-x border-t border-neutral-200 bg-white/70 px-6 py-24 md:px-10">
        <div className="grid items-start gap-12 md:grid-cols-2">
          <motion.div {...reveal}>
            <Tags size={22} />
            <h3 className="mt-6 text-2xl font-medium tracking-tight">
              Tag it once, filter it forever.
            </h3>
            <p className="mt-3 max-w-[380px] text-sm leading-relaxed text-neutral-600">
              Add tags like auth, docker, or hooks and narrow your workspace
              down to exactly what you need.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs">
              {["auth", "docker", "hooks", "sql", "regex", "api"].map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-neutral-300 bg-white px-3 py-1.5"
                >
                  {t}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            {...reveal}
            transition={{ ...reveal.transition, delay: 0.1 }}
          >
            <CloudUpload size={22} />
            <h3 className="mt-6 text-2xl font-medium tracking-tight">
              Your workspace, on every device.
            </h3>
            <p className="mt-3 max-w-[380px] text-sm leading-relaxed text-neutral-600">
              Sign in anywhere and pick up where you left off. Export
              everything as markdown or JSON whenever you want.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ───────────── Testimonials ───────────── */}
      <section className="mx-auto max-w-[972px] border-x border-t border-neutral-200 bg-white/70 px-6 py-24 md:px-10">
        <motion.h2
          {...reveal}
          className="max-w-[480px] text-3xl font-medium tracking-tight md:text-4xl"
        >
          Developers keep coming back.
        </motion.h2>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {quotes.map((q, i) => (
            <motion.figure
              key={q.name}
              {...reveal}
              transition={{ ...reveal.transition, delay: i * 0.1 }}
              className="flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-6"
            >
              <div>
                <Quote size={18} className="text-neutral-400" />
                <blockquote className="mt-4 text-sm leading-relaxed">
                  {q.text}
                </blockquote>
              </div>
              <figcaption className="mt-8 text-xs text-neutral-500">
                <span className="block text-black">{q.name}</span>
                {q.role}
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </section>

      {/* ───────────── Final CTA ───────────── */}
      <section className="mx-auto max-w-[1150px] px-4 pb-24 md:px-0">
        <motion.div
          {...reveal}
          className="rounded-[36px] bg-black px-6 py-20 text-center text-white md:px-12"
        >
          <h2 className="mx-auto max-w-[620px] text-3xl font-medium tracking-tight md:text-5xl">
            Keep everything worth keeping.
          </h2>
          <p className="mx-auto mt-5 max-w-[420px] text-sm text-neutral-400">
            Start your workspace for free. No setup, no clutter.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/services"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm text-black"
              >
                Get Started
                <ArrowRight size={16} />
              </Link>
            </motion.div>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-700 px-6 py-3 text-sm transition-colors hover:bg-neutral-900"
            >
              <GithubIcon size={16} />
              View on GitHub
            </a>
          </div>
        </motion.div>
      </section>

      {/* ───────────── Footer ───────────── */}
      <footer className="border-t border-neutral-200 bg-white/85">
        <div className="mx-auto flex max-w-[972px] flex-col items-center justify-between gap-4 border-x border-neutral-200 bg-white px-6 py-8 text-sm text-neutral-600 md:flex-row md:px-10">
          <span className="text-black">Kodet</span>
          <nav className="flex gap-6">
            <Link to="/services" className="hover:text-black">Services</Link>
            <Link to="/works" className="hover:text-black">Works</Link>
            <Link to="/about" className="hover:text-black">About</Link>
            <Link to="/faq" className="hover:text-black">FAQ</Link>
          </nav>
          <span>© {new Date().getFullYear()} Kodet</span>
        </div>
      </footer>
    </>
  );
}