import { useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CheckCircle2, File, FileImage, FileText, Loader2, UploadCloud, X } from 'lucide-react'
import WorkspaceLayout from '../components/WorkspaceLayout'
import { uploadDocument } from '../features/auth/authSlice' // Adjust path to your slice

const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

const ACCEPTED_EXTENSIONS = '.pdf,.jpg,.jpeg,.png,.docx'

function formatFileSize(bytes) {
  if (!bytes) return '0 KB'
  const units = ['Bytes', 'KB', 'MB', 'GB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`
}

function getFileIcon(type) {
  if (type.startsWith('image/')) return FileImage
  if (type === 'application/pdf') return FileText
  return File
}

export default function DocumentUpload() {
  const dispatch = useDispatch()
  const { loading: isUploading, error: reduxError } = useSelector((state) => state.auth)

  const inputRef = useRef(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [responseMessage, setResponseMessage] = useState(null)

  const chooseFile = (file) => {
    setResponseMessage(null)
    if (!file) return
    if (!ALLOWED_TYPES.includes(file.type)) {
      setResponseMessage({ type: 'error', message: 'Unsupported file type. Upload a PDF, JPG, PNG, or DOCX file.' })
      setSelectedFile(null)
      return
    }
    setSelectedFile(file)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)
    chooseFile(event.dataTransfer.files?.[0])
  }

  const handleUpload = async () => {
    if (!selectedFile || isUploading) return

    setResponseMessage(null)
    const resultAction = await dispatch(uploadDocument(selectedFile))

    if (uploadDocument.fulfilled.match(resultAction)) {
      const data = resultAction.payload
      setResponseMessage({ type: 'success', message: data?.message || 'File stored successfully.', data })
      setSelectedFile(null)
      if (inputRef.current) inputRef.current.value = ''
    } else {
      setResponseMessage({ type: 'error', message: resultAction.payload || 'Unable to upload the file.' })
    }
  }

  const FileIcon = selectedFile ? getFileIcon(selectedFile.type) : File
  const displayError = responseMessage?.type === 'error' ? responseMessage.message : null

  return (
    <WorkspaceLayout title="Upload document">
      <main className="min-h-[calc(100vh-72px)] bg-[#f8fbff] px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 max-w-2xl">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-[#f07828]">Document center</p>
            <h1 className="text-3xl font-bold tracking-tight text-[#12365c] sm:text-4xl">Share a document with your organization</h1>
            <p className="mt-3 text-base leading-7 text-slate-500">Upload a document securely so your team can review and collaborate on the latest version.</p>
          </div>

          <section className="rounded-[28px] border border-[#dbe8f3] bg-white p-5 shadow-[0_20px_60px_rgba(18,54,92,0.08)] sm:p-8">
            <div
              role="button"
              tabIndex={0}
              aria-label="Choose a document to upload"
              onClick={() => inputRef.current?.click()}
              onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click() }}
              onDragOver={(event) => { event.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 text-center transition ${isDragging ? 'border-[#f07828] bg-[#fff6ee]' : 'border-[#b9d3e8] bg-[#f8fbff] hover:border-[#2674b9] hover:bg-[#f5faff]'}`}
            >
              <div className="flex size-16 items-center justify-center rounded-2xl bg-[#e7f2fb] text-[#2674b9]">
                <UploadCloud className="size-8" />
              </div>
              <h2 className="mt-5 text-lg font-bold text-[#12365c]">Drop your document here</h2>
              <p className="mt-2 text-sm text-slate-500">or <span className="font-bold text-[#2674b9]">browse from your computer</span></p>
              <p className="mt-4 text-xs font-medium text-slate-400">Supported formats: PDF, JPG, PNG, DOCX</p>
              <input ref={inputRef} type="file" accept={ACCEPTED_EXTENSIONS} className="sr-only" onChange={(event) => chooseFile(event.target.files?.[0])} />
            </div>

            {selectedFile && (
              <div className="mt-5 flex items-center gap-4 rounded-2xl border border-[#dbe8f3] bg-[#f8fbff] p-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#e7f2fb] text-[#2674b9]"><FileIcon className="size-6" /></div>
                <div className="min-w-0 flex-1"><p className="truncate font-semibold text-[#12365c]">{selectedFile.name}</p><p className="mt-1 text-sm text-slate-500">{formatFileSize(selectedFile.size)}</p></div>
                <button type="button" aria-label="Remove selected file" onClick={() => { setSelectedFile(null); setResponseMessage(null); if (inputRef.current) inputRef.current.value = '' }} className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-[#d45135]"><X className="size-5" /></button>
              </div>
            )}

            {responseMessage && (
              <div className={`mt-5 flex items-start gap-3 rounded-2xl border p-4 text-sm ${responseMessage.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-700'}`} role="status">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
                <p>{responseMessage.message}</p>
              </div>
            )}

            <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[#e6eef5] pt-6 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => { setSelectedFile(null); setResponseMessage(null); if (inputRef.current) inputRef.current.value = '' }} className="rounded-xl px-5 py-3 text-sm font-bold text-slate-500 transition hover:bg-slate-50">Clear</button>
              <button type="button" disabled={!selectedFile || isUploading} onClick={handleUpload} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#f07828] px-6 py-3 text-sm font-bold text-white shadow-[0_8px_18px_rgba(240,120,40,0.22)] transition hover:bg-[#db641b] disabled:cursor-not-allowed disabled:opacity-50">
                {isUploading && <Loader2 className="size-4 animate-spin" />}
                {isUploading ? 'Uploading...' : 'Upload document'}
              </button>
            </div>
          </section>
        </div>
      </main>
    </WorkspaceLayout>
  )
}