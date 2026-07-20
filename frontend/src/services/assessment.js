import apiClient from './api_client';

/**
 * Submit intake answers + optional photo set for AI evaluation.
 * payload: { lifestyle, hydration, exposure, concerns, photos? }
 */
export async function submitAssessment(payload) {
  const { data } = await apiClient.post('/assessment', payload);
  return data;
}

/** Fetch the most recent completed assessment for the current user. */
export async function getLatestAssessment() {
  const { data } = await apiClient.get('/assessment/latest');
  return data;
}

/** Fetch full assessment history for trend charts. */
export async function getAssessmentHistory(range = '90d') {
  const { data } = await apiClient.get('/assessment/history', { params: { range } });
  return data;
}

/** Fetch the weighted skin health score breakdown (hydration, barrier, tone, texture). */
export async function getScoreBreakdown(assessmentId) {
  const { data } = await apiClient.get(`/assessment/${assessmentId}/score`);
  return data;
}

const assessmentService = {
  submitAssessment,
  getLatestAssessment,
  getAssessmentHistory,
  getScoreBreakdown,
};

export default assessmentService;
