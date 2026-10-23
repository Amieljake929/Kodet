import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

// A single row inside a grouped form card.
// Wrap several of these in:
// <div className="divide-y divide-neutral-200 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
export default function FormField({
  id,
  label,
  hint,
  type = "text",
  icon: Icon,
  value,
  onChange,
  error,
  placeholder,
  autoComplete,
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="px-4 py-3 transition-colors focus-within:bg-neutral-50">
      <div className="flex items-center gap-4">
        {Icon && <Icon size={18} className="shrink-0 text-neutral-500" />}

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <label
              htmlFor={id}
              className={`text-xs ${error ? "text-red-500" : "text-neutral-500"}`}
            >
              {label}
            </label>
            {hint && !error && (
              <span className="text-xs text-neutral-400">{hint}</span>
            )}
          </div>

          <input
            id={id}
            name={id}
            type={isPassword && show ? "text" : type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            autoComplete={autoComplete}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            className="mt-0.5 w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
          />
        </div>

        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Hide password" : "Show password"}
            className="shrink-0 text-neutral-500 transition-colors hover:text-black"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            id={`${id}-error`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden pl-[34px] pt-1.5 text-xs text-red-500"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}