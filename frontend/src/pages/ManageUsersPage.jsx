import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Building2, Loader2, RefreshCw, Search, ShieldCheck, Users, Pencil, X, Check, UserPlus } from 'lucide-react';
import WorkspaceLayout from '../components/WorkspaceLayout';
import { fetchUsersByOrganization, fetchUserDetails, clearAuthError } from '../features/auth/authSlice';

export default function ManageUsers() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, username, orgUsers: users, loading, error: reduxError } = useSelector((state) => state.auth);

  const [search, setSearch] = useState('');
  const [localError, setLocalError] = useState('');
  
  // Modal state for editing a user
  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');

  // Unpack user data safely from your backend structure
  const userData = user?.object ? user.object : (user || {});

  const orgId = userData?.organizationId || userData?.orgId || new URLSearchParams(window.location.search).get('orgId') || '';
  const isAdmin = userData?.role === 'ROLE_ADMIN' || userData?.role === 'ADMIN';

  useState(() => {
    if (username && !user) {
      dispatch(fetchUserDetails(username));
    }
  });

  const loadUsers = () => {
    if (!orgId.trim()) {
      setLocalError('No organization ID is available for this account.');
      return;
    }
    setLocalError('');
    dispatch(fetchUsersByOrganization(orgId.trim()));
  };

  useMemo(() => {
    if (isAdmin && orgId) {
      loadUsers();
    }
  }, [isAdmin, orgId]);

  // Handler to open the edit modal
  const handleOpenEdit = (targetUser) => {
    setEditingUser(targetUser);
    setEditName(targetUser.name || targetUser.fullName || '');
    setEditRole(targetUser.role || 'ROLE_USER');
  };

  // Handler for saving edited user details (Ready for your future async thunk)
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingUser) return;

    const updatedPayload = {
      ...editingUser,
      name: editName,
      role: editRole,
    };

    console.log('TODO: Dispatch update user thunk with:', updatedPayload);
    // dispatch(updateUserByAdmin(updatedPayload));

    setEditingUser(null); // Close modal
  };

  // Handler for activating/deactivating a user (Ready for your future async thunk)
  const handleToggleActive = (targetUser) => {
    const nextActiveStatus = !(targetUser.active !== false);
    const updatedPayload = {
      ...targetUser,
      active: nextActiveStatus,
    };

    console.log('TODO: Dispatch activate/deactivate thunk with:', updatedPayload);
    // dispatch(updateUserByAdmin(updatedPayload));
  };

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter((user) => 
      [user.name, user.fullName, user.email, user.role].some((value) => 
        String(value || '').toLowerCase().includes(term)
      )
    );
  }, [search, users]);

  const displayError = localError || reduxError;

  if (!isAdmin && user) {
    return (
      <WorkspaceLayout title="Access denied">
        <main className="mx-auto flex min-h-[calc(100vh-80px)] max-w-3xl items-center justify-center px-5 py-10">
          <section className="w-full rounded-[28px] border border-red-100 bg-white p-8 text-center shadow-[0_20px_60px_rgba(20,53,92,0.08)]">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <ShieldCheck className="size-7" />
            </div>
            <h1 className="mt-5 text-2xl font-bold text-slate-950">Admin access required</h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
              Only organization administrators can view the member directory.
            </p>
          </section>
        </main>
      </WorkspaceLayout>
    );
  }

  return (
    <WorkspaceLayout title="Organization users">
      <main className="mx-auto w-full max-w-6xl px-5 py-8 lg:px-10">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-primary">Admin workspace</p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Organization users</h1>
            <p className="mt-3 text-base leading-7 text-slate-500">Manage and review everyone who has access to your shared documents.</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Create User Button */}
            <button
              type="button"
              onClick={() => navigate('/register-users')}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
            >
              <UserPlus className="size-4" /> Create User
            </button>
            
            {/* Refresh Button */}
            <button 
              type="button" 
              onClick={loadUsers} 
              disabled={loading} 
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />} Refresh
            </button>
          </div>
        </div>

        <section className="mt-8 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(20,53,92,0.08)]">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-50 text-secondary">
                <Users className="size-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-950">Member directory</h2>
                <p className="text-sm text-slate-500">{users.length} {users.length === 1 ? 'member' : 'members'} found</p>
              </div>
            </div>
            <label className="relative block sm:w-72">
              <span className="sr-only">Search users</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input 
                value={search} 
                onChange={(event) => setSearch(event.target.value)} 
                placeholder="Search users" 
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-orange-100" 
              />
            </label>
          </div>

          {displayError && (
            <div className="m-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              {displayError}
            </div>
          )}

          {!displayError && loading && (
            <div className="flex items-center justify-center gap-2 p-12 text-sm text-slate-500">
              <Loader2 className="size-5 animate-spin text-primary" />
              Loading organization users...
            </div>
          )}

          {!loading && !displayError && filteredUsers.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 p-14 text-center">
              <Building2 className="size-8 text-slate-300" />
              <p className="font-semibold text-slate-700">No users found</p>
              <p className="text-sm text-slate-500">Try another search or refresh the directory.</p>
            </div>
          )}

          {!loading && !displayError && filteredUsers.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-bold">User</th>
                    <th className="px-6 py-4 font-bold">Email</th>
                    <th className="px-6 py-4 font-bold">Role</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user, index) => {
                    const isActive = user.active !== false;
                    return (
                      <tr key={user.id || user.email || index} className="transition hover:bg-orange-50/40">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-full bg-blue-100 font-bold text-secondary">
                              {String(user.name || user.fullName || 'U').charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-slate-900">{user.name || user.fullName || 'Unnamed user'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm text-slate-600">{user.email || '—'}</td>
                        <td className="px-6 py-5">
                          <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-primary">
                            {String(user.role || 'ROLE_USER').replace('ROLE_', '')}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                            <span className={`size-1.5 rounded-full ${isActive ? 'bg-emerald-600' : 'bg-slate-400'}`} />
                            {isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-3">
                            {/* Modern Sliding Toggle Switch */}
                            <div className="flex items-center gap-2" title={isActive ? 'Deactivate user' : 'Activate user'}>
                              <button
                                type="button"
                                role="switch"
                                aria-checked={isActive}
                                onClick={() => handleToggleActive(user)}
                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                                  isActive ? 'bg-primary' : 'bg-slate-300'
                                }`}
                              >
                                <span
                                  aria-hidden="true"
                                  className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                    isActive ? 'translate-x-5' : 'translate-x-0'
                                  }`}
                                />
                              </button>
                            </div>

                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(user)}
                              title="Edit user"
                              className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-blue-600"
                            >
                              <Pencil className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-950">Edit User Details</h3>
                <button 
                  type="button" 
                  onClick={() => setEditingUser(null)} 
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4 pt-4">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</label>
                  <input 
                    type="text" 
                    value={editName} 
                    onChange={(e) => setEditName(e.target.value)} 
                    required 
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-900 outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Role</label>
                  <select 
                    value={editRole} 
                    onChange={(e) => setEditRole(e.target.value)} 
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-900 outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-orange-100"
                  >
                    <option value="ROLE_USER">User</option>
                    <option value="ROLE_ADMIN">Admin</option>
                  </select>
                </div>

                <div className="mt-6 flex gap-3 pt-2">
                  <button 
                    type="submit" 
                    className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600"
                  >
                    <Check className="size-4" /> Save Changes
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setEditingUser(null)} 
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-4 font-bold text-slate-600 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </WorkspaceLayout>
  );
}