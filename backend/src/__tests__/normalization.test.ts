import { describe, it, expect } from 'vitest';
import { adzunaResponseSchema, resolveAdzunaCountryCode } from '../integrations/jobs/providers/adzuna.schema';
import { joobleResponseSchema } from '../integrations/jobs/providers/jooble.schema';

// ─── Adzuna country mapping ────────────────────────────────────────────────────
describe('Adzuna country mapping', () => {
  it('resolves india to "in"', () => {
    expect(resolveAdzunaCountryCode('india')).toBe('in');
  });

  it('is case-insensitive', () => {
    expect(resolveAdzunaCountryCode('INDIA')).toBe('in');
    expect(resolveAdzunaCountryCode('India')).toBe('in');
  });

  it('throws for unknown country', () => {
    expect(() => resolveAdzunaCountryCode('narnia')).toThrow(/No country code mapping/);
  });
});

// ─── Adzuna normalization ──────────────────────────────────────────────────────
describe('Adzuna response schema', () => {
  it('parses a valid Adzuna response', () => {
    const validResponse = {
      count: 100,
      results: [
        {
          id: 'adzuna-123',
          title: 'Junior React Developer',
          description: 'Build amazing apps with React.',
          redirect_url: 'https://adzuna.com/job/adzuna-123',
          created: '2026-09-10T10:00:00Z',
          location: { display_name: 'Bangalore, India' },
          company: { display_name: 'Tech Corp' },
        },
      ],
    };

    const result = adzunaResponseSchema.safeParse(validResponse);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.results).toHaveLength(1);
      expect(result.data.results[0].id).toBe('adzuna-123');
      expect(result.data.count).toBe(100);
    }
  });

  it('handles missing optional fields gracefully', () => {
    const minimalResponse = {
      results: [
        {
          id: 'adzuna-456',
          title: 'Node Developer',
          // No company, location, description, redirect_url, or created
        },
      ],
    };

    const result = adzunaResponseSchema.safeParse(minimalResponse);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.results[0].company?.display_name).toBe('');
    }
  });

  it('rejects a malformed Adzuna response with no id', () => {
    const malformed = {
      results: [
        {
          // Missing required 'id'
          title: 'React Dev',
        },
      ],
    };

    const result = adzunaResponseSchema.safeParse(malformed);
    expect(result.success).toBe(false);
  });

  it('defaults to empty results when results is missing', () => {
    const noResults = { count: 0 };
    const result = adzunaResponseSchema.safeParse(noResults);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.results).toEqual([]);
    }
  });
});

// ─── Jooble normalization ──────────────────────────────────────────────────────
describe('Jooble response schema', () => {
  it('parses a valid Jooble response', () => {
    const validResponse = {
      totalCount: 50,
      jobs: [
        {
          id: 'jooble-001',
          title: 'Junior Frontend Developer',
          location: 'Mumbai, India',
          snippet: 'Build great UIs with React.',
          link: 'https://jooble.org/job/jooble-001',
          company: 'Web Agency Ltd',
          updated: '2026-09-08T00:00:00Z',
        },
      ],
    };

    const result = joobleResponseSchema.safeParse(validResponse);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.jobs).toHaveLength(1);
      expect(result.data.jobs[0].id).toBe('jooble-001');
      expect(result.data.totalCount).toBe(50);
    }
  });

  it('accepts numeric job ids', () => {
    const response = {
      jobs: [
        {
          id: 12345,
          title: 'Node Dev',
          location: '',
          snippet: '',
          link: '',
          company: '',
        },
      ],
    };
    const result = joobleResponseSchema.safeParse(response);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.jobs[0].id).toBe('12345');
    }
  });

  it('defaults to empty jobs when jobs field is missing', () => {
    const noJobs = { totalCount: 0 };
    const result = joobleResponseSchema.safeParse(noJobs);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.jobs).toEqual([]);
    }
  });

  it('handles missing optional updated field', () => {
    const response = {
      jobs: [
        {
          id: 'j-999',
          title: 'Backend Dev',
          location: 'Delhi',
          snippet: 'Work on APIs.',
          link: 'https://jooble.org/job/j-999',
          company: 'Startup',
          // No 'updated' field
        },
      ],
    };
    const result = joobleResponseSchema.safeParse(response);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.jobs[0].updated).toBeUndefined();
    }
  });
});
