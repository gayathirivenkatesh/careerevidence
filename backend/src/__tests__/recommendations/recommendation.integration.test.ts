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
import recommendationRoutes from '../../recommendations/recommendation.routes.js';

function createApp() {
  const app = express();

  app.use(express.json());

  app.use(
    '/api/auth',
    authRoutes,
  );

  app.use(
    '/api/student/recommendations',
    recommendationRoutes,
  );

  return app;
}

function uniqueEmail(): string {
  return `phase11-rec-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}@example.com`;
}

async function createUser() {
  const app =
    createApp();

  const response =
    await request(app)
      .post('/api/auth/register')
      .send({
        email: uniqueEmail(),
        password:
          'StrongPassword123!',
        name:
          'Phase 11 Recommendation Student',
      });

  expect(
    response.status,
  ).toBe(201);

  return {
    app,
    token:
      response.body.data.token as string,
    userId:
      response.body.data.user.id as string,
  };
}

describe(
  'Recommendation PostgreSQL integration',
  () => {
    it('returns recommendations for the target role', async () => {
      const {
        app,
        token,
        userId,
      } = await createUser();

      const role =
        await prisma.role.findFirst({
          where: {
            code:
              'JUNIOR_REACT_DEVELOPER',
          },
        });

      expect(role).not.toBeNull();

      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          targetRoleId:
            role!.id,
          careerHoursPerWeek:
            14,
        },
      });

      const result =
        await request(app)
          .post(
            '/api/student/recommendations/generate/target',
          )
          .set(
            'Authorization',
            `Bearer ${token}`,
          );

      expect(
        result.status,
      ).toBe(200);

      expect(
        result.body.data.roleCode,
      ).toBe(
        'JUNIOR_REACT_DEVELOPER',
      );

      expect(
        Array.isArray(
          result.body.data
            .recommendations,
        ),
      ).toBe(true);
    });

    it('returns active recommendations', async () => {
      const {
        app,
        token,
      } = await createUser();

      const result =
        await request(app)
          .get(
            '/api/student/recommendations',
          )
          .set(
            'Authorization',
            `Bearer ${token}`,
          );

      expect(
        result.status,
      ).toBe(200);

      expect(
        Array.isArray(
          result.body.data,
        ),
      ).toBe(true);
    });
  },
);