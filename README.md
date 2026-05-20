# Irish Tax MCP

A lean public Irish tax calculation and reference server with:
- deterministic calculators in TypeScript
- a Cloudflare Worker exposing MCP-style tool endpoints
- a modular `skills/irish-tax` package for agent workflows
- no LLM arithmetic for tax calculations

## What this is

This project aims to be a strong Irish tax *assistant* for common scenarios by combining:
- exact code-based calculations
- structured published tax reference data
- a deterministic professional-review reasoning layer that connects supported facts across modules
- a public MCP endpoint for tool-using clients
- a reusable skill package for agent systems

## What this is not

It is **not** a licensed chartered accountant and cannot legally replace one.
It does not attempt to automate judgement-heavy advice or facts not encoded in inputs.

## Current MVP scope

### Calculators
- Income tax + USC + PRSI
- Annual personal tax across multiple income sources
- VAT
- CGT
- Stamp duty
- CAT
- Professional tax-case reasoning across structured facts

### Reference lookup
- income tax
- USC
- PRSI
- tax credits
- CGT
- VAT
- stamp duty

### HTTP endpoints
- `GET /health`
- `GET /tools/list`
- `POST /tools/call`

## Project structure

- `packages/core` — deterministic calculators
- `packages/reference` — tax-year reference data and lookup helpers
- `worker` — Cloudflare Worker with public MCP-style endpoints
- `skills/irish-tax` — finance-style skill package
- `scripts` — validation scripts
- `docs` — API and production runbook docs

## Usage

### Install

```bash
npm install
```

### Run the full verification suite

```bash
npm run check
```

### Run tests

```bash
npm test
```

### Typecheck

```bash
npm run typecheck
```

### Validate rate assumptions

```bash
npm run validate-rates
```

### Run worker locally

```bash
npm run dev --workspace @irish-tax-mcp/worker
```

### Deploy to Cloudflare

```bash
npm run deploy --workspace @irish-tax-mcp/worker
```

See `docs/api.md` for endpoint contracts and `docs/production-runbook.md` for release, smoke-test, and rollback steps.

## Design principles

1. All money uses euro cents.
2. Calculations are deterministic and auditable.
3. Reference data is versioned by tax year.
4. LLMs may orchestrate tools, but may not invent figures.
5. Responses must carry limitations and scope warnings.
