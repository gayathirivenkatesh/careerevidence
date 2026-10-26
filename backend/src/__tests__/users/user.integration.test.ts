import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import userRoutes from '../../users/user.routes.js';
import authRoutes from '../../auth/auth.routes.js';

function createApp() {
  const app = express();

  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);

  return app;
}

function uniqueEmail(): string {
  return `profile-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}@example.com`;
}

async function createAuthenticatedUser() {
  const app = createApp();

  const email = uniqueEmail();

  const response = await request(app)
    .post('/api/auth/register')
    .send({
      email,
      password: 'StrongPassword123!',
      name: 'Profile Student',
    });

  return {
    app,
    token: response.body.data.token as string,
    email,
  };
}

describe('Student profile - PostgreSQL integration', () => {
  it('returns the authenticated student profile', async () => {
    const { app, token, email } =
      await createAuthenticatedUser();

    const response = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body.data.email).toBe(email);
    expect(response.body.data.name).toBe(
      'Profile Student',
    );

    expect(response.body.data.careerHoursPerWeek).toBe(14);

    expect(response.body.data).not.toHaveProperty(
      'passwordHash',
    );
  });

  it('updates the student profile', async () => {
    const { app, token, email } =
      await createAuthenticatedUser();

    const role = await prisma.role.findFirst({
      orderBy: {
        code: 'asc',
      },
    });

    expect(role).not.toBeNull();

    const response = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated Student',
        education: 'B.Tech Computer Technology',
        graduationYear: 2026,
        careerHoursPerWeek: 20,
        targetRoleId: role!.id,
      });

    expect(response.status).toBe(200);

    expect(response.body.data.email).toBe(email);
    expect(response.body.data.name).toBe(
      'Updated Student',
    );

    expect(response.body.data.education).toBe(
      'B.Tech Computer Technology',
    );

    expect(response.body.data.graduationYear).toBe(2026);

    expect(response.body.data.careerHoursPerWeek).toBe(20);

    expect(response.body.data.targetRole.id).toBe(
      role!.id,
    );

    const databaseUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    expect(databaseUser?.name).toBe(
      'Updated Student',
    );

    expect(databaseUser?.education).toBe(
      'B.Tech Computer Technology',
    );

    expect(databaseUser?.graduationYear).toBe(2026);

    expect(databaseUser?.careerHoursPerWeek).toBe(20);

    expect(databaseUser?.targetRoleId).toBe(role!.id);
  });

  it('allows clearing the target role', async () => {
    const { app, token } =
      await createAuthenticatedUser();

    const role = await prisma.role.findFirst();

    expect(role).not.toBeNull();

    await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({
        targetRoleId: role!.id,
      });

    const response = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({
        targetRoleId: null,
      });

    expect(response.status).toBe(200);
    expect(response.body.data.targetRole).toBeNull();
  });

  it('rejects an invalid target role', async () => {
    const { app, token } =
      await createAuthenticatedUser();

    const response = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({
        targetRoleId:
          '00000000-0000-0000-0000-000000000000',
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe(
      'INVALID_TARGET_ROLE',
    );
  });

  it('rejects career hours below one', async () => {
    const { app, token } =
      await createAuthenticatedUser();

    const response = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({
        careerHoursPerWeek: 0,
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe(
      'INVALID_CAREER_HOURS',
    );
  });

  it('rejects career hours above 168', async () => {
    const { app, token } =
      await createAuthenticatedUser();

    const response = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({
        careerHoursPerWeek: 169,
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe(
      'INVALID_CAREER_HOURS',
    );
  });

  it('rejects an invalid graduation year', async () => {
    const { app, token } =
      await createAuthenticatedUser();

    const response = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({
        graduationYear: 1800,
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe(
      'INVALID_GRADUATION_YEAR',
    );
  });

  it('rejects unauthenticated profile access', async () => {
    const app = createApp();

    const response = await request(app)
      .get('/api/users/me');

    expect(response.status).toBe(401);
  });

  it('does not allow protected identity fields to be changed', async () => {
    const { app, token } =
      await createAuthenticatedUser();

    const response = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({
        id: 'another-user-id',
        email: 'attacker@example.com',
        passwordHash: 'fake',
        role: 'ADMIN',
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe(
      'INVALID_PROFILE_FIELD',
    );
  });
});