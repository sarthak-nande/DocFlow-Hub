import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserDetails, updateUserDetails, clearAuthError } from '../features/auth/authSlice';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { NativeSelect } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import {
  User,
  Mail,
  Building,
  Shield,
  Pencil,
  Save,
  X,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

const ROLES = ['USER', 'ROLE_APPROVER', 'ADMIN'];

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user, username, loading, error } = useSelector((state) => state.auth);
  const [editing, setEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'USER', organizationId: '', active: true });

  useEffect(() => {
    if (username) {
      dispatch(fetchUserDetails(username));
    }
    return () => dispatch(clearAuthError());
  }, [dispatch, username]);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'USER',
        organizationId: user.organizationId || '',
        active: user.active ?? true,
        password: undefined,
        extraDetails: user.extraDetials || {},
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const result = await dispatch(updateUserDetails(form));
    if (!result.error) {
      setSaveSuccess(true);
      setEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'USER',
        organizationId: user.organizationId || '',
        active: user.active ?? true,
      });
    }
  };

  const infoRow = (icon, label, value) => (
    <div className="flex items-center gap-4 py-4 border-b border-border last:border-0">
      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground truncate">{value || '—'}</p>
      </div>
    </div>
  );

  return (
    <Layout title="Profile">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Avatar header */}
        <div className="glass rounded-2xl border border-border p-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center text-3xl font-bold text-white glow-purple shrink-0">
              {(form.name || username || 'U')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-foreground">{form.name || username}</h2>
              <p className="text-sm text-muted-foreground">{form.email || '—'}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={form.active ? 'success' : 'warning'}>
                  {form.active ? 'Active' : 'Inactive'}
                </Badge>
                <Badge variant="default">{(form.role || 'USER').replace('_', ' ')}</Badge>
              </div>
            </div>
            {!editing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
                id="edit-profile-btn"
              >
                <Pencil className="w-4 h-4" />
                Edit
              </Button>
            )}
          </div>
        </div>

        {/* Success */}
        {saveSuccess && (
          <Alert variant="success" className="animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <AlertTitle>Profile Updated</AlertTitle>
            <AlertDescription>Your details have been saved successfully.</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{typeof error === 'string' ? error : 'An error occurred.'}</AlertDescription>
          </Alert>
        )}

        {/* View mode */}
        {!editing && (
          <div className="glass rounded-2xl border border-border p-6 animate-fade-in">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Account Details</h3>
            {infoRow(<User className="w-4 h-4 text-primary" />, 'Full Name', form.name)}
            {infoRow(<Mail className="w-4 h-4 text-blue-400" />, 'Email', form.email)}
            {infoRow(<Shield className="w-4 h-4 text-violet-400" />, 'Role', form.role?.replace('_', ' '))}
            {infoRow(<Building className="w-4 h-4 text-emerald-400" />, 'Organization ID', form.organizationId)}
          </div>
        )}

        {/* Edit mode */}
        {editing && (
          <div className="glass rounded-2xl border border-border p-6 animate-fade-in">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-5">Edit Profile</h3>
            <form onSubmit={handleSave} className="space-y-4" id="profile-edit-form">
              <div className="space-y-2">
                <Label htmlFor="profile-name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="profile-name" name="name" value={form.name} onChange={handleChange} className="pl-9" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="profile-email" name="email" type="email" value={form.email} onChange={handleChange} className="pl-9" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="profile-role">Role</Label>
                  <NativeSelect id="profile-role" name="role" value={form.role} onChange={handleChange}>
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r.replace('_', ' ')}</option>
                    ))}
                  </NativeSelect>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-orgId">Organization ID</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="profile-orgId" name="organizationId" value={form.organizationId} onChange={handleChange} className="pl-9" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={loading} className="flex-1" id="save-profile-btn">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel} id="cancel-edit-btn">
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
}
