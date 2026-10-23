import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";

const faqs = [
  { q: "What is Kodet?", a: "Kodet is a personal workspace where you store code snippets, developer notes, and anything else worth keeping." },
  { q: "Is Kodet free?", a: "Yes. You can start organizing for free, and the project is open source on GitHub." },
  { q: "Which languages are supported?", a: "Any language. Snippets get syntax highlighting based on the language you choose." },
  { q: "Can I use Kodet on multiple devices?", a: "Yes. Sign in on any device and your workspace is there." },
  { q: "Can I export my data?", a: "Yes. Export your snippets and notes as markdown or JSON at any time." },
];

export default function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section className="mx-auto max-w-243 border-x border-neutral-200 bg-white/70 px-6 py-20 md:px-10">
      <h2 className="text-4xl font-medium tracking-tight md:text-5xl">FAQ</h2>
      <p className="mt-4 text-sm text-neutral-600">Quick answers to common questions.</p>

      <div className="mt-14 divide-y divide-neutral-200 border-y border-neutral-200">
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.q}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 py-6 text-left text-lg"
                aria-expanded={isOpen}
              >
                {f.q}
                <motion.span animate={{ rotate: isOpen ? 45 : 0 }} className="flex">
                  <Plus size={20} />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p className="max-w-150 pb-6 text-sm leading-relaxed text-neutral-600">
                      {f.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}