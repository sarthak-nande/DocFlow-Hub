import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CheckCircle2, ChevronLeft, ChevronRight, Clock3, FileText, Filter, Loader2, Search, X, XCircle } from 'lucide-react'
import { fetchOrgDocuments, updateDocStatus } from '../features/documents/documentsSlice'
import { fetchUserDetails } from "../features/auth/authSlice";
import WorkspaceLayout from '../components/WorkspaceLayout'

const statusMeta = {
  APPROVED: { label: 'Approved', icon: CheckCircle2, className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  REJECTED: { label: 'Rejected', icon: XCircle, className: 'bg-rose-50 text-rose-700 ring-rose-200' },
  PENDING_APPROVAL: { label: 'Pending', icon: Clock3, className: 'bg-amber-50 text-amber-700 ring-amber-200' },
}

function hasRole(user, target) {
  const role = user?.role || user?.authorities?.[0]?.authority || user?.authorities?.[0] || ''
  return role.toUpperCase() === target || role.toUpperCase() === `ROLE_${target}`
}

export default function OrganizationDocuments() {
  const dispatch = useDispatch()
  const { user, username } = useSelector((state) => state.auth || {})
  const userData = user?.object ? user.object : (user || {});
  const canChangeStatus = hasRole(userData, 'ADMIN') || hasRole(userData, 'APPROVER')
  
  const { paginatedDocs = [], totalPages = 1, totalElements = 0, loading, statusUpdating, error } = useSelector((state) => state.documents || {})
  
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [page, setPage] = useState(0)
  const [editingDocument, setEditingDocument] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState('PENDING_APPROVAL')
  const pageSize = 10

  useEffect(() => {
    if (username) {
      dispatch(fetchUserDetails(username));
    }
  }, [dispatch, username]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    dispatch(fetchOrgDocuments({ page, size: pageSize, search: debouncedSearch, status: statusFilter }))
  }, [dispatch, page, debouncedSearch, statusFilter])

  const openStatusEditor = (doc) => {
    setEditingDocument(doc)
    setSelectedStatus((doc.status || 'PENDING_APPROVAL').toUpperCase())
  }

  const saveStatus = async () => {
    if (!editingDocument) return
    await dispatch(updateDocStatus({ documentId: editingDocument.id || editingDocument._id, status: selectedStatus }))
    setEditingDocument(null)
  }

  return (
    <WorkspaceLayout title="Document review">
      <main className="min-h-[calc(100vh-72px)] bg-[#f7fbff] px-4 py-6 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#e77825]">Workspace review</p>
              <h1 className="text-3xl font-bold tracking-tight text-[#12365c]">Organization documents</h1>
              <p className="mt-2 text-sm text-slate-500">Review document status from one organized workspace.</p>
            </div>
            <div className="rounded-2xl border border-[#dbe8f3] bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Total documents</p>
              <p className="mt-1 text-2xl font-bold text-[#12365c]">{totalElements}</p>
            </div>
          </div>
          
          <section className="overflow-hidden rounded-[26px] border border-[#dbe8f3] bg-white shadow-[0_18px_55px_rgba(18,54,92,0.08)]">
            <div className="flex flex-col gap-3 border-b border-[#e7eef5] p-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative max-w-md flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  aria-label="Search documents" 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)} 
                  placeholder="Search by document name or owner" 
                  className="w-full rounded-xl border border-[#dbe8f3] bg-[#f8fbff] py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#2674b9] focus:ring-4 focus:ring-[#e7f2fb]" 
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="size-4 text-slate-400" />
                <select 
                  aria-label="Filter by status" 
                  value={statusFilter} 
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(0) }} 
                  className="rounded-xl border border-[#dbe8f3] bg-[#f8fbff] px-3 py-3 text-sm font-medium text-slate-600 outline-none focus:border-[#2674b9]"
                >
                  <option value="ALL">All statuses</option>
                  <option value="PENDING_APPROVAL">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>
            
            {error && <div className="mx-5 mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
            
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="bg-[#f8fbff] text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Document</th>
                    <th className="px-6 py-4">Uploaded by</th>
                    <th className="px-6 py-4">Current status</th>
                    {canChangeStatus && <th className="px-6 py-4 text-right">Change status</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf2f6]">
                  {loading ? (
                    <tr>
                      <td colSpan={canChangeStatus ? 4 : 3} className="py-20 text-center">
                        <Loader2 className="mx-auto size-7 animate-spin text-[#2674b9]" />
                      </td>
                    </tr>
                  ) : paginatedDocs.length ? (
                    paginatedDocs.map((doc) => { 
                      const status = (doc.status || 'PENDING_APPROVAL').toUpperCase(); 
                      const meta = statusMeta[status] || statusMeta.PENDING_APPROVAL; 
                      const Icon = meta.icon; 
                      const id = doc.id || doc._id; 
                      return (
                        <tr key={id} className="transition hover:bg-[#fbfdff]">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="rounded-xl bg-[#edf5fc] p-3 text-[#2674b9]">
                                <FileText className="size-5" />
                              </div>
                              <div>
                                <p className="font-semibold text-[#12365c]">{doc.documentName || doc.name || 'Untitled document'}</p>
                                <p className="mt-1 text-xs text-slate-400">Document ID: {id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-sm text-slate-500">{doc.createdBy || doc.uploadedBy || 'System'}</td>
                          <td className="px-6 py-5">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${meta.className}`}>
                              <Icon className="size-3.5" />{meta.label}
                            </span>
                          </td>
                          {canChangeStatus && (
                            <td className="px-6 py-5 text-right">
                              <button 
                                type="button" 
                                onClick={() => openStatusEditor({ ...doc, id })} 
                                className="rounded-xl border border-[#cfe0ee] bg-white px-3.5 py-2.5 text-xs font-bold text-[#2674b9] transition hover:border-[#2674b9] hover:bg-[#f2f8fd]"
                              >
                                Change status
                              </button>
                            </td>
                          )}
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={canChangeStatus ? 4 : 3} className="py-20 text-center text-sm text-slate-500">
                        No documents found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {!loading && totalElements > 0 && (
              <div className="flex items-center justify-between border-t border-[#e7eef5] px-6 py-4">
                <span className="text-sm text-slate-500">
                  Page <strong className="text-slate-700">{page + 1}</strong> of <strong className="text-slate-700">{Math.max(totalPages, 1)}</strong>
                </span>
                <div className="flex gap-2">
                  <button 
                    aria-label="Previous page" 
                    onClick={() => setPage((p) => Math.max(0, p - 1))} 
                    disabled={!page} 
                    className="rounded-lg border border-[#dbe8f3] p-2 text-slate-600 disabled:opacity-40"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <button 
                    aria-label="Next page" 
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} 
                    disabled={page >= totalPages - 1} 
                    className="rounded-lg border border-[#dbe8f3] p-2 text-slate-600 disabled:opacity-40"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
      
      {editingDocument && (
        <div 
          role="presentation" 
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#12365c]/35 px-4" 
          onMouseDown={(e) => { if (e.target === e.currentTarget) setEditingDocument(null) }}
        >
          <section 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="status-dialog-title" 
            className="w-full max-w-md rounded-3xl border border-[#dbe8f3] bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#e77825]">Document workflow</p>
                <h2 id="status-dialog-title" className="mt-1 text-xl font-bold text-[#12365c]">Update document status</h2>
                <p className="mt-2 text-sm text-slate-500">Choose the new state for {editingDocument.documentName || editingDocument.name || 'this document'}.</p>
              </div>
              <button 
                type="button" 
                aria-label="Close status dialog" 
                onClick={() => setEditingDocument(null)} 
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="size-5" />
              </button>
            </div>
            
            <label htmlFor="document-status" className="mt-6 block text-sm font-semibold text-[#12365c]">Status</label>
            <select 
              id="document-status" 
              value={selectedStatus} 
              onChange={(e) => setSelectedStatus(e.target.value)} 
              className="mt-2 w-full rounded-xl border border-[#cfe0ee] bg-[#f8fbff] px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-[#2674b9] focus:ring-4 focus:ring-[#e7f2fb]"
            >
              <option value="PENDING_APPROVAL">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
            
            <div className="mt-6 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setEditingDocument(null)} 
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={saveStatus} 
                disabled={statusUpdating} 
                className="rounded-xl bg-[#2674b9] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#1e609e] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {statusUpdating ? 'Saving…' : 'Save status'}
              </button>
            </div>
          </section>
        </div>
      )}
    </WorkspaceLayout>
  )
}