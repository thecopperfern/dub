param(
    [int]$QStashPort = 8080
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$envPath = Join-Path $repoRoot "web\.env"

if (-not (Test-Path $envPath)) {
    throw "Missing $envPath. Create apps/web/.env first."
}

function Get-EnvValue {
    param(
        [string]$Path,
        [string]$Key
    )

    $line = Get-Content $Path | Where-Object { $_ -match "^$([regex]::Escape($Key))=" } | Select-Object -First 1
    if (-not $line) {
        return ""
    }

    return $line.Substring($line.IndexOf("=") + 1)
}

$redisUrl = Get-EnvValue -Path $envPath -Key "UPSTASH_REDIS_REST_URL"
$redisToken = Get-EnvValue -Path $envPath -Key "UPSTASH_REDIS_REST_TOKEN"

if ([string]::IsNullOrWhiteSpace($redisToken)) {
    throw "UPSTASH_REDIS_REST_TOKEN is empty in apps/web/.env."
}

if ([string]::IsNullOrWhiteSpace($redisUrl)) {
    $redisUrl = "http://127.0.0.1:8079"
}

if (-not ($redisUrl -match "^https?://")) {
    throw "UPSTASH_REDIS_REST_URL must start with http:// or https://"
}

$redisPort = [uri]$redisUrl
$port = if ($redisPort.IsDefaultPort) { 80 } else { $redisPort.Port }

docker inspect dub-redis *> $null
if ($LASTEXITCODE -ne 0) {
    docker run -d --name dub-redis redis:7-alpine *> $null
} else {
    docker start dub-redis *> $null
}

docker inspect dub-redis-http *> $null
if ($LASTEXITCODE -ne 0) {
    docker run -d --name dub-redis-http -p "${port}:80" --link dub-redis:redis `
        -e SRH_MODE=env `
        -e SRH_TOKEN="$redisToken" `
        -e SRH_CONNECTION_STRING=redis://redis:6379 `
        hiett/serverless-redis-http:latest *> $null
} else {
    docker start dub-redis-http *> $null
}

Write-Host "Redis REST is running at $redisUrl"
Write-Host "Starting local QStash on http://127.0.0.1:$QStashPort (Ctrl+C to stop)..."

Set-Location $repoRoot
npx --yes @upstash/qstash-cli dev -port $QStashPort
