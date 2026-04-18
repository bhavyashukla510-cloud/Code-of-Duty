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

    set({
      result: data,
      tailoredText,
      beforeScore,
      afterScore,
      improvement,
      jdKeywords,
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
  }),
}));

export default useResumeStore;
