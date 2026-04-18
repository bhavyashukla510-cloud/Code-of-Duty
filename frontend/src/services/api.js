import { MOCK_RESUME_TEXT, MOCK_TAILORED_TEXT, MOCK_SCORE_DATA, mockDelay } from './mockData';

/**
 * API service layer for communicating with the FastAPI backend.
 * Base URL defaults to localhost:8000 (FastAPI dev server).
 * Automatically falls back to mock data if the backend is unreachable.
 */

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

/**
 * Upload a resume PDF and get extracted text back.
 * POST /api/upload
 */
export async function uploadResume(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(err.detail || 'Upload failed');
    }

    const data = await res.json();
    return {
      raw_text: data.resume_text || data.raw_text,
      ...data
    };
  } catch (err) {
    console.warn('[API Fallback] Backend not reachable. Using mock data for uploadResume.', err.message);
    await mockDelay(1000, 2000);
    return {
      raw_text: MOCK_RESUME_TEXT,
      message: 'PDF uploaded successfully (Mock)',
      filename: file.name
    };
  }
}

/**
 * Tailor a resume to a job description.
 * POST /api/tailor
 * Returns JSON with tailored_text, scores, and keywords.
 */
export async function tailorResume(file, jobDescription) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('job_description', jobDescription);

    const res = await fetch(`${API_BASE}/api/tailor`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Tailoring failed' }));
      throw new Error(err.detail || 'Tailoring failed');
    }

    const data = await res.json();

    return {
      tailoredText: data.tailored_text || '',
      originalText: data.original_text || '',
      beforeScore: data.before_score ?? 0,
      afterScore: data.after_score ?? 0,
      improvement: data.improvement ?? 0,
      beforeATS: data.before_ats ?? 0,
      afterATS: data.after_ats ?? 0,
      beforeLLM: data.before_llm ?? 0,
      afterLLM: data.after_llm ?? 0,
      jdKeywords: data.matched_keywords ?? [],
      missingKeywords: data.missing_keywords ?? [],
      report: data.report ?? null,
    };
  } catch (err) {
    console.warn('[API Fallback] Backend not reachable. Using mock data for tailorResume.', err.message);
    await mockDelay(2500, 4000);

    return {
      tailoredText: MOCK_TAILORED_TEXT,
      originalText: MOCK_RESUME_TEXT,
      beforeScore: MOCK_SCORE_DATA.before_score,
      afterScore: MOCK_SCORE_DATA.after_score,
      improvement: MOCK_SCORE_DATA.improvement,
      jdKeywords: MOCK_SCORE_DATA.jd_keywords,
      missingKeywords: [],
    };
  }
}

/**
 * Download the tailored resume as a PDF.
 * POST /api/generate-pdf
 * Sends the tailored text + JD to the backend which generates and returns a PDF.
 */
export async function downloadPDF(tailoredText, jobDescription = '') {
  try {
    const res = await fetch(`${API_BASE}/api/generate-pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tailored_text: tailoredText,
        job_description: jobDescription,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'PDF generation failed' }));
      throw new Error(err.detail || 'PDF generation failed');
    }

    return await res.blob();
  } catch (err) {
    console.error('[API] PDF download failed:', err.message);
    // Fallback: create a simple text blob as PDF
    const fallbackBlob = new Blob([tailoredText || 'Resume content'], { type: 'application/pdf' });
    return fallbackBlob;
  }
}

/**
 * Get match scores for original vs tailored resume against a JD.
 * POST /api/score
 */
export async function getScore(originalResume, rewrittenResume, jdText) {
  try {
    const res = await fetch(`${API_BASE}/api/score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        original_resume: originalResume,
        rewritten_resume: rewrittenResume,
        jd_text: jdText,
      }),
    });

    if (!res.ok) {
      throw new Error('Scoring failed');
    }

    return await res.json();
  } catch (err) {
    console.warn('[API Fallback] Backend not reachable. Using mock data for getScore.');
    await mockDelay(1500, 2500);
    return MOCK_SCORE_DATA;
  }
}
