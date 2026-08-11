# Deploying to your server (Apache + Node)

The site is no longer static — it's a React build served by Apache with a Node
backend (for `/api`, `/media`, and the admin). A bare `git pull` + Apache
restart is **not** enough; follow the one-time setup once, then use the deploy
script for every update.

Requirements on the server: **Node.js 18+** and **npm**. Check with
`node -v`. If missing: `sudo apt install nodejs npm` (or use nvm).

---

## One-time setup (do this once)

```bash
# 1. Get the branch
cd /var/www/ranz-website
git fetch origin
git checkout claude/react-portfolio-admin-g6lmp4
git pull origin claude/react-portfolio-admin-g6lmp4

# 2. Install deps and build the client
npm run install:all
npm run build            # creates client/dist

# 3. Let the web user own the files (needed for admin photo uploads)
sudo chown -R www-data:www-data /var/www/ranz-website

# 4. Install the Node service
#    First edit deploy/ranz.service: set ADMIN_PASSWORD, JWT_SECRET, and the
#    node path (run `which node`).
sudo cp deploy/ranz.service /etc/systemd/system/ranz.service
sudo systemctl daemon-reload
sudo systemctl enable --now ranz
sudo systemctl status ranz      # should be "active (running)"

# 5. Point Apache at it
sudo a2enmod proxy proxy_http rewrite headers
#    Merge deploy/apache-ranz.conf into your ranz-bontogon.com vhost
#    (keep your existing SSL lines). Then:
sudo apache2ctl configtest
sudo systemctl restart apache2
```

Visit `https://ranz-bontogon.com` and `https://ranz-bontogon.com/admin`.

> **Admin login needs HTTPS.** The session cookie is marked `Secure`, so the
> admin only works over `https://`. Your site already has SSL, so this is fine.

---

## Every update after that

```bash
sudo bash /var/www/ranz-website/deploy/deploy.sh
```

That pulls, installs, rebuilds, restarts the Node service, and reloads Apache.

---

## Admin password

Set in `deploy/ranz.service` via `ADMIN_PASSWORD` (and a long random
`JWT_SECRET`). After changing it:

```bash
sudo cp deploy/ranz.service /etc/systemd/system/ranz.service
sudo systemctl daemon-reload && sudo systemctl restart ranz
```

---

## Troubleshooting

| Symptom | Check |
| --- | --- |
| 502 Bad Gateway | Node service down → `sudo systemctl status ranz`, `journalctl -u ranz -e` |
| Blank page / 404 on refresh | `FallbackResource /index.html` missing, or `client/dist` not built |
| Images 404 | `/media` not proxied to Node, or `server/media` missing |
| Admin login does nothing | Site must be served over HTTPS (Secure cookie) |
| Uploads fail | `server/` not writable by `www-data` → re-run the `chown` |
