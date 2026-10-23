import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import FormField from "../components/FormField";
import LoadingOverlay from "../components/LoadingOverlay";
import { signInAs } from "../lib/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SIGN_IN_STEPS = [
  "Checking your credentials",
  "Opening your workspace",
  "Signed in",
];

export default function SignIn() {
  const navigate = useNavigate();
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | loading | success

  const setField = (key) => (e) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!values.email.trim()) next.email = "Enter your email.";
    else if (!EMAIL_RE.test(values.email)) next.email = "Enter a valid email address.";
    if (!values.password) next.password = "Enter your password.";
    return next;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) return;

    // TODO: replace this with your real sign-in request once the backend exists.
    // For now any email + password signs you in.
    setStatus("loading");
    setTimeout(() => {
      signInAs(values.email.trim());
      setStatus("success");
      setTimeout(() => navigate("/dashboard"), 800);
    }, 1800);
  };

  return (
    <>
      <LoadingOverlay
        show={status !== "idle"}
        done={status === "success"}
        steps={SIGN_IN_STEPS}
        duration={1.8}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        className="mx-auto w-full max-w-[440px] lg:mx-0"
      >
        <h1 className="text-3xl font-medium tracking-tight">Sign in</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Welcome back. Pick up where you left off.
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-8">
          <div className="divide-y divide-neutral-200 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
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
              type="password"
              icon={Lock}
              placeholder="Enter your password"
              autoComplete="current-password"
              value={values.password}
              onChange={setField("password")}
              error={errors.password}
            />
          </div>

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              className="text-xs text-neutral-600 underline underline-offset-4 transition-colors hover:text-black"
            >
              Forgot password?
            </button>
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
                Sign in
                <ArrowRight size={16} />
              </>
            )}
            {status === "loading" && (
              <>
                <Loader2 size={16} className="animate-spin" />
                Signing in
              </>
            )}
            {status === "success" && (
              <>
                <CheckCircle2 size={16} />
                Signed in
              </>
            )}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-600">
          Don't have an account?{" "}
          <Link to="/signup" className="text-black underline underline-offset-4">
            Create account
          </Link>
        </p>
      </motion.div>
    </>
  );
}