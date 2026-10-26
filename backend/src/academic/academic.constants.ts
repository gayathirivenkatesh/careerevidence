import type {
  AcademicWorkload,
} from '@prisma/client';

export const ACADEMIC_CONSTRAINT_SCORE: Record<
  AcademicWorkload,
  number
> = {
  LOW: 20,
  MEDIUM: 60,
  HIGH: 100,
};

export const NO_ACADEMIC_CONSTRAINT_SCORE = 0;

export const HIGH_WORKLOAD_MAX_ACTION_HOURS = 4;

export const LOW_WORKLOAD_MIN_ACTION_HOURS = 8;

export const LOW_WORKLOAD_MAX_ACTION_HOURS = 15;