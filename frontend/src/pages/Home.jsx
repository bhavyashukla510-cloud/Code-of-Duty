import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineSparkles } from 'react-icons/hi';
import { motion } from 'framer-motion';
import UploadResume from '../components/UploadResume';
import JobDescriptionInput from '../components/JobDescriptionInput';
import StepProgress from '../components/StepProgress';
import CinematicLoader from '../components/CinematicLoader';
import TiltCard from '../components/TiltCard';
import { tailorResume } from '../services/api';
import useResumeStore from '../store/useResumeStore';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  },
  exit: {
    opacity: 0,
    y: -20,
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

export default function Home() {
  const navigate = useNavigate();

  // ── Zustand State ──
  const {
    resumeText, setResumeText,
    resumeFile,
    jdData, setJdData,
    isLoading, setIsLoading,
    error, setError,
    setResult,
  } = useResumeStore();

  const canSubmit = resumeText.trim().length > 0 && jdData.jdText.trim().length > 0;

  // ── Step progress calculation ──
  const currentStep = useMemo(() => {
    if (isLoading) return 2;
    if (canSubmit) return 2;
    if (resumeText.trim().length > 0) return 1;
    return 0;
  }, [resumeText, canSubmit, isLoading]);

  // ── Handlers ──
  const handleUploadComplete = (rawText, uploadedFile) => {
    setResumeText(rawText);
    if (uploadedFile) {
      useResumeStore.getState().setResumeFile(uploadedFile);
    } else {
      useResumeStore.getState().setResumeFile(null);
    }
    setError('');
  };

  const handleJDSubmit = (data) => {
    setJdData(data);
    setError('');
  };

  const handleTailor = async () => {
    if (!canSubmit) return;

    // ✅ FIX: Use the actual File object, not the text string
    const fileToSend = resumeFile;

    if (!fileToSend) {
      setError('Please upload a resume file first (PDF required).');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // ✅ Pass File object (not string) and job description
      const result = await tailorResume(fileToSend, jdData.jdText);
      setResult(result);
      setIsLoading(false);
      navigate('/result', {
        state: {
          result,
          resumeText,
          jdData,
        },
      });
    } catch (err) {
      setError(err.friendlyMessage || err.message || 'Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* ── Cinematic Loading Overlay ── */}
      {isLoading && <CinematicLoader />}

      {/* ── Main Content ── */}
      <motion.main 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8" 
        id="home-page"
      >
        {/* Hero */}
        <motion.div variants={itemVariants} className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-200/60 text-brand-700 text-sm font-medium mb-6"
          >
            <HiOutlineSparkles className="w-4 h-4" />
            AI-Powered Resume Optimization
          </motion.div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-4 heading-display">
            Tailor your resume
            <br />
            <span className="gradient-text-animated">in seconds</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Upload your resume, paste the job description, and let AI craft a perfectly
            matched version that gets past ATS filters and impresses recruiters.
          </p>
        </motion.div>

        {/* Step Progress */}
        <motion.div variants={itemVariants}>
          <StepProgress currentStep={currentStep} />
        </motion.div>

        {/* Two-Panel Layout — stacked full-width for visual balance */}
        <motion.div variants={itemVariants} className="space-y-6 mb-8">
          {/* Upload Resume — full width */}
          <TiltCard>
            <UploadResume onUploadComplete={handleUploadComplete} />
          </TiltCard>

          {/* Job Description — full width */}
          <TiltCard>
            <JobDescriptionInput onJDSubmit={handleJDSubmit} />
          </TiltCard>
        </motion.div>

        {/* Error Banner */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200/60 text-center" 
            id="tailor-error"
          >
            <p className="text-red-600">{error}</p>
          </motion.div>
        )}

        {/* CTA Button */}
        <motion.div variants={itemVariants} className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleTailor}
            disabled={!canSubmit || isLoading}
            className="btn-cta btn-magnetic flex items-center gap-3"
            id="tailor-cta"
          >
            <HiOutlineSparkles className="w-5 h-5" />
            Tailor My Resume
          </motion.button>
        </motion.div>

        {/* Status indicators */}
        <motion.div variants={itemVariants} className="flex justify-center gap-6 mt-6 text-sm">
          <motion.div 
            className="flex items-center gap-2"
            animate={resumeText ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <span className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${resumeText ? 'bg-green-500 shadow-sm shadow-green-500/50' : 'bg-slate-300'}`}></span>
            <span className={`transition-colors duration-300 ${resumeText ? 'text-green-600 font-medium' : 'text-slate-400'}`}>
              Resume {resumeText ? 'uploaded' : 'pending'}
            </span>
          </motion.div>
          <motion.div 
            className="flex items-center gap-2"
            animate={jdData.jdText ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <span className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${jdData.jdText ? 'bg-green-500 shadow-sm shadow-green-500/50' : 'bg-slate-300'}`}></span>
            <span className={`transition-colors duration-300 ${jdData.jdText ? 'text-green-600 font-medium' : 'text-slate-400'}`}>
              JD {jdData.jdText ? 'provided' : 'pending'}
            </span>
          </motion.div>
        </motion.div>
      </motion.main>
    </>
  );
}