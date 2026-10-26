import {
  JobEntryLevelStatus,
  JobProcessingStatus,
  JobStatus,
} from '@prisma/client';

import {
  evaluateMarketEligibility,
} from '../../modules/jobs/market-analytics/market-eligibility';

describe('Market eligibility', () => {
  const now =
    new Date(
      '2026-09-20T12:00:00.000Z',
    );

  const baseJob = {
    entryLevelStatus:
      JobEntryLevelStatus.ACCEPTED,

    processingStatus:
      JobProcessingStatus.PROCESSED,

    status:
      JobStatus.ACTIVE,

    primaryRoleId:
      'role-id',

    postedDate:
      new Date(
        '2026-09-10T12:00:00.000Z',
      ),

    lastCheckedAt:
      now,
  };

  it('accepts a valid current job', () => {
    expect(
      evaluateMarketEligibility(
        baseJob,
        {
          freshnessDays: 30,
          now,
        },
      ).eligible,
    ).toBe(true);
  });

  it('rejects review jobs', () => {
    expect(
      evaluateMarketEligibility(
        {
          ...baseJob,
          entryLevelStatus:
            JobEntryLevelStatus.REVIEW,
        },
        {
          freshnessDays: 30,
          now,
        },
      ).eligible,
    ).toBe(false);
  });

  it('rejects rejected jobs', () => {
    expect(
      evaluateMarketEligibility(
        {
          ...baseJob,
          entryLevelStatus:
            JobEntryLevelStatus.REJECTED,
        },
        {
          freshnessDays: 30,
          now,
        },
      ).eligible,
    ).toBe(false);
  });

  it('rejects unprocessed jobs', () => {
    expect(
      evaluateMarketEligibility(
        {
          ...baseJob,
          processingStatus:
            JobProcessingStatus.ERROR,
        },
        {
          freshnessDays: 30,
          now,
        },
      ).eligible,
    ).toBe(false);
  });

  it('rejects inactive jobs', () => {
    expect(
      evaluateMarketEligibility(
        {
          ...baseJob,
          status:
            JobStatus.STALE,
        },
        {
          freshnessDays: 30,
          now,
        },
      ).eligible,
    ).toBe(false);
  });

  it('rejects jobs without a role', () => {
    expect(
      evaluateMarketEligibility(
        {
          ...baseJob,
          primaryRoleId: null,
        },
        {
          freshnessDays: 30,
          now,
        },
      ).eligible,
    ).toBe(false);
  });

  it('rejects stale jobs', () => {
    expect(
      evaluateMarketEligibility(
        {
          ...baseJob,
          postedDate:
            new Date(
              '2026-07-01T12:00:00.000Z',
            ),
        },
        {
          freshnessDays: 30,
          now,
        },
      ).eligible,
    ).toBe(false);
  });
});