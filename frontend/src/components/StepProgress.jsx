import { motion } from 'framer-motion';
import { HiOutlineCloudUpload, HiOutlineDocumentText, HiOutlineSparkles, HiOutlineDownload } from 'react-icons/hi';

const steps = [
  { label: 'Upload', icon: HiOutlineCloudUpload },
  { label: 'Describe', icon: HiOutlineDocumentText },
  { label: 'Tailor', icon: HiOutlineSparkles },
  { label: 'Download', icon: HiOutlineDownload },
];

/**
 * StepProgress — Animated 4-step workflow indicator.
 * @param {{ currentStep: number }} props — 0-based index of current step
 */
export default function StepProgress({ currentStep = 0 }) {
  return (
    <div className="w-full max-w-lg mx-auto mb-10" id="step-progress">
      <div className="flex items-start justify-between relative">
        {/* Background connector line */}
        <div className="absolute top-[22px] left-[12%] right-[12%] h-[2px] bg-slate-100 z-0" />
        {/* Animated fill line */}
        <motion.div
          className="absolute top-[22px] left-[12%] h-[2px] bg-gradient-to-r from-brand-500 to-brand-400 z-[1] origin-left"
          initial={{ width: 0 }}
          animate={{
            width: currentStep === 0 ? '0%' : currentStep === 1 ? '25%' : currentStep === 2 ? '50%' : '76%',
          }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />

        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          const Icon = step.icon;

          return (
            <div key={step.label} className="flex flex-col items-center relative z-10 flex-1">
              {/* Step circle */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1, type: 'spring', stiffness: 200 }}
                className={`relative w-11 h-11 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isCompleted
                    ? 'bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg shadow-brand-500/25'
                    : isActive
                    ? 'bg-white border-2 border-brand-500 shadow-lg shadow-brand-500/15'
                    : 'bg-white border-2 border-slate-200'
                }`}
              >
                {isCompleted ? (
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </motion.svg>
                ) : (
                  <Icon className={`w-5 h-5 transition-colors duration-300 ${
                    isActive ? 'text-brand-600' : 'text-slate-300'
                  }`} />
                )}

                {/* Active pulse ring */}
                {isActive && (
                  <motion.div
                    animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute inset-0 rounded-full border-2 border-brand-400"
                  />
                )}
              </motion.div>

              {/* Label */}
              <motion.span
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                className={`mt-2.5 text-xs font-semibold tracking-wide transition-colors duration-300 ${
                  isCompleted || isActive ? 'text-brand-600' : 'text-slate-300'
                }`}
              >
                {step.label}
              </motion.span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
