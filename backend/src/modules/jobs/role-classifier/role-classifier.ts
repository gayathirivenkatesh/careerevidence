import type { NormalizedJob } from '../../../integrations/jobs/types';
import {
  ROLE_CONFIDENCE_THRESHOLD,
  ROLE_CLASSIFICATION_WEIGHTS,
  ROLE_SIGNALS,
} from './role-classifier.constants';

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function containsSignal(text: string, signal: string): boolean {
  const normalizedSignal = normalizeText(signal);

  if (!normalizedSignal) {
    return false;
  }

  return text.includes(normalizedSignal);
}

/**
 * Title matching is intentionally strong.
 *
 * If the job title directly identifies a supported role,
 * that role receives the full title score.
 */
function calculateTitleScore(
  title: string,
  signals: readonly string[],
): number {
  const normalizedTitle = normalizeText(title);

  if (!normalizedTitle) {
    return 0;
  }

  return signals.some((signal) =>
    containsSignal(normalizedTitle, signal),
  )
    ? 1
    : 0;
}

function calculateTextScore(
  text: string,
  signals: readonly string[],
): number {
  const normalizedText = normalizeText(text);

  if (!normalizedText || signals.length === 0) {
    return 0;
  }

  const matches = signals.filter((signal) =>
    containsSignal(normalizedText, signal),
  );

  if (matches.length === 0) {
    return 0;
  }

  const denominator = Math.min(signals.length, 3);

  return Math.min(matches.length / denominator, 1);
}

function calculateRoleScore(
  job: NormalizedJob,
  role: keyof typeof ROLE_SIGNALS,
) {
  const signals = ROLE_SIGNALS[role];

  const titleScore = calculateTitleScore(
    job.title,
    signals.title,
  );

  const responsibilityScore = calculateTextScore(
    job.description,
    signals.responsibilities,
  );

  const technologyScore = calculateTextScore(
    job.description,
    signals.technology,
  );

  let score =
    titleScore * ROLE_CLASSIFICATION_WEIGHTS.title +
    responsibilityScore *
      ROLE_CLASSIFICATION_WEIGHTS.responsibilities +
    technologyScore *
      ROLE_CLASSIFICATION_WEIGHTS.technology;

  /**
   * Full-stack precedence.
   *
   * A job that clearly contains both React and Node.js
   * receives a deterministic full-stack boost.
   */
  if (role === 'JUNIOR_FULLSTACK_DEVELOPER') {
    const hasReact = containsSignal(
      job.description,
      'react',
    );

    const hasNode = containsSignal(
      job.description,
      'node.js',
    );

    if (hasReact && hasNode) {
      score = Math.min(score + 0.2, 1);
    }
  }

  return {
    role,
    score,
    titleScore,
    responsibilityScore,
    technologyScore,
  };
}

export function classifyPrimaryRole(job: NormalizedJob) {
  const roles = Object.keys(ROLE_SIGNALS) as Array<
    keyof typeof ROLE_SIGNALS
  >;

  const scores = roles.map((role) =>
    calculateRoleScore(job, role),
  );

  /**
   * Highest score first.
   */
  scores.sort((a, b) => b.score - a.score);

  const best = scores[0];

  /**
   * Nothing reached the required confidence.
   * Keep the job unclassified rather than forcing a role.
   */
  if (
    !best ||
    best.score < ROLE_CONFIDENCE_THRESHOLD
  ) {
    return {
      primaryRole: null,
      confidence: best?.score ?? 0,
      method: 'deterministic' as const,
      reason:
        'No supported role reached the minimum classification confidence.',
      scores,
    };
  }

  return {
    primaryRole: best.role,
    confidence: best.score,
    method: 'deterministic' as const,
    reason: `Classified as ${best.role} using title, responsibility, and technology signals.`,
    scores,
  };
}