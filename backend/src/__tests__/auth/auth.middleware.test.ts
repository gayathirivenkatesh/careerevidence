import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createAccessToken } from '../../auth/jwt.service.js';
import { requireAuth } from '../../middleware/auth.middleware.js';

function createTestApp() {
  const app = express();

  app.get(
    '/protected',
    requireAuth,
    (req, res) => {
      res.status(200).json({
        userId: req.user?.id,
        role: req.user?.role,
      });
    },
  );

  return app;
}

describe('Authentication middleware', () => {
  it('rejects requests without authorization header', async () => {
    const app = createTestApp();

    const response = await request(app)
      .get('/protected');

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('UNAUTHORIZED');
  });

  it('rejects malformed authorization header', async () => {
    const app = createTestApp();

    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Token something');

    expect(response.status).toBe(401);
  });

  it('rejects invalid token', async () => {
    const app = createTestApp();

    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
    expect(response.body.error).toBe(
      'INVALID_OR_EXPIRED_TOKEN',
    );
  });

  it('accepts valid token', async () => {
    const app = createTestApp();

    const token = createAccessToken({
      sub: '00000000-0000-0000-0000-000000000001',
      role: 'STUDENT',
    });

    const response = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.userId).toBe(
      '00000000-0000-0000-0000-000000000001',
    );
    expect(response.body.role).toBe('STUDENT');
  });
});