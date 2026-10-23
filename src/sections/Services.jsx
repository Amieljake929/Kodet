import { motion } from "framer-motion";
import { Code2, StickyNote, FolderTree, Search, Tags, CloudUpload } from "lucide-react";

const services = [
  { icon: Code2, title: "Code snippets", text: "Save snippets with syntax highlighting for any language and copy them in one click." },
  { icon: StickyNote, title: "Developer notes", text: "Write quick notes in markdown, next to the code they belong to." },
  { icon: FolderTree, title: "Collections", text: "Group snippets and notes by project, stack, or client." },
  { icon: Search, title: "Instant search", text: "Find any snippet or note by title, tag, or content as you type." },
  { icon: Tags, title: "Tags", text: "Label anything and filter your workspace down to what you need." },
  { icon: CloudUpload, title: "Sync and backup", text: "Keep your workspace available on every device you code on." },
];

export default function Services() {
  return (
    <section className="mx-auto max-w-[972px] border-x border-neutral-200 bg-white/70 px-6 py-20 md:px-10">
      <h2 className="text-4xl font-medium tracking-tight md:text-5xl">Services</h2>
      <p className="mt-4 max-w-[520px] text-sm text-neutral-600">
        Everything you need to keep your code and thoughts organized.
      </p>

      <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-200 sm:grid-cols-2 lg:grid-cols-3">
        {services.map(({ icon: Icon, title, text }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="bg-white p-6 transition-colors hover:bg-neutral-50"
          >
            <Icon size={22} />
            <h3 className="mt-6 text-base">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">{text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}