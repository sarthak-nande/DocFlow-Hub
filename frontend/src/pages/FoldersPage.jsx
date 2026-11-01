import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  FileText,
  FileImage,
  File,
  Folder,
  FolderPlus,
  Loader2,
  MoreHorizontal,
  Pencil,
  Search,
  Trash2,
  UploadCloud,
  X,
  Download
} from "lucide-react";
import WorkspaceLayout from "../components/WorkspaceLayout";
import {
  createFolder,
  deleteFolder,
  fetchFolders,
  fetchDocuments,
  renameFolder,
  uploadFiles,
  clearFolderError,
} from "./../features/auth/folderSlice";

// Helpers
const folderId = (folder) => folder?.id || folder?.folderId || folder?._id;
const folderName = (folder) => folder?.name || folder?.folderName || "Untitled folder";
const docId = (doc) => doc?.id || doc?._id;
const docName = (doc) => doc?.documentName || "Untitled file";

// Dynamic File Size Formatter
const formatBytes = (bytes, decimals = 1) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

// Dynamic icon based on mime type
const getFileIcon = (type) => {
  if (type?.includes("image")) return <FileImage className="size-6" />;
  if (type?.includes("pdf")) return <FileText className="size-6" />;
  return <File className="size-6" />;
};

export default function Folders() {
  const dispatch = useDispatch();
  const inputRef = useRef(null);
  const directoryRef = useRef(null);
  
  const { 
    items = [], 
    documents = [], 
    loading = false, 
    docLoading = false, 
    uploadLoading = false, 
    error = null 
  } = useSelector((state) => state.folders || {});
  
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null);
  const [name, setName] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [toast, setToast] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    dispatch(fetchFolders());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchDocuments(currentFolderId));
  }, [dispatch, currentFolderId]);

  useEffect(() => {
    if (error) setToast({ type: "error", message: error });
  }, [error]);

  const breadcrumbs = useMemo(() => {
    const trail = [];
    let currId = currentFolderId;
    while (currId) {
      const folder = items.find((i) => folderId(i) === currId);
      if (folder) {
        trail.unshift(folder);
        currId = folder.parentId || null;
      } else {
        break;
      }
    }
    return trail;
  }, [items, currentFolderId]);

  const currentFolders = useMemo(() => {
    return items.filter((folder) => {
      const isChild = (folder.parentId || null) === (currentFolderId || null);
      return isChild && folderName(folder).toLowerCase().includes(query.toLowerCase());
    });
  }, [items, currentFolderId, query]);

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => 
      docName(doc).toLowerCase().includes(query.toLowerCase())
    );
  }, [documents, query]);

  const openCreate = () => {
    setName("");
    setModal({ type: "create" });
  };

  const openRename = (folder) => {
    setName(folderName(folder));
    setModal({ type: "rename", folder });
  };

  const saveFolder = async () => {
    if (!name.trim()) return;
    const action =
      modal.type === "create"
        ? createFolder({ name: name.trim(), parentId: currentFolderId })
        : renameFolder({
            folderId: folderId(modal.folder),
            newName: name.trim(),
          });
          
    const result = await dispatch(action);
    if (!result.error) {
      setModal(null);
      setToast({
        type: "success",
        message: modal.type === "create" ? "Folder created successfully." : "Folder renamed successfully.",
      });
    }
  };

  const chooseFiles = (files) => {
    const next = Array.from(files || []);
    if (next.length) {
      setSelectedFiles(next);
      setToast(null);
      setProgress(0);
    }
  };

  const startUpload = async () => {
    if (!selectedFiles.length || uploadLoading) return;
    
    const timer = window.setInterval(
      () => setProgress((value) => Math.min(value + 12, 90)),
      150
    );
    
    const result = await dispatch(uploadFiles({ files: selectedFiles, folderId: currentFolderId }));
    window.clearInterval(timer);
    
    if (result.error) {
      setProgress(0);
      return; 
    }

    const backendResponses = result.payload || [];
    const failedFiles = backendResponses.filter(res => 
      res.message && res.message.toLowerCase().includes('failed')
    );

    if (failedFiles.length > 0) {
      setProgress(0);
      setToast({
        type: "error",
        message: `Upload error: ${failedFiles[0].message}`, 
      });
      return; 
    }

    setProgress(100);
    setSelectedFiles([]);
    setToast({
      type: "success",
      message: `${selectedFiles.length} file(s) uploaded successfully.`,
    });
    
    if (inputRef.current) inputRef.current.value = "";
    
    dispatch(fetchDocuments(currentFolderId));
  };

  const closeToast = () => {
    setToast(null);
    dispatch(clearFolderError());
  };

  const navigateUp = () => {
    if (!currentFolderId) return;
    const current = items.find(f => folderId(f) === currentFolderId);
    setCurrentFolderId(current?.parentId || null);
    setQuery("");
  };

  const totalItems = currentFolders.length + filteredDocuments.length;

  return (
    <WorkspaceLayout title="Folders & documents">
      <main className="min-h-[calc(100vh-72px)] bg-[#f8fbff] px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <nav className="flex flex-wrap items-center gap-2 text-sm font-bold uppercase tracking-[0.1em] text-[#f07828]">
                <button 
                  onClick={() => { setCurrentFolderId(null); setQuery(""); }}
                  className="hover:text-[#db641b] hover:underline"
                >
                  Root
                </button>
                {breadcrumbs.map((crumb) => (
                  <div key={folderId(crumb)} className="flex items-center gap-2">
                    <ChevronRight className="size-4 text-slate-400" />
                    <button 
                      onClick={() => { setCurrentFolderId(folderId(crumb)); setQuery(""); }}
                      className="hover:text-[#db641b] hover:underline"
                    >
                      {folderName(crumb)}
                    </button>
                  </div>
                ))}
              </nav>
              
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#12365c]">
                {breadcrumbs.length > 0 ? folderName(breadcrumbs[breadcrumbs.length - 1]) : "Organization library"}
              </h1>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 rounded-xl border border-[#c9ddeb] bg-white px-4 py-3 text-sm font-bold text-[#2674b9] shadow-sm hover:bg-[#f5faff]"
              >
                <FolderPlus className="size-4" /> New folder
              </button>
              <button
                onClick={() => inputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl bg-[#f07828] px-4 py-3 text-sm font-bold text-white shadow-[0_8px_18px_rgba(240,120,40,0.22)] hover:bg-[#db641b]"
              >
                <UploadCloud className="size-4" /> Upload files
              </button>
            </div>
          </div>

          <section className="mt-8 rounded-[28px] border border-[#dbe8f3] bg-white p-5 shadow-[0_20px_60px_rgba(18,54,92,0.08)] sm:p-7">
            <div className="flex flex-col gap-4 border-b border-[#e6eef5] pb-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                {currentFolderId && (
                  <button 
                    onClick={navigateUp}
                    className="flex size-10 items-center justify-center rounded-lg border border-[#dbe8f3] bg-[#f8fbff] text-[#2674b9] hover:bg-[#e7f2fb]"
                    aria-label="Go up one folder"
                  >
                    <ArrowLeft className="size-5" />
                  </button>
                )}
                <div>
                  <h2 className="text-lg font-bold text-[#12365c]">Directory Contents</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {totalItems} item{totalItems === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
              <label className="flex items-center gap-2 rounded-xl border border-[#dbe8f3] bg-[#f8fbff] px-3 py-2 text-sm text-slate-500">
                <Search className="size-4" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search contents..."
                  className="w-44 bg-transparent outline-none placeholder:text-slate-400"
                />
              </label>
            </div>

            {loading || docLoading ? (
              <div className="flex justify-center py-20 text-[#2674b9]">
                <Loader2 className="size-7 animate-spin" />
              </div>
            ) : totalItems > 0 ? (
              <div className="grid gap-3 pt-5 sm:grid-cols-2 lg:grid-cols-3">
                
                {/* 1. Render Folders */}
                {currentFolders.map((folder) => (
                  <div
                    key={folderId(folder)}
                    onClick={() => { setCurrentFolderId(folderId(folder)); setQuery(""); }}
                    className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-[#e4edf4] bg-[#fbfdff] p-4 transition hover:border-[#b9d3e8] hover:shadow-sm"
                  >
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#e7f2fb] text-[#2674b9]">
                      <Folder className="size-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-[#12365c]">
                        {folderName(folder)}
                      </p>
                    </div>
                    <div className="relative">
                      <button
                        aria-label={`Actions for ${folderName(folder)}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setModal(modal?.folder === folder ? null : { type: "menu", folder });
                        }}
                        className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-[#2674b9]"
                      >
                        <MoreHorizontal className="size-5" />
                      </button>
                      {modal?.type === "menu" && modal.folder === folder && (
                        <div className="absolute right-0 top-10 z-10 w-36 rounded-xl border border-[#dbe8f3] bg-white p-1 shadow-xl" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => openRename(folder)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-600 hover:bg-[#f5faff]">
                            <Pencil className="size-4" /> Rename
                          </button>
                          <button onClick={async () => {
                              const result = await dispatch(deleteFolder(folderId(folder)));
                              setModal(null);
                              if (!result.error) setToast({ type: "success", message: "Folder deleted successfully." });
                            }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">
                            <Trash2 className="size-4" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* 2. Render Documents */}
                {filteredDocuments.map((doc) => (
                  <div
                    key={docId(doc)}
                    className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-[#b9d3e8] hover:shadow-sm"
                  >
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                      {getFileIcon(doc.documentType)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-[#12365c]" title={docName(doc)}>
                        {docName(doc)}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {formatBytes(doc.fileSize)} • v{doc.documentVersion}
                      </p>
                    </div>
                    <button
                       onClick={() => alert("Download not implemented yet!")}
                       className="rounded-lg p-2 text-slate-400 hover:bg-[#f5faff] hover:text-[#2674b9]"
                       title="Download File"
                    >
                      <Download className="size-5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-16 text-center">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-[#fff1e6] text-[#f07828]">
                  <Folder className="size-7" />
                </div>
                <h3 className="mt-4 font-bold text-[#12365c]">This folder is empty</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Upload a document or create a subfolder here.
                </p>
              </div>
            )}
          </section>

          <input ref={inputRef} type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg" className="sr-only" onChange={(e) => chooseFiles(e.target.files)} />
          <input ref={directoryRef} type="file" multiple webkitdirectory="true" className="sr-only" onChange={(e) => chooseFiles(e.target.files)} />
          
          <section className="mt-5 rounded-[24px] border-2 border-dashed border-[#b9d3e8] bg-white p-6 text-center" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); chooseFiles(e.dataTransfer.files); }}>
            <UploadCloud className="mx-auto size-7 text-[#2674b9]" />
            <p className="mt-2 text-sm font-semibold text-[#12365c]">Drop files or a folder anywhere here</p>
            <p className="mt-1 text-xs text-slate-500">You can also <button onClick={() => directoryRef.current?.click()} className="font-bold text-[#2674b9]">choose a folder</button> from your computer.</p>
          </section>

          {selectedFiles.length > 0 && (
            <section className="mt-5 rounded-[24px] border border-[#dbe8f3] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-[#12365c]">Ready to upload</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {selectedFiles.length} file{selectedFiles.length === 1 ? "" : "s"} ·{" "}
                    {formatBytes(selectedFiles.reduce((sum, file) => sum + file.size, 0))}
                  </p>
                </div>
                <button onClick={() => setSelectedFiles([])} className="rounded-lg p-2 text-slate-400 hover:bg-slate-50">
                  <X className="size-5" />
                </button>
              </div>
              <div className="mt-4 max-h-36 overflow-auto">
                {selectedFiles.slice(0, 5).map((file) => (
                  <div key={`${file.name}-${file.lastModified}`} className="flex items-center gap-3 border-t border-[#eef3f7] py-2 text-sm">
                    <File className="size-4 text-[#2674b9]" />
                    <span className="truncate text-slate-600">{file.webkitRelativePath || file.name}</span>
                  </div>
                ))}
              </div>
              
              {uploadLoading || progress > 0 ? (
                <div className="mt-4">
                  <div className="mb-2 flex justify-between text-xs font-bold text-slate-500">
                    <span>Uploading files...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#e7f2fb]">
                    <div className="h-full rounded-full bg-[#f07828] transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              ) : null}

              <button
                onClick={startUpload}
                disabled={uploadLoading}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#f07828] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#db641b] disabled:opacity-50"
              >
                {uploadLoading && <Loader2 className="size-4 animate-spin" />}
                Upload selected files {currentFolderId ? "to current folder" : ""}
              </button>
            </section>
          )}

          {toast && (
            <div role="status" className={`fixed bottom-6 right-6 z-20 flex max-w-sm items-start gap-3 rounded-2xl border bg-white p-4 shadow-2xl ${toast.type === "error" ? "border-red-200" : "border-emerald-200"}`}>
              <CheckCircle2 className={`mt-0.5 size-5 ${toast.type === "error" ? "text-red-500" : "text-emerald-500"}`} />
              <p className="text-sm font-semibold text-slate-700">{toast.message}</p>
              <button onClick={closeToast} aria-label="Close notification" className="text-slate-400 hover:text-slate-600">
                <X className="size-4" />
              </button>
            </div>
          )}

          {modal && (modal.type === "create" || modal.type === "rename") && (
            <div className="fixed inset-0 z-20 flex items-center justify-center bg-[#12365c]/25 p-5 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wider text-[#f07828]">Folder action</p>
                    <h2 className="mt-2 text-xl font-bold text-[#12365c]">
                      {modal.type === "create" ? "Create a new folder" : "Rename folder"}
                    </h2>
                  </div>
                  <button onClick={() => setModal(null)} aria-label="Close dialog" className="text-slate-400 hover:text-slate-600">
                    <X className="size-5" />
                  </button>
                </div>
                <input
                  autoFocus
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && saveFolder()}
                  placeholder="Folder name"
                  className="mt-6 w-full rounded-xl border border-[#c9ddeb] px-4 py-3 outline-none focus:border-[#2674b9] focus:ring-4 focus:ring-[#e7f2fb]"
                />
                <div className="mt-6 flex justify-end gap-3">
                  <button onClick={() => setModal(null)} className="rounded-xl px-4 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50">
                    Cancel
                  </button>
                  <button onClick={saveFolder} className="rounded-xl bg-[#f07828] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#db641b]">
                    Save folder
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </WorkspaceLayout>
  );
}