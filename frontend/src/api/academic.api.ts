import {
  apiRequest,
} from './client';

import type {
  AcademicEvent,
} from '../types/academic';

export function getAcademicEvents(
  token: string,
) {
  return apiRequest<{
    data: AcademicEvent[];
  }>(
    '/api/academic/',
    { token },
  );
}

export function createAcademicEvent(
  token: string,
  input: Omit<
    AcademicEvent,
    'id'
  >,
) {
  return apiRequest<{
    data: AcademicEvent;
  }>(
    '/api/academic/',
    {
      method: 'POST',
      token,
      body: JSON.stringify(input),
    },
  );
}

export function deleteAcademicEvent(
  token: string,
  id: string,
) {
  return apiRequest<void>(
    `/api/academic/${id}`,
    {
      method: 'DELETE',
      token,
    },
  );
}
