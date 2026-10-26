import {
  DEFAULT_PRIORITY_WEIGHTS,
} from './priority.constants.js';

import type {
  PriorityInputs,
  PriorityResult,
  PriorityWeights,
} from './priority.types.js';

export function validatePriorityWeights(
  weights: PriorityWeights,
): void {
  const total =
    weights.market +
    weights.role +
    weights.gap +
    weights.evidence +
    weights.academic;

  if (Math.abs(total - 1) > 0.000001) {
    throw new Error(
      'PRIORITY_WEIGHTS_MUST_SUM_TO_1',
    );
  }

  for (const value of Object.values(weights)) {
    if (value < 0 || value > 1) {
      throw new Error(
        'PRIORITY_WEIGHT_MUST_BE_BETWEEN_0_AND_1',
      );
    }
  }
}

export function calculatePriority(
  inputs: PriorityInputs,
  weights: PriorityWeights =
    DEFAULT_PRIORITY_WEIGHTS,
): PriorityResult {
  validatePriorityWeights(weights);

  const market =
    normalize(inputs.marketRelevance);

  const role =
    normalize(inputs.roleRelevance);

  const gap =
    normalize(inputs.gapSeverity);

  const evidence =
    normalize(inputs.evidenceGap);

  const academic =
    normalize(inputs.academicConstraint);

  const score =
    weights.market * market +
    weights.role * role +
    weights.gap * gap +
    weights.evidence * evidence -
    weights.academic * academic;

  return {
    priorityScore: clamp(
      Math.round(score),
      0,
      100,
    ),

    marketRelevance: market,
    roleRelevance: role,
    gapSeverity: gap,
    evidenceGap: evidence,
    academicConstraint: academic,
  };
}

function normalize(value: number): number {
  if (!Number.isFinite(value)) {
    throw new Error(
      'PRIORITY_INPUT_MUST_BE_FINITE',
    );
  }

  return Math.min(
    100,
    Math.max(0, value),
  );
}

function clamp(
  value: number,
  min: number,
  max: number,
): number {
  return Math.min(
    max,
    Math.max(min, value),
  );
}