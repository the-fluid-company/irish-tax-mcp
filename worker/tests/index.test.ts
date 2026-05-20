import { describe, expect, it } from 'vitest';
import worker from '../src/index.js';

async function call(request: Request) {
  return worker.fetch(request);
}

describe('worker API', () => {
  it('serves health metadata', async () => {
    const response = await call(new Request('https://example.com/health'));
    expect(response.status).toBe(200);

    const body = (await response.json()) as {
      status: string;
      service: string;
      supportedYears: number[];
    };

    expect(body.status).toBe('ok');
    expect(body.service).toBe('irish-tax-mcp');
    expect(body.supportedYears).toEqual([2025]);
  });

  it('rejects unsupported methods with Allow header', async () => {
    const response = await call(new Request('https://example.com/tools/list', { method: 'POST' }));
    expect(response.status).toBe(405);
    expect(response.headers.get('Allow')).toBe('GET, OPTIONS');
  });

  it('lists tools with disclaimer metadata', async () => {
    const response = await call(new Request('https://example.com/tools/list'));
    expect(response.status).toBe(200);

    const body = (await response.json()) as {
      tools: Array<{ name: string }>;
      disclaimer: string;
    };

    expect(body.tools.some((tool) => tool.name === 'calculate_income_tax')).toBe(true);
    expect(body.disclaimer).toMatch(/Informational Irish tax output only/);
  });

  it('calculates annual personal tax and returns disclaimer in tool payload', async () => {
    const response = await call(
      new Request('https://example.com/tools/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'calculate_annual_personal_tax',
          input: {
            year: 2025,
            filingStatus: 'single',
            creditKeys: ['personal_single', 'paye', 'earned_income'],
            incomeSources: [
              { kind: 'employment', grossIncomeCents: 5_000_000 },
              { kind: 'self_employment', grossIncomeCents: 2_000_000 },
            ],
          },
        }),
      }),
    );

    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      content: Array<{ text: string }>;
    };
    const payload = JSON.parse(body.content[0].text) as {
      totalGrossIncomeCents: number;
      disclaimer: string;
      informationalOnly: boolean;
    };

    expect(payload.totalGrossIncomeCents).toBe(7_000_000);
    expect(payload.informationalOnly).toBe(true);
    expect(payload.disclaimer).toMatch(/qualified tax professional/);
  });

  it('returns validation errors for malformed input', async () => {
    const response = await call(
      new Request('https://example.com/tools/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'calculate_income_tax', input: { grossIncomeCents: -1 } }),
      }),
    );

    expect(response.status).toBe(422);
    const body = (await response.json()) as { error: { code: string; message: string } };
    expect(body.error.code).toBe('tool_error');
    expect(body.error.message).toMatch(/grossIncomeCents/);
  });

  it('reasons across a professional tax case', async () => {
    const response = await call(
      new Request('https://example.com/tools/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'reason_professional_tax_case',
          input: {
            year: 2025,
            taxpayer: { filingStatus: 'single', residencyStatus: 'non_resident' },
            creditKeys: ['personal_single', 'paye'],
            incomeSources: [{ kind: 'employment', grossIncomeCents: 5_000_000 }],
            capitalGains: [{ gainCents: 2_000_000, description: 'Share sale' }],
            rawArtifacts: ['p60.pdf'],
          },
        }),
      }),
    );

    expect(response.status).toBe(200);
    const body = (await response.json()) as { content: Array<{ text: string }> };
    const payload = JSON.parse(body.content[0].text) as {
      modulesTriggered: string[];
      totalsCents: { totalLiabilityCents: number };
      totalsEur: { totalLiabilityEur: number };
      outOfScopeIssues: string[];
    };

    expect(payload.modulesTriggered).toEqual(['annual_personal_tax', 'capital_gains_tax']);
    expect(payload.totalsCents.totalLiabilityCents).toBe(1_674_312);
    expect(payload.totalsEur.totalLiabilityEur).toBe(16_743.12);
    expect(payload.outOfScopeIssues[0]).toMatch(/not fully modeled/);
  });
});
