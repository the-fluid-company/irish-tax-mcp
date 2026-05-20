import data2025 from '../data/2025.json';
import type { TaxRates } from '@irish-tax-mcp/core';

export const SUPPORTED_YEARS = [2025] as const;
type SupportedYear = (typeof SUPPORTED_YEARS)[number];

export const INFORMATIONAL_DISCLAIMER =
  'Informational Irish tax output only. Standard deterministic scenarios are covered, but you should verify material decisions with Revenue or a qualified tax professional.';

function isSupportedYear(year: number): year is SupportedYear {
  return (SUPPORTED_YEARS as readonly number[]).indexOf(year) !== -1;
}

function centsRecordToEur(record: Record<string, number>): Record<string, number> {
  const result: Record<string, number> = {};
  for (const key in record) {
    const value = record[key];
    if (value !== undefined) {
      result[key] = value / 100;
    }
  }
  return result;
}

export function getSupportedYears(): number[] {
  return [...SUPPORTED_YEARS];
}

export function getRates(year: number): TaxRates {
  if (!isSupportedYear(year)) {
    throw new Error(
      `Tax year ${year} is not supported. Supported years: ${SUPPORTED_YEARS.join(', ')}`,
    );
  }
  return data2025 as unknown as TaxRates;
}

export type ReferenceTopics =
  | 'income_tax'
  | 'usc'
  | 'prsi'
  | 'tax_credits'
  | 'cgt'
  | 'vat'
  | 'stamp_duty'
  | 'cat';

export function getTopicReference(topic: ReferenceTopics, year: number): unknown {
  const rates = getRates(year);

  switch (topic) {
    case 'income_tax':
      return {
        year: rates.year,
        rates: rates.incomeTax.rates,
        cutOffPointsCents: rates.incomeTax.cutOffPointsCents,
        cutOffPointsEur: centsRecordToEur(rates.incomeTax.cutOffPointsCents),
      };
    case 'usc':
      return {
        year: rates.year,
        exemptionThresholdEur: rates.usc.exemptionThresholdCents / 100,
        bands: rates.usc.bands.map((b) => ({
          widthEur: b.widthCents !== null ? b.widthCents / 100 : null,
          rate: b.rate,
          ratePercent: `${b.rate * 100}%`,
        })),
      };
    case 'prsi':
      return {
        year: rates.year,
        classA: {
          weeklyExemptionEur: rates.prsi.classA.weeklyExemptionCents / 100,
          rate: rates.prsi.classA.rate,
          ratePercent: `${rates.prsi.classA.rate * 100}%`,
        },
        classS: {
          incomeThresholdEur: rates.prsi.classS.incomeThresholdCents / 100,
          minimumAnnualEur: rates.prsi.classS.minimumAnnualCents / 100,
          rate: rates.prsi.classS.rate,
          ratePercent: `${rates.prsi.classS.rate * 100}%`,
        },
        classD: {
          rate: rates.prsi.classD.rate,
          ratePercent: `${rates.prsi.classD.rate * 100}%`,
        },
      };
    case 'tax_credits':
      return {
        year: rates.year,
        creditsEur: centsRecordToEur(rates.taxCreditsCents),
        creditsCents: rates.taxCreditsCents,
      };
    case 'cgt':
      return {
        year: rates.year,
        rate: rates.cgt.rate,
        ratePercent: `${rates.cgt.rate * 100}%`,
        annualExemptionEur: rates.cgt.annualExemptionCents / 100,
        annualExemptionCents: rates.cgt.annualExemptionCents,
      };
    case 'vat':
      return {
        year: rates.year,
        rates: rates.vat.rates,
        descriptions: rates.vat.descriptions,
      };
    case 'stamp_duty':
      return {
        year: rates.year,
        residentialBands: rates.stampDuty.residential.map((band) => ({
          widthEur: band.widthCents === null ? null : band.widthCents / 100,
          rate: band.rate,
          ratePercent: `${band.rate * 100}%`,
        })),
        nonResidentialRate: rates.stampDuty.nonResidential,
        nonResidentialRatePercent: `${rates.stampDuty.nonResidential * 100}%`,
        sharesRate: rates.stampDuty.shares,
        sharesRatePercent: `${rates.stampDuty.shares * 100}%`,
        _note: 'Stamp duty data is deterministic for standard scenarios only. Verify with Revenue for reliefs and complex transactions.',
      };
    case 'cat':
      return {
        year: rates.year,
        rate: rates.cat.rate,
        ratePercent: `${rates.cat.rate * 100}%`,
        thresholdsCents: rates.cat.thresholdsCents,
        thresholdsEur: centsRecordToEur(rates.cat.thresholdsCents),
        smallGiftExemptionCents: rates.cat.smallGiftExemptionCents,
        smallGiftExemptionEur: rates.cat.smallGiftExemptionCents / 100,
        _note: 'Small gift exemption applies to gifts only, not inheritances.',
      };
  }
}
