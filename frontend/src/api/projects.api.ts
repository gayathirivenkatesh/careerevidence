import { apiRequest } from './client';

import type {
  AddProjectSkillRequest,
  CreateProjectRequest,
  Project,
  UpdateProjectRequest,
} from '../types/project';

export async function getProjects(
  token: string,
): Promise<Project[]> {
  const response = await apiRequest<{
    data: Project[];
  }>('/api/student/projects', {
    token,
  });

  return response.data;
}

export async function createProject(
  token: string,
  data: CreateProjectRequest,
): Promise<Project> {
  const response = await apiRequest<{
    data: Project;
  }>('/api/student/projects', {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  });

  return response.data;
}

export async function updateProject(
  token: string,
  projectId: string,
  data: UpdateProjectRequest,
): Promise<Project> {
  const response = await apiRequest<{
    data: Project;
  }>(`/api/student/projects/${projectId}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(data),
  });

  return response.data;
}

export async function deleteProject(
  token: string,
  projectId: string,
): Promise<void> {
  await apiRequest<void>(
    `/api/student/projects/${projectId}`,
    {
      method: 'DELETE',
      token,
    },
  );
}

export async function addProjectSkill(
  token: string,
  projectId: string,
  data: AddProjectSkillRequest,
): Promise<Project> {
  const response = await apiRequest<{
    data: Project;
  }>(
    `/api/student/projects/${projectId}/skills`,
    {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    },
  );

  return response.data;
}

export async function updateProjectSkill(
  token: string,
  projectId: string,
  skillId: string,
  data: AddProjectSkillRequest,
): Promise<Project> {
  const response = await apiRequest<{
    data: Project;
  }>(
    `/api/student/projects/${projectId}/skills/${skillId}`,
    {
      method: 'PUT',
      token,
      body: JSON.stringify(data),
    },
  );

  return response.data;
}

export async function removeProjectSkill(
  token: string,
  projectId: string,
  skillId: string,
): Promise<void> {
  await apiRequest<void>(
    `/api/student/projects/${projectId}/skills/${skillId}`,
    {
      method: 'DELETE',
      token,
    },
  );
}