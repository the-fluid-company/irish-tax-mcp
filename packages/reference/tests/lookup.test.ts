import { describe, expect, it } from 'vitest';
import {
  getRates,
  getSupportedYears,
  getTopicReference,
  INFORMATIONAL_DISCLAIMER,
} from '../src/index.js';

describe('reference lookup', () => {
  it('returns supported years and deterministic 2025 rates', () => {
    expect(getSupportedYears()).toEqual([2025]);

    const rates = getRates(2025);
    expect(rates.year).toBe(2025);
    expect(rates.incomeTax.rates.standard).toBe(0.2);
    expect(rates.vat.rates.A).toBe(0.23);
  });

  it('rejects unsupported years', () => {
    expect(() => getRates(2024)).toThrow(/Tax year 2024 is not supported/);
  });

  it('returns income-tax reference payloads in cents and euro', () => {
    const reference = getTopicReference('income_tax', 2025) as {
      cutOffPointsCents: Record<string, number>;
      cutOffPointsEur: Record<string, number>;
    };

    expect(reference.cutOffPointsCents.single).toBe(4_400_000);
    expect(reference.cutOffPointsEur.single).toBe(44_000);
  });

  it('exposes VAT and CAT reference notes', () => {
    const vat = getTopicReference('vat', 2025) as { descriptions: Record<string, string> };
    const cat = getTopicReference('cat', 2025) as { _note: string; smallGiftExemptionEur: number };

    expect(vat.descriptions.A).toMatch(/23%/);
    expect(cat._note).toMatch(/Small gift exemption applies to gifts only/);
    expect(cat.smallGiftExemptionEur).toBe(3_000);
    expect(INFORMATIONAL_DISCLAIMER).toMatch(/Informational Irish tax output only/);
  });
});
