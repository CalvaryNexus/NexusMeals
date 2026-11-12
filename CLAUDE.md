@AGENTS.md

## Security rules (always)
- Secrets live only in server env vars. Never use a public-prefixed env var for a secret. Never ask the user to paste a key into chat.
- Every third-party call that costs money or uses a secret runs on the server.
- Every route/action checks authentication and authorization server-side before reading or writing.
- Fields controlling access, money, or limits are never writable by users and never stored on user-editable records.
- Every new endpoint gets server-side validation (schema + max lengths) and a rate limit.
- Payment status changes only via signed webhooks. Prices come from the server.
- Before adding a dependency, confirm the exact package exists, is from the expected publisher, and is widely used.
- No secrets or PII in logs or client errors.
- After any change touching auth, payments, data access, or AI endpoints, rerun the relevant Phase 3 scenarios: `./scripts/security/run.sh` (local only, never against production). See `SECURITY_REPORT.md`.
