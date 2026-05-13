<#
.SYNOPSIS
    Deploy de dist/ para o servidor de producao via PuTTY (pscp/plink).

.DESCRIPTION
    - Empacota dist/ excluindo runtime-config.js
    - Faz upload via pscp em modo batch (sem prompts)
    - Extrai remotamente, preserva runtime-config.js existente
    - Faz chown para dev:dev e ajusta permissoes (755/644)

    pscp.exe e plink.exe sao baixados automaticamente em
    %LOCALAPPDATA%\putty-cli na primeira execucao (sem necessidade de admin).

.PARAMETER Password
    Senha SSH. Se omitida, le de scripts/.deploy.local.

.EXAMPLE
    .\scripts\deploy.ps1
#>
param(
    [string]$Server       = '72.60.1.97',
    [string]$RemoteUser   = 'root',
    [string[]]$RemoteDirs = @('/var/www/goldenticket.lat'),
    [string]$OwnerUser    = 'dev',
    [string]$OwnerGroup   = 'dev',
    [string]$DistPath     = (Join-Path $PSScriptRoot '..\dist'),
    [string]$ExcludeFile  = 'runtime-config.js',
    [string]$HostKey      = 'SHA256:bsNAPo1OVmIqqvAEkr82PJSjVcuUKUjbNcmTkhrS0JI',
    [string]$Password
)

$ErrorActionPreference = 'Stop'

function Resolve-Password {
    if ($Password) { return $Password }

    $secretsPath = Join-Path $PSScriptRoot '.deploy.local'
    if (Test-Path $secretsPath) {
        $raw = (Get-Content -Raw $secretsPath).Trim()
        if ($raw) { return $raw }
    }

    $secure = Read-Host -AsSecureString -Prompt "SSH password for $RemoteUser@$Server"
    $bstr   = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try {
        return [Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
    } finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
    }
}

function Ensure-PuTTYTools {
    $dir = Join-Path $env:LOCALAPPDATA 'putty-cli'
    $pscp  = Join-Path $dir 'pscp.exe'
    $plink = Join-Path $dir 'plink.exe'

    if ((Test-Path $pscp) -and (Test-Path $plink)) {
        return @{ Pscp = $pscp; Plink = $plink }
    }

    Write-Host "Baixando pscp/plink para $dir (one-time setup)..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    $base = 'https://the.earth.li/~sgtatham/putty/latest/w64'
    Invoke-WebRequest -Uri "$base/pscp.exe"  -OutFile $pscp  -UseBasicParsing
    Invoke-WebRequest -Uri "$base/plink.exe" -OutFile $plink -UseBasicParsing
    Write-Host "  pscp: $((Get-Item $pscp).Length)  bytes"
    Write-Host "  plink: $((Get-Item $plink).Length) bytes"

    return @{ Pscp = $pscp; Plink = $plink }
}

function Assert-Tool($name) {
    if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
        throw "$name nao encontrado no PATH."
    }
}

$tools = Ensure-PuTTYTools
$pscp  = $tools.Pscp
$plink = $tools.Plink
Assert-Tool 'tar.exe'

$DistPath = (Resolve-Path $DistPath).Path
if (-not (Test-Path $DistPath)) {
    throw "dist nao encontrada em $DistPath. Rode 'npm run build' primeiro."
}

$Password = Resolve-Password
if (-not $Password) { throw "Senha nao informada." }

Write-Host "Source  : $DistPath"                                  -ForegroundColor Cyan
Write-Host "Server  : ${RemoteUser}@${Server}"                    -ForegroundColor Cyan
Write-Host "Targets : $($RemoteDirs -join ', ')"                  -ForegroundColor Cyan
Write-Host "Owner   : ${OwnerUser}:${OwnerGroup}"                 -ForegroundColor Cyan
Write-Host "Skip    : $ExcludeFile"                               -ForegroundColor Cyan

$id        = [guid]::NewGuid().ToString('N').Substring(0, 8)
$staging   = Join-Path $env:TEMP "deploy-frontend-$id"
$archive   = Join-Path $env:TEMP "deploy-frontend-$id.tar.gz"
$remoteTmp = "/tmp/deploy-frontend-$id.tar.gz"

New-Item -ItemType Directory -Path $staging -Force | Out-Null

try {
    Write-Host "[1/4] Staging (excluindo $ExcludeFile)..."
    Copy-Item -Path (Join-Path $DistPath '*') -Destination $staging -Recurse -Exclude $ExcludeFile

    Write-Host "[2/4] Empacotando $archive..."
    & tar.exe -czf $archive -C $staging .
    if ($LASTEXITCODE -ne 0) { throw "tar falhou (exit $LASTEXITCODE)" }

    Write-Host "[3/4] Upload para $remoteTmp..."
    & $pscp -batch -hostkey $HostKey -pw $Password $archive "${RemoteUser}@${Server}:$remoteTmp"
    if ($LASTEXITCODE -ne 0) { throw "pscp falhou (exit $LASTEXITCODE)" }

    $bashTemplate = @'
set -euo pipefail
EXCLUDE_FILE='__EXCLUDE_FILE__'
REMOTE_TMP='__REMOTE_TMP__'
OWNER='__OWNER__'
REMOTE_DIRS=(__REMOTE_DIRS__)

for REMOTE_DIR in "${REMOTE_DIRS[@]}"; do
    mkdir -p "$REMOTE_DIR"

    backup=""
    if [ -f "$REMOTE_DIR/$EXCLUDE_FILE" ]; then
        backup="$(mktemp)"
        cp "$REMOTE_DIR/$EXCLUDE_FILE" "$backup"
    fi

    find "$REMOTE_DIR" -mindepth 1 -delete
    tar -xzf "$REMOTE_TMP" -C "$REMOTE_DIR"

    if [ -n "$backup" ] && [ -f "$backup" ]; then
        mv "$backup" "$REMOTE_DIR/$EXCLUDE_FILE"
    fi

    chown -R "$OWNER" "$REMOTE_DIR"
    find "$REMOTE_DIR" -type d -exec chmod 755 {} \;
    find "$REMOTE_DIR" -type f -exec chmod 644 {} \;

    echo "deploy ok: $REMOTE_DIR"
done

rm -f "$REMOTE_TMP"
'@

    # Quote cada caminho remoto pra bash array
    $remoteDirsArg = ($RemoteDirs | ForEach-Object { "'$_'" }) -join ' '

    $bash = $bashTemplate.
        Replace('__REMOTE_DIRS__',  $remoteDirsArg).
        Replace('__EXCLUDE_FILE__', $ExcludeFile).
        Replace('__REMOTE_TMP__',   $remoteTmp).
        Replace('__OWNER__',        ("{0}:{1}" -f $OwnerUser, $OwnerGroup)).
        Replace("`r`n", "`n")

    # Codifica o script em base64 ASCII puro pra evitar BOM/encoding issues no pipe
    $bashBytes = [Text.UTF8Encoding]::new($false).GetBytes($bash)
    $bashB64   = [Convert]::ToBase64String($bashBytes)

    Write-Host "[4/4] Executando deploy remoto..."
    & $plink -ssh -batch -hostkey $HostKey -pw $Password "${RemoteUser}@${Server}" "echo $bashB64 | base64 -d | bash"
    if ($LASTEXITCODE -ne 0) { throw "plink remoto falhou (exit $LASTEXITCODE)" }

    Write-Host "Done." -ForegroundColor Green
} finally {
    Remove-Item -Recurse -Force $staging -ErrorAction SilentlyContinue
    Remove-Item -Force          $archive -ErrorAction SilentlyContinue
}
