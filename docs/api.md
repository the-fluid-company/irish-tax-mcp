# Irish Tax MCP API

## Endpoints

### `GET /health`
Returns service metadata.

Example response:
```json
{
  "status": "ok",
  "service": "irish-tax-mcp",
  "version": "1.0.0",
  "supportedYears": [2025],
  "informationalOnly": true
}
```

### `GET /tools/list`
Returns the available tool catalog plus the global disclaimer.

### `POST /tools/call`
Request body:
```json
{
  "name": "calculate_income_tax",
  "input": {
    "year": 2025,
    "grossIncomeCents": 5000000,
    "filingStatus": "single",
    "creditKeys": ["personal_single", "paye"],
    "prsiClass": "A"
  }
}
```

Response shape:
```json
{
  "content": [
    {
      "type": "text",
      "text": "{ ... stringified JSON payload ... }"
    }
  ],
  "service": "irish-tax-mcp",
  "version": "1.0.0"
}
```

Tool payloads include:
- `year`
- `informationalOnly: true`
- `disclaimer`
- `supportedYears`

## Error responses

```json
{
  "error": {
    "code": "tool_error",
    "message": "Field \"grossIncomeCents\" must be a non-negative integer."
  },
  "service": "irish-tax-mcp",
  "version": "1.0.0"
}
```

Status codes:
- `400` invalid request JSON/body shape
- `404` unknown route or unknown tool
- `405` wrong HTTP method
- `422` validation/tool error

## Safety contract
- Outputs are informational only.
- Supported years are explicit.
- Monetary values remain in euro cents unless an `Eur` field is also provided.
- Complex reliefs and judgment-heavy advice remain out of scope.
