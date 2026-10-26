import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  calculatePriority,
  validatePriorityWeights,
} from '../../recommendations/priority.engine.js';

describe('Priority engine', () => {
  it('calculates the specification default formula', () => {
    const result =
      calculatePriority({
        marketRelevance: 70,
        roleRelevance: 100,
        gapSeverity: 85,
        evidenceGap: 100,
        academicConstraint: 20,
      });

    /*
     * 0.30*70 +
     * 0.20*100 +
     * 0.25*85 +
     * 0.15*100 -
     * 0.10*20
     *
     * = 71.25
     */
    expect(
      result.priorityScore,
    ).toBe(75);
  });

  it('academic constraint reduces priority', () => {
    const low =
      calculatePriority({
        marketRelevance: 70,
        roleRelevance: 100,
        gapSeverity: 85,
        evidenceGap: 100,
        academicConstraint: 0,
      });

    const high =
      calculatePriority({
        marketRelevance: 70,
        roleRelevance: 100,
        gapSeverity: 85,
        evidenceGap: 100,
        academicConstraint: 100,
      });

    expect(
      high.priorityScore,
    ).toBeLessThan(
      low.priorityScore,
    );
  });

  it('clamps inputs to 0-100', () => {
    const result =
      calculatePriority({
        marketRelevance: 150,
        roleRelevance: -20,
        gapSeverity: 200,
        evidenceGap: -10,
        academicConstraint: 0,
      });

    expect(
      result.marketRelevance,
    ).toBe(100);

    expect(
      result.roleRelevance,
    ).toBe(0);

    expect(
      result.gapSeverity,
    ).toBe(100);

    expect(
      result.evidenceGap,
    ).toBe(0);
  });

  it('rejects weights that do not sum to one', () => {
    expect(() =>
      validatePriorityWeights({
        market: 0.5,
        role: 0.5,
        gap: 0.5,
        evidence: 0,
        academic: 0,
      }),
    ).toThrow(
      'PRIORITY_WEIGHTS_MUST_SUM_TO_1',
    );
  });

  it('accepts configurable weights', () => {
    const result =
      calculatePriority(
        {
          marketRelevance: 100,
          roleRelevance: 0,
          gapSeverity: 0,
          evidenceGap: 0,
          academicConstraint: 0,
        },
        {
          market: 1,
          role: 0,
          gap: 0,
          evidence: 0,
          academic: 0,
        },
      );

    expect(
      result.priorityScore,
    ).toBe(100);
  });
});