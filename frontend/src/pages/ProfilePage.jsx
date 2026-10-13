import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserDetails, updateUserDetails, clearAuthError } from '../features/auth/authSlice';
import WorkspaceLayout from '../components/WorkspaceLayout'; // Ensure correct path
import { 
  Building2, 
  Check, 
  LockKeyhole, 
  Mail, 
  Pencil, 
  ShieldCheck, 
  UserRound, 
  X,
  AlertCircle,
  Loader2
} from 'lucide-react';

function DetailRow({ icon: Icon, label, value, accent = 'blue' }) {
  return (
    <div className="flex items-center gap-4 border-b border-slate-100 py-4 last:border-0">
      <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${accent === 'orange' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
        <Icon className="size-[18px]" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</p>
        <p className="mt-1 truncate text-sm font-semibold text-slate-800">{value || '—'}</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user, username, loading, error } = useSelector((state) => state.auth);
  
  const [editing, setEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [draftName, setDraftName] = useState('');

  const userData = user?.object ? user.object : (user || {});

  useEffect(() => {
    if (username) {
      dispatch(fetchUserDetails(username));
    }
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch, username]);

  useEffect(() => {
    if (userData.name) setDraftName(userData.name);
  }, [userData.name]);

  const beginEditing = () => {
    setDraftName(userData.name || '');
    setSaveSuccess(false);
    dispatch(clearAuthError());
    setEditing(true);
  };

  const cancelEditing = () => {
    setDraftName(userData.name || '');
    setEditing(false);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const nextName = draftName.trim();
    if (!nextName) return;

    const payload = {
      name: nextName,
      email: userData.email || '',
      role: userData.role || 'USER',
      organizationId: userData.organizationId || '',
      active: userData.active ?? true,
      extraDetails: userData.extraDetials || {},
    };

    const result = await dispatch(updateUserDetails(payload));
    if (!result.error) {
      setSaveSuccess(true);
      setEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const displayName = userData.name || username || 'User';
  const displayInitial = displayName.charAt(0).toUpperCase();

  return (
    <WorkspaceLayout title="Profile">
      <main className="p-4 sm:p-6 lg:p-10 w-full overflow-x-hidden">
        <div className="mx-auto max-w-5xl">
          

          {saveSuccess && (
            <div role="status" className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 animate-in fade-in zoom-in duration-300">
              <Check className="size-5 shrink-0" /> Your profile was updated successfully.
            </div>
          )}

          {error && (
            <div role="alert" className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 animate-in fade-in zoom-in duration-300">
              <AlertCircle className="size-5 shrink-0" />
              <span className="truncate break-words">{typeof error === 'string' ? error : 'An error occurred.'}</span>
            </div>
          )}

          <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 shadow-[0_18px_50px_rgba(36,83,130,0.08)]">
              
              <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center">
                <div className="flex size-16 sm:size-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-2xl font-bold text-white shadow-[0_12px_24px_rgba(37,99,235,0.22)]">
                  {displayInitial}
                </div>
                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <h2 className="truncate text-lg sm:text-xl font-bold text-slate-950">{displayName}</h2>
                  <p className="mt-1 truncate text-sm text-slate-500">{userData.email || '—'}</p>
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                    <span className={`size-1.5 rounded-full ${userData.active !== false ? 'bg-blue-600' : 'bg-slate-400'}`} /> 
                    {userData.active !== false ? 'Active member' : 'Inactive member'}
                  </div>
                </div>
                {!editing && (
                  <button 
                    type="button" 
                    onClick={beginEditing} 
                    className="mt-4 sm:mt-0 inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 px-4 py-2.5 text-sm font-bold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50 w-full sm:w-auto"
                  >
                    <Pencil className="size-4 shrink-0" /> Edit name
                  </button>
                )}
              </div>

              {!editing ? (
                <div className="pt-4">
                  <DetailRow icon={UserRound} label="Full name" value={displayName} accent="orange" />
                  <DetailRow icon={Mail} label="Email address" value={userData.email} />
                  <DetailRow icon={Building2} label="Organization ID" value={userData.organizationId} accent="orange" />
                  <DetailRow icon={ShieldCheck} label="Access level" value={(userData.role || 'USER').replace('_', ' ')} />
                </div>
              ) : (
                <form onSubmit={handleSave} className="pt-7">
                  <label htmlFor="profile-name" className="mb-2 block text-sm font-bold text-slate-800">
                    Full name
                  </label>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-blue-500" />
                    <input 
                      id="profile-name" 
                      name="name" 
                      value={draftName} 
                      onChange={(event) => setDraftName(event.target.value)} 
                      disabled={loading}
                      required 
                      className="w-full rounded-xl border border-blue-200 bg-blue-50/30 py-3.5 pl-12 pr-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:opacity-60" 
                    />
                  </div>
                  <p className="mt-2 text-xs sm:text-sm text-slate-500">This is the only profile detail you can change.</p>
                  
                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-[0_8px_18px_rgba(249,115,22,0.22)] transition hover:bg-orange-600 disabled:opacity-70 w-full sm:w-auto"
                    >
                      {loading ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                      {loading ? 'Saving...' : 'Save name'}
                    </button>
                    <button 
                      type="button" 
                      onClick={cancelEditing} 
                      disabled={loading}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-70 w-full sm:w-auto"
                    >
                      <X className="size-4" /> Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            <aside className="rounded-3xl border border-blue-100 bg-blue-50/70 p-5 sm:p-6 self-start">
              <div className="flex size-11 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
                <LockKeyhole className="size-5" />
              </div>
              <h2 className="mt-5 text-lg font-bold text-slate-950">Your account is protected</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Your email, organization, and access permissions are managed by your workspace administrator.
              </p>
              <div className="mt-6 rounded-2xl border border-blue-100 bg-white/80 p-4 text-xs sm:text-sm font-semibold leading-6 text-blue-800">
                Only your full name can be edited from this page.
              </div>
            </aside>
          </section>
        </div>
      </main>
    </WorkspaceLayout>
  );
}