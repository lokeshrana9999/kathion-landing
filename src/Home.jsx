import {
  useState,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react'
import { Link } from 'react-router-dom'

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

const WAITLIST_URL =
  import.meta.env.VITE_WAITLIST_URL || '/api/waitlist'
/** Opaque token: identifies this browser as already signed up (not the email). */
const WAITLIST_STORAGE_KEY = 'kathion_waitlist_token'

function getWaitlistToken() {
  try {
    return localStorage.getItem(WAITLIST_STORAGE_KEY)
  } catch {
    return null
  }
}

function setWaitlistToken() {
  const token =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`
  try {
    localStorage.setItem(WAITLIST_STORAGE_KEY, token)
  } catch {
    /* private mode / blocked */
  }
  return token
}

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
      <div className="nav-left">
        <Link className="nav-mark" to="/" aria-label="Kathion home">
          <img
            src={BRAND_LOGO_SRC}
            alt=""
            className="brand-logo brand-logo--nav"
            width={905}
            height={398}
            decoding="async"
          />
        </Link>
        <div className="nav-links" aria-label="Site pages">
          <Link className="nav-link" to="/about">
            About
          </Link>
          <Link className="nav-link" to="/terms">
            Terms
          </Link>
        </div>
      </div>
      <span className="nav-status">
        <span className="dot" />
        <span>Private alpha · invitation only</span>
      </span>
    </nav>
  )
}

/* ---------- Story tree (hero canvas) ---------- */
const STORY_TREE_ACTIVE_PATHS = [
  ['root', 'b', 'b1', 'x2'],
  ['root', 'a', 'a2', 'x1'],
  ['root', 'c', 'c2', 'x4'],
  ['root', 'b', 'b2', 'x3'],
]

/** Keep in sync with .tree-highlight--draw / --recede in home-landing.css */
const STORY_TREE_DRAW_MS = 1150
const STORY_TREE_RECEDE_MS = 900

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

  const [activeIdx, setActiveIdx] = useState(0)
  const pathCycle = STORY_TREE_ACTIVE_PATHS.length
  /** boot → idle (timer runs); receding → drawing → idle */
  const [phase, setPhase] = useState('boot')
  const [transitionFrom, setTransitionFrom] = useState(0)
  const [metricLen, setMetricLen] = useState(0)
  const [animPathNodes, setAnimPathNodes] = useState(() => new Set())

  const prevCommittedRef = useRef(0)
  const activeIdxRef = useRef(activeIdx)
  const phaseRef = useRef(phase)

  useEffect(() => {
    activeIdxRef.current = activeIdx
    phaseRef.current = phase
  }, [activeIdx, phase])

  useEffect(() => {
    if (phase !== 'idle') return
    const id = setInterval(
      () => setActiveIdx((i) => (i + 1) % pathCycle),
      4200,
    )
    return () => clearInterval(id)
  }, [phase, pathCycle])

  useEffect(() => {
    if (phase !== 'idle') return
    if (activeIdx === prevCommittedRef.current) return
    setTransitionFrom(prevCommittedRef.current)
    setPhase('receding')
  }, [activeIdx, phase])

  const pathNodeSet =
    phase === 'idle'
      ? new Set(STORY_TREE_ACTIVE_PATHS[activeIdx])
      : animPathNodes

  const px = (n) => n.x * W
  const py = (n) => n.y * H

  const path = (a, b) => {
    const ax = px(a)
    const ay = py(a)
    const bx = px(b)
    const by = py(b)
    return `M${ax},${ay} C${ax + (bx - ax) * 0.5},${ay} ${ax + (bx - ax) * 0.5},${by} ${bx},${by}`
  }

  const segmentCurve = (na, nb) => {
    const ax = px(na)
    const ay = py(na)
    const bx = px(nb)
    const by = py(nb)
    return {
      move: `M${ax},${ay}`,
      curve: `C${ax + (bx - ax) * 0.5},${ay} ${ax + (bx - ax) * 0.5},${by} ${bx},${by}`,
    }
  }

  const buildRouteD = (routeIdx) => {
    const ids = STORY_TREE_ACTIVE_PATHS[routeIdx]
    let d = ''
    for (let i = 0; i < ids.length - 1; i++) {
      const { move, curve } = segmentCurve(all[ids[i]], all[ids[i + 1]])
      d += (i === 0 ? `${move} ${curve}` : ` ${curve}`)
    }
    return d
  }

  const routeLenByIdxRef = useRef(null)

  useLayoutEffect(() => {
    if (routeLenByIdxRef.current) return
    const svgNS = 'http://www.w3.org/2000/svg'
    const pathEl = document.createElementNS(svgNS, 'path')
    const a = all
    const segD = (na, nb) => {
      const ax = px(na)
      const ay = py(na)
      const bx = px(nb)
      const by = py(nb)
      return `M${ax},${ay} C${ax + (bx - ax) * 0.5},${ay} ${ax + (bx - ax) * 0.5},${by} ${bx},${by}`
    }
    const out = {}
    for (let r = 0; r < STORY_TREE_ACTIVE_PATHS.length; r++) {
      const ids = STORY_TREE_ACTIVE_PATHS[r]
      const cum = [0]
      let t = 0
      for (let i = 0; i < ids.length - 1; i++) {
        pathEl.setAttribute('d', segD(a[ids[i]], a[ids[i + 1]]))
        t += pathEl.getTotalLength()
        cum.push(t)
      }
      out[r] = { cum, total: t }
    }
    routeLenByIdxRef.current = out
    // Graph layout is fixed; measure once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (phase !== 'drawing' && phase !== 'boot') return
    const routeIdx = phase === 'boot' ? 0 : activeIdx
    const metrics = routeLenByIdxRef.current?.[routeIdx]
    if (!metrics?.total) return
    const { cum, total } = metrics
    const ids = STORY_TREE_ACTIVE_PATHS[routeIdx]
    setAnimPathNodes(new Set())
    const timers = ids.map((id, i) => {
      const along = total > 0 ? Math.min(1, cum[i] / total) : 0
      const tNorm =
        along <= 0 ? 0 : 1 - Math.cbrt(Math.max(0, 1 - along))
      return window.setTimeout(() => {
        setAnimPathNodes((prev) => new Set(prev).add(id))
      }, STORY_TREE_DRAW_MS * tNorm)
    })
    return () => timers.forEach(clearTimeout)
  }, [phase, activeIdx])

  useEffect(() => {
    if (phase !== 'receding') return
    const metrics = routeLenByIdxRef.current?.[transitionFrom]
    if (!metrics?.total) return
    const { cum, total } = metrics
    const ids = STORY_TREE_ACTIVE_PATHS[transitionFrom]
    setAnimPathNodes(new Set(ids))
    const timers = ids.map((id, i) => {
      const along = total > 0 ? Math.min(1, cum[i] / total) : 0
      const tNorm = along >= 1 ? 0 : Math.cbrt(Math.max(0, 1 - along))
      return window.setTimeout(() => {
        setAnimPathNodes((prev) => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      }, STORY_TREE_RECEDE_MS * tNorm)
    })
    return () => timers.forEach(clearTimeout)
  }, [phase, transitionFrom])

  // eslint-disable-next-line react-hooks/exhaustive-deps -- buildRouteD from fixed graph layout
  const idleRouteD = useMemo(() => buildRouteD(activeIdx), [activeIdx])

  const animatedPathRef = useRef(null)

  useLayoutEffect(() => {
    if (phase !== 'boot' && phase !== 'receding' && phase !== 'drawing') {
      return
    }
    const el = animatedPathRef.current
    if (!el) return
    const L = el.getTotalLength()
    setMetricLen(Number.isFinite(L) && L > 0 ? L : 0)
  }, [phase, transitionFrom, activeIdx])

  const handleRecedeEnd = useCallback((e) => {
    if (!e.animationName?.includes('tree-highlight-recede')) return
    if (e.target !== e.currentTarget) return
    setPhase('drawing')
  }, [])

  const handleHighlightDrawEnd = useCallback((e) => {
    if (!e.animationName?.includes('tree-highlight-draw')) return
    if (e.target !== e.currentTarget) return
    if (phaseRef.current === 'boot') {
      prevCommittedRef.current = 0
      setPhase('idle')
      return
    }
    prevCommittedRef.current = activeIdxRef.current
    setPhase('idle')
  }, [])

  const animatedHighlightD =
    phase === 'boot'
      ? buildRouteD(0)
      : phase === 'receding'
        ? buildRouteD(transitionFrom)
        : buildRouteD(activeIdx)

  const animatedPathKey =
    phase === 'boot'
      ? 'h-boot'
      : phase === 'receding'
        ? `h-r-${transitionFrom}-${activeIdx}`
        : `h-d-${activeIdx}`

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
      {links.map(([from, to], i) => (
        <path
          key={from + '-' + to}
          d={path(all[from], all[to])}
          className="tree-line draw-in"
          style={{ animationDelay: `${i * 80}ms` }}
        />
      ))}
      {phase === 'idle' ? (
        <path className="tree-highlight-route" d={idleRouteD} />
      ) : (
        <path
          ref={animatedPathRef}
          key={animatedPathKey}
          d={animatedHighlightD}
          className={
            'tree-highlight-path' +
            (phase === 'receding'
              ? ' tree-highlight--recede'
              : ' tree-highlight--draw') +
            (metricLen > 0 ? '' : ' tree-highlight--pre')
          }
          style={{
            ['--highlight-len']: String(metricLen > 0 ? metricLen : 1),
          }}
          onAnimationEnd={
            phase === 'receding' ? handleRecedeEnd : handleHighlightDrawEnd
          }
        />
      )}
      {Object.values(all).map((n, i) => {
        const isRoot = n.id === 'root'
        const active = pathNodeSet.has(n.id)
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
  const [state, setState] = useState(() =>
    getWaitlistToken() ? 'done' : 'idle',
  )
  const [error, setError] = useState('')

  const submit = async (e) => {
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
    try {
      const res = await fetch(WAITLIST_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Try again.')
        setState('error')
        return
      }
      setWaitlistToken()
      setState('done')
    } catch {
      setError('Could not reach the server. Try again later.')
      setState('error')
    }
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
              Join waitlist <IconArrowR size={14} />
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
    <section className="hero snap-section">
      <Nav />
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
            Further down, the live demo runs a real scene — narration generated
            for you in this browser.
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
    <section className="section-demo snap-section">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="eyebrow spark">A live scene</div>
            <h2>
              The engine{' '}
              <span className="em">responds</span>.
              <br />
              You answer it back.
            </h2>
          </div>
          <div className="right">
            <p>
              <strong>Demo only</strong>—a fixed sample scene for this page, not full gameplay or
              a saved story. Try a choice, your own line, or restart.
            </p>
          </div>
        </div>

        <div className="demo-frame" ref={stageRef}>
          <aside className="demo-aside">
            <div>
              <div className="eyebrow ink demo-aside-eyebrow">WORLD</div>
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
              className="btn btn-ghost-light btn-sm demo-restart"
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

export default function Home() {
  return (
    <>
      <Hero />
      <StoryDemo />
    </>
  )
}
