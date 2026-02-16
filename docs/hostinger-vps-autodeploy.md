# Hostinger VPS Auto-Deploy Setup

This repository is configured to auto-deploy on every push to `main` using:

- Workflow: `.github/workflows/deploy-hostinger-vps.yml`
- Hostinger Action: `hostinger/deploy-on-vps@v2`
- Compose file: `deploy/docker-compose.hostinger.yml`
- Dockerfile: `deploy/Dockerfile.hostinger`

## 1. Hostinger Prerequisites

- Create a Hostinger VPS with Docker enabled.
- Get your Hostinger API key from hPanel API settings.
- Note your VPS VM ID.
- If this repository is private, add an SSH deploy key in Hostinger Docker Manager and in GitHub repo deploy keys.

## 2. GitHub Repository Configuration

Use `deploy/.env.hostinger.example` as the canonical variable checklist.

Add these GitHub **Secrets**:

- `HOSTINGER_API_KEY`
- `DATABASE_URL`
- `PLANETSCALE_DATABASE_URL`
- `NEXTAUTH_SECRET`
- `TINYBIRD_API_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `QSTASH_TOKEN`
- `QSTASH_CURRENT_SIGNING_KEY`
- `QSTASH_NEXT_SIGNING_KEY`
- `RESEND_API_KEY`
- `RESEND_WEBHOOK_SECRET`

Optional but commonly needed secrets:

- `SMTP_USER`
- `SMTP_PASSWORD`
- `PLAIN_API_KEY`
- `PLAIN_WEBHOOK_SECRET`
- `PROJECT_ID_VERCEL`
- `TEAM_ID_VERCEL`
- `AUTH_BEARER_TOKEN`
- `STORAGE_ACCESS_KEY_ID`
- `STORAGE_SECRET_ACCESS_KEY`
- `STORAGE_ENDPOINT`
- `STORAGE_BASE_URL`
- `STORAGE_PUBLIC_BUCKET`
- `STORAGE_PRIVATE_BUCKET`

Add these GitHub **Variables**:

- `HOSTINGER_VM_ID`
- `NEXT_PUBLIC_APP_DOMAIN`
- `NEXT_PUBLIC_APP_SHORT_DOMAIN`
- `NEXTAUTH_URL`

Optional variables:

- `NEXT_PUBLIC_APP_NAME` (defaults to `Dub`)
- `TINYBIRD_API_URL` (defaults to `https://api.tinybird.co`)
- `QSTASH_URL` (optional override; defaults to Upstash hosted URL)
- `SMTP_HOST` (defaults to `localhost`)
- `SMTP_PORT` (defaults to `1025`)

## 3. Deploy Flow

Pre-flight check (recommended):

```bash
pwsh -NoProfile -File deploy/validate-hostinger-env.ps1 -EnvFile deploy/.env.hostinger.example
```

1. Push to `main`.
2. GitHub Actions triggers `.github/workflows/deploy-hostinger-vps.yml`.
3. Hostinger pulls the compose file for that commit and deploys the project.

## 4. Verify

- Check Actions run logs in GitHub.
- Check deployment status in Hostinger Docker Manager.
- Validate app is reachable on VPS exposed port (`3000`) or your reverse-proxy domain.

## 5. Notes

- This is optimized for fast VPS testing, not minimal image size.
- `PLAIN_API_KEY` is optional for boot now; Plain integration endpoints will fail if it is unset.
