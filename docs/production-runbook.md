# Production Runbook

## Prerequisites
- Node 22+
- npm
- Cloudflare account with Wrangler auth configured
- Target Worker name and route/domain decided

## Release gate
Run from repo root:

```bash
npm install
npm run check
```

This must pass before deployment.

## Deploy
```bash
npm run deploy --workspace @irish-tax-mcp/worker
```

## Smoke tests
Replace `<worker-url>` with the deployed URL.

```bash
curl -s <worker-url>/health
curl -s <worker-url>/tools/list | jq '.tools | length'
curl -s <worker-url>/tools/call \
  -H 'content-type: application/json' \
  -d '{
    "name": "calculate_income_tax",
    "input": {
      "year": 2025,
      "grossIncomeCents": 5000000,
      "filingStatus": "single",
      "creditKeys": ["personal_single", "paye"],
      "prsiClass": "A"
    }
  }'
```

Verify:
- `/health` returns `status: ok`
- `/tools/list` returns the expected tool catalog
- `/tools/call` returns a result payload with disclaimer text

## Rollback
- Re-deploy the previous known-good Worker version from CI or local tagged commit.
- Re-run the three smoke tests above.

## Operational notes
- Cache-Control is `no-store`; do not place stale caching in front of calculator responses.
- Keep reference data changes tax-year versioned and test-covered.
- Do not add LLM arithmetic to any calculator path.
- If rates change, update `packages/reference/data/<year>.json`, add tests, and run `npm run validate-rates`.
