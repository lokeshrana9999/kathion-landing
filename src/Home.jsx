import { useState, useEffect, useRef, useCallback } from 'react'
import { useTweaks } from './useTweaks'
import { DevTweaksPanel } from './DevTweaksPanel'

const BRAND_LOGO_SRC = '/Web_Photo_Editor.png'

/* ---------- Icons ---------- */
function Icon({ d, size = 18, sw = 1.5, children, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {d ? <path d={d} /> : children}
    </svg>
  )
}
function IconArrowR(p) {
  return <Icon {...p} d="M5 12h14M13 5l7 7-7 7" />
}
function IconCheck(p) {
  return <Icon {...p} d="M4 12l5 5 11-11" />
}
function IconMail(p) {
  return (
    <Icon {...p}>
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <path d="m3 7 9 6 9-6" />
    </Icon>
  )
}

const LIST_KEY = 'kathion.waitlist'

/* ---------- Nav ---------- */
function Nav() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <nav className={'nav' + (scrolled ? ' scrolled' : '')}>
      <a className="nav-mark" href="/" aria-label="Kathion home">
        <img
          src={BRAND_LOGO_SRC}
          alt=""
          className="brand-logo brand-logo--nav"
          width={905}
          height={398}
          decoding="async"
        />
      </a>
      <span className="nav-status">
        <span className="dot" />
        <span>Private alpha · invitation only</span>
      </span>
    </nav>
  )
}

