import pg from 'pg'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const { Pool } = pg

/** @type {pg.Pool | null} */
let pool

function getPool() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) return null
  if (!pool) {
    pool = new Pool({
      connectionString,
      max: 1,
      connectionTimeoutMillis: 10_000,
      idleTimeoutMillis: 10_000,
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
      console.error('waitlist: database', err)
      return Response.json(
        { error: 'Could not save signup' },
        { status: 500, headers: corsHeaders() },
      )
    }
  },
}
