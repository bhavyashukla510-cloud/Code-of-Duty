import { useState, useMemo, useEffect } from 'react';
import { HiOutlineDocumentText, HiOutlineSparkles, HiOutlineEye, HiOutlineCode, HiOutlineSwitchHorizontal } from 'react-icons/hi';

function highlightKeywords(text, keywords) {
  if (!keywords || keywords.length === 0 || !text) return <span>{text}</span>;
  const sorted = [...keywords].sort((a, b) => b.length - a.length);
  const escaped = sorted.map((kw) => kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) => {
    const isKeyword = keywords.some((kw) => kw.toLowerCase() === part.toLowerCase());
    if (isKeyword) return <mark key={i} className="keyword-highlight" title={`JD Keyword: ${part}`}>{part}</mark>;
    return <span key={i}>{part}</span>;
  });
}

function OriginalFileViewer({ resumeFile, fileType }) {
  const [fileUrl, setFileUrl] = useState('');
  const [docxHtml, setDocxHtml] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (resumeFile && fileType === 'pdf') {
      const url = URL.createObjectURL(resumeFile);
      setFileUrl(url);
      return () => URL.revokeObjectURL(url);
    } else { setFileUrl(''); }
  }, [resumeFile, fileType]);

  useEffect(() => {
    if (resumeFile && fileType === 'docx') {
      setLoading(true);
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const mammoth = await import('mammoth');
          const result = await mammoth.convertToHtml({ arrayBuffer: e.target.result });
          setDocxHtml(result.value);
        } catch (err) { console.error('[PreviewResume] DOCX conversion error:', err); }
        setLoading(false);
      };
      reader.readAsArrayBuffer(resumeFile);
    }
  }, [resumeFile, fileType]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 animate-fade-in">
      <div className="spinner"></div>
      <p className="text-slate-400 text-sm">Rendering document…</p>
    </div>
  );

  if (fileType === 'pdf' && fileUrl) return (
    <iframe src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`} className="w-full h-full border-0 bg-white" style={{ minHeight: '100%' }} title="Original Resume PDF" />
  );

  if (fileType === 'docx' && docxHtml) return (
    <div className="docx-preview text-sm leading-relaxed text-slate-700 px-2" dangerouslySetInnerHTML={{ __html: docxHtml }} />
  );

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <HiOutlineDocumentText className="w-12 h-12 text-slate-300" />
      <p className="text-slate-600 font-medium">{resumeFile?.name}</p>
      <p className="text-xs text-slate-400">Preview not available for .{fileType} files — the parsed text will be used for tailoring.</p>
    </div>
  );
}

function ResumePanel({ title, icon: Icon, text, keywords, variant = 'original', showHighlights = false }) {
  const borderColor = variant === 'original' ? 'border-slate-200' : 'border-green-200/60';
  const headerBg = variant === 'original' ? 'bg-slate-50' : 'bg-green-50/60';
  const headerText = variant === 'original' ? 'text-slate-600' : 'text-green-700';
  const iconBg = variant === 'original' ? 'bg-slate-100' : 'bg-green-100/60';
  const iconColor = variant === 'original' ? 'text-slate-500' : 'text-green-600';

  const content = useMemo(() => {
    if (showHighlights && variant === 'tailored' && keywords?.length > 0) return highlightKeywords(text, keywords);
    return <span>{text}</span>;
  }, [text, keywords, showHighlights, variant]);

  return (
    <div className={`flex flex-col rounded-xl border ${borderColor} overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-brand-500/5`}>
      <div className={`flex items-center gap-2.5 px-4 py-3 ${headerBg} border-b ${borderColor}`}>
        <div className={`w-7 h-7 rounded-md ${iconBg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <span className={`text-sm font-semibold ${headerText}`}>{title}</span>
        {variant === 'tailored' && showHighlights && keywords?.length > 0 && (
          <span className="ml-auto inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-200/60">
            <HiOutlineSparkles className="w-3 h-3" />
            {keywords.length} keywords matched
          </span>
        )}
      </div>
      <div className="flex-1 p-4 overflow-y-auto max-h-[550px] scrollbar-thin bg-white">
        <pre className="text-sm text-slate-600 whitespace-pre-wrap font-mono leading-relaxed tracking-wide" style={{ fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace" }}>
          {content}
        </pre>
      </div>
    </div>
  );
}

export default function PreviewResume({ originalText = '', tailoredText = '', jdKeywords = [], resumeFile = null }) {
  const [showHighlights, setShowHighlights] = useState(true);
  const [viewMode, setViewMode] = useState('split');
  const fileType = resumeFile ? resumeFile.name.split('.').pop().toLowerCase() : '';
  const hasFile = !!resumeFile;

  if (!originalText && !tailoredText && !hasFile) return null;

  return (
    <div className="glass-card p-6 lg:p-8 animate-slide-up" style={{ animationDelay: '0.15s' }} id="preview-resume">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
            <HiOutlineEye className="w-5 h-5 text-brand-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Resume Comparison</h2>
            <p className="text-sm text-slate-400">Side-by-side original vs tailored</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {jdKeywords.length > 0 && (
            <button
              onClick={() => setShowHighlights(!showHighlights)}
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all duration-300 ${
                showHighlights
                  ? 'bg-green-50 border-green-200/60 text-green-700 hover:bg-green-100/60'
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
              id="toggle-highlights-btn"
            >
              <HiOutlineSparkles className="w-3.5 h-3.5" />
              Highlights {showHighlights ? 'On' : 'Off'}
            </button>
          )}

          <div className="flex items-center rounded-lg border border-slate-200 overflow-hidden" id="view-mode-toggle">
            <button onClick={() => setViewMode('split')} className={`px-3 py-1.5 text-xs font-medium transition-all duration-200 ${viewMode === 'split' ? 'bg-brand-50 text-brand-700' : 'text-slate-400 hover:text-slate-600'}`}>
              <HiOutlineSwitchHorizontal className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setViewMode('original')} className={`px-3 py-1.5 text-xs font-medium transition-all duration-200 ${viewMode === 'original' ? 'bg-brand-50 text-brand-700' : 'text-slate-400 hover:text-slate-600'}`}>
              Original
            </button>
            <button onClick={() => setViewMode('tailored')} className={`px-3 py-1.5 text-xs font-medium transition-all duration-200 ${viewMode === 'tailored' ? 'bg-brand-50 text-brand-700' : 'text-slate-400 hover:text-slate-600'}`}>
              Tailored
            </button>
          </div>
        </div>
      </div>

      <div className={`grid gap-4 ${viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        {(viewMode === 'split' || viewMode === 'original') && (
          <div className="rounded-xl border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-brand-500/5">
            <div className="flex items-center gap-2.5 px-4 py-3 bg-slate-50 border-b border-slate-200">
              <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center">
                <HiOutlineDocumentText className="w-4 h-4 text-slate-500" />
              </div>
              <span className="text-sm font-semibold text-slate-600">Original Resume</span>
              {hasFile && (
                <span className="ml-auto inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 border border-brand-200/40">
                  {fileType.toUpperCase()}
                </span>
              )}
            </div>
            <div className="scrollbar-thin bg-white" style={hasFile ? { height: '600px', overflow: 'hidden' } : { maxHeight: '600px', overflowY: 'auto' }}>
              {hasFile ? (
                <OriginalFileViewer resumeFile={resumeFile} fileType={fileType} />
              ) : (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                  <HiOutlineDocumentText className="w-10 h-10 text-slate-200" />
                  <p className="text-slate-500 text-sm font-medium">Original resume preview</p>
                  <p className="text-slate-400 text-xs">Upload your resume to see it here</p>
                </div>
              )}
            </div>
          </div>
        )}

        {(viewMode === 'split' || viewMode === 'tailored') && (
          <ResumePanel title="Tailored Resume" icon={HiOutlineSparkles} text={tailoredText} keywords={jdKeywords} variant="tailored" showHighlights={showHighlights} />
        )}
      </div>

      {jdKeywords.length > 0 && showHighlights && (
        <div className="mt-6 p-4 rounded-lg bg-slate-50 border border-slate-200/60 animate-fade-in" id="keyword-legend">
          <div className="flex items-center gap-2 mb-3">
            <HiOutlineCode className="w-4 h-4 text-brand-500" />
            <p className="text-xs font-semibold text-slate-600">Matched JD Keywords</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {jdKeywords.map((keyword, i) => (
              <span key={i} className="inline-flex items-center px-2.5 py-1 text-[11px] font-medium rounded-md bg-brand-50 text-brand-700 border border-brand-200/40 hover:bg-brand-100/60 hover:border-brand-300/40 transition-all duration-200 cursor-default" style={{ animationDelay: `${i * 50}ms` }}>
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
