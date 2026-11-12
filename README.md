# Nexus Meals

A standalone web app where families and volunteers claim a Sunday to bring
the Nexus meal, and the Nexus team manages the schedule, overview, and
contacts. Built with Next.js (App Router, TypeScript), Upstash Redis, and
Tailwind CSS.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js (App Router, TypeScript) |
| Hosting | Vercel |
| Storage | Upstash Redis |
| Rate limiting | `@upstash/ratelimit` |
| Bot protection | Cloudflare Turnstile + honeypot field |
| Password hashing | bcrypt (`bcryptjs`) |
| Scheduled jobs | Vercel Cron (daily data purge) |
| Timezone | America/Chicago for all dates and cutoffs |

## Getting started

```bash
npm install
cp .env.example .env.local
# fill in .env.local, then:
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The public site starts
at `/schedule`; the admin panel is at `/admin`.

## Environment variables

See `.env.example` (a local-dev template; don't bulk-import it into Vercel,
since blank values override real ones). You'll need:

- `KV_REST_API_URL` / `KV_REST_API_TOKEN`: set automatically by the Vercel
  Upstash integration. `UPSTASH_REDIS_REST_URL` / `_TOKEN` also work.
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY`: Cloudflare
  Turnstile keys. With no secret key, signup verification is skipped only
  under `next dev`; every other mode fails closed.
- `OWNER_EMAIL` / `OWNER_PASSWORD`: seeds the first owner admin account on
  first request to any `/admin` page. Only runs while no admin accounts
  exist yet.
- `CRON_SECRET`: long random string. Vercel Cron sends it as a Bearer token
  to `/api/cron/purge`; the endpoint refuses every call while it's blank.
- `NEXT_PUBLIC_BASE_URL`: optional public `https://` URL for the QR code.
  Anything else falls back to the current origin.

## Data model

Everything lives in Upstash Redis as namespaced JSON documents; see
`src/lib/types.ts` and `src/lib/signups.ts` for the exact keys
(`settings`, `overview`, `week:{date}`, `claim:{date}`, `signup:{id}`,
`signups:by-date`, `needs-contact`, `admin:{id}`, `session:{token}`).
Weeks are generated on read for a rolling window; only exceptions
(No Nexus weeks, arrival overrides) and claims are stored.

## Scheduled purge

`vercel.json` registers a daily cron hitting `/api/cron/purge`, which wipes
name/email/phone (keeping date and meal) for signups more than
`retentionDays` (default 30) past their Sunday.

## Security

See `SECURITY_REPORT.md` for the latest audit, open risks, and manual
actions. Standing rules for future changes live in `CLAUDE.md`.
