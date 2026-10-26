import request from 'supertest';
import express from 'express';
import { describe, expect, it } from 'vitest';

import roleRoutes from '../../roles/role.routes.js';

const app = express();

app.use(express.json());
app.use('/api/roles', roleRoutes);

describe('Roles API', () => {
  it('returns the five supported roles', async () => {
    const response = await request(app)
      .get('/api/roles');

    expect(response.status).toBe(200);

    expect(Array.isArray(response.body)).toBe(true);

    expect(response.body).toHaveLength(5);

    const roleCodes = response.body.map(
      (role: { code: string }) => role.code,
    );

    expect(roleCodes).toContain(
      'JUNIOR_REACT_DEVELOPER',
    );

    expect(roleCodes).toContain(
      'JUNIOR_FRONTEND_DEVELOPER',
    );

    expect(roleCodes).toContain(
      'JUNIOR_FULLSTACK_DEVELOPER',
    );

    expect(roleCodes).toContain(
      'JUNIOR_NODE_DEVELOPER',
    );

    expect(roleCodes).toContain(
      'JUNIOR_SOFTWARE_DEVELOPER',
    );
  });

  it('returns a role by id', async () => {
    const listResponse = await request(app)
      .get('/api/roles');

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.length).toBeGreaterThan(0);

    const roleId = listResponse.body[0].id;

    const response = await request(app)
      .get(`/api/roles/${roleId}`);

    expect(response.status).toBe(200);

    expect(response.body.id).toBe(roleId);
    expect(response.body.code).toBeDefined();
    expect(response.body.name).toBeDefined();
    expect(response.body.description).toBeDefined();
  });

  it('returns 404 for an unknown role', async () => {
    const response = await request(app)
      .get('/api/roles/00000000-0000-0000-0000-000000000000');

    expect(response.status).toBe(404);

    expect(response.body.error).toBe(
      'ROLE_NOT_FOUND',
    );
  });
});