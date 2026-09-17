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

See `.env.example`. You'll need:

- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`: an Upstash Redis
  database (REST API, not a plain TCP Redis instance).
- `TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` / `NEXT_PUBLIC_TURNSTILE_SITE_KEY`:
  Cloudflare Turnstile widget keys. If `TURNSTILE_SECRET_KEY` is unset, the
  signup API skips verification outside production (useful for local dev)
  but never in production.
- `OWNER_EMAIL` / `OWNER_PASSWORD`: seeds the first owner admin account on
  first request to any `/admin` page. Only runs while no admin accounts
  exist yet, so it's safe to leave set after the first deploy.
- `CRON_SECRET`: shared secret checked against the `Authorization: Bearer`
  header on `/api/cron/purge`. Vercel Cron sends this automatically when the
  variable is set in the project.
- `NEXT_PUBLIC_BASE_URL`: used to build the QR code and absolute links.

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

## Known gaps to fill in before launch

- **Logo**: the brief calls for the white knockout Nexus logo embedded in
  the Abide Leader's Guide PNG. That file wasn't available in this build, so
  `src/components/Logo.tsx` currently renders a text wordmark placeholder.
  Swap in the real asset at `public/nexus-logo.png` and update `Logo.tsx` to
  render an `<Image>`.
- **Content Security Policy**: `script-src` includes `'unsafe-inline'`
  because Next.js injects inline hydration scripts. Tightening this to a
  nonce-based policy is possible but requires middleware wiring; flagged
  here rather than skipped silently.
- **Live QA**: this build was verified with `next build`, `eslint`, and a
  standalone test of the timezone/cutoff/state and calendar-generation logic
  (all passed). It has not been exercised against a live Upstash database,
  real Turnstile keys, or in a browser, since none of those were available
  in this environment.
