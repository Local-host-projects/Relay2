// Real delivery layer: Termii (SMS) + Resend (email), with demo fallback.
// Set keys in a `.env` file (see `.env.example`). Without keys, calls resolve
// as simulated sends so the demo flow never breaks. In production these calls
// should go through your backend proxy — never expose API keys in the client.

const TERMII_KEY = import.meta.env.VITE_TERMII_API_KEY || ''
const TERMII_SENDER = import.meta.env.VITE_TERMII_SENDER || 'Relay'
const RESEND_KEY = import.meta.env.VITE_RESEND_API_KEY || ''
const EMAIL_FROM = import.meta.env.VITE_EMAIL_FROM || 'Relay <noreply@relay.app>'

const delay = (ms) => new Promise((r) => setTimeout(r, ms))

export const deliveryStatus = {
  sms: TERMII_KEY ? 'live' : 'demo',
  email: RESEND_KEY ? 'live' : 'demo',
}

export async function sendSms(to, message) {
  if (!TERMII_KEY) {
    console.log('[demo sms → ' + to + ']', message)
    await delay(600)
    return { ok: true, demo: true, channel: 'sms', to }
  }
  try {
    const res = await fetch('https://api.ng.termii.com/api/sms/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, from: TERMII_SENDER, sms: message, type: 'plain', channel: 'generic', api_key: TERMII_KEY }),
    })
    const data = await res.json().catch(() => ({}))
    return { ok: res.ok, demo: false, channel: 'sms', to, data }
  } catch (e) {
    return { ok: false, demo: false, channel: 'sms', to, error: String(e) }
  }
}

export async function sendEmail(to, subject, text) {
  if (!RESEND_KEY || !to) {
    console.log('[demo email → ' + (to || '—') + ']', subject, text)
    await delay(600)
    return { ok: true, demo: true, channel: 'email', to }
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + RESEND_KEY },
      body: JSON.stringify({ from: EMAIL_FROM, to: [to], subject, text }),
    })
    const data = await res.json().catch(() => ({}))
    return { ok: res.ok, demo: false, channel: 'email', to, data }
  } catch (e) {
    return { ok: false, demo: false, channel: 'email', to, error: String(e) }
  }
}

// Notify a recipient of an issued promise on both rails (SMS + email).
export async function notifyIssued({ phone, email, name, amount, issuerName, ref }) {
  const msg = 'Relay — ' + amount + ' from ' + issuerName + ' is spendable now. Ref ' + ref + '. Set your PIN at relay.app to claim.'
  const out = []
  if (phone) out.push(await sendSms(phone, msg))
  if (email) out.push(await sendEmail(email, 'You have a spendable Relay promise', 'Hello ' + (name || 'there') + ',\n\n' + msg + '\n\n— Relay'))
  return out
}
