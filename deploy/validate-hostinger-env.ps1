param(
    [string]$EnvFile = "deploy/.env.hostinger.example"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $EnvFile)) {
    throw "Env file not found: $EnvFile"
}

$required = @(
    "NEXT_PUBLIC_APP_DOMAIN",
    "NEXT_PUBLIC_APP_SHORT_DOMAIN",
    "NEXTAUTH_URL",
    "DATABASE_URL",
    "PLANETSCALE_DATABASE_URL",
    "NEXTAUTH_SECRET",
    "TINYBIRD_API_KEY",
    "UPSTASH_REDIS_REST_URL",
    "UPSTASH_REDIS_REST_TOKEN",
    "QSTASH_TOKEN",
    "QSTASH_CURRENT_SIGNING_KEY",
    "QSTASH_NEXT_SIGNING_KEY",
    "RESEND_API_KEY",
    "RESEND_WEBHOOK_SECRET"
)

$envMap = @{}
Get-Content $EnvFile | ForEach-Object {
    if ($_ -match "^\s*#" -or $_ -match "^\s*$") {
        return
    }

    $i = $_.IndexOf("=")
    if ($i -le 0) {
        return
    }

    $key = $_.Substring(0, $i).Trim()
    $value = $_.Substring($i + 1)
    $envMap[$key] = $value
}

$missing = @()
foreach ($key in $required) {
    if (-not $envMap.ContainsKey($key) -or [string]::IsNullOrWhiteSpace($envMap[$key])) {
        $missing += $key
    }
}

if ($missing.Count -eq 0) {
    Write-Host "OK: all required Hostinger env values are present."
    exit 0
}

Write-Host "Missing required Hostinger env values:" -ForegroundColor Yellow
$missing | ForEach-Object { Write-Host " - $_" -ForegroundColor Yellow }
exit 1
