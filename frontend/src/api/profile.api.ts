import {
  apiRequest,
} from './client';

import type {
  User,
} from '../types/auth';

export interface ProfileUpdate {
  name?: string;
  education?: string;
  graduationYear?: number;
  targetRoleId?: string;
  careerHoursPerWeek?: number;
}

export function getProfile(
  token: string,
) {
  return apiRequest<{
    data: User;
  }>('/api/users/me', {
    token,
  });
}

export function updateProfile(
  token: string,
  input: ProfileUpdate,
) {
  return apiRequest<{
    data: User;
  }>('/api/users/me', {
    method: 'PATCH',
    token,
    body: JSON.stringify(input),
  });
}