import {
  apiRequest,
} from './client';

import type {
  Recommendation,
} from '../types/recommendation';

export function generateTargetRecommendations(
  token: string,
) {
  return apiRequest<{
    data: {
      recommendations:
        Recommendation[];
    };
  }>(
    '/api/recommendations/generate/target',
    {
      method: 'POST',
      token,
    },
  );
}

export function getRecommendations(
  token: string,
) {
  return apiRequest<{
    data: Recommendation[];
  }>(
    '/api/recommendations',
    {
      token,
    },
  );
}

export function completeRecommendation(
  token: string,
  id: string,
) {
  return apiRequest<{
    data: Recommendation;
  }>(
    `/api/recommendations/${id}/complete`,
    {
      method: 'POST',
      token,
    },
  );
}

export function dismissRecommendation(
  token: string,
  id: string,
) {
  return apiRequest<{
    data: Recommendation;
  }>(
    `/api/recommendations/${id}/dismiss`,
    {
      method: 'POST',
      token,
    },
  );
}