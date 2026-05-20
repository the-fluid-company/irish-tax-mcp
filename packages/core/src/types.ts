export type FilingStatus =
  | 'single'
  | 'married_one_income'
  | 'married_two_incomes'
  | 'widowed';

export type PrsiClass = 'A' | 'S' | 'D';

export type VatCode = 'A' | 'B' | 'C' | 'D';

export type VatDirection = 'exclusive' | 'inclusive';

export type StampDutyPropertyType = 'residential' | 'non_residential' | 'shares';

export type CatGroup = 'A' | 'B' | 'C';

export type PersonalTaxIncomeSourceKind =
  | 'employment'
  | 'self_employment'
  | 'pension'
  | 'other';

export type TaxCreditKey =
  | 'personal_single'
  | 'personal_married'
  | 'paye'
  | 'earned_income'
  | 'home_carer'
  | 'single_person_child_carer';

export interface TaxBand {
  widthCents: number | null;
  rate: number;
}

export interface IncomeTaxRates {
  rates: { standard: number; higher: number };
  cutOffPointsCents: Record<FilingStatus, number>;
}

export interface UscRates {
  exemptionThresholdCents: number;
  bands: TaxBand[];
}

export interface PrsiRates {
  classA: { weeklyExemptionCents: number; rate: number };
  classS: { incomeThresholdCents: number; minimumAnnualCents: number; rate: number };
  classD: { rate: number };
}

export interface CgtRates {
  rate: number;
  annualExemptionCents: number;
}

export interface VatRates {
  rates: Record<VatCode, number>;
  descriptions: Record<VatCode, string>;
}

export interface StampDutyRates {
  residential: TaxBand[];
  nonResidential: number;
  shares: number;
}

export interface CatRates {
  rate: number;
  thresholdsCents: Record<CatGroup, number>;
  smallGiftExemptionCents: number;
}

export interface TaxRates {
  year: number;
  incomeTax: IncomeTaxRates;
  usc: UscRates;
  prsi: PrsiRates;
  taxCreditsCents: Record<TaxCreditKey, number>;
  cgt: CgtRates;
  vat: VatRates;
  stampDuty: StampDutyRates;
  cat: CatRates;
}

export interface IncomeTaxParams {
  grossIncomeCents: number;
  filingStatus: FilingStatus;
  creditKeys: TaxCreditKey[];
  prsiClass: PrsiClass;
}

export interface IncomeTaxResult {
  grossIncomeCents: number;
  grossIncomeTaxCents: number;
  totalCreditsCents: number;
  incomeTaxCents: number;
  uscCents: number;
  prsiCents: number;
  totalDeductionsCents: number;
  netIncomeCents: number;
}

export interface VatParams {
  amountCents: number;
  vatCode: VatCode;
  direction: VatDirection;
}

export interface VatResult {
  netCents: number;
  vatCents: number;
  grossCents: number;
  rate: number;
  vatCode: VatCode;
}

export interface CgtParams {
  gainCents: number;
}

export interface CgtResult {
  gainCents: number;
  annualExemptionAppliedCents: number;
  taxableGainCents: number;
  cgtDueCents: number;
  rate: number;
}

export interface StampDutyParams {
  considerationCents: number;
  propertyType: StampDutyPropertyType;
}

export interface StampDutyResult {
  considerationCents: number;
  propertyType: StampDutyPropertyType;
  dutyDueCents: number;
  effectiveRate: number;
}

export interface CatParams {
  benefitCents: number;
  group: CatGroup;
  priorTaxableBenefitsCents?: number;
  applySmallGiftExemption?: boolean;
}

export interface CatResult {
  benefitCents: number;
  group: CatGroup;
  priorTaxableBenefitsCents: number;
  thresholdCents: number;
  smallGiftExemptionAppliedCents: number;
  taxableBenefitAfterExemptionCents: number;
  thresholdConsumedCents: number;
  remainingThresholdCents: number;
  taxableAmountCents: number;
  catDueCents: number;
  rate: number;
}

