import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrgDocuments, updateDocStatus } from "../features/documents/documentsSlice";
import { fetchUserDetails } from "../features/auth/authSlice";
import WorkspaceLayout from "../components/WorkspaceLayout";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";

function hasRole(user, targetRole) {
  const role = user?.role || user?.authorities?.[0]?.authority || user?.authorities?.[0] || "";
  const normalized = role.toUpperCase();
  const target = targetRole.toUpperCase();
  return normalized === target || normalized === `ROLE_${target}`;
}

export default function OrganizationDocuments() {
  const dispatch = useDispatch();
  const { user, username } = useSelector((state) => state.auth);
  const userData = user?.object ? user.object : (user || {});
  const canChangeStatus = hasRole(userData, "ADMIN") || hasRole(userData, "APPROVER");

  const {
    paginatedDocs,
    totalPages,
    currentPage,
    totalElements,
    loading,
    statusUpdating
  } = useSelector((state) => state.documents || {});

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    if (username) {
      dispatch(fetchUserDetails(username));
    }
  }, [dispatch, username]);

  // Debounce Search Input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0); // Reset to page 0 on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch Data
  useEffect(() => {
    dispatch(fetchOrgDocuments({ page, size: pageSize, search: debouncedSearch, status: statusFilter }));
  }, [dispatch, page, debouncedSearch, statusFilter]);

  const handleStatusChange = async (docId, newStatus) => {
    if (window.confirm(`Are you sure you want to mark this document as ${newStatus}?`)) {
      await dispatch(updateDocStatus({ documentId: docId, status: newStatus }));
    }
  };

  const StatusBadge = ({ status }) => {
    switch (status?.toUpperCase()) {
      case "APPROVED":
        return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-600 border border-emerald-200"><CheckCircle className="size-3"/> Approved</span>;
      case "REJECTED":
        return <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 border border-red-200"><XCircle className="size-3"/> Rejected</span>;
      default:
        return <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-600 border border-amber-200"><Clock className="size-3"/> Pending</span>;
    }
  };

  return (
    <WorkspaceLayout title="Organization Documents">
      <main className="min-h-[calc(100vh-72px)] bg-[#f8fbff] px-4 py-6 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#12365c]">
              Organization Documents
            </h1>
            <p className="mt-2 text-slate-500">
              Manage and review all documents submitted across the organization.
            </p>
          </div>

          <div className="rounded-2xl sm:rounded-[28px] border border-[#dbe8f3] bg-white shadow-sm overflow-hidden">
            
            {/* Toolbar (Search & Filter) */}
            <div className="flex flex-col gap-4 border-b border-[#e6eef5] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search documents..."
                  className="w-full rounded-xl border border-[#dbe8f3] bg-[#f8fbff] py-2 pl-10 pr-4 text-sm text-slate-600 outline-none focus:border-[#2674b9] focus:ring-2 focus:ring-[#e7f2fb]"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="size-4 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                  className="rounded-xl border border-[#dbe8f3] bg-[#f8fbff] px-3 py-2 text-sm text-slate-600 outline-none focus:border-[#2674b9]"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING_APPROVAL">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>

            {/* Document Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-[#f8fbff] text-xs uppercase text-slate-500 border-b border-[#e6eef5]">
                  <tr>
                    <th className="px-6 py-4 font-bold">Document Name</th>
                    <th className="px-6 py-4 font-bold">Uploaded By</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    {canChangeStatus && <th className="px-6 py-4 font-bold text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6eef5]">
                  {loading ? (
                    <tr>
                      <td colSpan={canChangeStatus ? 4 : 3} className="py-16 text-center">
                        <Loader2 className="mx-auto size-6 animate-spin text-[#2674b9]" />
                      </td>
                    </tr>
                  ) : paginatedDocs.length > 0 ? (
                    paginatedDocs.map((doc) => (
                      <tr key={doc.id || doc._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                              <FileText className="size-4" />
                            </div>
                            <span className="font-semibold text-[#12365c]">{doc.documentName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-500">{doc.createdBy || "System"}</td>
                        <td className="px-6 py-4">
                          <StatusBadge status={doc.status} />
                        </td>
                        {canChangeStatus && (
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                disabled={statusUpdating || doc.status?.toUpperCase() === "APPROVED"}
                                onClick={() => handleStatusChange(doc.id || doc._id, "APPROVED")}
                                className="rounded-lg border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button
                                disabled={statusUpdating || doc.status?.toUpperCase() === "REJECTED"}
                                onClick={() => handleStatusChange(doc.id || doc._id, "REJECTED")}
                                className="rounded-lg border border-red-200 bg-white px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={canChangeStatus ? 4 : 3} className="py-16 text-center text-slate-500">
                        No documents found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {!loading && totalElements > 0 && (
              <div className="flex items-center justify-between border-t border-[#e6eef5] px-6 py-4">
                <span className="text-sm text-slate-500">
                  Showing <span className="font-bold text-slate-700">{page * pageSize + 1}</span> to{" "}
                  <span className="font-bold text-slate-700">
                    {Math.min((page + 1) * pageSize, totalElements)}
                  </span>{" "}
                  of <span className="font-bold text-slate-700">{totalElements}</span> results
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="flex size-8 items-center justify-center rounded-lg border border-[#dbe8f3] text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="flex size-8 items-center justify-center rounded-lg border border-[#dbe8f3] text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </WorkspaceLayout>
  );
}