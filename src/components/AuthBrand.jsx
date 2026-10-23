import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

// Left side of the auth pages
export default function AuthBrand() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="text-center lg:text-left"
    >
      <Link
        to="/"
        aria-label="Kodet home"
        className="block text-[64px] font-medium leading-none tracking-tight sm:text-[88px] lg:text-[120px]"
      >
        Kodet
      </Link>
      <p className="mt-5 text-sm text-neutral-600">
        Your personal developer workspace
      </p>
      <Link
        to="/"
        className="mt-6 hidden items-center gap-2 text-xs text-neutral-500 transition-colors hover:text-black lg:inline-flex"
      >
        <ArrowLeft size={14} />
        Back to home
      </Link>
    </motion.div>
  );
}