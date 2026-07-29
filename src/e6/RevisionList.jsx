import { useState } from 'react'
import { CATEGORIES, CHAPTERS, QUESTIONS, SUBJECTS, catById } from './data'
import { Back, Chevron, Bookmark, Search, BookIcon, TestIcon, Close } from './icons'

const ago = (ts) => {
  const d = Math.max(1, Math.round((Date.now() - ts) / 86400000))
  return `${d}d ago`
}

// §M10 — Revision List. Saved items are global to the student: one entry per
// question regardless of which block or attempt it came from. The only
// grouping is Subject → Chapter.
export default function RevisionList({ revision, go, uncapture }) {
  const [tab, setTab] = useState('qbank')
  const [subject, setSubject] = useState(null)

  if (tab === 'tests') {
    // The Tests tab is not built in this release — same empty state as §4.35.
    return <Shell tab={tab} setTab={setTab} onBack={() => go('home')}><Empty go={go} /></Shell>
  }

  if (!revision.length) {
    return <Shell tab={tab} setTab={setTab} onBack={() => go('home')}><Empty go={go} /></Shell>
  }

  if (subject === null) return <SubjectLevel {...{ revision, tab, setTab, go, setSubject }} />
  return <ChapterLevel {...{ revision, tab, setTab, subject, setSubject, uncapture }} />
}

function Shell({ children, tab, setTab, onBack, title = 'Revision List' }) {
  return (
    <>
      <header className="e6-navbar" style={{ borderBottom: 'none' }}>
        <button onClick={onBack}><Back /></button>
        <span className="t">{title}</span>
      </header>
      <div className="e6-tabs2">
        <button className={tab === 'qbank' ? 'on' : ''} onClick={() => setTab('qbank')}><BookIcon s={15} /> QBank</button>
        <button className={tab === 'tests' ? 'on' : ''} onClick={() => setTab('tests')}><TestIcon s={15} /> Tests</button>
      </div>
      {children}
    </>
  )
}

// §4.33 — subject level: one row per subject with a saved-item count.
// Subjects with no saved items do not appear.
function SubjectLevel({ revision, tab, setTab, go, setSubject }) {
  const bySubject = SUBJECTS
    .map(s => ({ ...s, count: s.ordinal === 1 ? revision.length : 0 }))
    .filter(s => s.count > 0)

  return (
    <Shell tab={tab} setTab={setTab} onBack={() => go('home')}>
      <div className="e6-body">
        <div className="e6-pad">
          {bySubject.map(s => (
            <button key={s.id} className="e6-card e6-row" style={{ width: '100%', marginBottom: 9, textAlign: 'left' }}
              onClick={() => setSubject(s.id)}>
              <span className="e6-icontile">{s.icon}</span>
              <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600 }}>{s.name} ({s.count})</span>
              <Chevron className="e6-chev" />
            </button>
          ))}
        </div>
      </div>
    </Shell>
  )
}

// §4.34 — chapter level: unfiltered by default, category chips with counts,
// collapsible chapter accordions.
function ChapterLevel({ revision, tab, setTab, subject, setSubject, uncapture }) {
  const [active, setActive] = useState(null)          // no category pre-selected
  const [open, setOpen] = useState({ 2: true, 3: true })
  const [query, setQuery] = useState('')

  const counts = Object.fromEntries(CATEGORIES.map(c => [c.id, revision.filter(r => r.category === c.id).length]))

  const items = revision
    .map(r => ({ ...r, q: QUESTIONS.find(q => q.id === r.qId) }))
    .filter(r => r.q)
    .filter(r => !active || r.category === active)
    .filter(r => !query || r.q.text.toLowerCase().includes(query.toLowerCase()))

  // Group Subject → Chapter. Chapter assignment is stable per question id.
  const groups = CHAPTERS.map(ch => ({
    ch,
    rows: items.filter(r => (r.qId % CHAPTERS.length) === (ch.ordinal - 1) % CHAPTERS.length),
  })).filter(g => g.rows.length || !active)

  return (
    <Shell tab={tab} setTab={setTab} onBack={() => setSubject(null)}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px 0' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 7, flex: 1, color: 'var(--ink3)' }}>
          <Search s={15} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search question"
            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 12, fontFamily: 'inherit', width: '100%' }} />
        </span>
        <span style={{ fontSize: 11.5, color: 'var(--ink2)', display: 'flex', alignItems: 'center', gap: 3 }}>
          All Subjects ({revision.length}) <Chevron s={11} style={{ transform: 'rotate(90deg)' }} />
        </span>
      </div>

      {/* Only one chip is active at a time; tapping it again clears. */}
      <div className="e6-catchips">
        {CATEGORIES.map(c => (
          <button key={c.id}
            onClick={() => setActive(a => (a === c.id ? null : c.id))}
            style={{
              borderColor: active === c.id ? c.color : 'var(--line)',
              color: c.color,
              background: active === c.id ? '#fff' : '#fff',
            }}>
            {c.label} ({counts[c.id]})
            {active === c.id && <Close s={11} />}
          </button>
        ))}
      </div>

      <div className="e6-body">
        {items.length === 0 ? (
          <ScopedEmpty label={active ? catById(active).label : ''} />
        ) : (
          <div style={{ paddingBottom: 20 }}>
            {groups.map(({ ch, rows }) => (
              <div className="e6-accordion" key={ch.id}>
                <button className="hd" onClick={() => setOpen(o => ({ ...o, [ch.id]: !o[ch.id] }))}>
                  <span style={{ flex: 1, textAlign: 'left' }}>{ch.name}</span>
                  <span style={{ color: 'var(--ink3)', transform: open[ch.id] ? 'rotate(-90deg)' : 'rotate(90deg)', display: 'grid', placeItems: 'center' }}>
                    <Chevron s={14} />
                  </span>
                </button>
                {open[ch.id] && rows.map(r => (
                  <div className="e6-savedrow" key={r.qId}>
                    <span style={{ color: catById(r.category).color, flexShrink: 0, display: 'grid', placeItems: 'center' }}>
                      <Bookmark s={14} filled />
                    </span>
                    <span className="stem">{r.q.text}</span>
                    <span className="ago">{ago(r.ts)}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </Shell>
  )
}

// A zero-count category still shows its chip and a category-scoped empty state.
function ScopedEmpty({ label }) {
  return (
    <div className="e6-empty">
      <span className="ill"><Bookmark s={24} filled /></span>
      <h3>No saved questions yet</h3>
      <p>{label ? `Nothing saved under ${label} yet.` : 'Tap the bookmark icon while solving a question to save it here.'}</p>
    </div>
  )
}

// §4.35 — empty state.
function Empty({ go }) {
  return (
    <div className="e6-body">
      <div className="e6-empty">
        <span className="ill"><Bookmark s={26} filled /></span>
        <h3>No saved questions yet</h3>
        <p>Questions you get wrong, guess, or run out of time on are saved here automatically — and you can save any question yourself with the bookmark icon.</p>
        <button className="e6-btn e6-btn-blue" style={{ maxWidth: 190, margin: '0 auto' }} onClick={() => go('home')}>
          Start Attempting
        </button>
      </div>
    </div>
  )
}
