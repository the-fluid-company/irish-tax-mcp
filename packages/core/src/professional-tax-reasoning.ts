import { calculateAnnualPersonalTax } from './annual-personal-tax.js';
import { calculateCat } from './cat.js';
import { calculateCgt } from './cgt.js';
import { calculateStampDuty } from './stamp-duty.js';
import { calculateVat } from './vat.js';
import type {
  ProfessionalCapitalGainEntryResult,
  ProfessionalCatEntryResult,
  ProfessionalTaxReasoningParams,
  ProfessionalTaxReasoningResult,
  ProfessionalStampDutyEntryResult,
  ProfessionalVatEntryResult,
  TaxRates,
} from './types.js';

export function calculateProfessionalTaxReasoning(
  params: ProfessionalTaxReasoningParams,
  rates: TaxRates,
): ProfessionalTaxReasoningResult {
  const creditKeys = params.creditKeys ?? [];
  const incomeSources = params.incomeSources ?? [];
  const capitalGains = params.capitalGains ?? [];
  const vatTransactions = params.vatTransactions ?? [];
  const propertyTransactions = params.propertyTransactions ?? [];
  const giftsAndInheritances = params.giftsAndInheritances ?? [];
  const suppliedFacts = params.suppliedFacts ?? [];
  const rawArtifacts = params.rawArtifacts ?? [];

  const reasoningNotes: string[] = [];
  const assumptions: string[] = [];
  const unresolvedQuestions: string[] = [];
  const outOfScopeIssues: string[] = [];
  const modulesTriggered: string[] = [];

  if (params.taxpayer.residencyStatus && params.taxpayer.residencyStatus !== 'resident') {
    outOfScopeIssues.push(
      `Residency status "${params.taxpayer.residencyStatus}" is not fully modeled; current reasoning assumes standard resident Irish tax treatment only.`,
    );
  }

  if (rawArtifacts.length > 0) {
    outOfScopeIssues.push(
      `Received ${rawArtifacts.length} raw artifact(s). Raw documents are not parsed deterministically yet; convert them into structured facts before relying on this output.`,
    );
  }

  if (suppliedFacts.length > 0) {
    reasoningNotes.push(
      `Received ${suppliedFacts.length} structured fact(s); unsupported facts are preserved for human review but do not change calculator outputs unless explicitly modeled.`,
    );
  }

  if (incomeSources.length > 0) {
    modulesTriggered.push('annual_personal_tax');
    if (creditKeys.length === 0) {
      unresolvedQuestions.push(
        'No tax credits were supplied for the taxpayer. Confirm PAYE, personal, earned-income, home-carer, or other credits before filing reliance.',
      );
    }
  }

  const personalTax =
    incomeSources.length > 0
      ? calculateAnnualPersonalTax(
          {
            filingStatus: params.taxpayer.filingStatus,
            creditKeys,
            incomeSources,
          },
          rates,
        )
      : undefined;

  const capitalGainEntries: ProfessionalCapitalGainEntryResult[] = capitalGains.map((entry) => ({
    ...calculateCgt({ gainCents: entry.gainCents }, rates),
    description: entry.description,
  }));
  if (capitalGainEntries.length > 0) {
    modulesTriggered.push('capital_gains_tax');
    assumptions.push('CGT entries are treated as already-netted gains before annual exemption unless additional facts say otherwise.');
  }

  const vatEntries: ProfessionalVatEntryResult[] = vatTransactions.map((entry) => ({
    ...calculateVat(
      {
        amountCents: entry.amountCents,
        vatCode: entry.vatCode,
        direction: entry.direction,
      },
      rates,
    ),
    amountCents: entry.amountCents,
    direction: entry.direction,
    description: entry.description,
  }));
  if (vatEntries.length > 0) {
    modulesTriggered.push('vat');
    reasoningNotes.push('VAT totals are computed transaction-by-transaction so inclusive and exclusive entries remain auditable.');
  }

  const stampDutyEntries: ProfessionalStampDutyEntryResult[] = propertyTransactions.map((entry) => ({
    ...calculateStampDuty(
      {
        considerationCents: entry.considerationCents,
        propertyType: entry.propertyType,
      },
      rates,
    ),
    description: entry.description,
  }));
  if (stampDutyEntries.length > 0) {
    modulesTriggered.push('stamp_duty');
  }

  const catEntries: ProfessionalCatEntryResult[] = giftsAndInheritances.map((entry) => {
    let applySmallGiftExemption = entry.applySmallGiftExemption ?? false;
    if (entry.kind === 'inheritance' && applySmallGiftExemption) {
      applySmallGiftExemption = false;
      assumptions.push(
        `Small gift exemption was ignored for inheritance${entry.description ? ` (${entry.description})` : ''} because it only applies to gifts.`,
      );
    }

    return {
      ...calculateCat(
        {
          benefitCents: entry.benefitCents,
          group: entry.group,
          priorTaxableBenefitsCents: entry.priorTaxableBenefitsCents,
          applySmallGiftExemption,
        },
        rates,
      ),
      kind: entry.kind,
      description: entry.description,
    };
  });
  if (catEntries.length > 0) {
    modulesTriggered.push('capital_acquisitions_tax');
    unresolvedQuestions.push(
      'CAT outcomes assume the supplied threshold group and prior taxable benefits are complete. Confirm beneficiary relationship history before filing reliance.',
    );
  }

  const totalCgtCents = capitalGainEntries.reduce((sum, entry) => sum + entry.cgtDueCents, 0);
  const totalVatCents = vatEntries.reduce((sum, entry) => sum + entry.vatCents, 0);
  const totalStampDutyCents = stampDutyEntries.reduce((sum, entry) => sum + entry.dutyDueCents, 0);
  const totalCatCents = catEntries.reduce((sum, entry) => sum + entry.catDueCents, 0);
  const totalIncomeTaxCents = personalTax?.incomeTaxCents ?? 0;
  const totalUscCents = personalTax?.uscCents ?? 0;
  const totalPrsiCents = personalTax?.prsiCents ?? 0;

  if (modulesTriggered.length === 0) {
    unresolvedQuestions.push('No supported tax modules were triggered. Provide structured income, gain, VAT, property, or CAT facts.');
  }

  return {
    taxpayer: params.taxpayer,
    modulesTriggered,
    personalTax,
    capitalGains:
      capitalGainEntries.length > 0
        ? {
            entries: capitalGainEntries,
            totalGainCents: capitalGainEntries.reduce((sum, entry) => sum + entry.gainCents, 0),
            totalTaxableGainCents: capitalGainEntries.reduce((sum, entry) => sum + entry.taxableGainCents, 0),
            totalCgtDueCents: totalCgtCents,
          }
        : undefined,
    vat:
      vatEntries.length > 0
        ? {
            entries: vatEntries,
            totalNetCents: vatEntries.reduce((sum, entry) => sum + entry.netCents, 0),
            totalVatCents,
            totalGrossCents: vatEntries.reduce((sum, entry) => sum + entry.grossCents, 0),
          }
        : undefined,
    stampDuty:
      stampDutyEntries.length > 0
        ? {
            entries: stampDutyEntries,
            totalConsiderationCents: stampDutyEntries.reduce(
              (sum, entry) => sum + entry.considerationCents,
              0,
            ),
            totalDutyDueCents: totalStampDutyCents,
          }
        : undefined,
    cat:
      catEntries.length > 0
        ? {
            entries: catEntries,
            totalBenefitCents: catEntries.reduce((sum, entry) => sum + entry.benefitCents, 0),
            totalTaxableAmountCents: catEntries.reduce((sum, entry) => sum + entry.taxableAmountCents, 0),
            totalCatDueCents: totalCatCents,
          }
        : undefined,
    totalsCents: {
      totalLiabilityCents:
        totalIncomeTaxCents +
        totalUscCents +
        totalPrsiCents +
        totalCgtCents +
        totalVatCents +
        totalStampDutyCents +
        totalCatCents,
      incomeTaxCents: totalIncomeTaxCents,
      uscCents: totalUscCents,
      prsiCents: totalPrsiCents,
      cgtCents: totalCgtCents,
      vatCents: totalVatCents,
      stampDutyCents: totalStampDutyCents,
      catCents: totalCatCents,
    },
    reasoningNotes,
    assumptions,
    unresolvedQuestions,
    outOfScopeIssues,
  };
}
