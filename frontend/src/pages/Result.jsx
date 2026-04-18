import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  HiOutlineArrowLeft,
  HiOutlineSparkles,
  HiOutlineDownload,
  HiOutlineRefresh,
  HiOutlineHome,
} from 'react-icons/hi';
import { motion } from 'framer-motion';
import useResumeStore from '../store/useResumeStore';
import ScoreDisplay from '../components/ScoreDisplay';
import PreviewResume from '../components/PreviewResume';
import ConfettiBurst from '../components/ConfettiBurst';
import { downloadPDF, getScore } from '../services/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: { duration: 0.3 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();

  // ── Zustand state ──
  const {
    result, setResult,
    tailoredText, resumeText,
    beforeScore, afterScore, improvement,
    jdKeywords, missingKeywords, jdData,
    resumeFile, report,
    resetAll,
  } = useResumeStore();

  // ── Local UI state ──
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isScoring, setIsScoring] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);

  // ── Hide confetti after animation ──
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  // ── Hydrate store from router state if arriving fresh ──
  useEffect(() => {
    const stateData = location.state;
    if (stateData?.result && !result) {
      setResult(stateData.result);
      // Also set resumeText and jdData if available
      if (stateData.resumeText) {
        useResumeStore.getState().setResumeText(stateData.resumeText);
      }
      if (stateData.jdData) {
        useResumeStore.getState().setJdData(stateData.jdData);
      }
    }
  }, [location.state, result, setResult]);

  // ── Redirect to home if no data ──
  useEffect(() => {
    const stateData = location.state;
    if (!result && !stateData?.result) {
      navigate('/', { replace: true });
    }
  }, [result, location.state, navigate]);

  // ── Auto-fetch score only if scores came back as 0 (fallback) ──
  useEffect(() => {
    const needsScore = result && beforeScore === 0 && afterScore === 0 && !isScoring;
    if (needsScore && resumeText && tailoredText && jdData?.jdText) {
      setIsScoring(true);
      getScore(resumeText, tailoredText, jdData.jdText)
        .then((scoreData) => {
          // Merge score data into the existing result
          setResult({ ...result, ...scoreData });
        })
        .catch((err) => {
          console.warn('[Result] Auto-score failed:', err);
        })
        .finally(() => setIsScoring(false));
    }
  }, [result, beforeScore, afterScore, resumeText, tailoredText, jdData, isScoring, setResult]);

  // ── Download handler ──
  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadSuccess(false);

    try {
      const blob = await downloadPDF(tailoredText || displayTailoredText, jdData?.jdText || '');
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tailored_resume${jdData?.companyName ? `_${jdData.companyName.replace(/\s+/g, '_')}` : ''}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setDownloadSuccess(true);

      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('[Result] Download failed:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // ── Start Over ──
  const handleStartOver = () => {
    resetAll();
    navigate('/', { replace: true });
  };

  if (!result && !location.state?.result) return null;

  const displayData = result || location.state?.result;
  const displayTailoredText = tailoredText || displayData?.tailored_text || displayData?.tailoredText || (typeof displayData === 'string' ? displayData : JSON.stringify(displayData, null, 2));

  return (
    <>
      {/* ── Confetti Celebration ── */}
      {showConfetti && <ConfettiBurst />}

      <motion.main 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8" 
        id="result-page"
      >

        {/* ── Top Bar ── */}
        <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-400 hover:text-brand-600 transition-all duration-300 group"
            id="back-btn"
          >
            <HiOutlineArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="text-sm font-medium">Back to Home</span>
          </button>

          <div className="flex items-center gap-3">
            {/* Start Over */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartOver}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 hover:border-brand-300 rounded-lg transition-all duration-300 shadow-sm"
              id="start-over-btn"
            >
              <HiOutlineRefresh className="w-4 h-4" />
              Start Over
            </motion.button>
          </div>
        </motion.div>

        {/* ── Hero Header ── */}
        <motion.div variants={itemVariants} className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-50 border border-green-200/60 text-green-700 text-sm font-medium mb-4"
          >
            <HiOutlineSparkles className="w-4 h-4" />
            Tailoring Complete
          </motion.div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-3 heading-display">
            Your <span className="gradient-text-animated">Tailored Resume</span>
          </h1>
          {(jdData?.companyName || jdData?.jobTitle) && (
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-slate-500 text-lg"
            >
              {jdData.companyName && (
                <>Optimized for <span className="text-brand-600 font-medium">{jdData.companyName}</span></>
              )}
              {jdData.companyName && jdData.jobTitle && ' — '}
              {jdData.jobTitle && (
                <span className="text-brand-500 font-medium">{jdData.jobTitle}</span>
              )}
            </motion.p>
          )}
        </motion.div>

        {/* ── Score Display ── */}
        <motion.div variants={itemVariants} className="mb-8">
          {isScoring ? (
            <div className="glass-card p-8 text-center" id="score-loading">
              <div className="spinner mx-auto mb-4"></div>
              <p className="text-slate-700 font-medium">Calculating match scores…</p>
              <p className="text-sm text-slate-400 mt-1">Analyzing keyword matches</p>
            </div>
          ) : (
            <ScoreDisplay
              beforeScore={beforeScore}
              afterScore={afterScore}
              improvement={improvement}
            />
          )}
        </motion.div>

        {/* ── Resume Preview ── */}
        <motion.div variants={itemVariants} className="mb-8">
          <PreviewResume
            originalText={resumeText}
            tailoredText={displayTailoredText}
            jdKeywords={jdKeywords}
            resumeFile={resumeFile}
          />
        </motion.div>

        {/* ── Analysis Report ── */}
        {(report || missingKeywords?.length > 0) && (
          <motion.div variants={itemVariants} className="mb-8">
            <div className="glass-card p-6 lg:p-8" id="analysis-report">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Analysis Report</h2>
                  <p className="text-sm text-slate-400">Keyword coverage & optimization insights</p>
                </div>
                {report?.keyword_match_rate && (
                  <span className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-sm font-semibold border border-brand-200/40">
                    {report.keyword_match_rate} match
                  </span>
                )}
              </div>

              {/* Stats Row */}
              {report && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  <div className="bg-green-50/60 rounded-lg p-3 text-center border border-green-100/60">
                    <p className="text-2xl font-bold text-green-600">{report.matched_count}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Matched</p>
                  </div>
                  <div className="bg-red-50/60 rounded-lg p-3 text-center border border-red-100/60">
                    <p className="text-2xl font-bold text-red-500">{report.missing_count}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Missing</p>
                  </div>
                  <div className="bg-blue-50/60 rounded-lg p-3 text-center border border-blue-100/60">
                    <p className="text-2xl font-bold text-blue-600">{report.total_jd_keywords}</p>
                    <p className="text-xs text-slate-500 mt-0.5">JD Keywords</p>
                  </div>
                  <div className="bg-brand-50/60 rounded-lg p-3 text-center border border-brand-100/60">
                    <p className="text-2xl font-bold text-brand-600">{report.present_sections?.length || 0}/5</p>
                    <p className="text-xs text-slate-500 mt-0.5">Sections</p>
                  </div>
                </div>
              )}

              {/* Missing Keywords */}
              {missingKeywords?.length > 0 && (
                <div className="mb-5">
                  <p className="text-sm font-semibold text-red-600 mb-2 flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Missing Keywords ({missingKeywords.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {missingKeywords.map((kw, i) => (
                      <span key={i} className="inline-flex items-center px-2.5 py-1 text-[11px] font-medium rounded-md bg-red-50 text-red-600 border border-red-200/40">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Sections */}
              {report?.missing_sections?.length > 0 && (
                <div className="mb-5">
                  <p className="text-sm font-semibold text-amber-600 mb-2 flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Missing Sections
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {report.missing_sections.map((sec, i) => (
                      <span key={i} className="inline-flex items-center px-2.5 py-1 text-[11px] font-medium rounded-md bg-amber-50 text-amber-700 border border-amber-200/40 capitalize">
                        {sec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {report?.suggestions?.length > 0 && (
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200/60">
                  <p className="text-sm font-semibold text-slate-700 mb-2">💡 Suggestions</p>
                  <ul className="space-y-1.5">
                    {report.suggestions.map((suggestion, i) => (
                      <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                        <span className="text-brand-500 mt-0.5">•</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Action Buttons ── */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4" id="result-actions">
          {/* Download Button */}
          <motion.button
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownload}
            disabled={isDownloading}
            className={`btn-cta btn-magnetic flex items-center gap-3 ${
              downloadSuccess
                ? '!bg-gradient-to-r !from-green-600 !to-emerald-500'
                : ''
            }`}
            id="download-pdf-btn"
          >
            {isDownloading ? (
              <>
                <div className="spinner-sm border-white/30 border-t-white"></div>
                Preparing PDF…
              </>
            ) : downloadSuccess ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Downloaded!
              </>
            ) : (
              <>
                <HiOutlineDownload className="w-5 h-5" />
                Download Tailored Resume
              </>
            )}
          </motion.button>

          {/* Start Over Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStartOver}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 hover:border-brand-300 rounded-full transition-all duration-300 shadow-sm hover:shadow-md"
            id="start-over-btn-bottom"
          >
            <HiOutlineHome className="w-5 h-5" />
            Tailor Another Resume
          </motion.button>
        </motion.div>

        {/* ── Bottom spacer ── */}
        <div className="h-12" />
      </motion.main>
    </>
  );
}
