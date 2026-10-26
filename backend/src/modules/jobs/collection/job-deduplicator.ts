import type { NormalizedJob } from '../../../integrations/jobs/types';

export function getJobDeduplicationKey(
  job: NormalizedJob,
): string {
  return `${job.provider}:${job.externalId}`;
}

export function deduplicateJobs(
  jobs: NormalizedJob[],
): NormalizedJob[] {
  const seen = new Set<string>();
  const unique: NormalizedJob[] = [];

  for (const job of jobs) {
    const key = getJobDeduplicationKey(job);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    unique.push(job);
  }

  return unique;
}