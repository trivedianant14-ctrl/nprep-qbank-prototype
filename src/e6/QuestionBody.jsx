import { useState } from 'react'
import { SERVER_CONFIG, COHORT, catById, CATEGORIES } from './data'
import {
  Share, Sound, Spark, Bulb, Chevron, Copy, Book, Film, Bookmark,
  Play, Close, ZoomIn, ZoomOut, Clock,
} from './icons'

// The 50-student floor gates the option distribution percentages (§4.12/§4.27).
const showDistribution = COHORT.size >= SERVER_CONFIG.percentileMinCohort

// Renders **bold** and marks glossary terms. Glossary terms are content-managed
// (§M11) — here, any key of q.glossary found in the copy becomes tappable.
function RichText({ text, glossary, onTerm }) {
  const terms = glossary ? Object.keys(glossary) : []
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((p, i) => {
    if (p.startsWith('**')) {
      const word = p.slice(2, -2)
      const term = terms.find(t => t.toLowerCase() === word.toLowerCase())
      if (term && onTerm) {
        return <b key={i} className="e6-gloss" onClick={() => onTerm(term)}>{word}</b>
      }
      return <b key={i}>{word}</b>
    }
    return <span key={i}>{p}</span>
  })
}

export function PyqTags({ tags }) {
  // §4.12 — at most two tags inline with a +N pill; expanding moves all tags
  // onto a second line with a "- Show less" control. Stored order preserved.
  const [open, setOpen] = useState(false)
  if (!tags || !tags.length) return null
  if (tags.length <= 2 || open) {
    return (
      <>
        {tags.map((t, i) => <span key={i} className="e6-pyq">{t}</span>)}
        {open && <button className="e6-showless" onClick={() => setOpen(false)}>- Show less</button>}
      </>
    )
  }
  return (
    <>
      {tags.slice(0, 2).map((t, i) => <span key={i} className="e6-pyq">{t}</span>)}
      <button className="e6-pyq more" onClick={() => setOpen(true)}>+{tags.length - 2}</button>
    </>
  )
}

export function Options({ q, picked, reveal, onPick, disabled }) {
  return q.options.map(o => {
    let cls = ''
    if (reveal) {
      if (o.id === q.correct) cls = ' correct'
      else if (o.id === picked) cls = ' incorrect'
    } else if (o.id === picked) {
      cls = ' picked'
    }
    return (
      <button key={o.id} className={`e6-opt${cls}`} disabled={disabled} onClick={() => !disabled && onPick(o.id)}>
        <span className="k">{o.id}</span>
        <span className="tx">{o.text}</span>
        {reveal && showDistribution && <span className="pc">{o.pct}%</span>}
      </button>
    )
  })
}

export function Verdict({ q, picked }) {
  const ok = picked === q.correct
  return (
    <div className={`e6-verdict ${ok ? 'ok' : 'no'}`}>
      <span className="dot">{ok ? '✓' : '✕'}</span>
      {ok
        ? <span><b>Correct!</b> Wonderful, you got this one right.</span>
        : <span><b>Not Quite!</b>&nbsp; You picked {picked}, Correct is <b style={{ color: 'var(--ink)' }}>{q.correct}</b></span>}
    </div>
  )
}

