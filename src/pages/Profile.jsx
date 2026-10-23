import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { User, Mail, AtSign, CheckCircle2, ImagePlus } from "lucide-react";
import FormField from "../components/FormField";
import Avatar from "../components/Avatar";
import AvatarPicker from "../components/AvatarPicker";

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
  const [pickerOpen, setPickerOpen] = useState(false);

  const avatarSeed = user.avatar || user.name || user.email;

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

  const handleAvatarSave = (seed) => {
    // TODO: send to your backend once it exists
    updateUser({ avatar: seed });
    setPickerOpen(false);
  };

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
        <Avatar seed={avatarSeed} size={80} />
        <div>
          <p className="text-lg">{values.name || "Your name"}</p>
          <p className="text-sm text-neutral-500">{values.email}</p>
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="mt-3 inline-flex items-center gap-2 rounded-xl border border-neutral-300 px-4 py-2 text-xs transition-colors hover:bg-neutral-50"
          >
            <ImagePlus size={14} />
            Change avatar
          </button>
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

      <AvatarPicker
        open={pickerOpen}
        current={avatarSeed}
        onClose={() => setPickerOpen(false)}
        onSave={handleAvatarSave}
      />
    </motion.div>
  );
}