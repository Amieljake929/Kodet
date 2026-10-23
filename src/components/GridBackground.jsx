import { motion } from "framer-motion";

const SIZE = 56;

// subtle: softer grid for app screens (e.g. the dashboard)
export default function GridBackground({ subtle = false }) {
  const mask =
    "radial-gradient(ellipse 100% 85% at 50% 40%, black 45%, transparent 100%)";

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-white"
    >
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--grid-line) 1px, transparent 1px),
            linear-gradient(to bottom, var(--grid-line) 1px, transparent 1px)
          `,
          backgroundSize: `${SIZE}px ${SIZE}px`,
          maskImage: mask,
          WebkitMaskImage: mask,
          opacity: subtle ? 0.3 : 1,
        }}
        animate={{ backgroundPosition: ["0px 0px", `${SIZE}px ${SIZE}px`] }}
        transition={{ duration: 8, ease: "linear", repeat: Infinity }}
      />
    </div>
  );
}