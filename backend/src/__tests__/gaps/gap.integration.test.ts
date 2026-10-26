import express from 'express';
import request from 'supertest';
import {
  describe,
  expect,
  it,
} from 'vitest';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

import authRoutes from '../../auth/auth.routes.js';
import alignmentRoutes from '../../alignment/alignment.routes.js';

function createApp() {
  const app = express();

  app.use(express.json());

  app.use('/api/auth', authRoutes);

  app.use(
    '/api/student/alignment',
    alignmentRoutes,
  );

  return app;
}

function uniqueEmail(): string {
  return `gap-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}@example.com`;
}

async function createUser() {
  const app = createApp();

  const register =
    await request(app)
      .post('/api/auth/register')
      .send({
        email: uniqueEmail(),
        password: 'StrongPassword123!',
        name: 'Gap Student',
      });

  expect(register.status).toBe(201);

  return {
    app,
    token:
      register.body.data.token as string,
    userId:
      register.body.data.user.id as string,
  };
}

describe('Skill gaps - PostgreSQL integration', () => {
  it('returns a real gap analysis for a seeded role', async () => {
    const {
      app,
      token,
    } = await createUser();

    const role =
      await prisma.role.findFirst({
        where: {
          code:
            'JUNIOR_REACT_DEVELOPER',
        },
      });

    expect(role).not.toBeNull();

    const response =
      await request(app)
        .get(
          `/api/student/alignment/gaps/roles/${role!.id}`,
        )
        .set(
          'Authorization',
          `Bearer ${token}`,
        );

    expect(response.status).toBe(200);

    expect(
      response.body.data.roleCode,
    ).toBe(
      'JUNIOR_REACT_DEVELOPER',
    );

    expect(
      response.body.data.marketSkillThresholdPercentage,
    ).toBe(20);

    expect(
      Array.isArray(
        response.body.data.gaps,
      ),
    ).toBe(true);
  });

  it('returns target-role gaps after setting target role', async () => {
    const {
      app,
      token,
      userId,
    } = await createUser();

    const role =
      await prisma.role.findFirst({
        where: {
          code:
            'JUNIOR_FULLSTACK_DEVELOPER',
        },
      });

    expect(role).not.toBeNull();

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        targetRoleId: role!.id,
      },
    });

    const response =
      await request(app)
        .get(
          '/api/student/alignment/gaps/target',
        )
        .set(
          'Authorization',
          `Bearer ${token}`,
        );

    expect(response.status).toBe(200);

    expect(
      response.body.data.roleCode,
    ).toBe(
      'JUNIOR_FULLSTACK_DEVELOPER',
    );
  });
});