#!/usr/bin/env bash
#
# One-shot Apache setup for the Ranz portfolio.
# Makes the ranz-bontogon.com :443 vhost reverse-proxy to the Node server on
# 127.0.0.1:3001 (which serves the built client + /api + /media + admin).
#
# Safe: backs up the vhost, tests the config, and auto-restores on any error.
# Idempotent: running it again does nothing if already configured.
#
# Usage:  sudo bash /var/www/ranz-website/deploy/setup-apache.sh
#
set -euo pipefail

CONF="${1:-/etc/apache2/sites-available/ranz-bontogon.com.conf}"
NODE_URL="http://127.0.0.1:3001"

if [[ "${EUID}" -ne 0 ]]; then
  echo "!! Please run with sudo:  sudo bash $0" >&2
  exit 1
fi

if [[ ! -f "${CONF}" ]]; then
  echo "!! Vhost not found: ${CONF}" >&2
  echo "   Pass the correct path as an argument, e.g.:" >&2
  echo "   sudo bash $0 /etc/apache2/sites-available/your-vhost.conf" >&2
  exit 1
fi

echo "==> Target vhost: ${CONF}"

# 1) enable the proxy modules
echo "==> Enabling proxy modules"
a2enmod proxy proxy_http >/dev/null 2>&1 || true

# 2) already configured?
if grep -q "127.0.0.1:3001" "${CONF}"; then
  echo "==> Proxy already present in vhost — skipping edit."
else
  # 3) back up
  BACKUP="${CONF}.bak.$(date +%Y%m%d%H%M%S)"
  cp "${CONF}" "${BACKUP}"
  echo "==> Backed up to ${BACKUP}"

  # 4) insert the proxy block before the </VirtualHost> that closes the :443 vhost
  BLOCK=$(cat <<'EOF'

    # --- Ranz portfolio: reverse-proxy to the Node server (added by setup-apache.sh) ---
    ProxyPass /.well-known !
    ProxyPreserveHost On
    ProxyPass        /  http://127.0.0.1:3001/
    ProxyPassReverse /  http://127.0.0.1:3001/
EOF
)
  TMP="$(mktemp)"
  awk -v block="${BLOCK}" '
    /<VirtualHost[^>]*:443/ { in443=1 }
    (in443 && !ins && /<\/VirtualHost>/) { print block; ins=1 }
    /<\/VirtualHost>/ { in443=0 }
    { print }
    END { if (!ins) exit 3 }
  ' "${CONF}" > "${TMP}" || {
    echo "!! Could not find a <VirtualHost ...:443> block to edit in ${CONF}" >&2
    echo "   Nothing changed. Paste the file to me and I'll give an exact edit." >&2
    rm -f "${TMP}"
    exit 1
  }

  mv "${TMP}" "${CONF}"
  echo "==> Inserted reverse-proxy into the :443 vhost"

  # 5) validate; restore on failure
  if ! apache2ctl configtest; then
    echo "!! apache2ctl configtest FAILED — restoring original vhost" >&2
    cp "${BACKUP}" "${CONF}"
    exit 1
  fi
fi

# 6) make sure the Node service is up (best effort)
if systemctl list-unit-files 2>/dev/null | grep -q '^ranz.service'; then
  systemctl is-active --quiet ranz || systemctl restart ranz || true
fi

# 7) reload apache
echo "==> Reloading Apache"
apache2ctl configtest
systemctl reload apache2

# 8) verify
echo "==> Verifying..."
echo "--- Node (${NODE_URL}) ---"
curl -s -o /dev/null -w "  local node: HTTP %{http_code}\n" "${NODE_URL}/api/site" || true
echo "--- Public site ---"
if curl -s https://ranz-bontogon.com/ | grep -q 'id="root"'; then
  echo "  ✅ https://ranz-bontogon.com now serves the React app."
  echo "     Hard-refresh your browser (or use a private tab)."
else
  echo "  ⚠️  Still not seeing the app in the response. Check:"
  echo "     - systemctl status ranz"
  echo "     - curl -s https://ranz-bontogon.com/ | head"
fi
