#!/usr/bin/env bash
#
# Repeatable deploy for the Ranz portfolio.
# Run from anywhere:  sudo bash /var/www/ranz-website/deploy/deploy.sh
#
# It pulls the latest code, installs deps, rebuilds the client, and restarts
# the Node service. (One-time setup — systemd unit, Apache config — is in
# DEPLOY.md and only needs to be done once.)

set -euo pipefail

REPO="/var/www/ranz-website"
BRANCH="${BRANCH:-claude/react-portfolio-admin-g6lmp4}"
SERVICE="${SERVICE:-ranz}"

echo "==> Updating $REPO ($BRANCH)"
cd "$REPO"
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull origin "$BRANCH"

echo "==> Installing dependencies (client + server)"
npm run install:all

echo "==> Building the client"
npm run build

# Optional: regenerate optimized images from originals. Not needed normally —
# server/media and server/data are committed. Uncomment to rebuild them:
# npm run precompress

echo "==> Restarting the Node service ($SERVICE)"
if systemctl list-unit-files | grep -q "^${SERVICE}.service"; then
  systemctl restart "$SERVICE"
  systemctl --no-pager --lines=5 status "$SERVICE" || true
else
  echo "!! systemd service '$SERVICE' not found — do the one-time setup in DEPLOY.md first."
fi

echo "==> Reloading Apache"
systemctl reload apache2 || systemctl restart apache2

echo "==> Done. Check https://ranz-bontogon.com and /admin"
