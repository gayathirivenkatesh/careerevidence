import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  calculateRoleAlignment,
  calculateSkillAlignment,
} from '../../alignment/alignment.engine.js';

describe('Alignment engine', () => {
  it('gives strong skill alignment to strong ability and evidence', () => {
    const result =
      calculateSkillAlignment({
        skillId: '1',
        skillName: 'React',
        isCore: true,
        relevanceScore: 100,
        knowledgeLevel: 'STRONG',
        abilityLevel: 'STRONG',
        evidenceLevel: 'STRONG',
        projectEvidenceCount: 2,
      });

    expect(
      result.skillAlignmentScore,
    ).toBe(100);

    expect(
      result.explanation,
    ).toContain('React');
  });

  it('does not treat knowledge alone as ability', () => {
    const result =
      calculateSkillAlignment({
        skillId: '1',
        skillName: 'TypeScript',
        isCore: true,
        relevanceScore: 100,
        knowledgeLevel: 'STRONG',
        abilityLevel: 'NONE',
        evidenceLevel: 'MISSING',
        projectEvidenceCount: 0,
      });

    expect(
      result.abilityScore,
    ).toBe(0);

    expect(
      result.skillAlignmentScore,
    ).toBe(0);
  });

  it('recognizes ability without evidence', () => {
    const result =
      calculateSkillAlignment({
        skillId: '1',
        skillName: 'Node.js',
        isCore: true,
        relevanceScore: 100,
        knowledgeLevel: 'WORKING',
        abilityLevel: 'WORKING',
        evidenceLevel: 'MISSING',
        projectEvidenceCount: 0,
      });

    expect(
      result.abilityScore,
    ).toBe(67);

    expect(
      result.evidenceScore,
    ).toBe(0);

    expect(
      result.skillAlignmentScore,
    ).toBe(40.2);
  });

  it('calculates weighted role alignment', () => {
    const result =
      calculateRoleAlignment([
        {
          skillId: '1',
          skillName: 'React',
          isCore: true,
          relevanceScore: 100,
          knowledgeLevel: 'STRONG',
          abilityLevel: 'STRONG',
          evidenceLevel: 'STRONG',
          projectEvidenceCount: 1,
        },
        {
          skillId: '2',
          skillName: 'CSS',
          isCore: true,
          relevanceScore: 100,
          knowledgeLevel: 'BASIC',
          abilityLevel: 'BASIC',
          evidenceLevel: 'MISSING',
          projectEvidenceCount: 0,
        },
      ]);

    expect(result.score).toBe(60);
    expect(result.level).toBe('Good');
    expect(result.coveredSkills).toBe(2);
    expect(result.coreSkillsCovered).toBe(2);
  });

  it('returns Needs Development when no useful ability exists', () => {
    const result =
      calculateRoleAlignment([
        {
          skillId: '1',
          skillName: 'React',
          isCore: true,
          relevanceScore: 100,
          knowledgeLevel: 'BASIC',
          abilityLevel: 'NONE',
          evidenceLevel: 'MISSING',
          projectEvidenceCount: 0,
        },
      ]);

    expect(result.score).toBe(0);
    expect(result.level).toBe(
      'Needs Development',
    );
  });
});