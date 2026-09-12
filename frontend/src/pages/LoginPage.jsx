import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearAuthError } from '../features/auth/authSlice';
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  FileText,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Users,
  AlertCircle // Added for error display
} from 'lucide-react';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Pulling state from Redux just like the first code
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  // Local form state
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  // Redirect on authentication & cleanup error on unmount
  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
    return () => dispatch(clearAuthError());
  }, [isAuthenticated, navigate, dispatch]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(form));
  };

  return (
    <main className="min-h-screen bg-background p-4 text-foreground sm:p-6 lg:p-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-[1380px] overflow-hidden rounded-[2rem] border border-border bg-card shadow-[0_24px_80px_rgba(22,54,92,0.12)] sm:min-h-[calc(100vh-3rem)] lg:min-h-[calc(100vh-4rem)]">
        
        {/* Left Side Branding Section (Retained from Code 2) */}
        <section className="relative hidden w-[48%] overflow-hidden bg-primary p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div className="relative z-10 flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary-foreground text-primary shadow-lg">
              <FileText className="size-5" />
            </span>
            <span className="text-xl font-bold tracking-tight">folio</span>
          </div>

          <div className="relative z-10 max-w-lg">
            <p className="mb-5 flex items-center gap-2 text-sm font-semibold text-primary-foreground/75">
              <span className="size-2 rounded-full bg-secondary" />
              Your team&apos;s shared workspace
            </p>
            <h1 className="text-balance text-5xl font-semibold leading-[1.05] tracking-[-0.04em] xl:text-6xl">
              Every document. Every teammate. In sync.
            </h1>
            <p className="mt-6 max-w-md text-base leading-7 text-primary-foreground/75">
              Folio gives your organization one calm place to create, organize, and share the work that moves everything forward.
            </p>
            <div className="mt-9 flex flex-col gap-4 text-sm font-medium">
              <div className="flex items-center gap-3">
                <span className="flex size-7 items-center justify-center rounded-full bg-primary-foreground/15"><Check className="size-4" /></span>
                Keep files and people together
              </div>
              <div className="flex items-center gap-3">
                <span className="flex size-7 items-center justify-center rounded-full bg-primary-foreground/15"><Check className="size-4" /></span>
                Share with the right people instantly
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-3 text-sm text-primary-foreground/70">
            <div className="flex -space-x-2">
              <span className="flex size-8 items-center justify-center rounded-full border-2 border-primary bg-secondary text-xs font-bold text-secondary-foreground">MC</span>
              <span className="flex size-8 items-center justify-center rounded-full border-2 border-primary bg-accent text-xs font-bold text-accent-foreground">JL</span>
              <span className="flex size-8 items-center justify-center rounded-full border-2 border-primary bg-primary-foreground text-xs font-bold text-primary">AP</span>
            </div>
            <span>Trusted by collaborative teams</span>
          </div>
          <div className="absolute -bottom-24 -right-20 size-80 rounded-full border-[40px] border-primary-foreground/10" />
          <div className="absolute -right-10 top-28 size-40 rounded-full bg-secondary/20 blur-2xl" />
        </section>

        {/* Right Side Form Section (Enhanced with Code 1 Logic) */}
        <section className="flex flex-1 items-center justify-center bg-card px-6 py-10 sm:px-12 lg:px-16 xl:px-24">
          <div className="w-full max-w-[440px]">
            
            {/* Mobile Logo */}
            <div className="mb-9 lg:hidden">
              <div className="mb-7 flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <FileText className="size-5" />
                </span>
                <span className="text-xl font-bold tracking-tight">folio</span>
              </div>
            </div>
            
            <div className="mb-8">
              <p className="mb-3 text-sm font-semibold text-accent">Welcome back</p>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Sign in to your workspace</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">Pick up where your team left off.</p>
            </div>

            {/* Redux Error Handling Display */}
            {error && (
              <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50">
                <AlertCircle className="size-5 shrink-0" />
                <p>{typeof error === 'string' ? error : 'Invalid credentials. Please try again.'}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <label className="flex flex-col gap-2 text-sm font-semibold" htmlFor="username">
                Username or email
                <span className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-accent" />
                  <input 
                    id="username" 
                    name="username" 
                    type="text" 
                    placeholder="you@company.com" 
                    value={form.username}
                    onChange={handleChange}
                    required 
                    className="h-12 w-full rounded-xl border border-input bg-background pl-11 pr-4 text-sm font-normal outline-none transition placeholder:text-muted-foreground/70 focus:border-accent focus:ring-4 focus:ring-accent/10" 
                  />
                </span>
              </label>

              <label className="flex flex-col gap-2 text-sm font-semibold" htmlFor="password">
                Password
                <span className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-accent" />
                  <input 
                    id="password" 
                    name="password" 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="Enter your password" 
                    value={form.password}
                    onChange={handleChange}
                    required 
                    className="h-12 w-full rounded-xl border border-input bg-background pl-11 pr-12 text-sm font-normal outline-none transition placeholder:text-muted-foreground/70 focus:border-accent focus:ring-4 focus:ring-accent/10" 
                  />
                  <button 
                    type="button" 
                    aria-label={showPassword ? 'Hide password' : 'Show password'} 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </span>
              </label>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-muted-foreground">
                  <input type="checkbox" className="size-4 rounded border-input accent-[var(--accent)]" />
                  Remember me
                </label>
                {/* Changed to react-router Link based on Code 1 */}
                <Link to="/create-password" className="font-semibold text-accent hover:underline">
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button connected to Redux 'loading' state */}
              <button 
                type="submit" 
                disabled={loading} 
                className="mt-2 flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-[0_6px_0_rgba(197,65,12,0.16)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_0_rgba(197,65,12,0.16)] disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in <ArrowRight className="size-4" />
                  </>
                )}
              </button>
            </form>

            <div className="my-8 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              or
              <span className="h-px flex-1 bg-border" />
            </div>
            
            <button type="button" className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card text-sm font-semibold transition hover:border-accent hover:bg-muted">
              <Users className="size-4 text-accent" />
              Continue with organization SSO
            </button>
            
            <p className="mt-8 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              {/* Changed to react-router Link based on Code 1 */}
              <Link to="/signup" className="font-bold text-accent hover:underline">
                Create one
              </Link>
            </p>
            
            <div className="mt-10 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-4 text-accent" />
              Your workspace is private and secure
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}