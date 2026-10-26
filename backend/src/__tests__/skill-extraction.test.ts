import { describe, expect, it } from 'vitest';

import {
  extractSkills,
  normalizeSkill,
} from '../modules/jobs/skill-extraction';

describe('Skill extraction', () => {
  it('extracts canonical React skill', () => {
    const result = extractSkills(
      'We are looking for a React developer.',
    );

    expect(result.skills).toContainEqual({
      canonicalName: 'REACT',
      source: 'deterministic',
      matchedText: 'react',
    });
  });

  it('normalizes React aliases', () => {
    expect(normalizeSkill('reactjs')).toBe('REACT');
    expect(normalizeSkill('react.js')).toBe('REACT');
  });

  it('normalizes JavaScript aliases', () => {
    expect(normalizeSkill('js')).toBe('JAVASCRIPT');
    expect(normalizeSkill('javascript')).toBe(
      'JAVASCRIPT',
    );
  });

  it('normalizes Node.js aliases', () => {
    expect(normalizeSkill('nodejs')).toBe('NODE.JS');
    expect(normalizeSkill('node.js')).toBe('NODE.JS');
  });

  it('normalizes PostgreSQL aliases', () => {
    expect(normalizeSkill('postgres')).toBe(
      'POSTGRESQL',
    );
    expect(normalizeSkill('postgresql')).toBe(
      'POSTGRESQL',
    );
  });

  it('extracts multiple skills', () => {
    const result = extractSkills(
      `
      Junior Full Stack Developer.
      Experience with React, TypeScript, Node.js,
      Express, PostgreSQL, Git and Docker.
      `,
    );

    const skills = result.skills.map(
      (skill) => skill.canonicalName,
    );

    expect(skills).toEqual(
      expect.arrayContaining([
        'REACT',
        'TYPESCRIPT',
        'NODE.JS',
        'EXPRESS',
        'POSTGRESQL',
        'GIT',
        'DOCKER',
      ]),
    );
  });

  it('does not match Git inside another word', () => {
    const result = extractSkills(
      'Digital engineering platform',
    );

    const skills = result.skills.map(
      (skill) => skill.canonicalName,
    );

    expect(skills).not.toContain('GIT');
  });

  it('returns empty skills when no supported skills exist', () => {
    const result = extractSkills(
      'Strong communication and leadership skills required.',
    );

    expect(result.skills).toEqual([]);
    expect(result.method).toBe('deterministic');
  });

  it('does not normalize unknown skills', () => {
    expect(normalizeSkill('Python')).toBeNull();
    expect(normalizeSkill('Java')).toBeNull();
    expect(normalizeSkill('Kotlin')).toBeNull();
  });

  it('does not create duplicate canonical skills', () => {
    const result = extractSkills(
      'React React.js ReactJS developer',
    );

    const reactSkills = result.skills.filter(
      (skill) => skill.canonicalName === 'REACT',
    );

    expect(reactSkills).toHaveLength(1);
  });
});