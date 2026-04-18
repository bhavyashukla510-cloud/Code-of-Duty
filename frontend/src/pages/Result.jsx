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
    jdKeywords, jdData,
    resumeFile,
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

  // ── Auto-fetch score if not present ──
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
      const blob = await downloadPDF();
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
