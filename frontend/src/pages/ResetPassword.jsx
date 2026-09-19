import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Eye, EyeOff, KeyRound, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import {
  validateResetCredentials,
  createNewPassword,
  clearResetState,
} from '../features/auth/tempCredSlice';

function readCredentials(location) {
  const rawPath = location.pathname.split('/reset/')[1] || '';
  const query = new URLSearchParams(location.search);
  const pathParams = new URLSearchParams(rawPath.replace(/^\?/, '').replace(/&/g, '&'));
  return {
    username: query.get('username') || pathParams.get('username') || '',
    temporaryPassword: query.get('password') || pathParams.get('password') || '',
  };
}

export default function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // IMPORTANT: Changed from state.auth to state.tempCred to match the new slice
  const {
    resetChecking,
    validResetCredential,
    resetSubmitting,
    resetSuccessMessage,
    resetError,
  } = useSelector((state) => state.tempCred);

  const credentials = useMemo(() => readCredentials(location), [location]);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Validate token/credentials on mount or when credentials change
  useEffect(() => {
    if (!credentials.username || !credentials.temporaryPassword) {
      dispatch(clearResetState());
      return;
    }

    dispatch(
      validateResetCredentials({
        username: credentials.username,
        password: credentials.temporaryPassword,
      })
    );

    return () => {
      dispatch(clearResetState());
    };
  }, [credentials, dispatch]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setValidationError('');

    if (password.length < 8) {
      return setValidationError('Your new password must be at least 8 characters.');
    }
    if (password !== confirmPassword) {
      return setValidationError('Passwords do not match.');
    }

    dispatch(
      createNewPassword({
        username: credentials.username,
        password,
      })
    );
  };

  const displayedError = validationError || resetError;
  const isMissingCredentials = !credentials.username || !credentials.temporaryPassword;
  const canSubmit = validResetCredential && !resetChecking && !resetSubmitting;

  return (
    <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <section className="grid w-full overflow-hidden rounded-[2rem] border border-border bg-card shadow-[0_24px_80px_rgba(22,54,92,0.14)] md:grid-cols-[0.92fr_1.08fr]">
          {/* Left Decorative Section */}
          <div className="hidden bg-secondary p-12 text-white md:flex md:flex-col md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-2xl bg-primary">
                  <KeyRound />
                </div>
                <span className="text-xl font-bold">Folio</span>
              </div>
              <p className="mt-20 max-w-sm text-4xl font-semibold leading-tight">
                Create a password that keeps your workspace secure.
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm text-white/75">
              <ShieldCheck className="size-5 text-primary" /> Your account is protected with encrypted credentials.
            </div>
          </div>

          {/* Right Form Section */}
          <div className="p-7 sm:p-12">
            <div className="mx-auto max-w-md">
              {/* Mobile Branding */}
              <div className="mb-9 md:hidden">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-primary text-white">
                    <KeyRound />
                  </div>
                  <span className="text-xl font-bold">Folio</span>
                </div>
              </div>

              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Account setup</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight">Set your new password</h1>
              <p className="mt-3 text-muted-foreground">
                Confirm your temporary credentials and choose a secure password.
              </p>

              {/* State 1: Missing credentials in URL */}
              {isMissingCredentials ? (
                <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
                  <AlertCircle className="mb-3 size-6 text-red-600" />
                  <p className="font-semibold">Invalid Reset Link</p>
                  <p className="mt-1 text-sm">This password reset link is missing its temporary credentials.</p>
                  <Link to="/login" className="mt-5 inline-block rounded-xl bg-secondary px-4 py-2 text-sm font-semibold text-white">
                    Back to login
                  </Link>
                </div>
              ) : resetChecking ? (
                /* State 2: Validating Link */
                <div className="mt-10 flex items-center gap-3 rounded-2xl bg-muted p-4 text-sm text-muted-foreground">
                  <Loader2 className="size-5 animate-spin text-primary" /> Verifying your reset link...
                </div>
              ) : resetSuccessMessage ? (
                /* State 3: Password created successfully */
                <div className="mt-10 rounded-2xl border border-green-200 bg-green-50 p-5 text-green-800 animate-in fade-in zoom-in duration-300">
                  <CheckCircle2 className="mb-3 size-6 text-green-600" />
                  <p className="font-semibold">Password created successfully</p>
                  <p className="mt-1 text-sm">{resetSuccessMessage}</p>
                  <button
                    onClick={() => navigate('/login')}
                    className="mt-5 rounded-xl bg-secondary px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95"
                  >
                    Continue to login
                  </button>
                </div>
              ) : (
                /* State 4: Reset Form */
                <form onSubmit={handleSubmit} className="mt-9 flex flex-col gap-5">
                  <label className="flex flex-col gap-2 text-sm font-semibold">
                    New password
                    <div className="relative">
                      <input
                        required
                        minLength={8}
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="At least 8 characters"
                        disabled={resetSubmitting}
                        className="w-full rounded-xl border border-input bg-background px-4 py-3 pr-12 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-60"
                      />
                      <button
                        type="button"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                      </button>
                    </div>
                  </label>

                  <label className="flex flex-col gap-2 text-sm font-semibold">
                    Confirm password
                    <div className="relative">
                      <input
                        required
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        placeholder="Repeat your new password"
                        disabled={resetSubmitting}
                        className="w-full rounded-xl border border-input bg-background px-4 py-3 pr-12 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-60"
                      />
                      <button
                        type="button"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                      </button>
                    </div>
                  </label>

                  {displayedError && (
                    <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                      {displayedError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {resetSubmitting && <Loader2 className="size-4 animate-spin" />}
                    {resetSubmitting ? 'Saving password...' : 'Create new password'}
                  </button>
                </form>
              )}

              <Link to="/login" className="mt-8 block text-center text-sm font-semibold text-secondary hover:underline">
                Back to login
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}