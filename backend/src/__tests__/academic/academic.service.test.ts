import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  AcademicService,
} from '../../academic/academic.service.js';

describe('AcademicService', () => {
  it('returns zero constraint when there are no upcoming events', async () => {
    const prisma = {
      academicEvent: {
        findMany: async () => [],
      },
    } as never;

    const service =
      new AcademicService(prisma);

    const result =
      await service.getCurrentConstraint(
        'student-id',
        new Date('2026-09-21T10:00:00Z'),
      );

    expect(result.score).toBe(0);
    expect(result.workload).toBeNull();
    expect(result.activeEventCount).toBe(0);
  });

  it('maps high workload to 100', async () => {
    const prisma = {
      academicEvent: {
        findMany: async () => [
          {
            id: 'event-1',
            workload: 'HIGH',
            startDate:
              new Date('2026-09-21'),
            endDate:
              new Date('2026-09-23'),
          },
        ],
      },
    } as never;

    const service =
      new AcademicService(prisma);

    const result =
      await service.getCurrentConstraint(
        'student-id',
        new Date('2026-09-21'),
      );

    expect(result.score).toBe(100);
    expect(result.workload).toBe('HIGH');
  });
});