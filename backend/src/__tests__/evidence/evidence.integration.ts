import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();import authRoutes from '../../auth/auth.routes.js';
import projectRoutes from '../../projects/project.routes.js';

function createApp() {
  const app = express();

  app.use(express.json());

  app.use('/api/auth', authRoutes);
  app.use('/api/student/projects', projectRoutes);

  return app;
}

function uniqueEmail(): string {
  return `phase9-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}@example.com`;
}

async function createAuthenticatedUser() {
  const app = createApp();

  const response = await request(app)
    .post('/api/auth/register')
    .send({
      email: uniqueEmail(),
      password: 'StrongPassword123!',
      name: 'Phase 9 Student',
    });

  expect(response.status).toBe(201);

  return {
    app,
    token: response.body.data.token as string,
    userId: response.body.data.user.id as string,
  };
}

describe('Projects - PostgreSQL integration', () => {
  it('creates a project for the authenticated student', async () => {
    const { app, token, userId } =
      await createAuthenticatedUser();

    const response = await request(app)
      .post('/api/student/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'CareerEvidence Test Project',
        description:
          'A real project used for Phase 9 integration testing.',
        githubUrl:
          'https://github.com/example/project',
        liveUrl:
          'https://example.com/project',
        features:
          'Authentication, market analytics, skill analysis',
        implementationNotes:
          'Built with React, Node.js and PostgreSQL.',
      });

    expect(response.status).toBe(201);

    expect(response.body.data.title).toBe(
      'CareerEvidence Test Project',
    );

    expect(response.body.data.studentId).toBe(
      userId,
    );

    const databaseProject =
      await prisma.project.findUnique({
        where: {
          id: response.body.data.id,
        },
      });

    expect(databaseProject).not.toBeNull();

    expect(databaseProject?.studentId).toBe(
      userId,
    );
  });

  it('lists only the authenticated student projects', async () => {
    const first = await createAuthenticatedUser();
    const second = await createAuthenticatedUser();

    await request(first.app)
      .post('/api/student/projects')
      .set('Authorization', `Bearer ${first.token}`)
      .send({
        title: 'First Student Project',
        description: 'First student project',
      });

    await request(second.app)
      .post('/api/student/projects')
      .set('Authorization', `Bearer ${second.token}`)
      .send({
        title: 'Second Student Project',
        description: 'Second student project',
      });

    const response = await request(first.app)
      .get('/api/student/projects')
      .set('Authorization', `Bearer ${first.token}`);

    expect(response.status).toBe(200);

    expect(
      response.body.data.some(
        (project: { title: string }) =>
          project.title === 'First Student Project',
      ),
    ).toBe(true);

    expect(
      response.body.data.some(
        (project: { title: string }) =>
          project.title === 'Second Student Project',
      ),
    ).toBe(false);
  });

  it('gets one project belonging to the student', async () => {
    const { app, token } =
      await createAuthenticatedUser();

    const createResponse = await request(app)
      .post('/api/student/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Single Project',
        description: 'Single project description',
      });

    const projectId =
      createResponse.body.data.id;

    const response = await request(app)
      .get(`/api/student/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(projectId);
  });

  it('updates a project owned by the student', async () => {
    const { app, token } =
      await createAuthenticatedUser();

    const createResponse = await request(app)
      .post('/api/student/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Original Title',
        description: 'Original description',
      });

    const projectId =
      createResponse.body.data.id;

    const response = await request(app)
      .put(`/api/student/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Updated Title',
        description: 'Updated description',
      });

    expect(response.status).toBe(200);
    expect(response.body.data.title).toBe(
      'Updated Title',
    );
    expect(response.body.data.description).toBe(
      'Updated description',
    );
  });

  it('deletes a project owned by the student', async () => {
    const { app, token } =
      await createAuthenticatedUser();

    const createResponse = await request(app)
      .post('/api/student/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Delete Me',
        description: 'Project to delete',
      });

    const projectId =
      createResponse.body.data.id;

    const response = await request(app)
      .delete(`/api/student/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(204);

    const databaseProject =
      await prisma.project.findUnique({
        where: {
          id: projectId,
        },
      });

    expect(databaseProject).toBeNull();
  });

  it('prevents one student from accessing another student project', async () => {
    const first = await createAuthenticatedUser();
    const second = await createAuthenticatedUser();

    const createResponse = await request(first.app)
      .post('/api/student/projects')
      .set('Authorization', `Bearer ${first.token}`)
      .send({
        title: 'Private Project',
        description: 'Private project',
      });

    const projectId =
      createResponse.body.data.id;

    const response = await request(second.app)
      .get(`/api/student/projects/${projectId}`)
      .set('Authorization', `Bearer ${second.token}`);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe(
      'PROJECT_NOT_FOUND',
    );
  });

  it('rejects unauthenticated project access', async () => {
    const app = createApp();

    const response = await request(app)
      .get('/api/student/projects');

    expect(response.status).toBe(401);
  });
});