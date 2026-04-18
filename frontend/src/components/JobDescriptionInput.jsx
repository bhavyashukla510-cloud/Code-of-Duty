import { useState } from 'react';
import { HiOutlineBriefcase, HiOutlineOfficeBuilding, HiOutlineDocumentText } from 'react-icons/hi';
import { motion } from 'framer-motion';

const MIN_CHARS = 200;

/**
 * JobDescriptionInput — Form for JD text, company name, and job title.
 * @param {{ onJDSubmit: ({ companyName, jobTitle, jdText }) => void }} props
 */
export default function JobDescriptionInput({ onJDSubmit }) {
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jdText, setJdText] = useState('');
  const [touched, setTouched] = useState(false);

  const charCount = jdText.length;
  const isValid = jdText.trim().length > 0;
  const meetsMinLength = charCount >= MIN_CHARS;

  // ── Submit handler ──
  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);

    if (!isValid) return;

    onJDSubmit({
      companyName: companyName.trim(),
      jobTitle: jobTitle.trim(),
      jdText: jdText.trim(),
    });
  };

  // ── Sync to parent on any change ──
  const handleJdChange = (e) => {
    const value = e.target.value;
    setJdText(value);
    // Continuously push updates to parent
    onJDSubmit({
      companyName: companyName.trim(),
      jobTitle: jobTitle.trim(),
      jdText: value.trim(),
    });
  };

  const handleCompanyChange = (e) => {
    const value = e.target.value;
    setCompanyName(value);
    if (jdText.trim()) {
      onJDSubmit({
        companyName: value.trim(),
        jobTitle: jobTitle.trim(),
        jdText: jdText.trim(),
      });
    }
  };

  const handleTitleChange = (e) => {
    const value = e.target.value;
    setJobTitle(value);
    if (jdText.trim()) {
      onJDSubmit({
        companyName: companyName.trim(),
        jobTitle: value.trim(),
        jdText: jdText.trim(),
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
      className="glass-card-premium p-6 sm:p-8"
      id="jd-section"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
          <HiOutlineBriefcase className="w-5 h-5 text-brand-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Job Description</h2>
          <p className="text-sm text-slate-400">Paste the target job posting</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Company Name + Job Title side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="company-name" className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-1.5">
              <HiOutlineOfficeBuilding className="w-4 h-4 text-slate-400" />
              Company Name
              <span className="text-slate-300 text-xs">(optional)</span>
            </label>
            <input
              type="text"
              id="company-name"
              value={companyName}
              onChange={handleCompanyChange}
              placeholder="e.g. Google, Apple, Microsoft"
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="job-title" className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-1.5">
              <HiOutlineBriefcase className="w-4 h-4 text-slate-400" />
              Job Title
              <span className="text-slate-300 text-xs">(optional)</span>
            </label>
            <input
              type="text"
              id="job-title"
              value={jobTitle}
              onChange={handleTitleChange}
              placeholder="e.g. Senior Frontend Engineer"
              className="input-field"
            />
          </div>
        </div>

        {/* Job Description Textarea */}
        <div>
          <label htmlFor="jd-text" className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-1.5">
            <HiOutlineDocumentText className="w-4 h-4 text-slate-400" />
            Job Description
            <span className="text-red-500 text-xs">*required</span>
          </label>
          <textarea
            id="jd-text"
            value={jdText}
            onChange={handleJdChange}
            onBlur={() => setTouched(true)}
            placeholder="Paste the full job description here…&#10;&#10;Include responsibilities, requirements, qualifications, and preferred skills for best results."
            rows={8}
            className={`input-field resize-y min-h-[160px] ${meetsMinLength ? 'input-valid' : ''
              } ${touched && !isValid ? 'border-red-400 focus:border-red-500' : ''}`}
          />

          {/* Character counter + validation */}
          <div className="flex items-center justify-between mt-2">
            <div>
              {touched && !isValid && (
                <p className="text-red-500 text-xs animate-scale-in" id="jd-error">
                  Job description is required
                </p>
              )}
            </div>
            <div className={`char-counter ${meetsMinLength ? 'valid' : ''}`} id="char-counter">
              {charCount}/{MIN_CHARS} chars
              {meetsMinLength && (
                <span className="ml-1.5 inline-flex items-center">
                  <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}
            </div>
          </div>
        </div>
      </form>
    </motion.div>
  );
}