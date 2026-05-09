import { useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function About() {
  useEffect(() => {
    document.title = 'About — Kathion'
  }, [])

  return (
    <main className="static-main">
      <div className="static-wrap">
        <p className="static-eyebrow">About Kathion</p>
        <h1 className="static-h1">A narrative engine for worlds you actually care about</h1>
        <p className="static-lead">
          Kathion helps you <strong>author a world</strong>—places, tone, cast, and the hard
          rules the story must obey—then <strong>play inside it</strong> with interactive
          narration that responds to your choices or your own freeform actions. The goal is
          not a single pre-written plot: it is <strong>shared authorship</strong> between you
          and the engine, with the world as the contract that keeps everything coherent.
        </p>

        <h2 className="static-h2">What we are building toward</h2>
        <ul className="static-list">
          <li>
            <strong>Living canon:</strong> your setting and laws stay visible to the engine so
            every beat can respect what already happened.
          </li>
          <li>
            <strong>Playable scenes:</strong> readable narration, meaningful forks, and space to
            improvise without breaking the world.
          </li>
          <li>
            <strong>Branching paths you can revisit:</strong> explore &quot;what if&quot;
            without losing thread of the version you care about.
          </li>
        </ul>

        <h2 className="static-h2">How it feels from your side</h2>
        <p className="static-p">
          You start by sketching the world: what matters, what is forbidden, what tension holds
          everything together. When you enter a scene, Kathion proposes the next stretch of
          story as narration plus a small menu of strong choices. You can accept a choice,
          or type what you try instead—the engine still has to route through the laws you set.
        </p>

        <figure className="static-figure">
          <figcaption>From world sketch to playable scene</figcaption>
          <div className="diagram-frame">
            <img
              className="diagram-graphic"
              src="/about-diagram-1-world-engine-loop.png"
              alt="Flow diagram: Your World feeds the Kathion engine, which connects your choices at the table to the next scene in a loop."
              width={1200}
              height={675}
              decoding="async"
              loading="lazy"
            />
          </div>
        </figure>

        <h2 className="static-h2">One scene, in slow motion</h2>
        <figure className="static-figure">
          <figcaption>What happens inside a beat</figcaption>
          <div className="diagram-frame">
            <img
              className="diagram-graphic"
              src="/about-diagram-2-scene-beat.png"
              alt="Diagram: scene state leads to narration and choices, informed by the world codex, then updates to a new state for the next beat."
              width={1200}
              height={675}
              decoding="async"
              loading="lazy"
            />
          </div>
        </figure>

        <h2 className="static-h2">Why the structure matters</h2>
        <figure className="static-figure">
          <figcaption>Canon anchors the branches</figcaption>
          <div className="diagram-frame">
            <img
              className="diagram-graphic"
              src="/about-diagram-3-branching-canon.png"
              alt="Branching diagram: one root scene splits into multiple paths that continue deeper, all tied to shared world laws."
              width={1200}
              height={675}
              decoding="async"
              loading="lazy"
            />
          </div>
        </figure>

        <p className="static-p">
          Kathion is in <strong>private alpha</strong>: the live demo on the home page is a
          real slice of this loop—narration generated for a seeded scene so you can feel the
          rhythm of play while we harden tooling, safety, and collaboration features.
        </p>

        <p className="static-p static-muted">
          Product direction can shift during alpha; this page describes intent, not a final
          feature checklist. For legal terms of use, see the{' '}
          <Link to="/terms">Terms of Service</Link>.
        </p>
      </div>
    </main>
  )
}
