import { useState } from 'react'
import { BLOCKS, CHAPTERS } from './data'
import { Back, Chevron, Play } from './icons'

const LEGEND = [
  { label: 'Not attempted', style: { background: '#D8DEE9' } },
  { label: 'Correct',       style: { background: '#16A978' } },
  { label: 'Incorrect',     style: { background: '#E95454' } },
  { label: 'Missed',        style: { background: '#fff', border: '1.8px solid #FF9500' } },
]

// §4.10 Pre-attempt screen + §4.11 first-time coach mark.
export default function PreAttempt({ blockId, go, start, coachSeen, dismissCoach }) {
  const block = BLOCKS.find(b => b.id === blockId) || BLOCKS[0]
  const chapter = CHAPTERS.find(c => c.id === block.chapterId)

  const [showAnswers, setShowAnswers] = useState(true)   // default ON (§4.10)
  const [lang, setLang] = useState('en')

  // Conditional rendering driven by content-team data (§M11): the language
  // toggle only exists when the block has complete Hindi content, and the
  // video card only when a chapter overview video is linked.
  const hasHindi = true
  const video = chapter?.videoId ? { name: `${block.name} Overview`, meta: 'Chapter overview · 12 min' } : null

  const coach = !coachSeen

  return (
    <>
      <header className="e6-navbar" style={{ borderBottom: 'none', paddingBottom: 4 }}>
        <button onClick={() => go('blocks')}><Back /></button>
      </header>

      <div className="e6-body" style={{ background: '#fff' }}>
        <div style={{ padding: '4px 18px 0' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <span style={{ flex: 1 }}>
              <span style={{ display: 'block', fontSize: 12, color: 'var(--ink2)' }}>Applied Anatomy</span>
              <span style={{ display: 'block', fontSize: 19, fontWeight: 700, marginTop: 3, letterSpacing: '-0.01em' }}>{block.name}</span>
            </span>
            <span style={{ fontSize: 12, color: 'var(--ink2)' }}>{block.questions} Ques</span>
          </div>

          <Section title="General Instructions">
            <p style={{ fontSize: 11.5, color: 'var(--ink2)', lineHeight: 1.5 }}>
              Each question needs to be attempted before you can move to the next one.
            </p>
          </Section>

          <Section title="Question status">
            {LEGEND.map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 9 }}>
                <span style={{ width: 17, height: 17, borderRadius: 5, ...l.style }} />
                <span style={{ fontSize: 11.5, color: 'var(--ink2)' }}>{l.label}</span>
              </div>
            ))}
          </Section>

          {hasHindi && (
            <div style={{ display: 'flex', alignItems: 'center', padding: '14px 0', borderTop: '1px solid var(--line)' }}>
              <span style={{ flex: 1, fontSize: 12.5 }}>Choose Language</span>
              <span style={{ display: 'flex', background: '#F1F3F8', borderRadius: 20, padding: 3 }}>
                {[['en', 'Eng'], ['hi', 'हिंदी']].map(([k, l]) => (
                  <button key={k} onClick={() => setLang(k)}
                    style={{
                      padding: '4px 12px', borderRadius: 16, fontSize: 11, fontWeight: 600,
                      background: lang === k ? '#fff' : 'transparent',
                      color: lang === k ? 'var(--ink)' : 'var(--ink2)',
                      boxShadow: lang === k ? '0 1px 3px rgba(16,24,40,.12)' : 'none',
                    }}>{l}</button>
                ))}
              </span>
            </div>
          )}

          {/* Show Answer immediately — locked once the attempt starts (§4.10) */}
          <div style={{ padding: '14px 0', borderTop: '1px solid var(--line)' }}>
            <ShowAnswersRow on={showAnswers} onChange={() => setShowAnswers(v => !v)} />
          </div>

          {video && (
            <div style={{ padding: '16px 0 0', borderTop: '1px solid var(--line)', marginTop: 4 }}>
              <p style={{ fontSize: 11.5, lineHeight: 1.5 }}>
                <b>Want to revise before attempting?</b> <span style={{ color: 'var(--ink2)' }}>Watch the chapter video first.</span>
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, background: 'var(--blue-tint)', borderRadius: 12, padding: 9, marginTop: 10 }}>
                <span style={{ width: 42, height: 34, borderRadius: 7, background: '#1F2A44', color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Play s={14} /></span>
                <span style={{ flex: 1 }}>
                  <span style={{ display: 'block', fontSize: 12, fontWeight: 700 }}>{video.name}</span>
                  <span style={{ display: 'block', fontSize: 10.5, color: 'var(--ink2)', marginTop: 2 }}>{video.meta}</span>
                </span>
                <Chevron className="e6-chev" style={{ color: 'var(--blue)' }} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '10px 18px 18px', background: '#fff', flexShrink: 0 }}>
        <button className="e6-btn e6-btn-navy" onClick={() => start({ blockId: block.id, showAnswers, lang })}>
          Start Attempt
        </button>
      </div>

      {/* §4.11 — the page dims and the Show Answer Immediately row is spotlit.
          Shown once per student; dismissal persists server-side. */}
      {coach && (
        <div className="e6-scrim" style={{ background: 'rgba(20,24,40,.62)', justifyContent: 'center', padding: '0 18px' }} onClick={dismissCoach}>
          <div className="e6-spot" style={{ padding: '14px 16px' }} onClick={e => e.stopPropagation()}>
            <ShowAnswersRow on={showAnswers} onChange={() => setShowAnswers(v => !v)} />
          </div>
          <button className="e6-coach-ok" style={{ position: 'static', alignSelf: 'flex-end', marginTop: 14 }} onClick={dismissCoach}>
            Okay
          </button>
        </div>
      )}
    </>
  )
}

function ShowAnswersRow({ on, onChange }) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ flex: 1, fontSize: 12.5 }}>Show Answer immediately</span>
        <Toggle on={on} onChange={onChange} />
      </div>
      <p style={{ fontSize: 11, color: 'var(--ink2)', marginTop: 6, lineHeight: 1.5, paddingRight: 50 }}>
        See the correct answer as soon as you attempt a question.
      </p>
    </>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ padding: '16px 0 6px', borderTop: '1px solid var(--line)', marginTop: 16 }}>
      <h4 style={{ fontSize: 11.5, fontWeight: 700, marginBottom: 8 }}>{title}</h4>
      {children}
    </div>
  )
}

export function Toggle({ on, onChange }) {
  return (
    <button onClick={onChange} aria-pressed={on}
      style={{
        width: 40, height: 22, borderRadius: 12, flexShrink: 0, position: 'relative',
        background: on ? 'var(--blue)' : '#CFD6E4', transition: 'background .18s',
      }}>
      <i style={{
        position: 'absolute', top: 2.5, left: on ? 20 : 2.5, width: 17, height: 17,
        borderRadius: '50%', background: '#fff', transition: 'left .18s',
        boxShadow: '0 1px 3px rgba(16,24,40,.25)',
      }} />
    </button>
  )
}
