import { Link } from "react-router-dom";
import { motion } from "framer-motion";

// Simple empty-state page used until each section has real content
export default function Placeholder({
  icon: Icon,
  title,
  description,
  emptyTitle,
  emptyText,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <h1 className="text-3xl font-medium tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-neutral-600">{description}</p>

      <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-20 text-center">
        {Icon && (
          <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-neutral-200">
            <Icon size={22} />
          </span>
        )}
        <h2 className="mt-6 text-lg">{emptyTitle}</h2>
        <p className="mt-2 max-w-[340px] text-sm text-neutral-600">
          {emptyText}
        </p>
        <Link
          to="/dashboard"
          className="mt-8 rounded-xl border border-neutral-300 px-5 py-2.5 text-sm transition-colors hover:bg-neutral-50"
        >
          Back to dashboard
        </Link>
      </div>
    </motion.div>
  );
}