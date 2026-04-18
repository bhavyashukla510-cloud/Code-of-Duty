import { create } from 'zustand';

/**
 * Global Zustand store for resume tailoring state.
 * Shared between Home (write) and Result (read) pages.
 */
const useResumeStore = create((set, get) => ({
  // ── Resume Data ──
  resumeText: '',
  file: null,
  resumeFile: null,
  resumeFileType: '',
  uploadStatus: 'idle', // idle | selected | uploading | success | error

  // ── Job Description ──
  jdData: { companyName: '', jobTitle: '', jdText: '' },

  // ── Tailoring Result ──
  result: null,
  tailoredText: '',
  beforeScore: 0,
  afterScore: 0,
  improvement: 0,
  jdKeywords: [],
  missingKeywords: [],

  // ── Sub-scores ──
  beforeATS: 0,
  afterATS: 0,
  beforeLLM: 0,
  afterLLM: 0,

  // ── PDF Blob ──
  pdfBlob: null,

  // ── Analysis Report ──
  report: null,

  // ── UI State ──
  isLoading: false,
  loadingMessage: '',
  error: '',

  // ── Actions: Resume ──
  setResumeText: (text) => set({ resumeText: text }),
  setFile: (file) => set({ file }),
  setResumeFile: (file) => {
    const type = file ? file.name.split('.').pop().toLowerCase() : '';
    set({ resumeFile: file, resumeFileType: type });
  },
  setUploadStatus: (status) => set({ uploadStatus: status }),

  // ── Actions: JD ──
  setJdData: (data) => set({ jdData: data }),

  // ── Actions: Result ──
  setResult: (data) => {
    const tailoredText = data?.tailored_text || data?.tailoredText || (typeof data === 'string' ? data : '');
    const beforeScore = data?.before_score ?? data?.beforeScore ?? 0;
    const afterScore = data?.after_score ?? data?.afterScore ?? 0;
    const improvement = data?.improvement ?? (afterScore - beforeScore);
    const jdKeywords = data?.jd_keywords ?? data?.jdKeywords ?? [];
    const missingKeywords = data?.missing_keywords ?? data?.missingKeywords ?? [];
    const pdfBlob = data?.blob ?? null;
    const report = data?.report ?? null;

    // Sub-scores
    const beforeATS = data?.before_ats ?? data?.beforeATS ?? 0;
    const afterATS = data?.after_ats ?? data?.afterATS ?? 0;
    const beforeLLM = data?.before_llm ?? data?.beforeLLM ?? 0;
    const afterLLM = data?.after_llm ?? data?.afterLLM ?? 0;

    set({
      result: data,
      tailoredText,
      beforeScore,
      afterScore,
      improvement,
      jdKeywords,
      missingKeywords,
      pdfBlob,
      report,
      beforeATS,
      afterATS,
      beforeLLM,
      afterLLM,
    });
  },

  // ── Actions: UI ──
  setIsLoading: (val) => set({ isLoading: val }),
  setLoadingMessage: (msg) => set({ loadingMessage: msg }),
  setError: (err) => set({ error: err }),

  // ── Actions: Reset ──
  resetAll: () => set({
    resumeText: '',
    file: null,
    resumeFile: null,
    resumeFileType: '',
    uploadStatus: 'idle',
    jdData: { companyName: '', jobTitle: '', jdText: '' },
    result: null,
    tailoredText: '',
    beforeScore: 0,
    afterScore: 0,
    improvement: 0,
    jdKeywords: [],
    missingKeywords: [],
    beforeATS: 0,
    afterATS: 0,
    beforeLLM: 0,
    afterLLM: 0,
    pdfBlob: null,
    report: null,
    isLoading: false,
    loadingMessage: '',
    error: '',
  }),

  resetResult: () => set({
    result: null,
    tailoredText: '',
    beforeScore: 0,
    afterScore: 0,
    improvement: 0,
    jdKeywords: [],
    missingKeywords: [],
    beforeATS: 0,
    afterATS: 0,
    beforeLLM: 0,
    afterLLM: 0,
    pdfBlob: null,
    report: null,
  }),
}));

export default useResumeStore;
