import { PrismaClient } from '@prisma/client';
import { TestFixtureProvider } from './src/integrations/jobs/providers/test-fixture.provider';
import { persistCollectedJobs } from './src/modules/jobs/collection/job-collection.persistence';
import { MarketAnalyticsService } from './src/modules/jobs/market-analytics/market-analytics.service';

const prisma = new PrismaClient();

async function main() {
  const provider = new TestFixtureProvider();
  const res = await provider.searchJobs({ query: '', country: 'india', page: 1, resultsPerPage: 10 });
  console.log('Fixtures count:', res.jobs.length);

  const run = await prisma.jobCollectionRun.create({
    data: {
      provider: 'test-fixture',
      status: 'COMPLETED',
      startedAt: new Date(),
      finishedAt: new Date(),
      queriesExecuted: 1,
      jobsReceived: res.jobs.length,
      jobsNew: 0,
      jobsUpdated: 0,
      jobsDuplicate: 0,
      jobsRejected: 0,
      jobsReview: 0,
      jobsAccepted: res.jobs.length,
      errors: 0,
    },
  });

  const persistRes = await persistCollectedJobs(res.jobs, { collectionRunId: run.id });
  console.log('Persist result:', persistRes);

  const marketService = new MarketAnalyticsService({
    prisma,
    freshnessDays: 30,
    minimumSampleSize: 15,
  });

  const analytics = await marketService.generateAnalytics();
  console.log('Market Analytics Roles:');
  for (const r of analytics.roles) {
    console.log(` - [${r.roleCode}] sampleSize=${r.sampleSize}, sufficient=${r.sufficientSampleSize}, skillsCount=${r.skills.length}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
