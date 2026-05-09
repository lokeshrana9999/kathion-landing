import { useState } from 'react'

const ACCENTS = ['#c0704f', '#d4920a', '#7a5a9a', '#4a8c6f']

export function DevTweaksPanel({ tweaks, setTweak }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="dev-tweaks">
      <button
        type="button"
        className="dev-tweaks-toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        {open ? 'Close' : 'Theme'}
      </button>
      {open ? (
        <div className="dev-tweaks-panel" role="region" aria-label="Theme tweaks">
          <div className="dev-tweaks-row">
            <label htmlFor="tweak-theme">Atmosphere</label>
            <select
              id="tweak-theme"
              className="dev-tweaks-select"
              value={tweaks.theme}
              onChange={(e) => setTweak('theme', e.target.value)}
            >
              <option value="observatory">Observatory (deep green)</option>
              <option value="codex">Codex (warm ink)</option>
              <option value="holograph">Holograph (cold blue)</option>
            </select>
          </div>
          <div className="dev-tweaks-row">
            <span>Spark accent</span>
            <div className="dev-tweaks-swatches">
              {ACCENTS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={
                    'dev-tweaks-swatch' + (tweaks.accent === c ? ' active' : '')
                  }
                  style={{ background: c }}
                  onClick={() => setTweak('accent', c)}
                  aria-label={`Accent ${c}`}
                  aria-pressed={tweaks.accent === c}
                />
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
