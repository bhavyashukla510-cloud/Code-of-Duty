import { useState, useEffect, useRef } from 'react';
import { HiOutlineTrendingUp, HiOutlineChartBar, HiOutlineLightningBolt } from 'react-icons/hi';
import { motion } from 'framer-motion';

function useCountUp(target, duration = 1800, delay = 300) {
  const [count, setCount] = useState(0);
  const frameRef = useRef(null);
  useEffect(() => {
    const timeout = setTimeout(() => {
      const startTime = performance.now();
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(eased * target));
        if (progress < 1) frameRef.current = requestAnimationFrame(animate);
      };
      frameRef.current = requestAnimationFrame(animate);
    }, delay);
    return () => { clearTimeout(timeout); if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [target, duration, delay]);
  return count;
}

function ScoreRing({ score, maxScore = 100, size = 140, strokeWidth = 8, color, delay = 0 }) {
  const [animated, setAnimated] = useState(false);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min((score / maxScore) * 100, 100);
  const offset = circumference - (percentage / 100) * circumference;
  useEffect(() => { const timer = setTimeout(() => setAnimated(true), delay + 100); return () => clearTimeout(timer); }, [delay]);

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth={strokeWidth} />
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={`url(#gradient-${color})`} strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={animated ? offset : circumference} style={{ transition: `stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1) ${delay}ms`, filter: `drop-shadow(0 0 8px ${color==='red'?'rgba(239,68,68,0.2)':'rgba(34,197,94,0.2)'})` }} />
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
          {color === 'red' ? (<><stop offset="0%" stopColor="#f87171" /><stop offset="100%" stopColor="#ef4444" /></>) : (<><stop offset="0%" stopColor="#4ade80" /><stop offset="100%" stopColor="#22c55e" /></>)}
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function ScoreDisplay({ beforeScore = 0, afterScore = 0, improvement = 0 }) {
  const animatedBefore = useCountUp(Math.round(beforeScore), 1500, 400);
  const animatedAfter = useCountUp(Math.round(afterScore), 1500, 800);
  const animatedImprovement = useCountUp(Math.round(improvement), 1200, 1200);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      className="glass-card p-6 lg:p-8" 
      id="score-display"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
          <HiOutlineChartBar className="w-5 h-5 text-brand-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900 heading-display">Match Score Analysis</h2>
          <p className="text-sm text-slate-400">Keyword match comparison with job description</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Before Score */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="flex flex-col items-center group" 
          id="before-score-card"
        >
          <div className="relative mb-4">
            <ScoreRing score={beforeScore} color="red" size={140} strokeWidth={8} delay={200} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-red-500 tabular-nums">{animatedBefore}%</span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-700 mb-1">Keyword Match Before</p>
            <p className="text-xs text-slate-400">Original resume</p>
          </div>
        </motion.div>

        {/* Improvement Badge with Shine */}
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 150 }}
          className="flex flex-col items-center justify-center" 
          id="improvement-badge"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-green-500/5 rounded-2xl blur-xl animate-pulse-slow" />
            <div className="relative glass-card border-green-200/60 hover:border-green-300 px-8 py-6 text-center transition-all duration-500 badge-glow shine-sweep">
              <HiOutlineTrendingUp className="w-8 h-8 text-green-500 mx-auto mb-3" />
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold text-green-500 tabular-nums heading-display">+{animatedImprovement}</span>
                <span className="text-xl font-semibold text-green-500">%</span>
              </div>
              <p className="text-sm text-green-600/70 mt-2 font-medium">Improvement</p>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-75" />
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-green-300 rounded-full animate-ping opacity-50" style={{ animationDelay: '0.5s' }} />
            </div>
          </div>
        </motion.div>

        {/* After Score */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, type: 'spring' }}
          className="flex flex-col items-center group" 
          id="after-score-card"
        >
          <div className="relative mb-4">
            <ScoreRing score={afterScore} color="green" size={140} strokeWidth={8} delay={600} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-green-500 tabular-nums">{animatedAfter}%</span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-700 mb-1">Keyword Match After</p>
            <p className="text-xs text-slate-400">Tailored resume</p>
          </div>
        </motion.div>
      </div>

      {/* Comparison Bars */}
      <div className="mt-8 space-y-3" id="comparison-bars">
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-medium text-slate-500">Before</span>
            <span className="text-xs font-semibold text-red-500 tabular-nums">{animatedBefore}%</span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${animatedBefore}%` }}
              transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
              className="h-full rounded-full bg-gradient-to-r from-red-500 to-red-400" 
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-medium text-slate-500">After</span>
            <span className="text-xs font-semibold text-green-500 tabular-nums">{animatedAfter}%</span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${animatedAfter}%` }}
              transition={{ duration: 1.5, ease: 'easeOut', delay: 0.6 }}
              className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400" 
            />
          </div>
        </div>
      </div>

      {/* Feature badges */}
      <div className="grid grid-cols-3 gap-3 mt-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-amber-50/60 rounded-lg p-3 text-center border border-amber-100/60 hover:border-amber-200 hover:bg-amber-50 transition-all duration-300"
        >
          <HiOutlineLightningBolt className="w-4 h-4 text-amber-500 mx-auto mb-1" />
          <p className="text-xs text-slate-500">ATS Optimized</p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-brand-50/60 rounded-lg p-3 text-center border border-brand-100/60 hover:border-brand-200 hover:bg-brand-50 transition-all duration-300"
        >
          <HiOutlineChartBar className="w-4 h-4 text-brand-500 mx-auto mb-1" />
          <p className="text-xs text-slate-500">Keyword Matched</p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-green-50/60 rounded-lg p-3 text-center border border-green-100/60 hover:border-green-200 hover:bg-green-50 transition-all duration-300"
        >
          <HiOutlineTrendingUp className="w-4 h-4 text-green-500 mx-auto mb-1" />
          <p className="text-xs text-slate-500">Score Boosted</p>
        </motion.div>
      </div>
    </motion.div>
  );
}
