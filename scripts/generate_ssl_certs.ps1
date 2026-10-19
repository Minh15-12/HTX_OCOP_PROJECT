# ==============================================================================
# Generate Self-Signed SSL Certificate for HTX OCOP Production / Staging
# Generates server.key and server.crt with Subject Alternative Names (SAN)
# ==============================================================================

$targetDir = Join-Path $PSScriptRoot "..\docker\ssl"
if (-not (Test-Path $targetDir)) {
    New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
}

$certFile = Join-Path $targetDir "server.crt"
$keyFile  = Join-Path $targetDir "server.key"
$cnfFile  = Join-Path $targetDir "openssl.cnf"

# Find OpenSSL executable
$opensslExe = "openssl"
if (-not (Get-Command "openssl" -ErrorAction SilentlyContinue)) {
    $gitOpenSsl = "C:\Program Files\Git\usr\bin\openssl.exe"
    if (Test-Path $gitOpenSsl) {
        $opensslExe = $gitOpenSsl
    } else {
        Write-Error "OpenSSL not found. Please install OpenSSL or Git for Windows."
        exit 1
    }
}

Write-Host ">>> Generating OpenSSL configuration with SAN (Subject Alternative Names)..." -ForegroundColor Cyan

$cnfLines = @(
    "[req]",
    "default_bits        = 2048",
    "default_md          = sha256",
    "distinguished_name  = req_distinguished_name",
    "x509_extensions     = v3_req",
    "prompt              = no",
    "",
    "[req_distinguished_name]",
    "C   = VN",
    "ST  = Lam Dong",
    "L   = Da Lat",
    "O   = HTX Nong Nghiep Tan Tien",
    "OU  = IT & OCOP Department",
    "CN  = localhost",
    "",
    "[v3_req]",
    "keyUsage            = digitalSignature, keyEncipherment",
    "extendedKeyUsage    = serverAuth",
    "subjectAltName      = @alt_names",
    "",
    "[alt_names]",
    "DNS.1 = localhost",
    "DNS.2 = htx-ocop.local",
    "DNS.3 = *.htx.vn",
    "IP.1  = 127.0.0.1",
    "IP.2  = 0.0.0.0"
)

$cnfLines | Set-Content -Path $cnfFile -Encoding ASCII

Write-Host ">>> Generating private key (2048-bit RSA) and self-signed certificate (3 years validity)..." -ForegroundColor Cyan
& $opensslExe req -x509 -nodes -days 1095 -newkey rsa:2048 -keyout $keyFile -out $certFile -config $cnfFile

if (Test-Path $certFile) {
    Write-Host ">>> SUCCESS: SSL certificates generated successfully!" -ForegroundColor Green
    Write-Host "    - Certificate: $certFile" -ForegroundColor Yellow
    Write-Host "    - Private Key: $keyFile" -ForegroundColor Yellow
    Write-Host "    - Enabled: HTTPS 443, Mobile Camera QR Scanning, HTML5 Geolocation GPS." -ForegroundColor Green
} else {
    Write-Error "Failed to generate SSL certificate."
    exit 1
}
