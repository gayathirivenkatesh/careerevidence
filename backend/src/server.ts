
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

import 'dotenv/config';

import express from 'express';

import { env } from './config/env.js';
import cors from 'cors';

import {
  createJobProviderFromEnv,
} from './integrations/jobs/providers/provider.factory.js';

import {
  JobCollectionScheduler,
} from './modules/jobs/collection/job-collection.scheduler.js';

import {
  createJobCollectionRouter,
} from './modules/jobs/collection/job-collection.routes.js';

import { createJobCollectionHistoryRouter } from './modules/jobs/collection/job-collection-history.routes.js';


import {
  createMarketAnalyticsRouter,
} from './modules/jobs/market-analytics/market-analytics.routes.js';

import roleRoutes from './roles/role.routes.js';
import authRoutes from './auth/auth.routes';
import userRoutes from './users/user.routes';
import projectRoutes from './projects/project.routes.js';
import alignmentRoutes from './alignment/alignment.routes.js';
import academicRoutes from './academic/academic.routes.js';
import recommendationRoutes from './recommendations/recommendation.routes.js';

const app = express();

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    env: env.NODE_ENV,
  });
});

const server = app.listen(
  env.PORT,
  () => {
    console.log(
      `CareerEvidence backend listening on port ${env.PORT}`,
    );
  },
);

const jobProvider =
  createJobProviderFromEnv(env);

const jobCollectionScheduler =
  new JobCollectionScheduler({
    provider: jobProvider,

    country:
      env.JOB_PROVIDER_COUNTRY,

    resultsPerQuery:
      env.JOB_RESULTS_PER_QUERY,

    maxPagesPerQuery:
      env.JOB_MAX_PAGES_PER_QUERY,

    maxRetries: 3,

    retryDelayMs: 1000,

    requestDelayMs: 500,

    enabled:
      env.JOB_COLLECTION_ENABLED,

    intervalHours:
      env.JOB_COLLECTION_INTERVAL_HOURS,
  });

jobCollectionScheduler.start();

app.use(
  '/api/admin/collection',
  createJobCollectionRouter(
    jobCollectionScheduler,
  ),
);

app.use('/api/admin/collection', createJobCollectionHistoryRouter());

app.use(
  '/api/market-analytics',
  createMarketAnalyticsRouter(
    prisma,
    {
      freshnessDays:
        env.JOB_FRESHNESS_DAYS,

      minimumSampleSize:
        env.MIN_MARKET_SAMPLE_SIZE,
    },
  ),
);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/student/projects', projectRoutes);
app.use('/api/alignment', alignmentRoutes);
app.use(
  '/api/academic',
  academicRoutes,
);
app.use(
  '/api/recommendations',
  recommendationRoutes,
);
app.use('/api/roles', roleRoutes);

export {
  app,
  server,
  jobCollectionScheduler,
};