import { MOCK_RESUME_TEXT, MOCK_TAILORED_TEXT, MOCK_SCORE_DATA, mockDelay } from './mockData';

/**
 * API service layer for communicating with the FastAPI backend.
 * Base URL defaults to localhost:8000 (FastAPI dev server).
 * Automatically falls back to mock data if the backend is unreachable.
 */

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

/**
 * Upload a resume PDF and get extracted text back.
 * POST /upload
 */
export async function uploadResume(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      throw new Error('Upload failed');
    }

    const data = await res.json();
    // Map backend's 'resume_text' to 'raw_text' as expected by the frontend
    return {
      raw_text: data.resume_text || data.raw_text,
      ...data
    };
  } catch (err) {
    console.warn('[API Fallback] Backend not reachable. Using mock data for uploadResume.');
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
 * POST /tailor
 * Returns the response object (with PDF blob and score headers).
 */
export async function tailorResume(file, jobDescription) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('job_description', jobDescription);

    const res = await fetch(`${API_BASE}/tailor`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      throw new Error('Tailoring failed');
    }

    const beforeScore = parseFloat(res.headers.get('X-Before-Score')) || 0;
    const afterScore = parseFloat(res.headers.get('X-After-Score')) || 0;
    const improvement = parseFloat(res.headers.get('X-Improvement')) || 0;

    const blob = await res.blob();

    return {
      blob,
      beforeScore,
      afterScore,
      improvement,
    };
  } catch (err) {
    console.warn('[API Fallback] Backend not reachable. Using mock data for tailorResume.');
    await mockDelay(2500, 4000);
    
    // Create a dummy PDF blob just to prevent errors
    const dummyBlob = new Blob(['Mock Tailored Resume PDF'], { type: 'application/pdf' });
    
    return {
      blob: dummyBlob,
      beforeScore: MOCK_SCORE_DATA.before_score,
      afterScore: MOCK_SCORE_DATA.after_score,
      improvement: MOCK_SCORE_DATA.improvement,
      tailoredText: MOCK_TAILORED_TEXT,
      jdKeywords: MOCK_SCORE_DATA.jd_keywords
    };
  }
}

/**
 * Download the tailored resume as a PDF blob.
 * Re-uses the last tailored result stored in memory,
 * or falls back to re-calling /tailor if needed.
 */
let _lastTailoredBlob = null;

export function setLastTailoredBlob(blob) {
  _lastTailoredBlob = blob;
}

export async function downloadPDF() {
  if (_lastTailoredBlob) {
    return _lastTailoredBlob;
  }
  throw new Error('No tailored PDF available. Please tailor your resume first.');
}

/**
 * Get match scores for original vs tailored resume against a JD.
 * POST /score
 */
export async function getScore(originalResume, rewrittenResume, jdText) {
  try {
    const res = await fetch(`${API_BASE}/score`, {
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
