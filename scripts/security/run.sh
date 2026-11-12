#!/bin/bash
# Runs the security regression suite against a LOCAL production build.
# Never point this at the live site: it creates accounts and signups.
# Needs: redis-server on PATH. Installs ioredis without touching package.json.
set -euo pipefail
cd "$(dirname "$0")/../.."
HERE=scripts/security
PORT=3100

[ -d node_modules/ioredis ] || npm i --no-save ioredis@5 >/dev/null
redis-cli ping >/dev/null 2>&1 || redis-server --daemonize yes --port 6379 --save "" --appendonly no
redis-cli flushall >/dev/null

node $HERE/upstash-shim.mjs > /tmp/nexus-shim.log 2>&1 &
SHIM=$!
trap 'kill $SHIM 2>/dev/null; fuser -k $PORT/tcp >/dev/null 2>&1 || true' EXIT

export KV_REST_API_URL=http://127.0.0.1:8079 KV_REST_API_TOKEN=local-test-token
export UPSTASH_REDIS_REST_URL= UPSTASH_REDIS_REST_TOKEN=
export TURNSTILE_SECRET_KEY=test-secret NEXT_PUBLIC_TURNSTILE_SITE_KEY=test-site
export OWNER_EMAIL=owner@test.local OWNER_PASSWORD='Owner-Test-Pass-1'
export CRON_SECRET=test-cron-secret NEXT_PUBLIC_BASE_URL=

npm run build >/dev/null
NODE_OPTIONS="--require ./$HERE/mock-turnstile.cjs" npx next start -p $PORT > /tmp/nexus-next.log 2>&1 &
for _ in $(seq 1 30); do curl -s -o /dev/null http://localhost:$PORT/schedule && break; sleep 1; done

node $HERE/attack.mjs http://localhost:$PORT
