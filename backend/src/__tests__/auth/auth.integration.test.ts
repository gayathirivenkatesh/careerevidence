import request from 'supertest';
import { describe, expect, it } from 'vitest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import authRoutes from '../../auth/auth.routes.js';

function createAuthApp() {
  const app = express();

  app.use(express.json());
  app.use('/api/auth', authRoutes);

  return app;
}

function uniqueEmail(): string {
  return `phase8-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}@example.com`;
}

describe('Authentication - PostgreSQL integration', () => {
  const app = createAuthApp();

  it('registers a student account', async () => {
    const email = uniqueEmail();

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email,
        password: 'StrongPassword123!',
        name: 'Phase 8 Student',
      });

    expect(response.status).toBe(201);

    expect(response.body.data.token).toEqual(
      expect.any(String),
    );

    expect(response.body.data.user.email).toBe(email);

    expect(response.body.data.user.name).toBe(
      'Phase 8 Student',
    );

    expect(response.body.data.user.role).toBe('STUDENT');

    expect(response.body.data.user).not.toHaveProperty(
      'passwordHash',
    );

    const databaseUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    expect(databaseUser).not.toBeNull();

    expect(databaseUser?.passwordHash).not.toBe(
      'StrongPassword123!',
    );
  });

  it('rejects duplicate email', async () => {
    const email = uniqueEmail();

    const first = await request(app)
      .post('/api/auth/register')
      .send({
        email,
        password: 'StrongPassword123!',
        name: 'First Student',
      });

    expect(first.status).toBe(201);

    const second = await request(app)
      .post('/api/auth/register')
      .send({
        email,
        password: 'AnotherPassword123!',
        name: 'Second Student',
      });

    expect(second.status).toBe(409);
    expect(second.body.error).toBe(
      'EMAIL_ALREADY_EXISTS',
    );
  });

  it('logs in with valid credentials', async () => {
    const email = uniqueEmail();
    const password = 'StrongPassword123!';

    await request(app)
      .post('/api/auth/register')
      .send({
        email,
        password,
        name: 'Login Student',
      });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email,
        password,
      });

    expect(response.status).toBe(200);

    expect(response.body.data.token).toEqual(
      expect.any(String),
    );

    expect(response.body.data.user.email).toBe(email);
  });

  it('rejects an incorrect password', async () => {
    const email = uniqueEmail();

    await request(app)
      .post('/api/auth/register')
      .send({
        email,
        password: 'CorrectPassword123!',
        name: 'Wrong Password Student',
      });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email,
        password: 'WrongPassword123!',
      });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe(
      'INVALID_CREDENTIALS',
    );
  });

  it('rejects an unknown email', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: uniqueEmail(),
        password: 'SomePassword123!',
      });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe(
      'INVALID_CREDENTIALS',
    );
  });

  it('returns the authenticated user from /me', async () => {
    const email = uniqueEmail();

    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email,
        password: 'StrongPassword123!',
        name: 'Me Student',
      });

    const token = registerResponse.body.data.token;

    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body.data.email).toBe(email);
    expect(response.body.data.name).toBe('Me Student');

    expect(response.body.data).not.toHaveProperty(
      'passwordHash',
    );
  });

  it('rejects /me without authentication', async () => {
    const response = await request(app)
      .get('/api/auth/me');

    expect(response.status).toBe(401);
  });
});