import { apiRequest } from './client';
import type { Role } from '../types/role';

export function getRoles() {
  return apiRequest<Role[]>('/api/roles');
}

export function getRole(roleId: string) {
  return apiRequest<Role>(`/api/roles/${roleId}`);
}