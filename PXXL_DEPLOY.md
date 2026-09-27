# Deploy Relay on Pxxl

Two services from this one repo (Pxxl **Multiple Services**):

| Alias | Type | Base dir | Build | Output / Start | Port | Route |
| ----- | ---- | -------- | ----- | -------------- | ---- | ----- |
| `web` | Static App | `/` | `npm ci` → `npm run build` | `dist` | — | Yes (main URL) |
| `api` | Web Service | `server` | `npm install` | `node relay-notify.js` | `3001` | Yes (own URL) |

`pxxl.toml` in the repo root already declares all of this — the dashboard
review step should pick it up, just confirm it.

## Steps

1. **Push** — already on GitHub (`Local-host-projects/Relay2`, branch `main`).
2. **Pxxl dashboard → Deploy → GitHub** — install the Pxxl GitHub App, select
   `Relay2`, branch `main`.
3. **Enable Multiple Services** in Build Configuration. Add both services
   with the aliases, base directories, commands and ports from the table
   above (must match `pxxl.toml` aliases `web` + `api`).
4. **Deploy the `api` service first.** Add its environment variables in the
   dashboard (never in git):
   ```
   TERMII_API_KEY=…        # Settings → API token (app.termii.ai)
   TERMII_SENDER=Relay      # approved sender ID, 3–11 chars
   TERMII_CHANNEL=dnd       # transactional, reaches DND numbers
   RESEND_API_KEY=re_…      # resend.com API key
   EMAIL_FROM=Relay <notify@yourdomain.com>   # verified Resend domain
   ```
   Wait for healthy, open its public URL + `/api/health` → `{"ok":true}`.
   Copy the public URL, e.g. `https://relay-api-xxxx.pxxl.app`.
5. **Deploy the `web` service** with one environment variable:
   ```
   VITE_NOTIFY_API=https://relay-api-xxxx.pxxl.app/api
   ```
   (Vite bakes this in at build time — redeploy `web` if the api URL changes.
   Local dev ignores it and uses the Vite proxy to `localhost:3001`.)
6. Open the web URL → sign in as **Admin** → delivery banner should read
   **live via Termii (+ balance)** → Test SMS to your own number.
7. Optional: **Domains** → attach your custom domain to `web` (managed HTTPS),
   roll back from **Deployments** if anything misbehaves.

## Notes

- The `api` service is zero-dependency Node 18+ (`server/package.json`,
  health endpoint `/api/health`, binds `0.0.0.0:$PORT` as Pxxl requires).
- Without keys both rails run in demo mode — the app never breaks, the
  banner just says so.
- Full key setup walkthrough: `NOTIFY_SETUP.md`.
