import { describe, it, expect } from 'vitest';
import { createJobProvider } from '../integrations/jobs/providers/provider.factory';

describe('Provider Factory — configuration validation', () => {
  it('test mode returns TestFixtureProvider without credentials', () => {
    const provider = createJobProvider({
      mode: 'test',
      providerName: 'adzuna',
      // No credentials supplied
    });
    expect(provider.providerName).toBe('test-fixture');
  });

  it('test mode ignores provider name', () => {
    const provider = createJobProvider({
      mode: 'test',
      providerName: 'jooble',
    });
    expect(provider.providerName).toBe('test-fixture');
  });

  it('live Adzuna requires ADZUNA_APP_ID', () => {
    expect(() =>
      createJobProvider({
        mode: 'live',
        providerName: 'adzuna',
        adzunaAppId: undefined,
        adzunaAppKey: 'some-key',
      }),
    ).toThrow(/ADZUNA_APP_ID/);
  });

  it('live Adzuna requires ADZUNA_APP_KEY', () => {
    expect(() =>
      createJobProvider({
        mode: 'live',
        providerName: 'adzuna',
        adzunaAppId: 'some-id',
        adzunaAppKey: undefined,
      }),
    ).toThrow(/ADZUNA_APP_KEY/);
  });

  it('live Jooble requires JOOBLE_API_KEY', () => {
    expect(() =>
      createJobProvider({
        mode: 'live',
        providerName: 'jooble',
        joobleApiKey: undefined,
      }),
    ).toThrow(/JOOBLE_API_KEY/);
  });

  it('live Adzuna succeeds with both credentials', () => {
    const provider = createJobProvider({
      mode: 'live',
      providerName: 'adzuna',
      adzunaAppId: 'test-id',
      adzunaAppKey: 'test-key',
    });
    expect(provider.providerName).toBe('adzuna');
  });

  it('live Jooble succeeds with credentials', () => {
    const provider = createJobProvider({
      mode: 'live',
      providerName: 'jooble',
      joobleApiKey: 'test-key',
    });
    expect(provider.providerName).toBe('jooble');
  });

  it('invalid mode throws clearly', () => {
    expect(() =>
      createJobProvider({
        mode: 'invalid' as 'live',
        providerName: 'adzuna',
      }),
    ).toThrow(/Invalid JOB_DATA_MODE/);
  });
});

describe('Provider Factory — credential security', () => {
  it('Adzuna error does not expose credentials', () => {
    const fakeId = 'MY_SECRET_APP_ID_12345';
    const fakeKey = 'MY_SECRET_APP_KEY_67890';
    try {
      createJobProvider({
        mode: 'live',
        providerName: 'adzuna',
        adzunaAppId: undefined,
        adzunaAppKey: undefined,
      });
    } catch (err) {
      const msg = (err as Error).message;
      expect(msg).not.toContain(fakeId);
      expect(msg).not.toContain(fakeKey);
    }
  });

  it('Jooble error does not expose credentials', () => {
    const fakeKey = 'MY_SECRET_JOOBLE_KEY_99999';
    try {
      createJobProvider({
        mode: 'live',
        providerName: 'jooble',
        joobleApiKey: undefined,
      });
    } catch (err) {
      const msg = (err as Error).message;
      expect(msg).not.toContain(fakeKey);
    }
  });
});
