import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const works = [
  { name: "API error handlers", type: "Collection", count: "24 snippets" },
  { name: "React hooks library", type: "Collection", count: "38 snippets" },
  { name: "Docker and deploy notes", type: "Notes", count: "17 notes" },
  { name: "SQL query cheatsheet", type: "Notes", count: "12 notes" },
  { name: "Tailwind patterns", type: "Collection", count: "29 snippets" },
];

export default function Works() {
  return (
    <section className="mx-auto max-w-243 border-x border-neutral-200 bg-white/70 px-6 py-20 md:px-10">
      <h2 className="text-4xl font-medium tracking-tight md:text-5xl">Works</h2>
      <p className="mt-4 max-w-130 text-sm text-neutral-600">
        A look at how developers organize their workspace in Kodet.
      </p>

      <ul className="mt-14 divide-y divide-neutral-200 border-y border-neutral-200">
        {works.map((w, i) => (
          <motion.li
            key={w.name}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
          >
            <a
              href="#"
              className="group flex items-center justify-between gap-4 py-6 transition-colors hover:bg-neutral-50"
            >
              <span className="text-lg">{w.name}</span>
              <span className="flex items-center gap-6 text-sm text-neutral-500">
                <span className="hidden sm:inline">{w.type}</span>
                <span className="hidden sm:inline">{w.count}</span>
                <ArrowUpRight
                  size={18}
                  className="text-black transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </span>
            </a>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}