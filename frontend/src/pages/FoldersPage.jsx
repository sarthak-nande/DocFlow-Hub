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
  Download,
  Eye
} from "lucide-react";
import WorkspaceLayout from "../components/WorkspaceLayout";

// All actions imported directly from folderSlice
import {
  createFolder,
  deleteFolder,
  fetchFolders,
  fetchDocuments,
  renameFolder,
  uploadFiles,
  clearFolderError,
  deleteDocumentFile, 
  downloadDocumentFile, 
  getDocumentPreviewUrl 
} from "./../features/auth/folderSlice";

// --- Helpers ---
const folderId = (folder) => folder?.id || folder?.folderId || folder?._id;
const folderName = (folder) => folder?.name || folder?.folderName || "Untitled folder";
const docId = (doc) => doc?.id || doc?._id;
const docName = (doc) => doc?.documentName || "Untitled file";

const formatBytes = (bytes, decimals = 1) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const getFileIcon = (type) => {
  if (type?.includes("image")) return <FileImage className="size-5 sm:size-6" />;
  if (type?.includes("pdf")) return <FileText className="size-5 sm:size-6" />;
  return <File className="size-5 sm:size-6" />;
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

  // Preview Modal State
  const [previewDoc, setPreviewDoc] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Shadcn-style Delete Dialog State
  const [deleteConfirmDoc, setDeleteConfirmDoc] = useState(null);
  const [isDeletingDoc, setIsDeletingDoc] = useState(false);

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
    const docsArray = Array.isArray(documents) ? documents : [];
    return docsArray.filter((doc) => 
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
      setToast({ type: "error", message: `Upload error: ${failedFiles[0].message}` });
      return; 
    }

    setProgress(100);
    setSelectedFiles([]);
    setToast({ type: "success", message: `${selectedFiles.length} file(s) uploaded successfully.` });
    
    if (inputRef.current) inputRef.current.value = "";
    dispatch(fetchDocuments(currentFolderId));
  };

  // --- UPDATED SAFELY ---
  const confirmDeleteDocument = async () => {
    if (!deleteConfirmDoc) return;
    setIsDeletingDoc(true);
    
    try {
      const result = await dispatch(deleteDocumentFile(docId(deleteConfirmDoc)));
      
      // If the action returned an error state (backend rejection)
      if (result.error) {
        setToast({ type: "error", message: result.payload || result.error.message || "Failed to delete document." });
      } else {
        // Success
        setToast({ type: "success", message: "Document deleted successfully." });
        setDeleteConfirmDoc(null); // Close the modal
        dispatch(fetchDocuments(currentFolderId)); // Force fresh fetch
      }
    } catch (err) {
      // If a JavaScript crash happens, this prints it to the screen so we can see it
      console.error("Crash during document deletion:", err);
      setToast({ type: "error", message: `System Error: ${err.message}` });
    } finally {
      setIsDeletingDoc(false); // Always stop the spinner
    }
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

  const closePreview = () => {
    if (previewUrl) window.URL.revokeObjectURL(previewUrl);
    setPreviewDoc(null);
    setPreviewUrl(null);
  };

  const totalItems = currentFolders.length + filteredDocuments.length;

  return (
    <WorkspaceLayout title="Folders & documents">
      <main className="min-h-[calc(100vh-72px)] bg-[#f8fbff] px-4 py-6 sm:px-8 lg:px-12 relative">
        <div className="mx-auto max-w-7xl">
          
          {/* Header */}
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <nav className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-[0.1em] text-[#f07828]">
                <button 
                  onClick={() => { setCurrentFolderId(null); setQuery(""); }}
                  className="hover:text-[#db641b] hover:underline"
                >
                  Root
                </button>
                {breadcrumbs.map((crumb) => (
                  <div key={folderId(crumb)} className="flex items-center gap-1 sm:gap-2">
                    <ChevronRight className="size-4 text-slate-400" />
                    <button 
                      onClick={() => { setCurrentFolderId(folderId(crumb)); setQuery(""); }}
                      className="hover:text-[#db641b] hover:underline truncate max-w-[100px] sm:max-w-none"
                    >
                      {folderName(crumb)}
                    </button>
                  </div>
                ))}
              </nav>
              
              <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-[#12365c]">
                {breadcrumbs.length > 0 ? folderName(breadcrumbs[breadcrumbs.length - 1]) : "Organization library"}
              </h1>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 rounded-xl border border-[#c9ddeb] bg-white px-4 py-2.5 sm:py-3 text-sm font-bold text-[#2674b9] shadow-sm hover:bg-[#f5faff]"
              >
                <FolderPlus className="size-4" /> New folder
              </button>
              <button
                onClick={() => inputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl bg-[#f07828] px-4 py-2.5 sm:py-3 text-sm font-bold text-white shadow-[0_8px_18px_rgba(240,120,40,0.22)] hover:bg-[#db641b]"
              >
                <UploadCloud className="size-4" /> Upload files
              </button>
            </div>
          </div>

          <section className="mt-6 sm:mt-8 rounded-2xl sm:rounded-[28px] border border-[#dbe8f3] bg-white p-4 sm:p-7 shadow-[0_20px_60px_rgba(18,54,92,0.08)] overflow-hidden">
            <div className="flex flex-col gap-4 border-b border-[#e6eef5] pb-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                {currentFolderId && (
                  <button 
                    onClick={navigateUp}
                    className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-lg border border-[#dbe8f3] bg-[#f8fbff] text-[#2674b9] hover:bg-[#e7f2fb]"
                    aria-label="Go up one folder"
                  >
                    <ArrowLeft className="size-5" />
                  </button>
                )}
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-bold text-[#12365c] truncate">Directory Contents</h2>
                  <p className="mt-1 text-xs sm:text-sm text-slate-500">
                    {totalItems} item{totalItems === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
              <label className="flex w-full md:w-auto items-center gap-2 rounded-xl border border-[#dbe8f3] bg-[#f8fbff] px-3 py-2 text-sm text-slate-500">
                <Search className="size-4 shrink-0" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search contents..."
                  className="w-full md:w-44 bg-transparent outline-none placeholder:text-slate-400"
                />
              </label>
            </div>

            {loading || docLoading ? (
              <div className="flex justify-center py-16 sm:py-20 text-[#2674b9]">
                <Loader2 className="size-7 animate-spin" />
              </div>
            ) : totalItems > 0 ? (
              <div className="grid gap-3 pt-5 sm:grid-cols-2 lg:grid-cols-3">
                
                {/* 1. Render Folders */}
                {currentFolders.map((folder) => (
                  <div
                    key={folderId(folder)}
                    onClick={() => { setCurrentFolderId(folderId(folder)); setQuery(""); }}
                    className="group flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-[#e4edf4] bg-[#fbfdff] p-3 sm:p-4 transition hover:border-[#b9d3e8] hover:shadow-sm"
                  >
                    <div className="flex size-10 sm:size-12 shrink-0 items-center justify-center rounded-xl bg-[#e7f2fb] text-[#2674b9]">
                      <Folder className="size-5 sm:size-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-[#12365c]">
                        {folderName(folder)}
                      </p>
                    </div>
                    <div className="relative shrink-0">
                      <button
                        aria-label={`Actions for ${folderName(folder)}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setModal(modal?.folder === folder ? null : { type: "menu", folder });
                        }}
                        className="rounded-lg p-1.5 sm:p-2 text-slate-400 hover:bg-white hover:text-[#2674b9]"
                      >
                        <MoreHorizontal className="size-5" />
                      </button>
                      {modal?.type === "menu" && modal.folder === folder && (
                        <div className="absolute right-0 top-10 z-10 w-36 rounded-xl border border-[#dbe8f3] bg-white p-1 shadow-xl" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => openRename(folder)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-600 hover:bg-[#f5faff]">
                            <Pencil className="size-4" /> Rename
                          </button>
                          <button 
                            onClick={async () => {
                              const result = await dispatch(deleteFolder(folderId(folder)));
                              setModal(null);
                              if (!result.error) {
                                setToast({ type: "success", message: "Folder deleted successfully." });
                                dispatch(fetchFolders());
                              }
                            }} 
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                          >
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
                    className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 transition hover:border-[#b9d3e8] hover:shadow-sm"
                  >
                    <div className="flex size-10 sm:size-12 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                      {getFileIcon(doc.documentType)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-[#12365c]" title={docName(doc)}>
                        {docName(doc)}
                      </p>
                      <p className="mt-1 text-xs text-slate-400 truncate">
                        {formatBytes(doc.fileSize)} • v{doc.documentVersion}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-0.5 sm:gap-1 opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100">
                      {(doc.documentType?.includes("image") || doc.documentType?.includes("pdf")) && (
                        <button
                          onClick={async () => {
                            try {
                              setPreviewDoc(doc);
                              setPreviewLoading(true);
                              const url = await getDocumentPreviewUrl(docId(doc), doc.documentType);
                              setPreviewUrl(url);
                            } catch (err) {
                              setToast({ type: "error", message: "Preview failed to load." });
                              setPreviewDoc(null);
                            } finally {
                              setPreviewLoading(false);
                            }
                          }}
                          className="rounded-lg p-1.5 sm:p-2 text-slate-400 hover:bg-[#f0f7fc] hover:text-[#2674b9]"
                          title="Preview File"
                        >
                          <Eye className="size-4 sm:size-5" />
                        </button>
                      )}
                      <button
                        onClick={async () => {
                          try {
                            setToast({ type: "success", message: "Download started..." });
                            await downloadDocumentFile(docId(doc), docName(doc));
                          } catch (err) {
                            setToast({ type: "error", message: "Failed to download document" });
                          }
                        }}
                        className="rounded-lg p-1.5 sm:p-2 text-slate-400 hover:bg-[#e7f2fb] hover:text-[#2674b9]"
                        title="Download File"
                      >
                        <Download className="size-4 sm:size-5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmDoc(doc)}
                        className="rounded-lg p-1.5 sm:p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        title="Delete File"
                      >
                        <Trash2 className="size-4 sm:size-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-16 text-center px-4">
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
                    <File className="size-4 text-[#2674b9] shrink-0" />
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
            <div role="status" className={`fixed bottom-6 right-6 z-[110] flex max-w-sm items-start gap-3 rounded-2xl border bg-white p-4 shadow-2xl ${toast.type === "error" ? "border-red-200" : "border-emerald-200"}`}>
              <CheckCircle2 className={`mt-0.5 size-5 shrink-0 ${toast.type === "error" ? "text-red-500" : "text-emerald-500"}`} />
              <p className="text-sm font-semibold text-slate-700">{toast.message}</p>
              <button onClick={closeToast} aria-label="Close notification" className="text-slate-400 hover:text-slate-600 shrink-0">
                <X className="size-4" />
              </button>
            </div>
          )}

          {/* Folder Action Modal */}
          {modal && (modal.type === "create" || modal.type === "rename") && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#12365c]/40 p-4 sm:p-5 backdrop-blur-sm">
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

          {/* DOCUMENT PREVIEW MODAL */}
          {previewDoc && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#12365c]/60 p-2 sm:p-4 md:p-8 backdrop-blur-sm">
              <div className="flex h-[90vh] sm:h-full w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4">
                  <div className="min-w-0 pr-4">
                    <h3 className="text-base sm:text-lg font-bold text-[#12365c] truncate">{docName(previewDoc)}</h3>
                    <p className="text-xs font-medium text-slate-500 truncate">
                      {formatBytes(previewDoc.fileSize)} • {previewDoc.documentType}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                    <button
                      onClick={async () => {
                        setToast({ type: "success", message: "Download started..." });
                        await downloadDocumentFile(docId(previewDoc), docName(previewDoc));
                      }}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 sm:px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200"
                    >
                      <Download className="size-4" /> <span className="hidden sm:inline">Download</span>
                    </button>
                    <button 
                      onClick={closePreview} 
                      className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    >
                      <X className="size-5 sm:size-6" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-1 items-center justify-center bg-slate-100 overflow-hidden relative">
                  {previewLoading ? (
                    <div className="flex flex-col items-center text-[#2674b9]">
                      <Loader2 className="size-8 animate-spin" />
                      <p className="mt-3 text-sm font-medium text-slate-500">Loading preview...</p>
                    </div>
                  ) : previewUrl ? (
                    previewDoc.documentType?.includes("image") ? (
                      <img 
                        src={previewUrl} 
                        alt={docName(previewDoc)} 
                        className="max-h-full max-w-full object-contain p-2 sm:p-4" 
                      />
                    ) : previewDoc.documentType?.includes("pdf") ? (
                      <iframe 
                        src={`${previewUrl}#toolbar=0`} 
                        className="h-full w-full border-none"
                        title={docName(previewDoc)}
                      />
                    ) : (
                      <p className="text-slate-500">Preview not available for this file type.</p>
                    )
                  ) : (
                    <p className="text-red-500">Failed to load preview.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SHADCN-STYLE DELETE CONFIRMATION DIALOG */}
          {deleteConfirmDoc && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
                <h3 className="text-lg font-semibold text-slate-900">
                  Are you absolutely sure?
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  This action cannot be undone. This will permanently delete 
                  <span className="font-bold text-slate-700"> {docName(deleteConfirmDoc)}</span>.
                </p>
                <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
                  <button 
                    onClick={() => setDeleteConfirmDoc(null)} 
                    disabled={isDeletingDoc}
                    className="inline-flex justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmDeleteDocument} 
                    disabled={isDeletingDoc} 
                    className="inline-flex justify-center items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {isDeletingDoc && <Loader2 className="size-4 animate-spin" />}
                    Delete Document
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