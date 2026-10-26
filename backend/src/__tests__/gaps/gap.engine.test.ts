import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  analyzeSkillGap,
} from '../../gaps/gap.engine.js';

describe('Gap engine', () => {
  it('detects missing skill', () => {
    const result = analyzeSkillGap({
      skillId: '1',
      skillName: 'React',

      marketDemandPercentage: 70,
      marketJobCount: 21,
      marketDatasetSize: 30,

      knowledgeLevel: 'NONE',
      abilityLevel: 'NONE',
      evidenceLevel: 'MISSING',

      projectEvidenceCount: 0,

      marketSkillThresholdPercentage: 20,
    });

    expect(result).not.toBeNull();

    expect(
      result?.categories,
    ).toContain('MISSING_SKILL');

    expect(
      result?.primaryGap,
    ).toBe('MISSING_SKILL');
  });

  it('detects weak ability', () => {
    const result = analyzeSkillGap({
      skillId: '1',
      skillName: 'TypeScript',

      marketDemandPercentage: 50,
      marketJobCount: 15,
      marketDatasetSize: 30,

      knowledgeLevel: 'BASIC',
      abilityLevel: 'BASIC',
      evidenceLevel: 'MISSING',

      projectEvidenceCount: 0,

      marketSkillThresholdPercentage: 20,
    });

    expect(result).not.toBeNull();

    expect(
      result?.categories,
    ).toContain('WEAK_ABILITY');
  });

  it('detects missing evidence', () => {
    const result = analyzeSkillGap({
      skillId: '1',
      skillName: 'Node.js',

      marketDemandPercentage: 40,
      marketJobCount: 12,
      marketDatasetSize: 30,

      knowledgeLevel: 'WORKING',
      abilityLevel: 'WORKING',
      evidenceLevel: 'MISSING',

      projectEvidenceCount: 0,

      marketSkillThresholdPercentage: 20,
    });

    expect(result).not.toBeNull();

    expect(
      result?.categories,
    ).toContain('MISSING_EVIDENCE');

    expect(
      result?.primaryGap,
    ).toBe('MISSING_EVIDENCE');
  });

  it('ignores skills below the market threshold', () => {
    const result = analyzeSkillGap({
      skillId: '1',
      skillName: 'Docker',

      marketDemandPercentage: 10,
      marketJobCount: 3,
      marketDatasetSize: 30,

      knowledgeLevel: 'NONE',
      abilityLevel: 'NONE',
      evidenceLevel: 'MISSING',

      projectEvidenceCount: 0,

      marketSkillThresholdPercentage: 20,
    });

    expect(result).toBeNull();
  });

  it('does not report missing evidence when project evidence exists', () => {
    const result = analyzeSkillGap({
      skillId: '1',
      skillName: 'React',

      marketDemandPercentage: 70,
      marketJobCount: 21,
      marketDatasetSize: 30,

      knowledgeLevel: 'WORKING',
      abilityLevel: 'WORKING',
      evidenceLevel: 'MISSING',

      projectEvidenceCount: 1,

      marketSkillThresholdPercentage: 20,
    });

    expect(result).toBeNull();
  });

  it('can report both weak ability and missing evidence', () => {
    const result = analyzeSkillGap({
      skillId: '1',
      skillName: 'PostgreSQL',

      marketDemandPercentage: 35,
      marketJobCount: 7,
      marketDatasetSize: 20,

      knowledgeLevel: 'BASIC',
      abilityLevel: 'BASIC',
      evidenceLevel: 'MISSING',

      projectEvidenceCount: 0,

      marketSkillThresholdPercentage: 20,
    });

    expect(result).not.toBeNull();

    expect(
      result?.categories,
    ).toContain('WEAK_ABILITY');

    expect(
      result?.categories,
    ).toContain('MISSING_EVIDENCE');
  });
});