/* ---------- Story tree (hero canvas) ---------- */
function StoryTree() {
  const W = 600
  const H = 580
  const root = { id: 'root', x: 0.12, y: 0.5, label: 'ORIGIN' }
  const tier1 = [
    { id: 'a', x: 0.36, y: 0.18, label: 'BARGAIN' },
    { id: 'b', x: 0.36, y: 0.5, label: 'OATH' },
    { id: 'c', x: 0.36, y: 0.82, label: 'BETRAYAL' },
  ]
  const tier2 = [
    { id: 'a1', x: 0.62, y: 0.08, label: 'EXILE' },
    { id: 'a2', x: 0.62, y: 0.28, label: 'ASCENT' },
    { id: 'b1', x: 0.62, y: 0.46, label: 'DUTY' },
    { id: 'b2', x: 0.62, y: 0.62, label: 'WITNESS' },
    { id: 'c1', x: 0.62, y: 0.78, label: 'FLIGHT' },
    { id: 'c2', x: 0.62, y: 0.94, label: 'RUIN' },
  ]
  const tier3 = [
    { id: 'x1', x: 0.88, y: 0.18, label: 'CROWN' },
    { id: 'x2', x: 0.88, y: 0.42, label: 'VOW' },
    { id: 'x3', x: 0.88, y: 0.62, label: 'EXILE-II' },
    { id: 'x4', x: 0.88, y: 0.86, label: 'DUST' },
  ]
  const links = [
    ['root', 'a'],
    ['root', 'b'],
    ['root', 'c'],
    ['a', 'a1'],
    ['a', 'a2'],
    ['b', 'b1'],
    ['b', 'b2'],
    ['c', 'c1'],
    ['c', 'c2'],
    ['a1', 'x1'],
    ['a2', 'x1'],
    ['b1', 'x2'],
    ['b2', 'x3'],
    ['c1', 'x3'],
    ['c2', 'x4'],
  ]
  const all = {
    root,
    ...Object.fromEntries([...tier1, ...tier2, ...tier3].map((n) => [n.id, n])),
  }

  const activePaths = [
    ['root', 'b', 'b1', 'x2'],
    ['root', 'a', 'a2', 'x1'],
    ['root', 'c', 'c2', 'x4'],
    ['root', 'b', 'b2', 'x3'],
  ]
  const [activeIdx, setActiveIdx] = useState(0)
  const pathCycle = activePaths.length
  useEffect(() => {
    const id = setInterval(
      () => setActiveIdx((i) => (i + 1) % pathCycle),
      4200,
    )
    return () => clearInterval(id)
  }, [pathCycle])
  const activeSet = new Set(activePaths[activeIdx])
  const activeLinks = new Set()
  const pathIds = activePaths[activeIdx]
  for (let i = 0; i < pathIds.length - 1; i++) {
    activeLinks.add(pathIds[i] + '-' + pathIds[i + 1])
  }

  const px = (n) => n.x * W
  const py = (n) => n.y * H
  const path = (a, b) => {
    const ax = px(a)
    const ay = py(a)
    const bx = px(b)
    const by = py(b)
    return `M${ax},${ay} C${ax + (bx - ax) * 0.5},${ay} ${ax + (bx - ax) * 0.5},${by} ${bx},${by}`
  }

  return (
    <svg
      className="story-tree"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <g opacity="0.18" stroke="var(--canopy-line-2)" fill="none">
        <circle cx={px(root)} cy={py(root)} r="100" />
        <circle cx={px(root)} cy={py(root)} r="220" />
        <circle cx={px(root)} cy={py(root)} r="340" />
      </g>
      {links.map(([from, to], i) => {
        const k = from + '-' + to
        const active = activeLinks.has(k)
        return (
          <path
            key={k}
            d={path(all[from], all[to])}
            className={'tree-line draw-in' + (active ? ' active' : '')}
            style={{ animationDelay: `${i * 80}ms` }}
          />
        )
      })}
      {Object.values(all).map((n, i) => {
        const isRoot = n.id === 'root'
        const active = activeSet.has(n.id)
        return (
          <g
            key={n.id}
            className={'tree-node fade-in' + (active ? ' active' : '')}
            style={{ animationDelay: `${600 + i * 60}ms` }}
            transform={`translate(${px(n)}, ${py(n)})`}
          >
            {isRoot ? (
              <circle
                className="tree-node-circle"
                r="11"
                fill="var(--canopy-2)"
                stroke="var(--spark)"
                strokeWidth="1"
              />
            ) : null}
            <circle
              className="tree-node-circle"
              r={isRoot ? 4 : 3}
              fill={isRoot ? 'var(--spark)' : 'var(--canopy-mute)'}
            />
            <text
              className="tree-node-label"
              x={isRoot ? -14 : 8}
              y="3"
              textAnchor={isRoot ? 'end' : 'start'}
            >
              {n.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function MailingList() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState('idle')
  const [error, setError] = useState('')

  const submit = (e) => {
    e?.preventDefault?.()
    if (state === 'submitting' || state === 'done') return
    const trimmed = email.trim()
    if (!trimmed.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Enter a valid email.')
      setState('error')
      return
    }
    setError('')
    setState('submitting')
    setTimeout(() => {
      try {
        const list = JSON.parse(localStorage.getItem(LIST_KEY) || '[]')
        if (!list.includes(trimmed)) list.push(trimmed)
        localStorage.setItem(LIST_KEY, JSON.stringify(list))
      } catch {
        /* ignore */
      }
      setState('done')
    }, 700)
  }

  if (state === 'done') {
    return (
      <div className="ml-done">
        <div className="ml-done-icon">
          <IconCheck size={16} sw={2} />
        </div>
        <div>
          <div className="ml-done-title">You&apos;re on the list.</div>
          <div className="ml-done-sub">
            We&apos;ll send a key when the doors open. No spam, no noise — only
            the codex.
          </div>
        </div>
      </div>
    )
  }

  return (
    <form className="ml" onSubmit={submit}>
      <div className={'ml-input' + (state === 'error' ? ' err' : '')}>
        <IconMail size={15} />
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (state === 'error') setState('idle')
          }}
          placeholder="your.name@somewhere"
          autoComplete="email"
          disabled={state === 'submitting'}
        />
        <button
          className="btn btn-spark"
          type="submit"
          disabled={state === 'submitting'}
        >
          {state === 'submitting' ? (
            'Adding…'
          ) : (
            <>
              Get a key <IconArrowR size={14} />
            </>
          )}
        </button>
      </div>
      <div className="ml-foot">
        {state === 'error' ? (
          <span className="ml-err">{error}</span>
        ) : (
          <span>1,247 already waiting. We open in cohorts of 100.</span>
        )}
      </div>
    </form>
  )
}

function Hero() {
  return (
    <section className="hero">
      <div className="hero-grid" />
      <div className="hero-vignette" />
      <div className="wrap hero-inner">
        <div className="hero-copy">
          <div className="hero-tag">
            <span className="pulse" />
            <span>Coming soon · private alpha</span>
          </div>

          <h1 className="hero-title">
            Worlds you <span className="em">write</span>.
            <br />
            Stories you <span className="em-eon">play</span>.
          </h1>

          <p className="hero-sub">
            Kathion is a narrative engine for impossible scenarios. Sketch a
            world, set its laws, and let the story respond — to your choices,
            your players, your ruin.
          </p>

          <MailingList />

          <p className="hero-try">
            Try a live scene below — real narration, generated for you in this
            browser.
          </p>
        </div>

        <div className="hero-canvas">
          <span className="hero-canvas-corner tl" />
          <span className="hero-canvas-corner tr" />
          <span className="hero-canvas-corner bl" />
          <span className="hero-canvas-corner br" />
          <div className="hero-canvas-frame" />
          <div className="hero-canvas-overlay">
            <span className="dot" />
            <span>BRANCH MAP · ETIWAA / ACT II</span>
          </div>
          <div className="hero-canvas-coords">N 47.2° · W 12.8° · DEPTH 4</div>
          <StoryTree />
        </div>
      </div>
    </section>
  )
}

const SCENE_SEED = {
  world: 'The Last Lighthouse on Etiwaa',
  scene: 1,
  setting:
    "A coast that grieves its drowned. The lighthouse keeper's cottage, predawn.",
  laws: [
    'The dead remember warmth.',
    'Names spoken aloud are seen by the sea.',
    'No door east of the staircase opens twice the same way.',
  ],
  narrator:
    'The keeper hands you a brass key still warm from her palm and does not let go of your wrist. "Don\'t open the eastern door," she says. "And whatever you hear behind it — don\'t let it hear you back." Outside, the foghorn coughs once. The light has gone out.',
  choices: [
    'Pocket the key. Ask what\'s behind the door.',
    'Hand the key back. Tell her you won\'t keep her secrets.',
    'Climb to the lamp room and check the light first.',
  ],
}

const FALLBACK_BRANCHES = [
  {
    narration:
      'The key hums faintly between your fingers, the way a struck bell hums after the strike has stopped. The keeper has gone very still. Somewhere upstairs a floorboard sighs, though no-one is up there. The fog has begun to come in through the keyhole of the eastern door — slow, deliberate, uninvited.',
    choices: [
      'Ask the keeper whose key this was.',
      'Climb toward the sound on the floorboards.',
      'Press your ear against the eastern door.',
    ],
  },
  {
    narration:
      'She lets you go. Her hand falls open like an unlatched gate. "Then take the lamp," she says, and lights it for you with a match that flares too long, too steady. The flame leans east when it shouldn\'t. Outside, the sea has begun to refuse the shore — pulling back, holding its breath.',
    choices: [
      'Walk out toward the receding tide.',
      'Climb to the lamp room with the borrowed flame.',
      'Sit down across from her and ask her to begin at the beginning.',
    ],
  },
  {
    narration:
      "The lamp room is colder than the night. The great lens stands dark and patient, and your reflection, when you find it, is wearing your father's coat — though your father has been twenty years drowned. You hear, very softly, the sound of the eastern door opening downstairs.",
    choices: [
      'Speak your father\'s name aloud.',
      'Light the lamp by hand.',
      'Go back down — quickly, quietly.',
    ],
  },
]

function DemoTypewriter({ text, onTypingChange }) {
  const [displayed, setDisplayed] = useState('')
  const [cursorOn, setCursorOn] = useState(true)

  useEffect(() => {
    onTypingChange(true)
    let i = 0
    const id = window.setInterval(() => {
      i += 2
      const slice = text.slice(0, i)
      setDisplayed(slice)
      if (i >= text.length) {
        window.clearInterval(id)
        setCursorOn(false)
        onTypingChange(false)
      }
    }, 18)
    return () => window.clearInterval(id)
  }, [text, onTypingChange])

  return (
    <span className={cursorOn ? 'typing' : ''}>{displayed}</span>
  )
}

async function tryClaudeNarration(prompt) {
  const claude = typeof globalThis !== 'undefined' ? globalThis.claude : null
  if (!claude?.complete) return null
  try {
    const raw = await claude.complete(prompt)
    const m = String(raw).match(/\{[\s\S]*\}/)
    if (!m) return null
    const parsed = JSON.parse(m[0])
    if (
      parsed.narration &&
      Array.isArray(parsed.choices) &&
      parsed.choices.length >= 3
    ) {
      return {
        narration: parsed.narration,
        choices: parsed.choices.slice(0, 3),
      }
    }
  } catch {
    return null
  }
  return null
}

function StoryDemo() {
  const [scene, setScene] = useState(SCENE_SEED)
  const [typing, setTyping] = useState(true)
  const [busy, setBusy] = useState(false)
  const [custom, setCustom] = useState('')
  const [history, setHistory] = useState([])
  const stageRef = useRef(null)
  const setTypingStable = useCallback((v) => {
    setTyping(v)
  }, [])

  const advance = useCallback(
    async (choice) => {
      if (busy) return
      setBusy(true)
      const nextHistory = [...history, { choice, narration: scene.narrator }]
      let narration = null
      let choices = null
      try {
        const prompt = `You are the narrator of an interactive story called "${scene.world}".
The story enforces these laws of the world:
${scene.laws.map((l) => '- ' + l).join('\n')}

Story so far (most recent last):
${nextHistory.map((h, i) => `[Scene ${i + 1}] ${h.narration}\n> Player: ${h.choice}`).join('\n\n')}

Write the NEXT short paragraph of narration (3-5 sentences, second person, present tense, atmospheric, avoid resolution).
Then propose exactly THREE distinct player actions, each one short imperative sentence (under 14 words).

Respond as JSON only:
{"narration": "...", "choices": ["...", "...", "..."]}`
        const parsed = await tryClaudeNarration(prompt)
        if (parsed) {
          narration = parsed.narration
          choices = parsed.choices
        }
      } catch {
        /* fall through */
      }

      if (!narration) {
        const fb = FALLBACK_BRANCHES[scene.scene % FALLBACK_BRANCHES.length]
        narration = fb.narration
        choices = fb.choices
      }

      setHistory(nextHistory)
      setScene((s) => ({
        ...s,
        scene: s.scene + 1,
        narrator: narration,
        choices,
      }))
      setBusy(false)
      setCustom('')
    },
    [busy, history, scene],
  )

  const reset = () => {
    setScene(SCENE_SEED)
    setHistory([])
    setCustom('')
  }

  return (
    <section className="section-demo">
      <div className="wrap">
        <div className="section-head" style={{ marginBottom: 36 }}>
          <div>
            <div className="eyebrow spark">A live scene</div>
            <h2 style={{ color: 'var(--canopy-text)' }}>
              The engine{' '}
              <span
                className="em"
                style={{ fontStyle: 'italic', color: 'var(--spark)' }}
              >
                responds
              </span>
              .
              <br />
              You answer it back.
            </h2>
          </div>
          <div className="right">
            <p style={{ color: 'var(--canopy-mute)' }}>
              This is real narration, generated live for this scene. Pick a
              choice, type your own action, or restart the scene.
            </p>
          </div>
        </div>

        <div className="demo-frame" ref={stageRef}>
          <aside className="demo-aside">
            <div style={{ marginBottom: 20 }}>
              <div
                className="eyebrow ink"
                style={{ color: 'var(--canopy-faint)', marginBottom: 10 }}
              >
                WORLD
              </div>
              <h4>{scene.world}</h4>
              <div className="subline">A maritime gothic, Act I.</div>
            </div>

            <div className="codex-row">
              <span className="key">Setting</span>
              <span className="val">{scene.setting}</span>
            </div>
            <div className="codex-row">
              <span className="key">Laws</span>
              <span className="val">
                {scene.laws.map((l, i) => (
                  <div
                    key={i}
                    style={{ display: 'flex', gap: 8, marginBottom: 4 }}
                  >
                    <span
                      style={{
                        color: 'var(--spark)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        marginTop: 2,
                      }}
                    >
                      L{i + 1}
                    </span>
                    <span className="serif-italic" style={{ fontSize: 12.5 }}>
                      {l}
                    </span>
                  </div>
                ))}
              </span>
            </div>
            <div className="codex-row">
              <span className="key">Scene</span>
              <span
                className="val"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  color: 'var(--spark)',
                }}
              >
                {String(scene.scene).padStart(2, '0')} / ∞
              </span>
            </div>
            <div className="codex-row">
              <span className="key">Branches</span>
              <span
                className="val"
                style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}
              >
                {Math.pow(3, history.length)}
              </span>
            </div>

            <button
              type="button"
              className="btn btn-ghost-light btn-sm"
              style={{ marginTop: 18, width: '100%', justifyContent: 'center' }}
              onClick={reset}
            >
              Restart scene
            </button>
          </aside>

          <div className="demo-stage">
            <div className="demo-scene-bar">
              <span>
                <span className="scene-num">
                  SCENE {String(scene.scene).padStart(2, '0')}
                </span>{' '}
                · the keeper&apos;s cottage
              </span>
              <span>
                {busy ? 'ENGINE ▸ writing' : 'ENGINE ▸ awaiting choice'}
              </span>
            </div>

            <p className="demo-narration">
              <DemoTypewriter
                key={`${scene.scene}-${history.length}`}
                text={scene.narrator}
                onTypingChange={setTypingStable}
              />
            </p>

            <div className="demo-tail">
              <div className="demo-tail-label">Your move</div>
              <div className="choices">
                {scene.choices.map((c, i) => (
                  <button
                    type="button"
                    className="choice"
                    key={i}
                    onClick={() => advance(c)}
                    disabled={busy || typing}
                  >
                    <span className="key">{String.fromCharCode(65 + i)}</span>
                    <span>{c}</span>
                  </button>
                ))}
              </div>
              <div className="custom-input">
                <input
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && custom.trim()) advance(custom.trim())
                  }}
                  placeholder={
                    busy ? 'the engine is writing…' : 'or describe what you do…'
                  }
                  disabled={busy || typing}
                />
                <button
                  type="button"
                  onClick={() => custom.trim() && advance(custom.trim())}
                  disabled={busy || typing || !custom.trim()}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="foot-mini">
      <div className="wrap foot-mini-row">
        <span className="foot-mark">
          <img
            src={BRAND_LOGO_SRC}
            alt=""
            className="brand-logo brand-logo--foot"
            width={905}
            height={398}
            decoding="async"
            aria-hidden
          />
        </span>
        <span className="foot-tag">A library of unwritten worlds.</span>
        <span className="foot-meta">© 2026 · v 0.7.4 · CODEX BUILD</span>
      </div>
    </footer>
  )
}

const TWEAK_DEFAULTS = {
  theme: 'observatory',
  accent: '#c0704f',
}

function applyTweaks(t) {
  const root = document.documentElement
  root.style.setProperty('--spark', t.accent || '#c0704f')
  if (t.theme === 'codex') {
    root.style.setProperty('--canopy', '#14110b')
    root.style.setProperty('--canopy-2', '#1c1810')
    root.style.setProperty('--canopy-3', '#272015')
  } else if (t.theme === 'holograph') {
    root.style.setProperty('--canopy', '#0c1517')
    root.style.setProperty('--canopy-2', '#13202a')
    root.style.setProperty('--canopy-3', '#1b2c39')
  } else {
    root.style.setProperty('--canopy', '#131f1a')
    root.style.setProperty('--canopy-2', '#1a2a23')
    root.style.setProperty('--canopy-3', '#213731')
  }
}

export default function Home() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS)
  useEffect(() => {
    applyTweaks(t)
  }, [t])

  return (
    <>
      <Nav />
      <Hero />
      <StoryDemo />
      <Footer />
      <DevTweaksPanel tweaks={t} setTweak={setTweak} />
    </>
  )
}
