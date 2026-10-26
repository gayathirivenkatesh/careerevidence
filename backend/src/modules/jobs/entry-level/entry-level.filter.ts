import type { NormalizedJob } from '../../../integrations/jobs/types';
import type {
  EntryLevelResult,
  EntryLevelStatus,
} from './entry-level.types';
import {
  ENTRY_LEVEL_EXPERIENCE_SIGNALS,
  ENTRY_LEVEL_TITLE_SIGNALS,
  SENIOR_EXPERIENCE_PATTERNS,
  SENIOR_TITLE_SIGNALS,
} from './entry-level.constants';

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function containsAny(text: string, signals: readonly string[]): boolean {
  return signals.some((signal) => text.includes(signal));
}

function hasSeniorTitleSignal(title: string): boolean {
  const normalizedTitle = normalizeText(title);

  return SENIOR_TITLE_SIGNALS.some((signal) => {
    if (signal === 'sr ') {
      return /\bsr\b/.test(normalizedTitle);
    }

    return normalizedTitle.includes(signal);
  });
}

function hasSeniorExperience(description: string): boolean {
  return SENIOR_EXPERIENCE_PATTERNS.some((pattern) =>
    pattern.test(description),
  );
}

function hasEntryTitleSignal(title: string): boolean {
  return containsAny(
    normalizeText(title),
    ENTRY_LEVEL_TITLE_SIGNALS,
  );
}

function hasEntryExperienceSignal(description: string): boolean {
  return containsAny(
    normalizeText(description),
    ENTRY_LEVEL_EXPERIENCE_SIGNALS,
  );
}

function hasExplicitConflictingExperience(
  description: string,
): boolean {
  return hasSeniorExperience(description);
}

export function filterEntryLevelJob(
  job: NormalizedJob,
): EntryLevelResult {
  const title = normalizeText(job.title);
  const description = normalizeText(job.description);

  const entryTitle = hasEntryTitleSignal(title);
  const entryExperience = hasEntryExperienceSignal(description);

  const seniorTitle = hasSeniorTitleSignal(title);
  const seniorExperience = hasSeniorExperience(description);

  /*
   * Explicit conflict:
   * Example:
   * "Junior React Developer"
   * + "5+ years experience"
   */
  if (
    (entryTitle || entryExperience) &&
    (seniorTitle || seniorExperience)
  ) {
    return {
      status: 'REVIEW',
      reason:
        'Conflicting entry-level and seniority signals require review.',
    };
  }

  /*
   * Clearly senior role.
   */
  if (seniorTitle && seniorExperience) {
    return {
      status: 'REJECTED',
      reason:
        'Senior role title with 5+ years or more experience required.',
    };
  }

  if (seniorTitle) {
    return {
      status: 'REJECTED',
      reason: 'Senior-level role title detected.',
    };
  }

  if (seniorExperience) {
    return {
      status: 'REJECTED',
      reason: 'Senior experience requirement detected.',
    };
  }

  /*
   * Clearly entry-level.
   */
  if (entryTitle && entryExperience) {
    return {
      status: 'ACCEPTED',
      reason:
        'Entry-level title and entry-level experience requirement detected.',
    };
  }

  if (entryTitle) {
    return {
      status: 'ACCEPTED',
      reason: 'Entry-level title detected.',
    };
  }

  if (entryExperience) {
    return {
      status: 'ACCEPTED',
      reason: 'Entry-level experience requirement detected.',
    };
  }

  /*
   * No strong signal.
   */
  return {
    status: 'REVIEW',
    reason:
      'No sufficiently strong entry-level or seniority signal was detected.',
  };
}

export function getEntryLevelStatus(
  job: NormalizedJob,
): EntryLevelStatus {
  return filterEntryLevelJob(job).status;
}