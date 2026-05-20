import type {
  AnnualPersonalTaxIncomeSource,
  CatGroup,
  FilingStatus,
  PersonalTaxIncomeSourceKind,
  PrsiClass,
  ProfessionalCapitalGainEntry,
  ProfessionalCatEntry,
  ProfessionalStampDutyEntry,
  ProfessionalTaxReasoningParams,
  ProfessionalVatEntry,
  StampDutyPropertyType,
  TaxCaseFact,
  TaxCreditKey,
  TaxpayerProfile,
  VatCode,
  VatDirection,
} from '@irish-tax-mcp/core';
import type { ReferenceTopics } from '@irish-tax-mcp/reference';

function asRecord(input: unknown): Record<string, unknown> {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new Error('Input must be an object.');
  }
  return input as Record<string, unknown>;
}

function isInteger(value: unknown): value is number {
  return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
}

function requireInteger(input: Record<string, unknown>, key: string): number {
  const value = input[key];
  if (!isInteger(value)) {
    throw new Error(`Field "${key}" must be an integer.`);
  }
  return value;
}

function requireNonNegativeInteger(input: Record<string, unknown>, key: string): number {
  const value = requireInteger(input, key);
  if (value < 0) {
    throw new Error(`Field "${key}" must be a non-negative integer.`);
  }
  return value;
}

function optionalNonNegativeInteger(
  input: Record<string, unknown>,
  key: string,
  defaultValue = 0,
): number {
  if (!(key in input) || input[key] === undefined) {
    return defaultValue;
  }
  return requireNonNegativeInteger(input, key);
}

function optionalBoolean(input: Record<string, unknown>, key: string, defaultValue = false): boolean {
  if (!(key in input) || input[key] === undefined) {
    return defaultValue;
  }
  if (typeof input[key] !== 'boolean') {
    throw new Error(`Field "${key}" must be a boolean.`);
  }
  return input[key] as boolean;
}

function optionalYear(input: Record<string, unknown>): number {
  if (!('year' in input) || input['year'] === undefined) {
    return 2025;
  }
  return requireInteger(input, 'year');
}

function hasEnumValue<T extends string>(allowed: readonly T[], value: string): value is T {
  return (allowed as readonly string[]).indexOf(value) !== -1;
}

function requireEnumValue<T extends string>(
  input: Record<string, unknown>,
  key: string,
  allowed: readonly T[],
): T {
  const value = input[key];
  if (typeof value !== 'string' || !hasEnumValue(allowed, value)) {
    throw new Error(`Field "${key}" must be one of: ${allowed.join(', ')}.`);
  }
  return value;
}

function requireEnumArray<T extends string>(
  input: Record<string, unknown>,
  key: string,
  allowed: readonly T[],
): T[] {
  const value = input[key];
  if (!Array.isArray(value)) {
    throw new Error(`Field "${key}" must be an array.`);
  }

  return value.map((item) => {
    if (typeof item !== 'string' || !hasEnumValue(allowed, item)) {
      throw new Error(`Field "${key}" contains an invalid value. Allowed: ${allowed.join(', ')}.`);
    }
    return item;
  });
}

const FILING_STATUSES = ['single', 'married_one_income', 'married_two_incomes', 'widowed'] as const;
const PRSI_CLASSES = ['A', 'S', 'D'] as const;
const VAT_CODES = ['A', 'B', 'C', 'D'] as const;
const VAT_DIRECTIONS = ['exclusive', 'inclusive'] as const;
const CREDIT_KEYS = [
  'personal_single',
  'personal_married',
  'paye',
  'earned_income',
  'home_carer',
  'single_person_child_carer',
] as const;
const STAMP_DUTY_TYPES = ['residential', 'non_residential', 'shares'] as const;
const CAT_GROUPS = ['A', 'B', 'C'] as const;
const PERSONAL_TAX_SOURCE_KINDS = ['employment', 'self_employment', 'pension', 'other'] as const;
const REFERENCE_TOPICS = ['income_tax', 'usc', 'prsi', 'tax_credits', 'cgt', 'vat', 'stamp_duty', 'cat'] as const;
const RESIDENCY_STATUSES = ['resident', 'non_resident', 'unknown'] as const;
const CAT_ENTRY_KINDS = ['gift', 'inheritance'] as const;

