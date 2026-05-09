import pg from 'pg'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const { Pool } = pg

/** @type {pg.Pool | null} */
let pool

/** Map deprecated sslmode values so pg v8 stops warning (future v9 libpq semantics). */
function normalizePgConnectionString(raw) {
  const q = raw.indexOf('?')
  const base = q === -1 ? raw : raw.slice(0, q)
  const params = new URLSearchParams(q === -1 ? '' : raw.slice(q + 1))
  const mode = (params.get('sslmode') || '').toLowerCase()
  if (mode === 'require' || mode === 'prefer' || mode === 'verify-ca') {
    params.set('sslmode', 'verify-full')
  } else if (
    !params.has('sslmode') &&
    /\.supabase\.(com|co)\b/i.test(base)
  ) {
    params.set('sslmode', 'verify-full')
  }
  const rest = params.toString()
  return rest ? `${base}?${rest}` : base
}

/** Pooler uses *.supabase.com; DB uses *.supabase.co */
function isSupabaseHostedUrl(raw) {
  return /\.supabase\.(com|co)\b/i.test(raw)
}

/** Direct DB host often fails on Vercel (ENOTFOUND); pooler :6543 is required. */
function isSupabaseDirectDbUrl(raw) {
  return /@db\.[^/]+\.supabase\.co:5432\//i.test(raw)
}

/** When relaxing TLS for local dev, drop sslmode from URI so pg honors `ssl.rejectUnauthorized`. */
function connectionStringForPool(raw, relaxTls) {
  if (!relaxTls) return raw
  const q = raw.indexOf('?')
  if (q === -1) return raw
  const base = raw.slice(0, q)
  const params = new URLSearchParams(raw.slice(q + 1))
  params.delete('sslmode')
  const rest = params.toString()
  return rest ? `${base}?${rest}` : base
}

function getPool() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) return null
  if (!pool) {
    /**
     * Node pg on serverless sometimes fails chain verify against Supabase
     * (SELF_SIGNED_CERT_IN_CHAIN) even with correct URIs. Keep TLS, skip CA verify
     * for *.supabase.{com,co} unless DATABASE_SSL_STRICT=1.
     */
    const strictSsl = process.env.DATABASE_SSL_STRICT === '1'
    const relaxTls =
      process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === '0' ||
      (isSupabaseHostedUrl(connectionString) && !strictSsl)
    let conn = normalizePgConnectionString(connectionString)
    if (isSupabaseDirectDbUrl(conn)) {
      console.warn(
        'waitlist: DATABASE_URL points at db.*.supabase.co:5432 — use the Transaction pooler URI from Supabase (port 6543, …pooler.supabase.com) in Vercel env to avoid ENOTFOUND',
      )
    }
    conn = connectionStringForPool(conn, relaxTls)
    pool = new Pool({
      connectionString: conn,
      max: 1,
      connectionTimeoutMillis: 10_000,
      idleTimeoutMillis: 10_000,
      ...(relaxTls ? { ssl: { rejectUnauthorized: false } } : {}),
    })
  }
  return pool
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

/**
 * POST { "email": "a@b.com" }
 * Env: DATABASE_URL (PostgreSQL URI, e.g. Supabase direct or pooler)
 *
 * Vercel deploys `/api/*.js` as Node functions. For non-Next projects, use the
 * Web `fetch` handler: https://vercel.com/docs/functions/functions-api-reference
 */
export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() })
    }

    if (request.method !== 'POST') {
      return Response.json(
        { error: 'Method not allowed' },
        { status: 405, headers: corsHeaders() },
      )
    }

    const db = getPool()
    if (!db) {
      console.error('waitlist: missing DATABASE_URL')
      return Response.json(
        { error: 'Server misconfigured' },
        { status: 500, headers: corsHeaders() },
      )
    }

    let body
    try {
      body = await request.json()
    } catch {
      return Response.json(
        { error: 'Invalid JSON' },
        { status: 400, headers: corsHeaders() },
      )
    }

    const raw = typeof body?.email === 'string' ? body.email.trim() : ''
    const email = raw.toLowerCase()

    if (!email || !EMAIL_RE.test(email)) {
      return Response.json(
        { error: 'Invalid email' },
        { status: 400, headers: corsHeaders() },
      )
    }

    try {
      const existing = await db.query(
        'select 1 from public.waitlist where email = $1 limit 1',
        [email],
      )
      if (existing.rowCount > 0) {
        return Response.json({ ok: true }, { headers: corsHeaders() })
      }

      try {
        await db.query(
          'insert into public.waitlist (email) values ($1)',
          [email],
        )
      } catch (insertErr) {
        if (insertErr?.code === '23505') {
          return Response.json({ ok: true }, { headers: corsHeaders() })
        }
        throw insertErr
      }

      return Response.json({ ok: true }, { headers: corsHeaders() })
    } catch (err) {
      if (err?.code === 'ENOTFOUND' || err?.errno === -3007) {
        console.error(
          'waitlist: database DNS failed — use Supabase Transaction pooler URI (:6543, pooler host) in DATABASE_URL on Vercel, not db.*.supabase.co:5432',
          err.hostname || err,
        )
      } else {
        console.error('waitlist: database', err)
      }
      return Response.json(
        { error: 'Could not save signup' },
        { status: 500, headers: corsHeaders() },
      )
    }
  },
}
