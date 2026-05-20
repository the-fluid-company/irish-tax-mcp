import { describe, expect, it } from 'vitest';
import { calculateProfessionalTaxReasoning } from '../src/professional-tax-reasoning.js';
import { rates2025 } from './fixtures/rates.js';

describe('calculateProfessionalTaxReasoning', () => {
  it('connects supported modules into one deterministic case result', () => {
    const result = calculateProfessionalTaxReasoning(
      {
        taxpayer: { filingStatus: 'single', residencyStatus: 'resident' },
        creditKeys: ['personal_single', 'paye', 'earned_income'],
        incomeSources: [
          { kind: 'employment', grossIncomeCents: 5_000_000 },
          { kind: 'self_employment', grossIncomeCents: 2_000_000 },
        ],
        capitalGains: [{ gainCents: 2_000_000, description: 'Share disposal' }],
        vatTransactions: [{ amountCents: 12_300, vatCode: 'A', direction: 'inclusive' }],
        propertyTransactions: [{ considerationCents: 150_000_000, propertyType: 'residential' }],
        giftsAndInheritances: [{ kind: 'gift', benefitCents: 500_000, group: 'C', applySmallGiftExemption: true }],
      },
      rates2025,
    );

    expect(result.modulesTriggered).toEqual([
      'annual_personal_tax',
      'capital_gains_tax',
      'vat',
      'stamp_duty',
      'capital_acquisitions_tax',
    ]);
    expect(result.personalTax?.totalDeductionsCents).toBe(1_810_722);
    expect(result.capitalGains?.totalCgtDueCents).toBe(618_090);
    expect(result.vat?.totalVatCents).toBe(2_300);
    expect(result.stampDuty?.totalDutyDueCents).toBe(2_000_000);
    expect(result.cat?.totalCatDueCents).toBe(0);
    expect(result.totalsCents.totalLiabilityCents).toBe(4_431_112);
  });

  it('flags unsupported or incomplete facts for professional review', () => {
    const result = calculateProfessionalTaxReasoning(
      {
        taxpayer: { filingStatus: 'single', residencyStatus: 'non_resident' },
        incomeSources: [{ kind: 'employment', grossIncomeCents: 1_000_000 }],
        giftsAndInheritances: [
          {
            kind: 'inheritance',
            benefitCents: 2_000_000,
            group: 'B',
            applySmallGiftExemption: true,
          },
        ],
        suppliedFacts: [{ key: 'rental_property_country', value: 'Spain' }],
        rawArtifacts: ['bank_statement.pdf'],
      },
      rates2025,
    );

    expect(result.outOfScopeIssues[0]).toMatch(/not fully modeled/);
    expect(result.outOfScopeIssues[1]).toMatch(/Raw documents are not parsed deterministically yet/);
    expect(result.assumptions[0]).toMatch(/Small gift exemption was ignored/);
    expect(result.unresolvedQuestions[0]).toMatch(/No tax credits were supplied/);
    expect(result.reasoningNotes[0]).toMatch(/structured fact/);
  });
});
