import { useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AlertCircle, CheckCircle2, File, FileImage, FileText, FolderUp, Loader2, UploadCloud, X } from 'lucide-react'
import WorkspaceLayout from '../components/WorkspaceLayout'
import { uploadDocuments } from '../features/auth/authSlice' // Updated thunk name

const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

const ACCEPTED_EXTENSIONS = '.pdf,.jpg,.jpeg,.png,.docx'

function formatFileSize(bytes) {
  if (!bytes) return '0 Bytes'
  const units = ['Bytes', 'KB', 'MB', 'GB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`
}

function getFileIcon(type = '') {
  if (type.startsWith('image/')) return FileImage
  if (type === 'application/pdf') return FileText
  return File
}

export default function DocumentUpload() {
  const dispatch = useDispatch()
  const { loading: isUploading } = useSelector((state) => state.auth)

  const fileInputRef = useRef(null)
  const folderInputRef = useRef(null)

  const [selectedFiles, setSelectedFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [responseMessage, setResponseMessage] = useState(null)

  const addFiles = (newFilesList) => {
    setResponseMessage(null)
    if (!newFilesList || newFilesList.length === 0) return

    const incoming = Array.from(newFilesList)
    const validFiles = []
    const invalidNames = []

    incoming.forEach((file) => {
      // Directories or zero-byte files can be skipped
      if (file.size === 0 && !file.type) return

      if (ALLOWED_TYPES.includes(file.type)) {
        validFiles.push(file)
      } else {
        invalidNames.push(file.name)
      }
    })

    if (invalidNames.length > 0) {
      setResponseMessage({
        type: 'error',
        message: `${invalidNames.length} file(s) skipped due to unsupported formats. Only PDF, JPG, PNG, and DOCX are allowed.`,
      })
    }

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => {
        // Prevent duplicate entries by name and size
        const existingKeys = new Set(prev.map((f) => `${f.name}-${f.size}`))
        const deduped = validFiles.filter((f) => !existingKeys.has(`${f.name}-${f.size}`))
        return [...prev, ...deduped]
      })
    }
  }

  const removeFile = (indexToRemove) => {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove))
    if (selectedFiles.length <= 1) {
      resetInputs()
    }
  }

  const resetInputs = () => {
    setSelectedFiles([])
    setResponseMessage(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (folderInputRef.current) folderInputRef.current.value = ''
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)
    if (event.dataTransfer.files) {
      addFiles(event.dataTransfer.files)
    }
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || isUploading) return

    setResponseMessage(null)
    const resultAction = await dispatch(uploadDocuments(selectedFiles))

    if (uploadDocuments.fulfilled.match(resultAction)) {
      const results = resultAction.payload || []
      const failedCount = results.filter((r) => r.message?.toLowerCase().includes('failed') || r.message?.toLowerCase().includes('error')).length
      const successCount = results.length - failedCount

      setResponseMessage({
        type: failedCount === 0 ? 'success' : 'mixed',
        message: `${successCount} file(s) stored successfully.${failedCount > 0 ? ` ${failedCount} file(s) failed.` : ''}`,
        results,
      })
      resetInputs()
    } else {
      setResponseMessage({
        type: 'error',
        message: typeof resultAction.payload === 'string' ? resultAction.payload : 'Failed to complete batch upload.',
      })
    }
  }

  const totalSize = selectedFiles.reduce((acc, curr) => acc + curr.size, 0)

  return (
    <WorkspaceLayout title="Upload documents">
      <main className="min-h-[calc(100vh-72px)] bg-[#f8fbff] px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 max-w-2xl">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-[#f07828]">Document center</p>
            <h1 className="text-3xl font-bold tracking-tight text-[#12365c] sm:text-4xl">Share documents with your organization</h1>
            <p className="mt-3 text-base leading-7 text-slate-500">
              Upload single files, multiple files, or entire folders securely.
            </p>
          </div>

          <section className="rounded-[28px] border border-[#dbe8f3] bg-white p-5 shadow-[0_20px_60px_rgba(18,54,92,0.08)] sm:p-8">
            {/* Drop Zone */}
            <div
              onDragOver={(event) => {
                event.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`flex min-h-[260px] flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 text-center transition ${
                isDragging ? 'border-[#f07828] bg-[#fff6ee]' : 'border-[#b9d3e8] bg-[#f8fbff]'
              }`}
            >
              <div className="flex size-16 items-center justify-center rounded-2xl bg-[#e7f2fb] text-[#2674b9]">
                <UploadCloud className="size-8" />
              </div>

              <h2 className="mt-5 text-lg font-bold text-[#12365c]">Drag and drop your files or folder here</h2>
              <p className="mt-2 text-sm text-slate-500">Choose an upload mode:</p>

              {/* Action Buttons for Files vs Folder */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl border border-[#2674b9] bg-white px-4 py-2 text-sm font-semibold text-[#2674b9] shadow-sm hover:bg-[#f0f7fc]"
                >
                  Browse Files
                </button>
                <button
                  type="button"
                  onClick={() => folderInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  <FolderUp className="size-4 text-[#f07828]" />
                  Upload Folder
                </button>
              </div>

              <p className="mt-4 text-xs font-medium text-slate-400">Supported formats: PDF, JPG, PNG, DOCX</p>

              {/* Standard Multiple Files Input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ACCEPTED_EXTENSIONS}
                className="sr-only"
                onChange={(e) => addFiles(e.target.files)}
              />

              {/* Folder Selector Input */}
              <input
                ref={folderInputRef}
                type="file"
                multiple
                webkitdirectory=""
                directory=""
                className="sr-only"
                onChange={(e) => addFiles(e.target.files)}
              />
            </div>

            {/* Selected Files List & Summary */}
            {selectedFiles.length > 0 && (
              <div className="mt-6">
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="font-semibold text-[#12365c]">
                    Selected ({selectedFiles.length} {selectedFiles.length === 1 ? 'file' : 'files'})
                  </span>
                  <span className="font-medium text-slate-500">Total size: {formatFileSize(totalSize)}</span>
                </div>

                <div className="max-h-64 space-y-2.5 overflow-y-auto pr-1">
                  {selectedFiles.map((file, idx) => {
                    const FileIcon = getFileIcon(file.type)
                    return (
                      <div
                        key={`${file.name}-${idx}`}
                        className="flex items-center gap-3 rounded-xl border border-[#dbe8f3] bg-[#f8fbff] p-3 text-left"
                      >
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#e7f2fb] text-[#2674b9]">
                          <FileIcon className="size-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-[#12365c]">{file.webkitRelativePath || file.name}</p>
                          <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
                        </div>
                        <button
                          type="button"
                          aria-label="Remove file"
                          onClick={() => removeFile(idx)}
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white hover:text-red-500"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Status Notifications */}
            {responseMessage && (
              <div
                className={`mt-5 flex items-start gap-3 rounded-2xl border p-4 text-sm ${
                  responseMessage.type === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : responseMessage.type === 'mixed'
                    ? 'border-amber-200 bg-amber-50 text-amber-800'
                    : 'border-red-200 bg-red-50 text-red-700'
                }`}
                role="status"
              >
                {responseMessage.type === 'success' ? (
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
                ) : (
                  <AlertCircle className="mt-0.5 size-5 shrink-0" />
                )}
                <div>
                  <p className="font-semibold">{responseMessage.message}</p>
                  {responseMessage.results && (
                    <div className="mt-2 max-h-32 space-y-1 overflow-y-auto text-xs opacity-90">
                      {responseMessage.results.map((res, i) => (
                        <p key={i} className="truncate">
                          • {res.fileName}: {res.message}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions Bar */}
            <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[#e6eef5] pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={resetInputs}
                className="rounded-xl px-5 py-3 text-sm font-bold text-slate-500 transition hover:bg-slate-50"
              >
                Clear all
              </button>
              <button
                type="button"
                disabled={selectedFiles.length === 0 || isUploading}
                onClick={handleUpload}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#f07828] px-6 py-3 text-sm font-bold text-white shadow-[0_8px_18px_rgba(240,120,40,0.22)] transition hover:bg-[#db641b] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUploading && <Loader2 className="size-4 animate-spin" />}
                {isUploading ? 'Uploading...' : `Upload (${selectedFiles.length})`}
              </button>
            </div>
          </section>
        </div>
      </main>
    </WorkspaceLayout>
  )
}