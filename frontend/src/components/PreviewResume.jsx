import { useState, useMemo, useEffect } from 'react';
import { HiOutlineDocumentText, HiOutlineSparkles, HiOutlineEye, HiOutlineCode, HiOutlineSwitchHorizontal } from 'react-icons/hi';

/**
 * Parse resume plain text into structured sections for display.
 * Converts raw AI output into formatted HTML-like React elements.
 */
function parseResumeText(text, keywords = [], showHighlights = false) {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];
  let i = 0;

  const sectionKeywords = [
    'summary', 'skills', 'experience', 'projects', 'education',
    'profile', 'work experience', 'contact', 'languages',
    'achievements', 'internship', 'certifications', 'objective',
    'certifications & achievements', 'professional summary',
    'technical skills', 'references', 'declaration',
  ];

  const isSection = (line) => {
    const clean = line.trim().toLowerCase().replace(/:$/, '');
    return (
      sectionKeywords.includes(clean) ||
      (line.trim() === line.trim().toUpperCase() && line.trim().length > 2 && line.trim().length < 40 && /[A-Z]/.test(line))
    );
  };

  const renderHighlighted = (text, key) => {
    if (!showHighlights || !keywords || keywords.length === 0) {
      return <span key={key}>{text}</span>;
    }
    const sorted = [...keywords].sort((a, b) => b.length - a.length);
    const escaped = sorted.map((kw) => kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, j) => {
      const isKw = keywords.some((kw) => kw.toLowerCase() === part.toLowerCase());
      if (isKw) return <mark key={`${key}-${j}`} className="keyword-highlight" title={`JD Keyword: ${part}`}>{part}</mark>;
      return <span key={`${key}-${j}`}>{part}</span>;
    });
  };

  // Detect name (first non-empty line)
  let nameFound = false;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) {
      i++;
      continue;
    }

    // Name (first substantial line, usually the candidate name)
    if (!nameFound && trimmed.length > 1 && !isSection(trimmed) && !trimmed.startsWith('-') && !trimmed.startsWith('•')) {
      // Check if this looks like a name (typically short, no special chars except spaces)
      const looksLikeName = trimmed.length < 50 && !/[:@|]/.test(trimmed) && !/\d{4}/.test(trimmed);
      if (looksLikeName) {
        elements.push(
          <h1 key={`name-${i}`} className="text-2xl font-bold text-slate-900 text-center mb-1 tracking-tight">
            {trimmed}
          </h1>
        );
        nameFound = true;
        i++;
        // Collect contact info lines
        const contactLines = [];
        while (i < lines.length) {
          const cl = lines[i].trim();
          if (!cl) { i++; continue; }
          const isContact = /@|phone|\+91|linkedin|github|http|\.com|\.in/.test(cl.toLowerCase()) ||
            /^\d{3,}/.test(cl) ||
            /^\(?\+?\d/.test(cl) ||
            (cl.includes(',') && cl.length < 80 && !isSection(cl));
          if (isContact) {
            contactLines.push(cl);
            i++;
          } else {
            break;
          }
        }
        if (contactLines.length > 0) {
          elements.push(
            <p key={`contact-${i}`} className="text-xs text-slate-500 text-center mb-4 leading-relaxed">
              {contactLines.join(' | ')}
            </p>
          );
        }
        elements.push(<hr key={`hr-top-${i}`} className="border-slate-300 mb-4" />);
        continue;
      }
    }

    nameFound = true; // past the header area

    // Section heading
    if (isSection(trimmed)) {
      elements.push(
        <div key={`section-${i}`} className="mt-5 mb-2">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">
            {trimmed.replace(/:$/, '')}
          </h2>
          <hr className="border-slate-300 mt-1" />
        </div>
      );
      i++;
      continue;
    }

    // Bullet point
    if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*')) {
      const bulletText = trimmed.replace(/^[-•*]\s*/, '');
      elements.push(
        <div key={`bullet-${i}`} className="flex items-start gap-2 ml-2 mb-1">
          <span className="text-brand-500 mt-1 text-xs flex-shrink-0">•</span>
          <p className="text-[13px] text-slate-700 leading-relaxed">
            {renderHighlighted(bulletText, `btext-${i}`)}
          </p>
        </div>
      );
      i++;
      continue;
    }

    // Experience/Project heading with date (lines containing | and date patterns)
    if (trimmed.includes('|') && (
      /\d{4}/.test(trimmed) || /present/i.test(trimmed) || /week|month/i.test(trimmed)
    )) {
      const parts = trimmed.split('|').map(p => p.trim());
      elements.push(
        <div key={`exp-${i}`} className="flex items-baseline justify-between gap-2 mt-3 mb-1">
          <p className="text-sm font-semibold text-slate-800">
            {renderHighlighted(parts.slice(0, -1).join(' | '), `expleft-${i}`)}
          </p>
          <span className="text-xs text-slate-400 italic whitespace-nowrap flex-shrink-0">
            {parts[parts.length - 1]}
          </span>
        </div>
      );
      i++;
      continue;
    }

    // Skill/label line (e.g., "Languages: Java, Python, SQL")
    if (trimmed.includes(':') && trimmed.indexOf(':') < 25 && !trimmed.startsWith('http')) {
      const colonIdx = trimmed.indexOf(':');
      const label = trimmed.substring(0, colonIdx).trim();
      const value = trimmed.substring(colonIdx + 1).trim();
      elements.push(
        <p key={`label-${i}`} className="text-[13px] text-slate-700 mb-1 ml-1 leading-relaxed">
          <span className="font-semibold text-slate-800">{label}:</span>{' '}
          {renderHighlighted(value, `lvalue-${i}`)}
        </p>
      );
      i++;
      continue;
    }

    // Regular text paragraph
    elements.push(
      <p key={`text-${i}`} className="text-[13px] text-slate-700 mb-1 leading-relaxed">
        {renderHighlighted(trimmed, `para-${i}`)}
      </p>
    );
    i++;
  }

  return elements;
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

function TailoredResumePanel({ title, text, keywords, showHighlights = false }) {
  const parsed = useMemo(
    () => parseResumeText(text, keywords, showHighlights),
    [text, keywords, showHighlights]
  );

  return (
    <div className="flex flex-col rounded-xl border border-green-200/60 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-brand-500/5">
      <div className="flex items-center gap-2.5 px-4 py-3 bg-green-50/60 border-b border-green-200/60">
        <div className="w-7 h-7 rounded-md bg-green-100/60 flex items-center justify-center">
          <HiOutlineSparkles className="w-4 h-4 text-green-600" />
        </div>
        <span className="text-sm font-semibold text-green-700">{title}</span>
        {showHighlights && keywords?.length > 0 && (
          <span className="ml-auto inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-200/60">
            <HiOutlineSparkles className="w-3 h-3" />
            {keywords.length} keywords matched
          </span>
        )}
      </div>
      <div className="flex-1 p-5 overflow-y-auto max-h-[600px] scrollbar-thin bg-white">
        {parsed || (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <HiOutlineSparkles className="w-10 h-10 text-slate-200" />
            <p className="text-slate-500 text-sm font-medium">Tailored resume preview</p>
            <p className="text-slate-400 text-xs">Your optimized resume will appear here</p>
          </div>
        )}
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
          <TailoredResumePanel
            title="Tailored Resume"
            text={tailoredText}
            keywords={jdKeywords}
            showHighlights={showHighlights}
          />
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