export interface AnnualPersonalTaxIncomeSource {
  kind: PersonalTaxIncomeSourceKind;
  grossIncomeCents: number;
  prsiClass?: PrsiClass;
}

export interface AnnualPersonalTaxParams {
  filingStatus: FilingStatus;
  creditKeys: TaxCreditKey[];
  incomeSources: AnnualPersonalTaxIncomeSource[];
}

export interface AnnualPersonalTaxResult {
  filingStatus: FilingStatus;
  totalGrossIncomeCents: number;
  sourceTotalsCents: Record<PersonalTaxIncomeSourceKind, number>;
  grossIncomeTaxCents: number;
  totalCreditsCents: number;
  incomeTaxCents: number;
  uscCents: number;
  prsiByClassCents: Record<PrsiClass, number>;
  prsiCents: number;
  totalDeductionsCents: number;
  netIncomeCents: number;
}

export interface TaxpayerProfile {
  filingStatus: FilingStatus;
  residencyStatus?: 'resident' | 'non_resident' | 'unknown';
}

export interface TaxCaseFact {
  key: string;
  value: string;
  source?: string;
}

export interface ProfessionalCapitalGainEntry {
  gainCents: number;
  description?: string;
}

export interface ProfessionalVatEntry {
  amountCents: number;
  vatCode: VatCode;
  direction: VatDirection;
  description?: string;
}

export interface ProfessionalStampDutyEntry {
  considerationCents: number;
  propertyType: StampDutyPropertyType;
  description?: string;
}

export interface ProfessionalCatEntry {
  kind: 'gift' | 'inheritance';
  benefitCents: number;
  group: CatGroup;
  priorTaxableBenefitsCents?: number;
  applySmallGiftExemption?: boolean;
  description?: string;
}

export interface ProfessionalTaxReasoningParams {
  taxpayer: TaxpayerProfile;
  creditKeys?: TaxCreditKey[];
  incomeSources?: AnnualPersonalTaxIncomeSource[];
  capitalGains?: ProfessionalCapitalGainEntry[];
  vatTransactions?: ProfessionalVatEntry[];
  propertyTransactions?: ProfessionalStampDutyEntry[];
  giftsAndInheritances?: ProfessionalCatEntry[];
  suppliedFacts?: TaxCaseFact[];
  rawArtifacts?: string[];
}

export interface ProfessionalCapitalGainEntryResult extends CgtResult {
  description?: string;
}

export interface ProfessionalVatEntryResult extends VatResult {
  amountCents: number;
  direction: VatDirection;
  description?: string;
}

export interface ProfessionalStampDutyEntryResult extends StampDutyResult {
  description?: string;
}

export interface ProfessionalCatEntryResult extends CatResult {
  kind: 'gift' | 'inheritance';
  description?: string;
}

export interface ProfessionalTaxReasoningResult {
  taxpayer: TaxpayerProfile;
  modulesTriggered: string[];
  personalTax?: AnnualPersonalTaxResult;
  capitalGains?: {
    entries: ProfessionalCapitalGainEntryResult[];
    totalGainCents: number;
    totalTaxableGainCents: number;
    totalCgtDueCents: number;
  };
  vat?: {
    entries: ProfessionalVatEntryResult[];
    totalNetCents: number;
    totalVatCents: number;
    totalGrossCents: number;
  };
  stampDuty?: {
    entries: ProfessionalStampDutyEntryResult[];
    totalConsiderationCents: number;
    totalDutyDueCents: number;
  };
  cat?: {
    entries: ProfessionalCatEntryResult[];
    totalBenefitCents: number;
    totalTaxableAmountCents: number;
    totalCatDueCents: number;
  };
  totalsCents: {
    totalLiabilityCents: number;
    incomeTaxCents: number;
    uscCents: number;
    prsiCents: number;
    cgtCents: number;
    vatCents: number;
    stampDutyCents: number;
    catCents: number;
  };
  reasoningNotes: string[];
  assumptions: string[];
  unresolvedQuestions: string[];
  outOfScopeIssues: string[];
}