// §4.16 — inline auto-capture card with Remove and a category picker.
export function SaveCard({ item, onRemove, onChange, canTimeout, timedOut }) {
  const [picking, setPicking] = useState(false)
  const cat = catById(item.category)
  // "Ran out of time" is conditional: only offered if she actually ran out.
  const options = CATEGORIES.filter(c => c.id !== 'timeout' || canTimeout)

  return (
    <div className="e6-savecard" style={{ position: 'relative' }}>
      <div className="top">
        <span>{timedOut ? 'Time ran out' : 'Added to Revision List'}</span>
        <button className="rm" onClick={onRemove}>Remove</button>
      </div>
      {timedOut && <div className="sub">Saving this for revision</div>}
      <div className="e6-catchip">
        <span style={{ color: cat.color, display: 'grid', placeItems: 'center' }}><Bookmark s={11} filled /></span>
        <span>{cat.label}</span>
        <button className="chg" onClick={() => setPicking(p => !p)}>Change</button>
      </div>

      {picking && (
        <div style={{
          position: 'absolute', left: 12, bottom: 46, zIndex: 30, background: '#fff',
          borderRadius: 10, boxShadow: '0 8px 26px rgba(16,24,40,.18)', overflow: 'hidden', minWidth: 152,
        }}>
          {options.map(c => (
            <button key={c.id}
              onClick={() => { onChange(c.id); setPicking(false) }}
              style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', textAlign: 'left', padding: '9px 12px', fontSize: 11.5, fontWeight: c.id === item.category ? 700 : 400 }}>
              <span style={{ color: c.id === item.category ? c.color : 'var(--ink3)', display: 'grid', placeItems: 'center' }}>
                <Bookmark s={11} filled={c.id === item.category} />
              </span>
              {c.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// §4.15 — guess card. Shown whether the answer was right or wrong.
export function GuessCard({ onRemove, onChange }) {
  return (
    <div className="e6-guess">
      <button className="rm" onClick={onRemove}>Remove</button>
      <div className="t">⚡ Too fast, is this Guess?</div>
      <div className="b">You answered this one really quickly. A lucky guess won't save you in NORCET.</div>
      <div className="e6-catchip" style={{ marginTop: 9 }}>
        <span style={{ color: '#6B4EFF', display: 'grid', placeItems: 'center' }}><Bookmark s={11} filled /></span>
        <span>Guess</span>
        <button className="chg" onClick={onChange}>Change</button>
      </div>
    </div>
  )
}

// §4.17 — Hindi audio explanation player.
function AudioPlayer({ onClose }) {
  const [playing, setPlaying] = useState(true)
  const [speed, setSpeed] = useState(1)
  const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2]
  return (
    <div className="e6-audio">
      <button onClick={() => setPlaying(p => !p)} style={{ color: '#fff', display: 'grid', placeItems: 'center' }}>
        {playing ? '❚❚' : <Play s={13} />}
      </button>
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>00:03/10:00</span>
      <span className="bar"><i style={{ width: '5%' }} /></span>
      <button className="spd" onClick={() => setSpeed(SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length])}>
        {speed.toFixed(speed % 1 === 0 ? 1 : 2).replace(/0$/, '')}x
      </button>
      <button onClick={onClose} style={{ color: '#fff', display: 'grid', placeItems: 'center' }}><Close s={14} /></button>
    </div>
  )
}

// §4.18 — image zoom viewer.
export function ImageZoom({ visual, onClose }) {
  const [scale, setScale] = useState(1.6)
  return (
    <div className="e6-zoom" onDoubleClick={() => setScale(s => (s > 2 ? 1 : s + 1))}>
      <div className="e6-zoom-ctl">
        <button onClick={() => setScale(s => Math.min(4, s + 0.4))}><ZoomIn /></button>
        <button onClick={() => setScale(s => Math.max(1, s - 0.4))}><ZoomOut /></button>
        <button onClick={onClose}><Close s={13} /></button>
      </div>
      <div style={{ transform: `scale(${scale})`, transition: 'transform .16s' }}>
        <ShoulderDiagram />
      </div>
    </div>
  )
}

// §4.19 — glossary pop-up.
function GlossarySheet({ term, definition, onClose }) {
  return (
    <div className="e6-scrim" onClick={onClose}>
      <div className="e6-sheet" onClick={e => e.stopPropagation()}>
        <span className="e6-grip" />
        <div className="e6-sheet-head"><h3>{term[0].toUpperCase() + term.slice(1)}</h3><button onClick={onClose}><Close s={17} /></button></div>
        <div className="e6-sheet-body">
          <p style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--ink)' }}>{definition}</p>
        </div>
      </div>
    </div>
  )
}

function ShoulderDiagram() {
  return (
    <svg viewBox="0 0 260 130" style={{ width: '100%', display: 'block', background: '#fff' }}>
      <text x="70" y="16" fontSize="8" fontWeight="700" fill="#101828">Shoulder Anatomy (Axillary Nerve)</text>
      <ellipse cx="72" cy="76" rx="46" ry="40" fill="#C97B72" />
      <ellipse cx="66" cy="66" rx="30" ry="26" fill="#E0968C" />
      <ellipse cx="86" cy="94" rx="26" ry="22" fill="#B96A62" />
      <path d="M58 70 Q86 78 112 66" stroke="#3E8B5A" strokeWidth="2" fill="none" />
      <path d="M60 84 Q88 92 116 88" stroke="#C9821F" strokeWidth="1.4" fill="none" />
      <g stroke="#101828" strokeWidth=".5" fill="none">
        <path d="M104 46h44" /><path d="M112 66h36" /><path d="M116 94h32" />
      </g>
      <text x="152" y="48" fontSize="6.5" fill="#101828">Deltoid muscle</text>
      <text x="152" y="68" fontSize="6.5" fill="#2E7D4F" fontWeight="600">Axillary nerve</text>
      <text x="152" y="93" fontSize="6.5" fill="#101828">Surgical neck</text>
      <text x="152" y="102" fontSize="6.5" fill="#101828">of humerus</text>
    </svg>
  )
}

// Explanation + supporting blocks, shared by the attempt and solutions views.
export function Explanation({ q, full = true, onZoom }) {
  const [audio, setAudio] = useState(false)
  const [term, setTerm] = useState(null)
  const [open, setOpen] = useState({})
  const toggle = (k) => setOpen(o => ({ ...o, [k]: !o[k] }))

  return (
    <>
      <div className="e6-expl">
        <div className="e6-expl-head">
          <span className="lbl">Explanation</span>
          {q.hindiAudio && !audio && (
            <button className="e6-hindi-pill" onClick={() => setAudio(true)}>Listen in Hindi <Sound /></button>
          )}
          {q.hindiAudio && audio && <span className="e6-speaker"><Sound /></span>}
          {!q.hindiAudio && <span className="e6-speaker"><Sound /></span>}
        </div>
        <p><RichText text={q.explanation} glossary={q.glossary} onTerm={setTerm} /></p>
      </div>

      {audio && <AudioPlayer onClose={() => setAudio(false)} />}

      {full && (
        <>
          <div className="e6-why">
            <h4>Why Other Options Were Wrong</h4>
            <ul>
              {q.whyWrong.map((w, i) => (
                <li key={i}><b>{w.title}</b><span>{w.body}</span></li>
              ))}
            </ul>
          </div>

          {q.visual && (
            <div className="e6-visual">
              <div className="lbl">Related Visual</div>
              <div className="frame">
                <ShoulderDiagram />
                <button className="zoom" onClick={onZoom}><ZoomIn s={12} /></button>
              </div>
            </div>
          )}

          <Accordion icon={<Spark />} title="Clinical Relevance" open={open.clin} onToggle={() => toggle('clin')} items={q.clinical} />
          <Accordion icon={<Bulb />} title="How to Approach this Question" open={open.appr} onToggle={() => toggle('appr')} items={q.approach} />
          <Accordion icon={<Bulb />} title="Concept Tested" open={open.conc} onToggle={() => toggle('conc')} items={q.concept} />
          <Accordion icon={<Bulb />} title="Keywords" open={open.kw} onToggle={() => toggle('kw')} items={[q.keywords.join(', ')]} />

          <div className="e6-meta">
            <div className="lbl">Question ID</div>
            <div className="item">
              <span className="dv">#</span><b>{q.qcode}</b>
              <span className="dim" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Copy code <Copy /></span>
            </div>
          </div>
          <div className="e6-meta">
            <div className="lbl">Reference Book</div>
            {q.refs.books.map((b, i) => (
              <div className="item" key={i}>
                {i === 0 && <span className="dv"><Book /></span>}
                {i > 0 && <span style={{ width: 20, flexShrink: 0 }} />}
                <span><b>{b.name}</b> <span className="dim">{b.detail}</span></span>
              </div>
            ))}
          </div>
          <div className="e6-meta">
            <div className="lbl">Reference Video</div>
            {q.refs.videos.map((v, i) => (
              <div className="item" key={i}>
                {i === 0 && <span className="dv"><Film /></span>}
                {i > 0 && <span style={{ width: 20, flexShrink: 0 }} />}
                <span><b>{v.name}</b> <span className="dim">{v.dur}</span></span>
                <Chevron s={12} className="e6-chev" />
              </div>
            ))}
          </div>
        </>
      )}

      {term && <GlossarySheet term={term} definition={q.glossary[term]} onClose={() => setTerm(null)} />}
    </>
  )
}

function Accordion({ icon, title, items, open, onToggle }) {
  return (
    <div className="e6-acc">
      <button className="e6-acc-head" onClick={onToggle}>
        <span style={{ color: 'var(--blue)', display: 'grid', placeItems: 'center' }}>{icon}</span>
        <span className="sp">{title}</span>
        <span style={{ color: 'var(--ink3)', transform: open ? 'rotate(-90deg)' : 'rotate(90deg)', display: 'grid', placeItems: 'center' }}>
          <Chevron s={14} />
        </span>
      </button>
      {open && (
        <div className="e6-acc-body">
          <ul>{items.map((t, i) => <li key={i}>{t}</li>)}</ul>
        </div>
      )}
    </div>
  )
}
