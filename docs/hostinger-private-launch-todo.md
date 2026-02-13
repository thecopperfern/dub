# Hostinger Private Hosting TODO (Dub Link Tracking)

## Current Baseline (Completed)

- [x] Installed repo dependencies with lockfile fidelity using `pnpm 9.15.9`.
- [x] Verified workspace install works with `pnpm install --frozen-lockfile`.
- [x] Verified package build baseline with `pnpm --filter @dub/ui build`.
- [x] Ran `apps/web` production build and captured blocking issues.

## Current Blockers (From Build/Eval)

- [ ] Build fails without runtime env loaded: `apps/web/lib/plain/client.ts` instantiates `PlainClient` at module load and throws when `PLAIN_API_KEY` is empty.
- [ ] Domain management is tightly coupled to Vercel Domains API in several paths, including:
- [ ] `apps/web/app/api/domains/[domain]/route.ts`
- [ ] `apps/web/app/api/domains/[domain]/verify/route.ts`
- [ ] `apps/web/lib/api/domains/add-domain-vercel.ts`
- [ ] `apps/web/lib/api/domains/remove-domain-vercel.ts`
- [ ] `apps/web/lib/api/domains/get-domain-response.ts`
- [ ] `apps/web/lib/api/domains/get-config-response.ts`
- [ ] `apps/web/lib/api/domains/verify-domain.ts`
- [ ] Local dependency containers were not started because Docker daemon is not running on this machine.

## Phase 1: Environment + Local Readiness

- [ ] Copy `apps/web/.env.example` to `apps/web/.env`.
- [ ] Set required minimum envs for startup and build:
- [ ] `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_APP_DOMAIN`, `NEXT_PUBLIC_APP_SHORT_DOMAIN`
- [ ] `DATABASE_URL`, `PLANETSCALE_DATABASE_URL`
- [ ] `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- [ ] `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- [ ] `QSTASH_TOKEN`, `QSTASH_CURRENT_SIGNING_KEY`, `QSTASH_NEXT_SIGNING_KEY`
- [ ] `TINYBIRD_API_KEY`, `TINYBIRD_API_URL`
- [ ] `PLAIN_API_KEY` (or code-gate Plain client init)
- [ ] Set `NEXT_PUBLIC_VERCEL_ENV=production` for hosted/prod URL generation.
- [ ] Start Docker Desktop (if using local MySQL/mailhog) and run `docker compose up -d` in `apps/web`.
- [ ] Run `pnpm --filter web prisma:push`.
- [ ] Validate build: `$env:NODE_OPTIONS='--max-old-space-size=8192'; pnpm --filter web build`.

## Phase 2: Hostinger Architecture Decision

- [ ] Choose hosting mode:
- [ ] Option A: Hostinger VPS + private services on VPS.
- [ ] Option B: Hostinger Node app hosting + managed external services (Upstash/Tinybird/PlanetScale/SMTP).
- [ ] Decide privacy target:
- [ ] "App private, data on managed SaaS".
- [ ] "Full private stack" (replace Upstash/Tinybird managed dependencies).

## Phase 3: Hostinger VPS Provisioning (Recommended)

- [ ] Provision VPS (Ubuntu LTS, at least 4 vCPU, 8 GB RAM, SSD).
- [ ] Install runtime: Node.js 23.11.x, pnpm 9.15.9, git, nginx, certbot.
- [ ] Create non-root deploy user and SSH key-only auth.
- [ ] Configure firewall: allow `22`, `80`, `443`; deny all else.
- [ ] Set up app directory and clone repo.
- [ ] Install dependencies with `pnpm install --frozen-lockfile`.
- [ ] Configure systemd service for `pnpm --filter web start`.
- [ ] Configure Nginx reverse proxy to app port and TLS certificates.

## Phase 4: DNS + Routing for Dub Hostname Model

- [ ] Configure DNS records in Hostinger for:
- [ ] `app.<your-domain>`
- [ ] `api.<your-domain>`
- [ ] `admin.<your-domain>` (if used)
- [ ] `partners.<your-domain>` (if used)
- [ ] Short domain root + wildcard (for redirect links).
- [ ] Ensure reverse proxy forwards `Host`, `X-Forwarded-For`, `X-Forwarded-Proto`.
- [ ] Validate middleware hostname routing works for each host.

## Phase 5: Code Changes Required for Hostinger Private Flow

- [ ] Add an abstraction for domain provider operations.
- [ ] Keep current Vercel implementation behind provider flag.
- [ ] Add Hostinger/manual DNS verification implementation.
- [ ] Guard Vercel-only calls in `domains` routes so non-Vercel deployments do not break.
- [ ] Make Plain client lazy-initialized or feature-flagged to avoid hard build failure when not configured.
- [ ] Decide geolocation strategy outside Vercel (`x-forwarded-for` + GeoIP service or disable geo dimensions).

## Phase 6: Private Data Plane (If Fully Private)

- [ ] Replace Upstash Redis with self-hosted Redis and adapt clients if needed.
- [ ] Replace Upstash QStash with queue/worker stack (BullMQ, RabbitMQ, or cron worker).
- [ ] Replace Tinybird analytics with ClickHouse pipeline + query adapter.
- [ ] Review all `apps/web/lib/tinybird/*` and analytics API routes for migration scope.

## Phase 7: Security + Ops Hardening

- [ ] Rotate all secrets and store in Hostinger/VPS secret management.
- [ ] Add automated backups (DB + uploaded assets + env vault).
- [ ] Add uptime, error, and latency monitoring.
- [ ] Add log retention and alerting policy.
- [ ] Add WAF/rate-limiting at Nginx or CDN edge.

## Phase 8: Go-Live Checklist

- [ ] Create test workspace and test domain.
- [ ] Create short link and validate redirect on short domain.
- [ ] Validate click ingestion appears in analytics.
- [ ] Validate auth (email sign-in, password reset, session cookie domain).
- [ ] Validate cron/workflow path (QStash or replacement).
- [ ] Run smoke tests on `app`, `api`, and short-link hostnames.
- [ ] Cut DNS TTL low, perform cutover, monitor error budget for 24h.

## Command Quick Reference

- `pnpm install --frozen-lockfile`
- `pnpm --filter web prisma:generate`
- `pnpm --filter web prisma:push`
- `$env:NODE_OPTIONS='--max-old-space-size=8192'; pnpm --filter web build`
- `pnpm --filter web start`
