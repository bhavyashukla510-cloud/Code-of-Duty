import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineSparkles, HiOutlineDocumentText, HiOutlineLightningBolt, HiOutlineCode } from 'react-icons/hi';

const LOADING_MESSAGES = [
  'Analyzing your resume…',
  'Matching with job description…',
  'Identifying key skills…',
  'Crafting your tailored resume…',
  'Optimizing for ATS compatibility…',
  'Almost there…',
];

const floatingIcons = [
  { Icon: HiOutlineDocumentText, x: -120, y: -80, delay: 0 },
  { Icon: HiOutlineSparkles, x: 130, y: -60, delay: 0.3 },
  { Icon: HiOutlineLightningBolt, x: -100, y: 90, delay: 0.6 },
  { Icon: HiOutlineCode, x: 110, y: 70, delay: 0.9 },
];

/**
 * CinematicLoader — Fullscreen loading experience with pulsating orb,
 * floating icons, morphing text, and a circular progress ring.
 */
export default function CinematicLoader() {
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Cycle messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Animate progress
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95; // never hit 100 until actual completion
        return prev + Math.random() * 3 + 0.5;
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const circumference = 2 * Math.PI * 52;
  const strokeDashoffset = circumference - (Math.min(progress, 100) / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: 'rgba(254, 252, 251, 0.95)', backdropFilter: 'blur(20px)' }}
      id="cinematic-loader"
    >
      {/* Background radial glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative flex flex-col items-center">
        {/* Floating icons */}
        {floatingIcons.map(({ Icon, x, y, delay }, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 0.4, 0.2, 0.4],
              scale: [0.6, 1, 0.8, 1],
              x: [x * 0.8, x, x * 1.1, x],
              y: [y * 0.8, y, y * 1.15, y],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay,
              ease: 'easeInOut',
            }}
            className="absolute"
          >
            <Icon className="w-6 h-6 text-brand-400" />
          </motion.div>
        ))}

        {/* Central orb + progress ring */}
        <div className="relative w-32 h-32 mb-8">
          {/* Pulsating orb */}
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              boxShadow: [
                '0 0 40px rgba(249,115,22,0.15)',
                '0 0 80px rgba(249,115,22,0.25)',
                '0 0 40px rgba(249,115,22,0.15)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-4 rounded-full bg-gradient-to-br from-brand-400 to-brand-600"
          />

          {/* Inner icon */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            >
              <HiOutlineSparkles className="w-8 h-8 text-white" />
            </motion.div>
          </div>

          {/* Progress ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(249,115,22,0.1)" strokeWidth="4" />
            <circle
              cx="60" cy="60" r="52"
              fill="none"
              stroke="url(#loaderGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 0.3s ease-out' }}
            />
            <defs>
              <linearGradient id="loaderGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#fb923c" />
                <stop offset="100%" stopColor="#ea580c" />
              </linearGradient>
            </defs>
          </svg>

          {/* Orbiting dot */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0"
            style={{ transformOrigin: 'center' }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-brand-500 shadow-lg shadow-brand-500/50" />
          </motion.div>
        </div>

        {/* Morphing text */}
        <div className="text-center h-16">
          <AnimatePresence mode="wait">
            <motion.p
              key={msgIndex}
              initial={{ opacity: 0, y: 15, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -15, filter: 'blur(8px)' }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-lg font-semibold text-slate-800"
            >
              {LOADING_MESSAGES[msgIndex]}
            </motion.p>
          </AnimatePresence>
          <p className="text-sm text-slate-400 mt-2">This may take a few seconds</p>
        </div>

        {/* Step dots */}
        <div className="flex gap-2 mt-6">
          {LOADING_MESSAGES.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                scale: i === msgIndex ? 1.3 : 1,
                backgroundColor: i <= msgIndex ? '#f97316' : '#e2e8f0',
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="w-2 h-2 rounded-full"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
