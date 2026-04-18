import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { HiOutlineCloudUpload, HiOutlineDocumentText, HiOutlineX, HiOutlineRefresh } from 'react-icons/hi';
import { motion } from 'framer-motion';
import { uploadResume } from '../services/api';

/**
 * UploadResume — Drag-and-drop PDF/DOC/DOCX upload with parsing.
 * @param {{ onUploadComplete: (rawText: string, file: File | null) => void }} props
 */
export default function UploadResume({ onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | selected | uploading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  // ── Dropzone handler ──
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      setErrorMsg('Only PDF, DOC, and DOCX files are accepted.');
      setStatus('error');
      setFile(null);
      return;
    }
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setStatus('selected');
      setErrorMsg('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    multiple: false,
  });

  // ── Format file size ──
  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  // ── File extension badge ──
  const getFileExt = (name) => name?.split('.').pop().toUpperCase() || '';

  // ── Upload handler ──
  const handleUpload = async () => {
    if (!file) return;
    setStatus('uploading');
    setErrorMsg('');

    try {
      const data = await uploadResume(file);
      setStatus('success');
      onUploadComplete(data.raw_text, file);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.friendlyMessage || 'Failed to parse resume. Please try again.');
    }
  };

  // ── Remove file ──
  const handleRemove = () => {
    setFile(null);
    setStatus('idle');
    setErrorMsg('');
    onUploadComplete('', null);
  };

  // ── Retry ──
  const handleRetry = () => {
    setStatus('selected');
    setErrorMsg('');
  };

  // ── Determine dropzone classes ──
  const dropzoneClass = isDragReject
    ? 'dropzone-reject'
    : isDragActive
    ? 'dropzone-active'
    : 'dropzone-idle';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
      className="glass-card-premium p-6 sm:p-8" 
      id="upload-section"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
          <HiOutlineDocumentText className="w-5 h-5 text-brand-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Upload Resume</h2>
          <p className="text-sm text-slate-400">PDF, DOC & DOCX supported</p>
        </div>
      </div>

      {/* ── Idle / Drag State ── */}
      {(status === 'idle' || status === 'error') && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* Dropzone — takes 3 cols */}
            <div className="md:col-span-3">
              <div
                {...getRootProps()}
                className={`${dropzoneClass} rounded-xl p-10 text-center cursor-pointer transition-all duration-300 h-full flex items-center justify-center`}
                id="dropzone"
              >
                <input {...getInputProps()} id="file-input" />
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-brand-50 flex items-center justify-center">
                    <HiOutlineCloudUpload className={`w-10 h-10 text-brand-500 ${isDragActive ? 'animate-bounce-soft' : ''}`} />
                  </div>
                  <div>
                    <p className="text-slate-800 font-semibold text-lg">
                      {isDragActive ? 'Drop your resume here…' : 'Drag & drop your resume'}
                    </p>
                    <p className="text-sm text-slate-400 mt-1.5">
                      or <span className="text-brand-600 underline underline-offset-2 cursor-pointer hover:text-brand-700 transition-colors">click to browse</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                    <span className="text-xs text-slate-400">PDF, DOC, DOCX up to 10 MB</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Info panel — takes 2 cols */}
            <div className="md:col-span-2 flex flex-col justify-center gap-4">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Smart Parsing</p>
                    <p className="text-xs text-slate-400 mt-0.5">Extracts text, skills, and experience from your resume automatically</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">100% Private</p>
                    <p className="text-xs text-slate-400 mt-0.5">Your data is processed securely and never stored permanently</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Instant Results</p>
                    <p className="text-xs text-slate-400 mt-0.5">Get your tailored resume in under 30 seconds</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error message */}
          {status === 'error' && errorMsg && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200/60 animate-scale-in" id="upload-error">
              <p className="text-red-600 text-sm">{errorMsg}</p>
              {file && (
                <button
                  onClick={handleRetry}
                  className="mt-2 flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors"
                  id="retry-btn"
                >
                  <HiOutlineRefresh className="w-4 h-4" />
                  Try again
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* ── File Selected ── */}
      {status === 'selected' && file && (
        <div className="animate-scale-in">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-brand-50/60 border border-brand-200/40" id="file-preview">
            {/* File Icon with type badge */}
            <div className="relative w-12 h-12 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
              <HiOutlineDocumentText className="w-6 h-6 text-brand-600" />
              <span className="absolute -bottom-1 -right-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-brand-600 text-white leading-none">
                {getFileExt(file.name)}
              </span>
            </div>
            {/* File Info */}
            <div className="flex-1 min-w-0">
              <p className="text-slate-800 font-medium truncate">{file.name}</p>
              <p className="text-sm text-slate-400">{formatSize(file.size)}</p>
            </div>
            {/* Remove */}
            <button
              onClick={handleRemove}
              className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-red-50 transition-colors"
              id="remove-file-btn"
            >
              <HiOutlineX className="w-4 h-4 text-slate-400 hover:text-red-500" />
            </button>
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            className="mt-4 w-full py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-brand-600/15"
            id="confirm-upload-btn"
          >
            Parse Resume
          </button>
        </div>
      )}

      {/* ── Uploading State ── */}
      {status === 'uploading' && (
        <div className="flex flex-col items-center gap-4 py-8 animate-fade-in" id="upload-spinner">
          <div className="spinner"></div>
          <div className="text-center">
            <p className="text-slate-800 font-medium">Parsing your resume…</p>
            <p className="text-sm text-slate-400 mt-1">Extracting text from document</p>
          </div>
        </div>
      )}

      {/* ── Success State ── */}
      {status === 'success' && (
        <div className="flex flex-col items-center gap-4 py-6 animate-fade-in" id="upload-success">
          <div className="checkmark-circle">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-slate-800 font-medium">Resume parsed successfully!</p>
            <p className="text-sm text-slate-400 mt-1">{file?.name}</p>
          </div>
          <button
            onClick={handleRemove}
            className="text-sm text-brand-600 hover:text-brand-700 underline underline-offset-2 transition-colors"
            id="upload-another-btn"
          >
            Upload a different resume
          </button>
        </div>
      )}
    </motion.div>
  );
}
