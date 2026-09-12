import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { Zap, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function ActivateAccountPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No activation token found in the URL.');
      return;
    }

    axiosInstance
      .get(`/user/activate/account?token=${encodeURIComponent(token)}`)
      .then((res) => {
        setStatus('success');
        setMessage(res.data || 'Your account has been activated successfully!');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(
          err.response?.data || 'Activation failed. The link may have expired or is invalid.'
        );
      });
  }, [token]);

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-primary glow-purple mb-4">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Account Activation</h1>
        </div>

        <div className="glass-strong rounded-2xl p-8 text-center shadow-2xl">
          {status === 'loading' && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-foreground font-medium">Activating your account...</p>
              <p className="text-sm text-muted-foreground">Please wait a moment</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Activated!</h2>
              <p className="text-sm text-muted-foreground">{message}</p>
              <Link to="/login" className="w-full mt-2">
                <Button size="lg" className="w-full" id="activate-login-btn">
                  Sign In Now
                </Button>
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Activation Failed</h2>
              <p className="text-sm text-muted-foreground">{message}</p>
              <Link to="/login" className="w-full mt-2">
                <Button variant="outline" size="lg" className="w-full">
                  Back to Login
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
