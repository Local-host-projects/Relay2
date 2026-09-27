// Relay notify server — keeps TERMII / RESEND secrets off the client and
// avoids browser CORS blocks. Zero dependencies, Node 18+.
//
// Setup:
//   1. Copy ../.env.example to ../.env and fill in your keys.
//   2. Run:  node server/relay-notify.js   (or `npm run notify`)
//   3. The Vite dev server proxies /api/* here (see vite.config.js).
//
// Endpoints (JSON):
//   GET  /api/notify/status             -> { sms, email, balance }
//   GET  /api/notify/balance            -> Termii wallet balance
//   POST /api/notify/sms    {to, message}
//   POST /api/notify/email  {to, subject, text}
//   POST /api/notify/issued {phone, email, name, amount, issuerName, ref}

const http = require('http')
const fs = require('fs')
const path = require('path')

const PORT = process.env.PORT || process.env.NOTIFY_PORT || 3001
const HOST = '0.0.0.0' // Pxxl health-checks require binding 0.0.0.0, not localhost
const TERMII_BASE = 'https://api.ng.termii.com'

// --- minimal .env loader (root .env) ---
function loadEnv() {
  const env = {}
  try {
    const raw = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8')
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
      if (!m || line.trim().startsWith('#')) continue
      let v = m[2].trim()
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
      env[m[1]] = v
    }
  } catch {}
  return env
}
const ENV = { ...loadEnv(), ...process.env }

const TERMII_KEY = ENV.TERMII_API_KEY || ''
const TERMII_SENDER = ENV.TERMII_SENDER || 'Relay'
const TERMII_CHANNEL = ENV.TERMII_CHANNEL || 'dnd' // dnd = transactional (DND-safe), generic = promo (8am–8pm only in NG)
const RESEND_KEY = ENV.RESEND_API_KEY || ''
const EMAIL_FROM = ENV.EMAIL_FROM || 'Relay <noreply@relay.app>'

function toIntl(phone) {
  let d = String(phone || '').replace(/\D/g, '')
  if (d.startsWith('0')) d = '234' + d.slice(1)
  return d
}

async function termiiSend(to, sms) {
  const res = await fetch(TERMII_BASE + '/api/sms/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: TERMII_KEY, to: toIntl(to), from: TERMII_SENDER, sms, type: 'plain', channel: TERMII_CHANNEL }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || ('Termii HTTP ' + res.status))
  return data // { message_id, message, balance, user }
}

async function termiiBalance() {
  const res = await fetch(TERMII_BASE + '/api/get-balance?api_key=' + encodeURIComponent(TERMII_KEY))
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || ('Termii HTTP ' + res.status))
  return data
}

async function resendEmail(to, subject, text) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + RESEND_KEY },
    body: JSON.stringify({ from: EMAIL_FROM, to: [to], subject, text }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || data.error || ('Resend HTTP ' + res.status))
  return data
}

function json(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
  res.end(JSON.stringify(obj))
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' })
    return res.end()
  }
  const url = new URL(req.url, 'http://x')
  let body = {}
  if (req.method === 'POST') {
    try {
      body = JSON.parse(await new Promise((resolve, reject) => {
        let s = ''
        req.on('data', (c) => (s += c))
        req.on('end', () => resolve(s || '{}'))
        req.on('error', reject)
      }))
    } catch {
      return json(res, 400, { ok: false, error: 'Invalid JSON' })
    }
  }

  try {
    if ((url.pathname === '/' || url.pathname === '/api/health') && req.method === 'GET') {
      return json(res, 200, { ok: true, service: 'relay-notify' })
    }
    if (url.pathname === '/api/notify/status' && req.method === 'GET') {
      let balance = null
      if (TERMII_KEY) {
        try {
          balance = await termiiBalance()
        } catch (e) {
          balance = { error: String(e.message || e) }
        }
      }
      return json(res, 200, { ok: true, sms: TERMII_KEY ? 'live' : 'demo', email: RESEND_KEY ? 'live' : 'demo', sender: TERMII_SENDER, channel: TERMII_CHANNEL, balance })
    }
    if (url.pathname === '/api/notify/balance' && req.method === 'GET') {
      if (!TERMII_KEY) return json(res, 200, { ok: true, demo: true })
      return json(res, 200, { ok: true, ...(await termiiBalance()) })
    }
    if (url.pathname === '/api/notify/sms' && req.method === 'POST') {
      if (!TERMII_KEY) return json(res, 200, { ok: true, demo: true, to: body.to })
      if (!body.to || !body.message) return json(res, 400, { ok: false, error: 'to + message required' })
      return json(res, 200, { ok: true, demo: false, ...(await termiiSend(body.to, body.message)) })
    }
    if (url.pathname === '/api/notify/email' && req.method === 'POST') {
      if (!RESEND_KEY) return json(res, 200, { ok: true, demo: true, to: body.to })
      if (!body.to || !body.subject) return json(res, 400, { ok: false, error: 'to + subject required' })
      return json(res, 200, { ok: true, demo: false, ...(await resendEmail(body.to, body.subject, body.text || '')) })
    }
    if (url.pathname === '/api/notify/issued' && req.method === 'POST') {
      const { phone, email, name, amount, issuerName, ref } = body
      const msg = 'Relay — ' + amount + ' from ' + issuerName + ' is spendable now. Ref ' + ref + '. Set your PIN at relay.app to claim.'
      const out = []
      if (phone) out.push(TERMII_KEY ? { channel: 'sms', ...(await termiiSend(phone, msg)) } : { channel: 'sms', demo: true, to: phone })
      if (email) {
        const text = 'Hello ' + (name || 'there') + ',\n\n' + msg + '\n\n— Relay'
        out.push(RESEND_KEY ? { channel: 'email', ...(await resendEmail(email, 'You have a spendable Relay promise', text)) } : { channel: 'email', demo: true, to: email })
      }
      return json(res, 200, { ok: true, results: out })
    }
    return json(res, 404, { ok: false, error: 'Not found' })
  } catch (e) {
    return json(res, 502, { ok: false, error: String(e.message || e) })
  }
})

server.listen(PORT, HOST, () => {
  console.log('Relay notify server on ' + HOST + ':' + PORT + ' — SMS ' + (TERMII_KEY ? 'LIVE (sender ' + TERMII_SENDER + ', ' + TERMII_CHANNEL + ')' : 'demo (no TERMII_API_KEY)') + ' — email ' + (RESEND_KEY ? 'LIVE' : 'demo (no RESEND_API_KEY)'))
})
