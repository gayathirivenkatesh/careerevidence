import {
  apiRequest,
} from './client';

import type {
  AuthResponse,
  LoginInput,
  RegisterInput,
  User,
} from '../types/auth';

export function register(
  input: RegisterInput,
) {
  return apiRequest<{
    data: AuthResponse;
  }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function login(
  input: LoginInput,
) {
  return apiRequest<{
    data: AuthResponse;
  }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function getMe(
  token: string,
) {
  return apiRequest<{
    data: User;
  }>('/api/auth/me', {
    token,
  });
}