/**
 * Verifies POST /api/waitlist inserts and the row exists in public.waitlist.
 *
 * Usage:
 *   npm run verify:waitlist
 *
 * Reads DATABASE_URL from `.env` (repo root) or the environment.
 * Supabase URLs use relaxed TLS verify in the API by default; for this script’s
 * follow-up SELECT, the same rules apply. Opt in to strict CA verify with
 * DATABASE_SSL_STRICT=1.
 */
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const envPath = join(root, '.env')

function loadDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL
  if (!existsSync(envPath)) {
    throw new Error('Set DATABASE_URL or create .env with DATABASE_URL in repo root')
  }
  const raw = readFileSync(envPath, 'utf8')
  const line = raw.split(/\r?\n/).find((l) => /^\s*DATABASE_URL=/.test(l))
  if (!line) throw new Error('DATABASE_URL not found in .env')
  return line.replace(/^\s*DATABASE_URL=/, '').trim().replace(/^["']|["']$/g, '')
}

function stripSslModeIfRelaxing(raw, relaxTls) {
  if (!relaxTls) return raw
  const q = raw.indexOf('?')
  if (q === -1) return raw
  const base = raw.slice(0, q)
  const params = new URLSearchParams(raw.slice(q + 1))
  params.delete('sslmode')
  const rest = params.toString()
  return rest ? `${base}?${rest}` : base
}

function isSupabaseHostedUrl(raw) {
  return /\.supabase\.(com|co)\b/i.test(raw)
}

async function main() {
  const databaseUrl = loadDatabaseUrl()
  process.env.DATABASE_URL = databaseUrl

  const strictSsl = process.env.DATABASE_SSL_STRICT === '1'
  const relaxTls =
    process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === '0' ||
    (isSupabaseHostedUrl(databaseUrl) && !strictSsl)
  if (relaxTls && process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === '0') {
    console.warn(
      '(TLS) DATABASE_SSL_REJECT_UNAUTHORIZED=0 — forces relax for any host',
    )
  }

  const stamp = Date.now()
  const email = `waitlist-verify-${stamp}@example.com`

  const { default: handler } = await import('../api/waitlist.js')

  const req = new Request('http://internal/api/waitlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  const res = await handler.fetch(req)
  const body = await res.json().catch(() => ({}))

  if (!res.ok) {
    console.error('API response:', res.status, body)
    process.exit(1)
  }
  if (!body.ok) {
    console.error('Expected { ok: true }, got:', body)
    process.exit(1)
  }
  console.log('API:', res.status, body)

  const connForPg = stripSslModeIfRelaxing(databaseUrl, relaxTls)
  const client = new pg.Client({
    connectionString: connForPg,
    ...(relaxTls ? { ssl: { rejectUnauthorized: false } } : {}),
  })
  await client.connect()
  try {
    const { rows } = await client.query(
      'select email, created_at from public.waitlist where email = $1',
      [email],
    )
    if (rows.length !== 1) {
      console.error('DB: expected 1 row, got', rows.length, rows)
      process.exit(1)
    }
    console.log('DB row:', rows[0])
  } finally {
    await client.end()
  }

  console.log('\nPASS — email stored in public.waitlist')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
