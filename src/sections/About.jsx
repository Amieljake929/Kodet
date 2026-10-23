import { motion } from "framer-motion";
import { Terminal, Lock, Zap } from "lucide-react";

const values = [
  { icon: Terminal, title: "Built for developers", text: "Keyboard-first, monospaced, and out of your way." },
  { icon: Zap, title: "Fast by default", text: "Open it, find your snippet, paste it. Nothing in between." },
  { icon: Lock, title: "Yours to keep", text: "Open source, so you always know where your work lives." },
];

export default function About() {
  return (
    <section className="mx-auto max-w-243 border-x border-neutral-200 bg-white/70 px-6 py-20 md:px-10">
      <h2 className="text-4xl font-medium tracking-tight md:text-5xl">About</h2>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 max-w-155 text-base leading-relaxed text-neutral-700"
      >
        Kodet started as a folder of half-finished notes and snippets scattered
        across editors, chats, and browser tabs. We built one place to keep all
        of it, so you can stop searching and get back to building.
      </motion.p>

      <div className="mt-14 grid gap-10 md:grid-cols-3">
        {values.map(({ icon: Icon, title, text }) => (
          <div key={title} className="border-t border-neutral-300 pt-6">
            <Icon size={22} />
            <h3 className="mt-5 text-base">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}