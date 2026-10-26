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
import userRoutes from '../../users/user.routes.js';
import projectRoutes from '../../projects/project.routes.js';
import alignmentRoutes from '../../alignment/alignment.routes.js';

function createApp() {
  const app = express();

  app.use(express.json());

  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use(
    '/api/student/projects',
    projectRoutes,
  );
  app.use(
    '/api/student/alignment',
    alignmentRoutes,
  );

  return app;
}

function uniqueEmail(): string {
  return `phase10-${Date.now()}-${Math.random()
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
        name: 'Phase 10 Student',
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

describe('Role alignment - PostgreSQL integration', () => {
  it('returns alignment for a real seeded role', async () => {
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
          `/api/student/alignment/roles/${role!.id}`,
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
      response.body.data.alignment,
    ).toBeDefined();

    expect(
      Array.isArray(
        response.body.data.skills,
      ),
    ).toBe(true);
  });

  it('returns all five role analyses for role discovery', async () => {
    const {
      app,
      token,
    } = await createUser();

    const response =
      await request(app)
        .get(
          '/api/student/alignment/discovery',
        )
        .set(
          'Authorization',
          `Bearer ${token}`,
        );

    expect(response.status).toBe(200);

    expect(
      response.body.data,
    ).toHaveLength(5);

    const codes =
      response.body.data.map(
        (role: { roleCode: string }) =>
          role.roleCode,
      );

    expect(codes).toContain(
      'JUNIOR_REACT_DEVELOPER',
    );

    expect(codes).toContain(
      'JUNIOR_FRONTEND_DEVELOPER',
    );

    expect(codes).toContain(
      'JUNIOR_FULLSTACK_DEVELOPER',
    );

    expect(codes).toContain(
      'JUNIOR_NODE_DEVELOPER',
    );

    expect(codes).toContain(
      'JUNIOR_SOFTWARE_DEVELOPER',
    );
  });

  it('returns target role alignment when target role is configured', async () => {
    const {
      app,
      token,
      userId,
    } = await createUser();

    const role =
      await prisma.role.findFirst({
        where: {
          code:
            'JUNIOR_NODE_DEVELOPER',
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
          '/api/student/alignment/target',
        )
        .set(
          'Authorization',
          `Bearer ${token}`,
        );

    expect(response.status).toBe(200);

    expect(
      response.body.data.roleCode,
    ).toBe(
      'JUNIOR_NODE_DEVELOPER',
    );
  });
});