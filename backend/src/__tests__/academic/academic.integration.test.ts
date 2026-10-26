import express from 'express';
import crypto from 'node:crypto';
import request from 'supertest';
import {
  describe,
  expect,
  it,
} from 'vitest';

import academicRoutes from '../../academic/academic.routes.js';
import { createAccessToken } from '../../auth/jwt.service.js';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

function createApp() {
  const app = express();

  app.use(express.json());

  app.use(
    '/api/student/academic-events',
    academicRoutes,
  );

  return app;
}

function uniqueEmail(): string {
  return `phase11-academic-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}-${crypto.randomUUID()}@example.com`;
}

async function createUser() {
  const app = createApp();

  const user = await prisma.user.create({
    data: {
      email: uniqueEmail(),
      passwordHash: 'integration-test-password-hash',
      name: 'Phase 11 Student',
      careerHoursPerWeek: 14,
      role: 'STUDENT',
    },
  });

  const token = createAccessToken({
    sub: user.id,
    role: user.role,
  });

  return {
    app,
    token,
    userId: user.id,
  };
}

describe(
  'Academic events PostgreSQL integration',
  () => {
    it('creates and retrieves an academic event', async () => {
      const {
        app,
        token,
      } = await createUser();

      const create =
        await request(app)
          .post(
            '/api/student/academic-events',
          )
          .set(
            'Authorization',
            `Bearer ${token}`,
          )
          .send({
            type: 'EXAM',
            title:
              'Internal Assessment',
            description:
              'Semester assessment',
            workload: 'HIGH',
            startDate:
              '2026-09-25T00:00:00.000Z',
            endDate:
              '2026-09-28T23:59:59.000Z',
          });

      expect(
        create.status,
      ).toBe(201);

      expect(
        create.body.data.workload,
      ).toBe('HIGH');

      const list =
        await request(app)
          .get(
            '/api/student/academic-events',
          )
          .set(
            'Authorization',
            `Bearer ${token}`,
          );

      expect(
        list.status,
      ).toBe(200);

      expect(
        list.body.data.length,
      ).toBeGreaterThan(0);
    });

    it('prevents access to another student event', async () => {
      const first =
        await createUser();

      const second =
        await createUser();

      const create =
        await request(first.app)
          .post(
            '/api/student/academic-events',
          )
          .set(
            'Authorization',
            `Bearer ${first.token}`,
          )
          .send({
            type: 'ASSIGNMENT',
            title:
              'Private Assignment',
            description:
              'Private event',
            workload: 'MEDIUM',
            startDate:
              '2026-10-01T00:00:00.000Z',
            endDate:
              '2026-10-02T00:00:00.000Z',
          });

      expect(
        create.status,
      ).toBe(201);

      const eventId =
        create.body.data.id;

      const result =
        await request(second.app)
          .get(
            `/api/student/academic-events/${eventId}`,
          )
          .set(
            'Authorization',
            `Bearer ${second.token}`,
          );

      expect(
        result.status,
      ).toBe(404);
    });
  },
);