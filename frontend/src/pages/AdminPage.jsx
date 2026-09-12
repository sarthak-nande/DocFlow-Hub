import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerOrgUser, clearAdminState } from '../features/documents/documentsSlice';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { NativeSelect } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import {
  Shield,
  User,
  Mail,
  Building,
  UserPlus,
  CheckCircle2,
  Loader2,
  Info,
} from 'lucide-react';

const ROLES = ['USER', 'ROLE_APPROVER', 'ADMIN'];

export default function AdminPage() {
  const dispatch = useDispatch();
  const { adminRegisterLoading, adminRegisterSuccess, adminRegisterError } =
    useSelector((state) => state.documents);

  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'USER',
    organizationId: '',
    active: true,
    extraDetails: {},
  });

  useEffect(() => {
    return () => dispatch(clearAdminState());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(registerOrgUser(form));
  };

  const handleReset = () => {
    setForm({ name: '', email: '', role: 'USER', organizationId: '', active: true, extraDetails: {} });
    dispatch(clearAdminState());
  };

  return (
    <Layout title="Admin Panel">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass rounded-2xl border border-border p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Shield className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Register Organization User</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Create a new user account for your organization. A temporary password will be sent to their email.
              </p>
            </div>
          </div>
        </div>

        {/* Success */}
        {adminRegisterSuccess && (
          <Alert variant="success" className="animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <AlertTitle>User Registered!</AlertTitle>
            <AlertDescription>
              The user has been created successfully. They will receive login credentials via email.
            </AlertDescription>
          </Alert>
        )}

        {/* Error */}
        {adminRegisterError && (
          <Alert variant="destructive" className="animate-fade-in">
            <AlertTitle>Registration Failed</AlertTitle>
            <AlertDescription>{adminRegisterError}</AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <div className="glass rounded-2xl border border-border p-6">
          <form onSubmit={handleSubmit} className="space-y-5" id="admin-register-form">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="admin-name">Full Name <span className="text-destructive">*</span></Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="admin-name"
                  name="name"
                  placeholder="Jane Smith"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="pl-9"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email Address <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="admin-email"
                  name="email"
                  type="email"
                  placeholder="jane@company.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="pl-9"
                />
              </div>
            </div>

            {/* Role + OrgId */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="admin-role">Role <span className="text-destructive">*</span></Label>
                <NativeSelect
                  id="admin-role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  required
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r.replace('_', ' ')}</option>
                  ))}
                </NativeSelect>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-orgId">Organization ID <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="admin-orgId"
                    name="organizationId"
                    placeholder="ORG-001"
                    value={form.organizationId}
                    onChange={handleChange}
                    required
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            {/* Active toggle */}
            <div className="flex items-center gap-3 py-2 px-4 rounded-lg bg-secondary/50 border border-border">
              <input
                type="checkbox"
                id="admin-active"
                name="active"
                checked={form.active}
                onChange={handleChange}
                className="w-4 h-4 rounded accent-primary cursor-pointer"
              />
              <div>
                <Label htmlFor="admin-active" className="cursor-pointer">Account Active</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  User can login immediately after creation
                </p>
              </div>
              <Badge variant={form.active ? 'success' : 'warning'} className="ml-auto">
                {form.active ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            {/* Info */}
            <div className="flex items-start gap-2 text-xs text-muted-foreground p-3 rounded-lg bg-secondary/30">
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <p>No password required — a temporary password will be generated and emailed to the user. They must create a new password on first login.</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={adminRegisterLoading}
                className="flex-1"
                id="admin-register-btn"
              >
                {adminRegisterLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Register User
                  </>
                )}
              </Button>

              <Button type="button" variant="outline" onClick={handleReset} id="admin-reset-btn">
                Reset
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
