import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signupUser, clearAuthError, clearSignupSuccess } from "../features/auth/authSlice";
import {
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  LockKeyhole,
  Mail,
  UserRound,
  AlertCircle
} from "lucide-react";

const initialForm = {
  name: "",
  email: "",
  password: "",
  organizationName: "",
  active: true,
  extraDetails: {},
};

function BrandPanel() {
  return (
    <section className="relative hidden w-[48%] overflow-hidden bg-primary p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between xl:p-14">
      <div className="relative z-10 flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-primary-foreground text-primary shadow-lg">
          <FileText className="size-5" />
        </span>
        <span className="text-xl font-bold tracking-tight">folio</span>
      </div>
      <div className="relative z-10 max-w-lg">
        <p className="mb-5 flex items-center gap-2 text-sm font-semibold text-primary-foreground/75">
          <span className="size-2 rounded-full bg-secondary" />A calmer way to
          work together
        </p>
        <h1 className="text-balance text-5xl font-semibold leading-[1.05] tracking-[-0.04em] xl:text-6xl">
          Bring your organization&apos;s work into focus.
        </h1>
        <p className="mt-6 max-w-md text-base leading-7 text-primary-foreground/75">
          Create a shared home for your documents, teammates, and the work that
          moves everything forward.
        </p>
        <div className="mt-9 flex flex-col gap-4 text-sm font-medium">
          <div className="flex items-center gap-3">
            <span className="flex size-7 items-center justify-center rounded-full bg-primary-foreground/15">
              <Check className="size-4" />
            </span>
            One workspace for every document
          </div>
          <div className="flex items-center gap-3">
            <span className="flex size-7 items-center justify-center rounded-full bg-primary-foreground/15">
              <Check className="size-4" />
            </span>
            Invite and share with confidence
          </div>
        </div>
      </div>
      <div className="relative z-10 flex items-center gap-3 text-sm text-primary-foreground/70">
        <div className="flex -space-x-2">
          <span className="flex size-8 items-center justify-center rounded-full border-2 border-primary bg-secondary text-xs font-bold text-secondary-foreground">
            MC
          </span>
          <span className="flex size-8 items-center justify-center rounded-full border-2 border-primary bg-accent text-xs font-bold text-accent-foreground">
            JL
          </span>
          <span className="flex size-8 items-center justify-center rounded-full border-2 border-primary bg-primary-foreground text-xs font-bold text-primary">
            AP
          </span>
        </div>
        <span>Built for collaborative teams</span>
      </div>
      <div className="absolute -bottom-24 -right-20 size-80 rounded-full border-[40px] border-primary-foreground/10" />
    </section>
  );
}

function Field({ id, label, icon: Icon, ...props }) {
  return (
    <label className="flex flex-col gap-2 text-sm font-semibold" htmlFor={id}>
      {label}
      <span className="relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-accent" />
        <input
          id={id}
          name={id}
          {...props}
          className="h-12 w-full rounded-xl border border-input bg-background pl-11 pr-4 text-sm font-normal outline-none transition placeholder:text-muted-foreground/70 focus:border-accent focus:ring-4 focus:ring-accent/10"
        />
      </span>
    </label>
  );
}

export default function SignupPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Pulling state from Redux
  const { loading, error, signupSuccess } = useSelector((state) => state.auth);

  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
      dispatch(clearSignupSuccess());
    };
  }, [dispatch]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(signupUser(form));
  };

  const handleGoToLogin = () => {
    dispatch(clearSignupSuccess());
    navigate("/login");
  };

  // Success View
  if (signupSuccess) {
    return (
      <main className="min-h-screen bg-background p-4 text-foreground sm:p-6 lg:p-8">
        <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-[1380px] items-center justify-center rounded-[2rem] border border-border bg-card p-6 shadow-[0_24px_80px_rgba(22,54,92,0.12)]">
          <div className="w-full max-w-md text-center animate-in fade-in zoom-in duration-500">
            <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-10" />
            </div>
            <h2 className="text-3xl font-semibold tracking-tight">
              Account created
            </h2>
            <p className="mt-3 text-muted-foreground">
              Your organization workspace is ready. Check your email for an
              activation link.
            </p>
            <button
              onClick={handleGoToLogin}
              className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 font-semibold text-primary-foreground transition hover:brightness-105"
            >
              Go to login <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Signup Form View
  return (
    <main className="min-h-screen bg-background p-4 text-foreground sm:p-6 lg:p-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-[1380px] overflow-hidden rounded-[2rem] border border-border bg-card shadow-[0_24px_80px_rgba(22,54,92,0.12)] sm:min-h-[calc(100vh-3rem)] lg:min-h-[calc(100vh-4rem)]">
        <BrandPanel />
        <section className="flex flex-1 items-center justify-center bg-card px-6 py-10 sm:px-12 lg:px-16 xl:px-24">
          <div className="w-full max-w-[440px]">
            <div className="mb-7 flex items-center gap-3 lg:hidden">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <FileText className="size-5" />
              </span>
              <span className="text-xl font-bold tracking-tight">folio</span>
            </div>
            
            <div className="mb-8">
              <p className="mb-3 text-sm font-semibold text-accent">
                Start together
              </p>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Create your workspace
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Set up your account and organization in a few steps.
              </p>
            </div>

            {/* Redux Error Banner */}
            {error && (
              <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50">
                <AlertCircle className="size-5 shrink-0" />
                <p>{typeof error === 'string' ? error : 'Registration failed. Please check your details.'}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5" id="signup-form">
              <Field
                id="name"
                label="Full name"
                icon={UserRound}
                type="text"
                placeholder="Alex Morgan"
                value={form.name}
                onChange={handleChange}
                required
              />
              <Field
                id="email"
                label="Work email"
                icon={Mail}
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={handleChange}
                required
              />
              <Field
                id="organizationName"
                label="Organization name"
                icon={Building2}
                type="text"
                placeholder="Acme Studio"
                value={form.organizationName}
                onChange={handleChange}
                required
              />

              <label className="flex flex-col gap-2 text-sm font-semibold" htmlFor="password">
                Password
                <span className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-accent" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="h-12 w-full rounded-xl border border-input bg-background pl-11 pr-12 text-sm font-normal outline-none transition placeholder:text-muted-foreground/70 focus:border-accent focus:ring-4 focus:ring-accent/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </span>
              </label>

              <label className="flex items-center gap-3 text-sm text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  name="active"
                  checked={form.active}
                  onChange={handleChange}
                  className="size-4 rounded border-input accent-[var(--accent)]"
                />
                Activate account immediately
              </label>

              <button
                type="submit"
                disabled={loading}
                className="mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 font-semibold text-primary-foreground transition hover:brightness-105 disabled:cursor-wait disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Creating workspace...
                  </>
                ) : (
                  <>
                    Create workspace <ArrowRight className="size-4" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-accent hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}