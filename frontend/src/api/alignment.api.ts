import { apiRequest } from './client';

import type {
  GapResponse,
  RoleDiscoveryResponse,
  RoleAlignment,
  TargetAlignmentResponse,
} from '../types/alignment';

export async function getTargetAlignment(
  token: string,
): Promise<TargetAlignmentResponse> {
  const response = await apiRequest<{
    data: TargetAlignmentResponse;
  }>(
    '/api/alignment/target',
    { token },
  );

  return response.data;
}

export async function getRoleDiscovery(
  token: string,
): Promise<RoleDiscoveryResponse> {
  const response = await apiRequest<{
    data: RoleDiscoveryResponse;
  }>(
    '/api/alignment/discovery',
    { token },
  );

  return response.data;
}

export async function getRoleAlignment(
  token: string,
  roleId: string,
): Promise<RoleAlignment> {
  const response = await apiRequest<{
    data: RoleAlignment;
  }>(
    `/api/alignment/roles/${roleId}`,
    { token },
  );

  return response.data;
}

export async function getTargetGaps(
  token: string,
): Promise<GapResponse> {
  const response = await apiRequest<{
    data: GapResponse;
  }>(
    '/api/alignment/gaps/target',
    { token },
  );

  return response.data;
}

export async function getRoleGaps(
  token: string,
  roleId: string,
): Promise<GapResponse> {
  const response = await apiRequest<{
    data: GapResponse;
  }>(
    `/api/alignment/gaps/roles/${roleId}`,
    { token },
  );

  return response.data;
}