function parseIncomeSource(input: unknown): AnnualPersonalTaxIncomeSource {
  const record = asRecord(input);
  const kind = requireEnumValue<PersonalTaxIncomeSourceKind>(
    record,
    'kind',
    PERSONAL_TAX_SOURCE_KINDS,
  );

  let prsiClass: PrsiClass | undefined;
  if ('prsiClass' in record && record.prsiClass !== undefined) {
    prsiClass = requireEnumValue<PrsiClass>(record, 'prsiClass', PRSI_CLASSES);
  }

  return {
    kind,
    grossIncomeCents: requireNonNegativeInteger(record, 'grossIncomeCents'),
    prsiClass,
  };
}

function optionalObjectArray(input: Record<string, unknown>, key: string): unknown[] {
  if (!(key in input) || input[key] === undefined) {
    return [];
  }
  const value = input[key];
  if (!Array.isArray(value)) {
    throw new Error(`Field "${key}" must be an array.`);
  }
  return value;
}

function parseTaxpayer(input: unknown): TaxpayerProfile {
  const record = asRecord(input);
  let residencyStatus: TaxpayerProfile['residencyStatus'];
  if ('residencyStatus' in record && record.residencyStatus !== undefined) {
    residencyStatus = requireEnumValue(record, 'residencyStatus', RESIDENCY_STATUSES);
  }
  return {
    filingStatus: requireEnumValue<FilingStatus>(record, 'filingStatus', FILING_STATUSES),
    residencyStatus,
  };
}

function parseCapitalGainEntry(input: unknown): ProfessionalCapitalGainEntry {
  const record = asRecord(input);
  const description = typeof record.description === 'string' ? record.description : undefined;
  return {
    gainCents: requireNonNegativeInteger(record, 'gainCents'),
    description,
  };
}

function parseVatEntry(input: unknown): ProfessionalVatEntry {
  const record = asRecord(input);
  const description = typeof record.description === 'string' ? record.description : undefined;
  return {
    amountCents: requireNonNegativeInteger(record, 'amountCents'),
    vatCode: requireEnumValue<VatCode>(record, 'vatCode', VAT_CODES),
    direction: requireEnumValue<VatDirection>(record, 'direction', VAT_DIRECTIONS),
    description,
  };
}

function parseStampDutyEntry(input: unknown): ProfessionalStampDutyEntry {
  const record = asRecord(input);
  const description = typeof record.description === 'string' ? record.description : undefined;
  return {
    considerationCents: requireNonNegativeInteger(record, 'considerationCents'),
    propertyType: requireEnumValue<StampDutyPropertyType>(record, 'propertyType', STAMP_DUTY_TYPES),
    description,
  };
}

function parseCatEntry(input: unknown): ProfessionalCatEntry {
  const record = asRecord(input);
  const description = typeof record.description === 'string' ? record.description : undefined;
  return {
    kind: requireEnumValue(record, 'kind', CAT_ENTRY_KINDS),
    benefitCents: requireNonNegativeInteger(record, 'benefitCents'),
    group: requireEnumValue<CatGroup>(record, 'group', CAT_GROUPS),
    priorTaxableBenefitsCents: optionalNonNegativeInteger(record, 'priorTaxableBenefitsCents'),
    applySmallGiftExemption: optionalBoolean(record, 'applySmallGiftExemption'),
    description,
  };
}

function parseTaxCaseFact(input: unknown): TaxCaseFact {
  const record = asRecord(input);
  const key = record.key;
  const value = record.value;
  const source = record.source;
  if (typeof key !== 'string' || key.length === 0) {
    throw new Error('Field "key" must be a non-empty string.');
  }
  if (typeof value !== 'string') {
    throw new Error('Field "value" must be a string.');
  }
  if (source !== undefined && typeof source !== 'string') {
    throw new Error('Field "source" must be a string when provided.');
  }
  return { key, value, source };
}

