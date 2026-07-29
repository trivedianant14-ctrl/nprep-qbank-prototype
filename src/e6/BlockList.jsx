import { useRef, useState } from 'react'
import { BLOCKS, CHAPTERS, CHAPTER_INDEX, STUDY_PLAN } from './data'
import { Search, Index, Back, Chevron, Close, Check, Play } from './icons'

// §4.5 / §4.6 — Block listing for a subject, with the freemium variant.
export default function BlockList({ go, openBlock, progress, isFree }) {
  const [filter, setFilter] = useState('all')
  const [sheet, setSheet] = useState(null)   // 'index' | 'plan'
  const [paywall, setPaywall] = useState(false)
  const chapterRefs = useRef({})

  const filters = isFree
    ? ['all', 'free', 'attempted', 'unattempted', 'paused']
    : ['all', 'attempted', 'unattempted', 'paused']

  // Per-student state is layered over the authored block list, so a block the
  // student has completed in this session reads Completed here too.
  const blocks = BLOCKS.map(b => {
    const rec = progress.blocks[b.id]
    if (!rec) return b
    return { ...b, status: rec.status, accuracy: rec.accuracy, attempted: rec.attempted }
  })

  const match = (b) => {
    if (filter === 'all') return true
    if (filter === 'free') return b.free
    if (filter === 'attempted') return b.status === 'completed' || b.status === 'paused'
    if (filter === 'unattempted') return b.status === 'unattempted'
    if (filter === 'paused') return b.status === 'paused'
    return true
  }

  const completed = blocks.filter(b => b.status === 'completed').length

  return (
    <>
      <header className="e6-navbar">
        <button onClick={() => go('home')}><Back /></button>
        <span className="t">Applied Anatomy</span>
        <button><Search /></button>
        <button onClick={() => setSheet('index')}><Index /></button>
      </header>

      {/* Study plan banner (§4.5) */}
      <div style={{ background: '#DCE9FB', padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <span style={{ width: 17, height: 17, borderRadius: '50%', background: 'var(--blue)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 9, flexShrink: 0 }}>📅</span>
        <span style={{ fontSize: 11, flex: 1 }}>Toppers complete this in {STUDY_PLAN.days} days</span>
        <button style={{ fontSize: 11, fontWeight: 600, color: 'var(--blue)', display: 'flex', alignItems: 'center', gap: 2 }} onClick={() => setSheet('plan')}>
          View plan <Chevron s={13} />
        </button>
      </div>

      {/* Progress (§4.5) */}
      <div style={{ background: '#DCE9FB', padding: '0 14px 10px', flexShrink: 0 }}>
        <div className="e6-bar" style={{ background: '#C3D8F5' }}>
          <i style={{ width: `${(completed / blocks.length) * 100}%` }} />
        </div>
        <div style={{ textAlign: 'right', fontSize: 10, fontWeight: 600, marginTop: 4 }}>{completed}/48</div>
      </div>

      <div className="e6-body">
        <div style={{ padding: '12px 14px 0' }}>
          <div className="e6-chiprow">
            {filters.map(f => (
              <button key={f} className={`e6-chip${filter === f ? ' on' : ''}`} onClick={() => setFilter(f)}>
                {f === 'all' ? 'All' : f[0].toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: '4px 14px 0' }}>
          {CHAPTERS.map(ch => {
            const rows = blocks.filter(b => b.chapterId === ch.id && match(b))
            if (!rows.length) return null
            const chDone = blocks.filter(b => b.chapterId === ch.id && b.status === 'completed').length
            const chTotal = blocks.filter(b => b.chapterId === ch.id).length
            return (
              <div key={ch.id} ref={el => { chapterRefs.current[ch.ordinal] = el }}>
                <div style={{ display: 'flex', alignItems: 'center', margin: '14px 2px 8px' }}>
                  <span style={{ fontSize: 11, color: 'var(--ink2)', flex: 1 }}>{ch.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--ink2)' }}>{chDone}/{chTotal}</span>
                </div>
                {rows.map(b => (
                  <BlockRow
                    key={b.id} block={b} isFree={isFree}
                    // Tapping a locked block routes to the existing paywall —
                    // no new upgrade surface is required (§4.6).
                    onOpen={(locked) => (locked ? setPaywall(true) : openBlock(b.id))}
                  />
                ))}
              </div>
            )
          })}

          <div className="e6-watermark">
            <div className="e">— EDITION 6 —</div>
            <div className="m">Exam Crack Karana Easy He!</div>
          </div>
        </div>
      </div>

      {sheet === 'index' && (
        <ChapterIndexSheet
          onClose={() => setSheet(null)}
          onPick={(ordinal) => {
            setSheet(null)
            chapterRefs.current[ordinal]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }}
        />
      )}
      {sheet === 'plan' && <StudyPlanSheet onClose={() => setSheet(null)} />}
      {paywall && <Paywall onClose={() => setPaywall(false)} />}
    </>
  )
}

// §4.6 — locked blocks route to the paywall that already exists in the app.
// This stands in for it; no new upgrade surface is specified.
function Paywall({ onClose }) {
  return (
    <div className="e6-scrim" onClick={onClose}>
      <div className="e6-sheet" onClick={e => e.stopPropagation()}>
        <span className="e6-grip" />
        <div style={{ padding: '22px 24px 26px', textAlign: 'center' }}>
          <span style={{ fontSize: 34 }}>🔒</span>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 12 }}>This block is part of NPrep Pro</h3>
          <p style={{ fontSize: 11.5, color: 'var(--ink2)', lineHeight: 1.55, margin: '9px 0 20px' }}>
            Unlock all {BLOCKS.length}+ blocks in Edition 6, every solution, and the full Revision List.
          </p>
          <button className="e6-btn e6-btn-blue">Upgrade to Pro</button>
          <button style={{ marginTop: 14, color: 'var(--ink2)', fontSize: 12.5, fontWeight: 600 }} onClick={onClose}>
            Not now
          </button>
        </div>
      </div>
    </div>
  )
}

// §4.5 block row states + §4.6 lock badge.
function BlockRow({ block, isFree, onOpen }) {
  const done = block.status === 'completed'
  const paused = block.status === 'paused'
  // A block the student has already worked on is never shown as locked —
  // the lock badge only replaces the chevron on untouched paid blocks (§4.6).
  const locked = isFree && !block.free && !done && !paused

  return (
    <button
      className={`e6-card e6-row e6-blockrow${done ? ' done' : ''}`}
      style={{ width: '100%', marginBottom: 8, textAlign: 'left', padding: '11px 13px' }}
      onClick={() => onOpen(locked)}
    >
      <span style={{ fontSize: 16, flexShrink: 0 }}>📄</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 12.5, fontWeight: 700 }}>{block.name}</span>
        <span style={{ display: 'block', fontSize: 10.5, color: done ? 'var(--green)' : 'var(--ink2)', marginTop: 3 }}>
          {done   ? <>Completed • {block.accuracy}% Accuracy</>
           : paused ? <>{block.attempted}/{block.questions} Attempted &nbsp;•&nbsp; Learn</>
           : <>{block.questions} Ques &nbsp;•&nbsp; Learn</>}
        </span>
      </span>
      {locked
        ? <span className="e6-badge lock">🔒</span>
        : done
          ? <span className="e6-badge done"><Check /></span>
          : paused
            ? <span className="e6-badge pause">❙❙</span>
            : <Chevron className="e6-chev" />}
    </button>
  )
}

// §4.7 — Chapter Index bottom sheet.
function ChapterIndexSheet({ onClose, onPick }) {
  return (
    <div className="e6-scrim" onClick={onClose}>
      <div className="e6-sheet" onClick={e => e.stopPropagation()}>
        <span className="e6-grip" />
        <div className="e6-sheet-head"><h3>Chapter Index</h3><button onClick={onClose}><Close s={17} /></button></div>
        <div className="e6-sheet-body">
          {/* Tapping a row scrolls the listing to that chapter (§4.7). */}
          {CHAPTER_INDEX.map((c, i) => (
            <button key={c} onClick={() => onPick((i % CHAPTERS.length) + 1)}
              style={{ display: 'flex', gap: 14, width: '100%', textAlign: 'left', padding: '13px 2px', borderBottom: '1px solid var(--line)', fontSize: 12.5 }}>
              <span style={{ color: 'var(--ink3)', width: 12 }}>{i + 1}</span>
              <span style={{ fontWeight: 600 }}>{c}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// §4.8 — 10-day study plan timeline.
function StudyPlanSheet({ onClose }) {
  return (
    <div className="e6-scrim" onClick={onClose}>
      <div className="e6-sheet" onClick={e => e.stopPropagation()}>
        <span className="e6-grip" />
        <div style={{ padding: '14px 18px 4px' }}>
          <h3 style={{ fontSize: 17, fontWeight: 700 }}>Your {STUDY_PLAN.days}-Day Study Plan</h3>
          <div style={{ fontSize: 11, color: 'var(--ink2)', marginTop: 4 }}>
            {STUDY_PLAN.subject} · <b style={{ color: 'var(--ink)' }}>{STUDY_PLAN.chaptersDone}/{STUDY_PLAN.chaptersTotal}</b> chapters done
          </div>
        </div>
        <div className="e6-sheet-body" style={{ paddingTop: 12 }}>
          <div className="e6-timeline">
            {STUDY_PLAN.nodes.map((n, i) => (
              <div key={i} className={`e6-tlnode${n.state === 'current' ? ' cur' : n.state === 'done' ? ' done' : ''}`}>
                <span className={`dot${n.state === 'done' ? ' done' : n.state === 'current' ? ' cur' : ''}`}>
                  {n.state === 'done' ? <Check s={10} /> : i + 1}
                </span>
                <span className="rng">{n.range}</span>
                <span>
                  <span className="ch">{n.chapter}</span>
                  <span style={{ display: 'block' }} className="ra">{n.rationale}</span>
                  <span style={{ display: 'block' }} className="qs">{n.ques} ques</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
