import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uploadDocument, clearUploadState, checkDocumentServiceStatus } from '../features/documents/documentsSlice';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import {
  Upload,
  FileText,
  Image,
  File,
  CheckCircle2,
  XCircle,
  Loader2,
  CloudUpload,
  Info,
  HardDrive,
} from 'lucide-react';
import { cn } from '../lib/utils';

const ALLOWED_TYPES = {
  'application/pdf': { icon: FileText, label: 'PDF', color: 'text-red-400' },
  'image/jpeg': { icon: Image, label: 'JPEG', color: 'text-blue-400' },
  'image/png': { icon: Image, label: 'PNG', color: 'text-green-400' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    icon: File, label: 'DOCX', color: 'text-indigo-400',
  },
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function DocumentsPage() {
  const dispatch = useDispatch();
  const { serviceStatus, statusLoading, uploadLoading, uploadedFile, uploadError, uploadSuccess } =
    useSelector((state) => state.documents);

  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef();

  useEffect(() => {
    dispatch(checkDocumentServiceStatus());
    return () => dispatch(clearUploadState());
  }, [dispatch]);

  const validateFile = (file) => {
    if (!ALLOWED_TYPES[file.type]) {
      setFileError('Invalid file type. Only PDF, JPEG, PNG, and DOCX are allowed.');
      return false;
    }
    if (file.size > 15 * 1024 * 1024) {
      setFileError('File exceeds 15 MB limit.');
      return false;
    }
    setFileError('');
    return true;
  };

  const handleFileSelect = (file) => {
    if (file && validateFile(file)) {
      setSelectedFile(file);
      dispatch(clearUploadState());
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFileSelect(file);
  };

  const handleUpload = () => {
    if (selectedFile) {
      dispatch(uploadDocument(selectedFile)).then(() => {
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      });
    }
  };

  const FileIcon = selectedFile ? (ALLOWED_TYPES[selectedFile.type]?.icon || File) : CloudUpload;
  const fileColor = selectedFile ? (ALLOWED_TYPES[selectedFile.type]?.color || 'text-primary') : 'text-muted-foreground';

  return (
    <Layout title="Documents">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Service status banner */}
        <div className="glass rounded-xl border border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HardDrive className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">Document Service</p>
              <p className="text-xs text-muted-foreground">Storage backend health status</p>
            </div>
          </div>
          {statusLoading ? (
            <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
          ) : serviceStatus && serviceStatus !== 'error' ? (
            <Badge variant="success">● Online</Badge>
          ) : (
            <Badge variant="destructive">● Offline</Badge>
          )}
        </div>

        {/* Upload area */}
        <div className="glass rounded-2xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-1">Upload Document</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Accepted formats: PDF, JPEG, PNG, DOCX · Max size: 15 MB
          </p>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200",
              dragOver
                ? "border-primary bg-primary/10"
                : selectedFile
                ? "border-emerald-500/50 bg-emerald-500/5"
                : "border-border hover:border-primary/50 hover:bg-primary/5"
            )}
            id="file-dropzone"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.docx"
              onChange={handleInputChange}
              className="hidden"
              id="file-input"
            />

            <div className="flex flex-col items-center gap-3">
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center transition-all",
                selectedFile ? "bg-emerald-500/15" : "bg-primary/10"
              )}>
                <FileIcon className={cn("w-8 h-8 transition-all", selectedFile ? "text-emerald-400" : fileColor)} />
              </div>

              {selectedFile ? (
                <>
                  <p className="font-medium text-foreground">{selectedFile.name}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <Badge variant="outline">{ALLOWED_TYPES[selectedFile.type]?.label}</Badge>
                    <span>{formatBytes(selectedFile.size)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Click to change file</p>
                </>
              ) : (
                <>
                  <p className="font-medium text-foreground">
                    {dragOver ? 'Drop your file here' : 'Drag & drop a file or click to browse'}
                  </p>
                  <p className="text-xs text-muted-foreground">PDF, JPEG, PNG, DOCX up to 15MB</p>
                </>
              )}
            </div>
          </div>

          {/* File validation error */}
          {fileError && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{fileError}</AlertDescription>
            </Alert>
          )}

          {/* Upload button */}
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploadLoading}
            size="lg"
            className="w-full mt-4"
            id="upload-btn"
          >
            {uploadLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload Document
              </>
            )}
          </Button>
        </div>

        {/* Upload result */}
        {uploadSuccess && uploadedFile && (
          <Alert variant="success" className="animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <AlertTitle>Upload Successful!</AlertTitle>
            <AlertDescription>
              <div className="mt-2 space-y-1 text-xs">
                <p><span className="text-muted-foreground">File:</span> {uploadedFile.originalFileName}</p>
                <p><span className="text-muted-foreground">Type:</span> {uploadedFile.fileType}</p>
                <p><span className="text-muted-foreground">Size:</span> {formatBytes(uploadedFile.sizeInBytes)}</p>
                <p><span className="text-muted-foreground">Path:</span> <code className="bg-black/20 px-1 rounded">{uploadedFile.storagePath}</code></p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {uploadError && (
          <Alert variant="destructive" className="animate-fade-in">
            <XCircle className="w-4 h-4" />
            <AlertTitle>Upload Failed</AlertTitle>
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        )}

        {/* Info panel */}
        <div className="glass rounded-xl border border-border p-5">
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Documents are stored securely on the server under <code className="bg-secondary/50 px-1 rounded text-xs">uploads/docflow-files/</code></p>
              <p>Each upload is protected by JWT authentication and CSRF token validation.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
