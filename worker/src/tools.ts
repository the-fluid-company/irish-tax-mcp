export const TOOL_LIST = [
  {
    name: 'calculate_income_tax',
    description:
      'Calculate Irish income tax (IT), USC, and PRSI for a given gross income, filing status, tax credits, and PRSI class. All monetary amounts are in euro cents.',
    inputSchema: {
      type: 'object',
      required: ['grossIncomeCents', 'filingStatus', 'creditKeys', 'prsiClass'],
      properties: {
        year: {
          type: 'integer',
          description: 'Tax year. Defaults to 2025.',
          default: 2025,
        },
        grossIncomeCents: {
          type: 'integer',
          description: 'Annual gross income in euro cents (e.g. 5000000 = €50,000).',
        },
        filingStatus: {
          type: 'string',
          enum: ['single', 'married_one_income', 'married_two_incomes', 'widowed'],
          description: 'Filing status for standard-rate cut-off point selection.',
        },
        creditKeys: {
          type: 'array',
          items: {
            type: 'string',
            enum: [
              'personal_single',
              'personal_married',
              'paye',
              'earned_income',
              'home_carer',
              'single_person_child_carer',
            ],
          },
          description:
            'Tax credit keys to apply. E.g. ["personal_single","paye"] for a standard PAYE employee.',
        },
        prsiClass: {
          type: 'string',
          enum: ['A', 'S', 'D'],
          description: 'PRSI class: A = employed, S = self-employed, D = pre-1995 public servant.',
        },
      },
    },
  },
  {
    name: 'calculate_annual_personal_tax',
    description:
      'Calculate annual Irish personal tax across multiple income sources, aggregating income tax and USC while computing PRSI per source. All monetary amounts are in euro cents.',
    inputSchema: {
      type: 'object',
      required: ['filingStatus', 'creditKeys', 'incomeSources'],
      properties: {
        year: {
          type: 'integer',
          description: 'Tax year. Defaults to 2025.',
          default: 2025,
        },
        filingStatus: {
          type: 'string',
          enum: ['single', 'married_one_income', 'married_two_incomes', 'widowed'],
          description: 'Filing status for standard-rate cut-off point selection.',
        },
        creditKeys: {
          type: 'array',
          items: {
            type: 'string',
            enum: [
              'personal_single',
              'personal_married',
              'paye',
              'earned_income',
              'home_carer',
              'single_person_child_carer',
            ],
          },
          description: 'Tax credit keys to apply at the annual taxpayer level.',
        },
        incomeSources: {
          type: 'array',
          items: {
            type: 'object',
            required: ['kind', 'grossIncomeCents'],
            properties: {
              kind: {
                type: 'string',
                enum: ['employment', 'self_employment', 'pension', 'other'],
                description: 'Income source category.',
              },
              grossIncomeCents: {
                type: 'integer',
                description: 'Gross annual income for this source in euro cents.',
              },
              prsiClass: {
                type: 'string',
                enum: ['A', 'S', 'D'],
                description: 'Optional explicit PRSI class override for this source.',
              },
            },
          },
          description: 'Income sources to aggregate into one annual personal-tax computation.',
        },
      },
    },
  },
  {
    name: 'calculate_vat',
    description:
      'Calculate Irish VAT for a given amount and VAT code, either adding VAT to a net amount (exclusive) or extracting it from a gross amount (inclusive).',
    inputSchema: {
      type: 'object',
      required: ['amountCents', 'vatCode', 'direction'],
      properties: {
        year: { type: 'integer', description: 'Tax year. Defaults to 2025.', default: 2025 },
        amountCents: {
          type: 'integer',
          description: 'Amount in euro cents.',
        },
        vatCode: {
          type: 'string',
          enum: ['A', 'B', 'C', 'D'],
          description:
            'VAT rate code: A=23% (standard), B=13.5% (reduced), C=9% (second reduced), D=0% (zero).',
        },
        direction: {
          type: 'string',
          enum: ['exclusive', 'inclusive'],
          description:
            'exclusive = amountCents is net, add VAT. inclusive = amountCents is gross, extract VAT.',
        },
      },
    },
  },
  {
    name: 'calculate_cgt',
    description:
      'Calculate Irish Capital Gains Tax (CGT) on a capital gain, applying the annual personal exemption.',
    inputSchema: {
      type: 'object',
      required: ['gainCents'],
      properties: {
        year: { type: 'integer', description: 'Tax year. Defaults to 2025.', default: 2025 },
        gainCents: {
          type: 'integer',
          description: 'Total capital gain in euro cents before exemption.',
        },
      },
    },
  },
  {
    name: 'calculate_stamp_duty',
    description:
      'Calculate Irish stamp duty for a standard residential property, non-residential property, or share transfer. All monetary amounts are in euro cents.',
    inputSchema: {
      type: 'object',
      required: ['considerationCents', 'propertyType'],
      properties: {
        year: { type: 'integer', description: 'Tax year. Defaults to 2025.', default: 2025 },
        considerationCents: {
          type: 'integer',
          description: 'Consideration in euro cents.',
        },
        propertyType: {
          type: 'string',
          enum: ['residential', 'non_residential', 'shares'],
          description:
            'Transaction type: residential property, non-residential property, or share transfer.',
        },
      },
    },
  },
  {
    name: 'calculate_cat',
    description:
      'Calculate Irish Capital Acquisitions Tax (CAT) for a gift or inheritance using a group threshold, prior taxable benefits, and optional small gift exemption. All monetary amounts are in euro cents.',
    inputSchema: {
      type: 'object',
      required: ['benefitCents', 'group'],
      properties: {
        year: { type: 'integer', description: 'Tax year. Defaults to 2025.', default: 2025 },
        benefitCents: {
          type: 'integer',
          description: 'Taxable value of the current gift or inheritance in euro cents before CAT thresholding.',
        },
        group: {
          type: 'string',
          enum: ['A', 'B', 'C'],
          description: 'CAT threshold group.',
        },
        priorTaxableBenefitsCents: {
          type: 'integer',
          description: 'Prior taxable benefits already aggregated against the same group threshold.',
        },
        applySmallGiftExemption: {
          type: 'boolean',
          description: 'Whether to apply the annual €3,000 small gift exemption. Use only for gifts, not inheritances.',
        },
      },
    },
  },
  {
    name: 'reason_professional_tax_case',
    description:
      'Run deterministic multi-module Irish tax reasoning across structured taxpayer facts, connecting income, VAT, CGT, CAT, and stamp-duty modules into one professional review payload. All money is in euro cents.',
    inputSchema: {
      type: 'object',
      required: ['taxpayer'],
      properties: {
        year: { type: 'integer', description: 'Tax year. Defaults to 2025.', default: 2025 },
        taxpayer: {
          type: 'object',
          required: ['filingStatus'],
          properties: {
            filingStatus: {
              type: 'string',
              enum: ['single', 'married_one_income', 'married_two_incomes', 'widowed'],
            },
            residencyStatus: {
              type: 'string',
              enum: ['resident', 'non_resident', 'unknown'],
              description: 'Non-resident scenarios are flagged as not fully modeled.',
            },
          },
        },
        creditKeys: {
          type: 'array',
          items: {
            type: 'string',
            enum: [
              'personal_single',
              'personal_married',
              'paye',
              'earned_income',
              'home_carer',
              'single_person_child_carer',
            ],
          },
        },
        incomeSources: {
          type: 'array',
          items: {
            type: 'object',
            required: ['kind', 'grossIncomeCents'],
            properties: {
              kind: { type: 'string', enum: ['employment', 'self_employment', 'pension', 'other'] },
              grossIncomeCents: { type: 'integer' },
              prsiClass: { type: 'string', enum: ['A', 'S', 'D'] },
            },
          },
        },
        capitalGains: {
          type: 'array',
          items: {
            type: 'object',
            required: ['gainCents'],
            properties: {
              gainCents: { type: 'integer' },
              description: { type: 'string' },
            },
          },
        },
        vatTransactions: {
          type: 'array',
          items: {
            type: 'object',
            required: ['amountCents', 'vatCode', 'direction'],
            properties: {
              amountCents: { type: 'integer' },
              vatCode: { type: 'string', enum: ['A', 'B', 'C', 'D'] },
              direction: { type: 'string', enum: ['exclusive', 'inclusive'] },
              description: { type: 'string' },
            },
          },
        },
        propertyTransactions: {
          type: 'array',
          items: {
            type: 'object',
            required: ['considerationCents', 'propertyType'],
            properties: {
              considerationCents: { type: 'integer' },
              propertyType: { type: 'string', enum: ['residential', 'non_residential', 'shares'] },
              description: { type: 'string' },
            },
          },
        },
        giftsAndInheritances: {
          type: 'array',
          items: {
            type: 'object',
            required: ['kind', 'benefitCents', 'group'],
            properties: {
              kind: { type: 'string', enum: ['gift', 'inheritance'] },
              benefitCents: { type: 'integer' },
              group: { type: 'string', enum: ['A', 'B', 'C'] },
              priorTaxableBenefitsCents: { type: 'integer' },
              applySmallGiftExemption: { type: 'boolean' },
              description: { type: 'string' },
            },
          },
        },
        suppliedFacts: {
          type: 'array',
          items: {
            type: 'object',
            required: ['key', 'value'],
            properties: {
              key: { type: 'string' },
              value: { type: 'string' },
              source: { type: 'string' },
            },
          },
        },
        rawArtifacts: {
          type: 'array',
          items: { type: 'string' },
          description: 'Unparsed raw inputs are accepted for audit trail but flagged as not yet deterministically modeled.',
        },
      },
    },
  },
  {
    name: 'tax_reference_lookup',
    description:
      'Look up Irish tax reference data (rates, thresholds, credits) for a given topic and year.',
    inputSchema: {
      type: 'object',
      required: ['topic'],
      properties: {
        year: { type: 'integer', description: 'Tax year. Defaults to 2025.', default: 2025 },
        topic: {
          type: 'string',
          enum: ['income_tax', 'usc', 'prsi', 'tax_credits', 'cgt', 'vat', 'stamp_duty', 'cat'],
          description: 'The tax topic to retrieve reference data for.',
        },
      },
    },
  },
] as const;
