#!/usr/bin/env bash
# ==============================================================================
# Generate Self-Signed SSL Certificate for HTX OCOP Production / Staging (Linux)
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="${SCRIPT_DIR}/../docker/ssl"
mkdir -p "${TARGET_DIR}"

CERT_FILE="${TARGET_DIR}/server.crt"
KEY_FILE="${TARGET_DIR}/server.key"
CNF_FILE="${TARGET_DIR}/openssl.cnf"

cat > "${CNF_FILE}" << 'EOF'
[req]
default_bits        = 2048
default_md          = sha256
distinguished_name  = req_distinguished_name
x509_extensions     = v3_req
prompt              = no

[req_distinguished_name]
C   = VN
ST  = Lam Dong
L   = Da Lat
O   = HTX Nong Nghiep Tan Tien
OU  = IT & OCOP Department
CN  = localhost

[v3_req]
keyUsage            = digitalSignature, keyEncipherment
extendedKeyUsage    = serverAuth
subjectAltName      = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = htx-ocop.local
DNS.3 = *.htx.vn
IP.1  = 127.0.0.1
IP.2  = 0.0.0.0
EOF

echo ">>> Generating private key and 3-year self-signed certificate with SAN..."
openssl req -x509 -nodes -days 1095 -newkey rsa:2048 \
    -keyout "${KEY_FILE}" \
    -out "${CERT_FILE}" \
    -config "${CNF_FILE}"

chmod 600 "${KEY_FILE}"
chmod 644 "${CERT_FILE}"

echo ">>> SUCCESS! SSL certificates generated at ${TARGET_DIR}"
