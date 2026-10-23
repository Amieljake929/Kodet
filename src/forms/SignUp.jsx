import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import FormField from "../components/FormField";
import { saveUser } from "../lib/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUp() {
  const navigate = useNavigate();
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | loading | success

  const setField = (key) => (e) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!values.name.trim()) next.name = "Enter your name.";
    if (!values.email.trim()) next.email = "Enter your email.";
    else if (!EMAIL_RE.test(values.email)) next.email = "Enter a valid email address.";
    if (!values.password) next.password = "Create a password.";
    else if (values.password.length < 8) next.password = "Use at least 8 characters.";
    if (!agreed) next.terms = "Accept the terms to continue.";
    return next;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) return;

    // TODO: replace this with your real sign-up request once the backend exists
    setStatus("loading");
    setTimeout(() => {
      // Remember the name so the dashboard can greet you after sign in
      saveUser({ name: values.name.trim(), email: values.email.trim() });
      setStatus("success");
      setTimeout(() => navigate("/signin"), 1000);
    }, 800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
      className="mx-auto w-full max-w-[440px] lg:mx-0"
    >
      <h1 className="text-3xl font-medium tracking-tight">Create account</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Start keeping your snippets and notes in one place.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-8">
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
            id="password"
            label="Password"
            hint="At least 8 characters"
            type="password"
            icon={Lock}
            placeholder="Create a password"
            autoComplete="new-password"
            value={values.password}
            onChange={setField("password")}
            error={errors.password}
          />
        </div>

        <div className="mt-4">
          <label className="flex cursor-pointer items-center gap-3 text-xs text-neutral-600">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => {
                setAgreed(e.target.checked);
                if (errors.terms) setErrors((er) => ({ ...er, terms: undefined }));
              }}
              className="h-4 w-4 shrink-0 accent-black"
            />
            <span>
              I agree to the{" "}
              <span className="text-black underline underline-offset-4">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="text-black underline underline-offset-4">
                Privacy Policy
              </span>
              .
            </span>
          </label>
          {errors.terms && (
            <p className="pt-1.5 text-xs text-red-500">{errors.terms}</p>
          )}
        </div>

        <motion.button
          type="submit"
          disabled={status !== "idle"}
          whileHover={status === "idle" ? { scale: 1.02 } : undefined}
          whileTap={status === "idle" ? { scale: 0.98 } : undefined}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-3.5 text-sm text-white disabled:opacity-80"
        >
          {status === "idle" && (
            <>
              Create account
              <ArrowRight size={16} />
            </>
          )}
          {status === "loading" && (
            <>
              <Loader2 size={16} className="animate-spin" />
              Creating account
            </>
          )}
          {status === "success" && (
            <>
              <CheckCircle2 size={16} />
              Account created
            </>
          )}
        </motion.button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-600">
        Already have an account?{" "}
        <Link to="/signin" className="text-black underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}