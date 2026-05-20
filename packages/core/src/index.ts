export { calculateIncomeTax } from './income-tax.js';
export { calculateAnnualPersonalTax } from './annual-personal-tax.js';
export { calculateVat } from './vat.js';
export { calculateCgt } from './cgt.js';
export { calculateStampDuty } from './stamp-duty.js';
export { calculateCat } from './cat.js';
export { calculateProfessionalTaxReasoning } from './professional-tax-reasoning.js';
export type {
  TaxRates,
  IncomeTaxParams,
  IncomeTaxResult,
  AnnualPersonalTaxParams,
  AnnualPersonalTaxResult,
  AnnualPersonalTaxIncomeSource,
  VatParams,
  VatResult,
  CgtParams,
  CgtResult,
  StampDutyParams,
  StampDutyResult,
  CatParams,
  CatResult,
  FilingStatus,
  PrsiClass,
  VatCode,
  VatDirection,
  StampDutyPropertyType,
  CatGroup,
  PersonalTaxIncomeSourceKind,
  TaxCreditKey,
  TaxBand,
  TaxpayerProfile,
  TaxCaseFact,
  ProfessionalCapitalGainEntry,
  ProfessionalVatEntry,
  ProfessionalStampDutyEntry,
  ProfessionalCatEntry,
  ProfessionalTaxReasoningParams,
  ProfessionalCapitalGainEntryResult,
  ProfessionalVatEntryResult,
  ProfessionalStampDutyEntryResult,
  ProfessionalCatEntryResult,
  ProfessionalTaxReasoningResult,
} from './types.js';
