import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { registerOrgUser, clearAdminState } from '../features/documents/documentsSlice' // Adjust path if needed
import { fetchUserDetails } from '../features/auth/authSlice' // Added for fetching user details
import WorkspaceLayout from '../components/WorkspaceLayout'
import {
  Building2,
  CheckCircle2,
  Info,
  Loader2,
  Mail,
  ShieldCheck,
  User,
  UserPlus
} from 'lucide-react'

const ROLES = ['ROLE_USER', 'ROLE_APPROVER', 'ROLE_ADMIN']

const initialForm = {
  name: '',
  email: '',
  role: 'ROLE_USER',
  organizationId: '',
  active: false,
  extraDetails: {},
}

export default function AdminPage() {
  const dispatch = useDispatch()

  // 1. Pulling auth state to get current admin's details
  const { user, username } = useSelector((state) => state.auth)
  const userData = user?.object ? user.object : (user || {})

  // 2. Pulling document state for registration status
  const { adminRegisterLoading, adminRegisterSuccess, adminRegisterError } = useSelector((state) => state.documents)

  const [form, setForm] = useState(initialForm)

  // Fetch admin's user details on mount to get the organizationId
  useEffect(() => {
    if (username) {
      dispatch(fetchUserDetails(username))
    }
  }, [dispatch, username])

  // Sync the fetched organizationId into the form state
  useEffect(() => {
    if (userData.organizationId) {
      setForm((prev) => ({
        ...prev,
        organizationId: userData.organizationId
      }))
    }
  }, [userData.organizationId])

  // Clear admin states on unmount
  useEffect(() => {
    return () => dispatch(clearAdminState())
  }, [dispatch])

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    if (adminRegisterSuccess || adminRegisterError) {
      dispatch(clearAdminState())
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    dispatch(registerOrgUser(form))
  }

  const handleReset = () => {
    // Preserve the organizationId when resetting the form
    setForm({
      ...initialForm,
      organizationId: userData.organizationId || ''
    })
    dispatch(clearAdminState())
  }

  return (
    <WorkspaceLayout title="Admin panel">
      <main className="mx-auto w-full max-w-5xl px-5 py-8 lg:px-10">
        <div className="mb-8 max-w-2xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-primary">Organization access</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Register a new user</h1>
          <p className="mt-3 text-base leading-7 text-slate-500">Create an account for a teammate and send their temporary sign-in details by email.</p>
        </div>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(20,53,92,0.08)] sm:p-8">

            {/* Redux Success Alert */}
            {adminRegisterSuccess && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 animate-in fade-in zoom-in duration-300">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
                <div>
                  <p className="font-semibold">User registered successfully</p>
                  <p className="mt-1 text-sm">Temporary login credentials will be sent to their email.</p>
                </div>
              </div>
            )}

            {/* Redux Error Alert */}
            {adminRegisterError && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 animate-in fade-in zoom-in duration-300">
                {adminRegisterError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                  Full name
                  <span className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <input
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 font-normal outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-orange-100 disabled:opacity-60"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Jane Smith"
                      disabled={adminRegisterLoading}
                      required
                    />
                  </span>
                </label>

                <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                  Email address
                  <span className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <input
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 font-normal outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-orange-100 disabled:opacity-60"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="jane@company.com"
                      disabled={adminRegisterLoading}
                      required
                    />
                  </span>
                </label>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                  Role
                  <select
                    className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 font-normal outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-orange-100 disabled:opacity-60"
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    disabled={adminRegisterLoading}
                    required
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role}>{role.replace('_', ' ')}</option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                  Organization ID
                  <span className="relative">
                    <Building2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <input
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-100 pl-10 pr-4 font-normal text-slate-500 outline-none cursor-not-allowed opacity-80"
                      name="organizationId"
                      value={form.organizationId}
                      placeholder="Loading..."
                      disabled={true} // Locked to prevent editing
                      readOnly
                      required
                    />
                  </span>
                </label>
              </div>

              {/* Active Account Toggle */}
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <input
                  type="checkbox"
                  id="admin-active"
                  name="active"
                  checked={form.active}
                  onChange={handleChange}
                  disabled={adminRegisterLoading}
                  className="size-4 rounded accent-primary cursor-pointer disabled:opacity-60"
                />
                <div>
                  <label htmlFor="admin-active" className="cursor-pointer text-sm font-semibold text-slate-700">Account Active</label>
                  <p className="text-xs text-slate-500 mt-0.5">User can login immediately after creation</p>
                </div>
                <div className="ml-auto">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${form.active ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {form.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-blue-50 p-4 text-sm text-blue-900">
                <Info className="mt-0.5 size-4 shrink-0 text-secondary" />
                <p>No password is needed. A temporary password will be generated and emailed to the new user.</p>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row">
                <button
                  className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 font-bold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-orange-600 disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0"
                  type="submit"
                  disabled={adminRegisterLoading || !form.organizationId}
                >
                  {adminRegisterLoading ? (
                    <><Loader2 className="size-4 animate-spin" /> Registering...</>
                  ) : (
                    <><UserPlus className="size-4" /> Register user</>
                  )}
                </button>
                <button
                  className="h-12 rounded-xl border border-slate-200 px-6 font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
                  type="button"
                  onClick={handleReset}
                  disabled={adminRegisterLoading}
                >
                  Reset
                </button>
              </div>
            </form>
          </div>

          <aside className="rounded-[28px] bg-secondary p-6 text-white shadow-[0_20px_60px_rgba(31,77,152,0.2)] self-start">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-white/15">
              <ShieldCheck className="size-6" />
            </div>
            <h2 className="mt-6 text-xl font-bold">A secure workspace</h2>
            <p className="mt-3 text-sm leading-6 text-blue-100">
              New members receive access based on the role you choose and can start collaborating on shared documents right away.
            </p>
            <div className="mt-8 border-t border-white/15 pt-5 text-sm text-blue-100">
              <p className="font-semibold text-white">What happens next?</p>
              <p className="mt-2">The user receives an email with temporary credentials and creates a password on first login.</p>
            </div>
          </aside>
        </section>
      </main>
    </WorkspaceLayout>
  )
}