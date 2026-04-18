import { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { HiOutlineSparkles } from 'react-icons/hi';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Lenis from 'lenis';
import Home from './pages/Home';
import Result from './pages/Result';
import ParticleCanvas from './components/ParticleCanvas';

function Preloader({ onComplete }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const letters = 'AutoAlign'.split('');

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#FEFCFB]"
    >
      <div className="relative flex flex-col items-center">
        {/* Animated Orbs */}
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-40 h-40 bg-brand-400 rounded-full blur-[80px] opacity-20"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.25, 0.1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute w-32 h-32 bg-amber-300 rounded-full blur-[60px] opacity-15 translate-x-12"
        />
        
        {/* Logo Icon with draw effect */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1, ease: [0.34, 1.56, 0.64, 1] }}
          className="relative z-10 w-18 h-18 rounded-2xl flex items-center justify-center mb-8"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl shadow-brand-500/25"
          >
            <img src="/favicon.svg" alt="AutoAlign Icon" className="w-full h-full object-contain" />
          </motion.div>
          
          {/* Rotating ring around logo */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-[-8px] rounded-3xl border-2 border-dashed border-brand-300/30"
          />
        </motion.div>

        {/* Letter-by-letter text */}
        <div className="flex overflow-hidden mb-3">
          {letters.map((letter, i) => (
            <motion.span
              key={i}
              initial={{ y: '120%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                delay: 0.5 + i * 0.06,
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={`text-3xl font-bold tracking-tight heading-display ${
                i >= 4 ? 'text-brand-600' : 'text-slate-900'
              }`}
            >
              {letter}
            </motion.span>
          ))}
        </div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="text-sm text-slate-400 mb-6"
        >
          AI-Powered Resume Optimization
        </motion.p>

        {/* Animated progress bar */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="w-48 h-1 bg-slate-100 rounded-full overflow-hidden"
        >
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="h-full w-1/2 bg-gradient-to-r from-transparent via-brand-500 to-transparent rounded-full"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { scrollY } = useScroll();

  // Navbar morph values
  const navOpacity = useTransform(scrollY, [0, 80], [0, 1]);
  const logoScale = useTransform(scrollY, [0, 80], [1, 0.9]);

  // Initialize Lenis for ultra-smooth scrolling
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.12,
      wheelMultiplier: 1,
      smoothWheel: true,
      syncTouch: true,
      touchMultiplier: 1.5,
      autoResize: true,
    });

    // Store globally so other components can access
    window.__lenis = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {loading && <Preloader key="preloader" onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      <div className="gradient-bg min-h-screen relative">
        {/* ── Interactive Particle Canvas Background ── */}
        <ParticleCanvas />

        {/* ── Morphing Nav Bar ── */}
        <motion.nav 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: loading ? 3 : 0, duration: 0.8 }}
          className="fixed top-0 left-0 right-0 z-30 px-4 sm:px-6 py-4 transition-all duration-300" 
          id="main-nav"
        >
          {/* Morphing background overlay */}
          <motion.div 
            className="absolute inset-0 nav-morphed"
            style={{ opacity: navOpacity }}
          />

          <div className="relative max-w-6xl mx-auto flex items-center justify-between">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2.5 group" id="nav-logo">
              <motion.div 
                style={{ scale: logoScale }}
                className="w-9 h-9 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/10 group-hover:shadow-brand-500/25 transition-shadow"
              >
                <img src="/favicon.svg" alt="AutoAlign Icon" className="w-full h-full object-contain" />
              </motion.div>
              <span className="text-xl font-bold text-slate-900 tracking-tight heading-display">
                Auto<span className="text-brand-600">Align</span>
              </span>
            </a>

            {/* Team Logo */}
            <div className="flex items-center gap-4">
              <img
                src="/code_of_duty_logo.svg"
                alt="Code of Duty Logo"
                className="h-10 w-auto object-contain rounded-md"
              />
            </div>
          </div>
        </motion.nav>

        {/* ── Spacer for fixed nav ── */}
        <div className="h-[72px]" />

        {/* ── Routes ── */}
        <AnimatePresence mode="wait">
          {!loading && (
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home />} />
              <Route path="/result" element={<Result />} />
            </Routes>
          )}
        </AnimatePresence>

        {/* ── Footer ── */}
        <motion.footer 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="relative z-10 text-center py-8 mt-12 border-t border-slate-200/60" 
          id="main-footer"
        >
          <p className="text-sm text-slate-400">
            Built with <span className="text-brand-500">♥</span> for Kriyeta 5.0
          </p>
        </motion.footer>
      </div>
    </>
  );
}
