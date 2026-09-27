# Relay delivery rails — real SMS + email setup

Relay notifies recipients by **SMS (Termii)** and **email (Resend)** when the
admin board approves a promise. Without keys everything still runs in demo
mode. This guide makes both rails live.

## 1. Termii (SMS)

1. Log in at **app.termii.ai** → **Settings → API token** → copy your key.
2. Request/confirm a **Sender ID** (3–11 chars, e.g. `Relay`). Messages sent
   from an unapproved sender ID will fail.
3. Fund your wallet (sandboxes often include a small test balance).
4. Create `.env` next to `package.json` (copy from `.env.example`):
   ```
   TERMII_API_KEY=paste_key_here
   TERMII_SENDER=Relay
   TERMII_CHANNEL=dnd
   ```
   - `dnd` = transactional route, delivers even to DND numbers. Use this.
   - `generic` = promotional, Nigeria 8am–8pm only.
5. Recipient numbers must be international format — the app converts
   `0803…` → `234803…` automatically.

## 2. Resend (email)

1. Sign up at **resend.com** → **API Keys** → create a key.
2. **Domains** → add + verify your sending domain (DNS records).
3. `.env`:
   ```
   RESEND_API_KEY=re_xxxx
   EMAIL_FROM=Relay <notify@yourdomain.com>
   ```
   `EMAIL_FROM` must use your verified domain.

## 3. Run it

Terminal 1: `npm run notify` → expect
`Relay notify server on :3001 — SMS LIVE … — email LIVE`
Terminal 2: `npm run dev`

Open the app → sign in as **Admin** → delivery banner shows LIVE + balance →
**Test SMS** to your own number, **Test email** to your inbox. Approvals
from the queue then notify recipients for real.

## 4. Production notes

- Deploy `server/relay-notify.js` next to the static build (same origin
  serves `/api/*`). Never put `TERMII_API_KEY` / `RESEND_API_KEY` in
  `VITE_` variables — those ship to the browser.
- `.env` is gitignored. Rotate keys from the dashboards if one leaks.
