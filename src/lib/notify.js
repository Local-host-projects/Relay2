// Delivery layer: talks to the Relay notify server (server/relay-notify.js),
// which holds your Termii + Resend secrets. Falls back to direct API calls
// if VITE_ keys are set, else simulates so the demo never breaks.
//
// Dev: run `node server/relay-notify.js`, Vite proxies /api/* to it.
// Prod: deploy the server alongside the static build (same origin /api).

const API = (import.meta.env.VITE_NOTIFY_API || '/api').replace(/\/$/, '')

const delay = (ms) => new Promise((r) => setTimeout(r, ms))

export function toIntl(phone) {
  let d = String(phone || '').replace(/\D/g, '')
  if (d.startsWith('0')) d = '234' + d.slice(1)
  return d
}

async function post(path, body) {
  const res = await fetch(API + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return res.json()
}

async function directSms(to, message) {
  const key = import.meta.env.VITE_TERMII_API_KEY || ''
  if (!key) return null
  try {
    const res = await fetch('https://api.ng.termii.com/api/sms/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: key,
        to: toIntl(to),
        from: import.meta.env.VITE_TERMII_SENDER || 'Relay',
        sms: message,
        type: 'plain',
        channel: import.meta.env.VITE_TERMII_CHANNEL || 'dnd',
      }),
    })
    const data = await res.json().catch(() => ({}))
    return { ok: res.ok, demo: false, channel: 'sms', to, data }
  } catch (e) {
    return { ok: false, demo: false, channel: 'sms', to, error: String(e) }
  }
}

export async function fetchStatus() {
  try {
    const res = await fetch(API + '/notify/status')
    if (!res.ok) throw new Error('no proxy')
    return await res.json()
  } catch {
    return {
      ok: true,
      demo: true,
      sms: import.meta.env.VITE_TERMII_API_KEY ? 'live-direct' : 'demo',
      email: import.meta.env.VITE_RESEND_API_KEY ? 'live-direct' : 'demo',
      balance: null,
    }
  }
}

export async function sendSms(to, message) {
  try {
    return await post('/notify/sms', { to, message })
  } catch {
    const direct = await directSms(to, message)
    if (direct) return direct
    console.log('[demo sms → ' + to + ']', message)
    await delay(600)
    return { ok: true, demo: true, channel: 'sms', to }
  }
}

export async function sendEmail(to, subject, text) {
  try {
    return await post('/notify/email', { to, subject, text })
  } catch {
    console.log('[demo email → ' + (to || '—') + ']', subject)
    await delay(600)
    return { ok: true, demo: true, channel: 'email', to }
  }
}

// Notify a recipient of an issued promise on both rails (SMS + email).
export async function notifyIssued({ phone, email, name, amount, issuerName, ref }) {
  try {
    const data = await post('/notify/issued', { phone, email, name, amount, issuerName, ref })
    if (data && data.results) return data.results
    return []
  } catch {
    const out = []
    if (phone) out.push(await sendSms(phone, 'Relay — ' + amount + ' from ' + issuerName + ' is spendable now. Ref ' + ref + '.'))
    if (email) out.push(await sendEmail(email, 'You have a spendable Relay promise', 'Hello ' + (name || 'there')))
    return out
  }
}