export function parseCalculateIncomeTax(input: unknown) {
  const record = asRecord(input);
  return {
    year: optionalYear(record),
    params: {
      grossIncomeCents: requireNonNegativeInteger(record, 'grossIncomeCents'),
      filingStatus: requireEnumValue<FilingStatus>(record, 'filingStatus', FILING_STATUSES),
      creditKeys: requireEnumArray<TaxCreditKey>(record, 'creditKeys', CREDIT_KEYS),
      prsiClass: requireEnumValue<PrsiClass>(record, 'prsiClass', PRSI_CLASSES),
    },
  };
}

export function parseCalculateAnnualPersonalTax(input: unknown) {
  const record = asRecord(input);
  const incomeSourcesValue = record.incomeSources;
  if (!Array.isArray(incomeSourcesValue)) {
    throw new Error('Field "incomeSources" must be an array.');
  }

  return {
    year: optionalYear(record),
    params: {
      filingStatus: requireEnumValue<FilingStatus>(record, 'filingStatus', FILING_STATUSES),
      creditKeys: requireEnumArray<TaxCreditKey>(record, 'creditKeys', CREDIT_KEYS),
      incomeSources: incomeSourcesValue.map(parseIncomeSource),
    },
  };
}

export function parseCalculateVat(input: unknown) {
  const record = asRecord(input);
  return {
    year: optionalYear(record),
    params: {
      amountCents: requireNonNegativeInteger(record, 'amountCents'),
      vatCode: requireEnumValue<VatCode>(record, 'vatCode', VAT_CODES),
      direction: requireEnumValue<VatDirection>(record, 'direction', VAT_DIRECTIONS),
    },
  };
}

export function parseCalculateCgt(input: unknown) {
  const record = asRecord(input);
  return {
    year: optionalYear(record),
    params: {
      gainCents: requireNonNegativeInteger(record, 'gainCents'),
    },
  };
}

export function parseCalculateStampDuty(input: unknown) {
  const record = asRecord(input);
  return {
    year: optionalYear(record),
    params: {
      considerationCents: requireNonNegativeInteger(record, 'considerationCents'),
      propertyType: requireEnumValue<StampDutyPropertyType>(record, 'propertyType', STAMP_DUTY_TYPES),
    },
  };
}

export function parseCalculateCat(input: unknown) {
  const record = asRecord(input);
  return {
    year: optionalYear(record),
    params: {
      benefitCents: requireNonNegativeInteger(record, 'benefitCents'),
      group: requireEnumValue<CatGroup>(record, 'group', CAT_GROUPS),
      priorTaxableBenefitsCents: optionalNonNegativeInteger(record, 'priorTaxableBenefitsCents'),
      applySmallGiftExemption: optionalBoolean(record, 'applySmallGiftExemption'),
    },
  };
}

export function parseReferenceLookup(input: unknown) {
  const record = asRecord(input);
  return {
    year: optionalYear(record),
    topic: requireEnumValue<ReferenceTopics>(record, 'topic', REFERENCE_TOPICS),
  };
}

export function parseProfessionalTaxReasoning(input: unknown): {
  year: number;
  params: ProfessionalTaxReasoningParams;
} {
  const record = asRecord(input);
  if (!('taxpayer' in record)) {
    throw new Error('Field "taxpayer" is required.');
  }

  return {
    year: optionalYear(record),
    params: {
      taxpayer: parseTaxpayer(record.taxpayer),
      creditKeys: 'creditKeys' in record ? requireEnumArray<TaxCreditKey>(record, 'creditKeys', CREDIT_KEYS) : [],
      incomeSources: optionalObjectArray(record, 'incomeSources').map(parseIncomeSource),
      capitalGains: optionalObjectArray(record, 'capitalGains').map(parseCapitalGainEntry),
      vatTransactions: optionalObjectArray(record, 'vatTransactions').map(parseVatEntry),
      propertyTransactions: optionalObjectArray(record, 'propertyTransactions').map(parseStampDutyEntry),
      giftsAndInheritances: optionalObjectArray(record, 'giftsAndInheritances').map(parseCatEntry),
      suppliedFacts: optionalObjectArray(record, 'suppliedFacts').map(parseTaxCaseFact),
      rawArtifacts: optionalObjectArray(record, 'rawArtifacts').map((item) => {
        if (typeof item !== 'string') {
          throw new Error('Field "rawArtifacts" must contain strings only.');
        }
        return item;
      }),
    },
  };
}
