import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { User, Mail, AtSign, CheckCircle2 } from "lucide-react";
import FormField from "../components/FormField";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Profile() {
  const { user, updateUser } = useOutletContext();
  const [values, setValues] = useState({
    name: user.name || "",
    email: user.email || "",
    username: user.username || "",
  });
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  const setField = (key) => (e) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
    setSaved(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (!values.name.trim()) next.name = "Enter your name.";
    if (!values.email.trim()) next.email = "Enter your email.";
    else if (!EMAIL_RE.test(values.email)) next.email = "Enter a valid email address.";
    setErrors(next);
    if (Object.keys(next).length) return;

    // TODO: send to your backend once it exists
    updateUser({
      name: values.name.trim(),
      email: values.email.trim(),
      username: values.username.trim(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const initial = (values.name || values.email || "?").charAt(0).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <h1 className="text-3xl font-medium tracking-tight">Profile</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Manage how you appear in Kodet.
      </p>

      <div className="mt-10 flex items-center gap-5">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-black text-3xl text-white">
          {initial}
        </div>
        <div>
          <p className="text-lg">{values.name || "Your name"}</p>
          <p className="text-sm text-neutral-500">{values.email}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-10 max-w-[480px]">
        <div className="divide-y divide-neutral-200 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          <FormField
            id="name"
            label="Full name"
            icon={User}
            placeholder="Your full name"
            autoComplete="name"
            value={values.name}
            onChange={setField("name")}
            error={errors.name}
          />
          <FormField
            id="email"
            label="Email address"
            type="email"
            icon={Mail}
            placeholder="you@example.com"
            autoComplete="email"
            value={values.email}
            onChange={setField("email")}
            error={errors.email}
          />
          <FormField
            id="username"
            label="Username"
            hint="Optional"
            icon={AtSign}
            placeholder="your-username"
            autoComplete="username"
            value={values.username}
            onChange={setField("username")}
          />
        </div>

        <div className="mt-5 flex items-center gap-4">
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-xl bg-black px-6 py-3 text-sm text-white"
          >
            Save changes
          </motion.button>

          <AnimatePresence>
            {saved && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 text-sm text-neutral-600"
              >
                <CheckCircle2 size={16} />
                Saved
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </form>
    </motion.div>
  );
}