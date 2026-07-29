import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Close, Settings } from './icons'

// ─────────────────────────────────────────────────────────────────────────────
// Prototype-only control. Not part of the Edition 6 design — it exists so the
// four states the PRD describes can be demoed without seeding a backend:
//
//   Plan   free / paid      → §4.6 Free filter chip and lock badges
//   User   new / existing   → §4.1 vs §4.2 Home, and per-block student state
//
// On desktop it docks beside the phone frame; on mobile it collapses to a
// floating button so it never covers the design.
// ─────────────────────────────────────────────────────────────────────────────
export default function VariantSwitcher({ plan, setPlan, userType, setUserType }) {
  const [open, setOpen] = useState(false)

  // Portalled to <body>: the phone frame clips overflow, and on desktop this
  // needs to sit outside the frame entirely.
  return createPortal(
    <div className="e6-vs-root">
      <button className="e6-vs-fab" onClick={() => setOpen(o => !o)} aria-label="Prototype variants">
        {open ? <Close s={16} /> : <Settings s={18} />}
      </button>

      <aside className={`e6-vs${open ? ' open' : ''}`}>
        <div className="e6-vs-head">
          <span>Prototype variants</span>
          <button onClick={() => setOpen(false)} aria-label="Close"><Close s={14} /></button>
        </div>

        <Group
          label="Plan"
          hint="Free shows the Free filter chip and lock badges on paid blocks."
          value={plan}
          onChange={setPlan}
          options={[{ v: 'free', l: 'Free user' }, { v: 'paid', l: 'Paid user' }]}
        />

        <Group
          label="User"
          hint="Existing seeds completed blocks, a paused block and saved questions."
          value={userType}
          onChange={setUserType}
          options={[{ v: 'new', l: 'New user' }, { v: 'existing', l: 'Existing user' }]}
        />

        <p className="e6-vs-note">Switching either control resets progress to that state.</p>
      </aside>
    </div>,
    document.body,
  )
}

function Group({ label, hint, value, onChange, options }) {
  return (
    <div className="e6-vs-group">
      <div className="e6-vs-label">{label}</div>
      <div className="e6-vs-seg">
        {options.map(o => (
          <button key={o.v} className={value === o.v ? 'on' : ''} onClick={() => onChange(o.v)}>
            {o.l}
          </button>
        ))}
      </div>
      <p className="e6-vs-hint">{hint}</p>
    </div>
  )
}
