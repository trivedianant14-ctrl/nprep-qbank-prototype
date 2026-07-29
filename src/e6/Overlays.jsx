import { useState } from 'react'
import { Close, Settings, List, Grid9, Warn } from './icons'

const TIMES = [45, 50, 55, 60]
const SIZES = ['Small', 'Medium', 'Large']

// §4.21 — Session Settings. A time change never touches the question currently
// on screen; the caller applies it from the next question onward.
export function SessionSettings({ time, size, onApply, onClose }) {
  const [t, setT] = useState(time)
  const [s, setS] = useState(size)
  const ti = TIMES.indexOf(t), si = SIZES.indexOf(s)

  return (
    <div className="e6-scrim" onClick={onClose}>
      <div className="e6-sheet" onClick={e => e.stopPropagation()}>
        <span className="e6-grip" />
        <div className="e6-sheet-head"><h3>Session Settings</h3><button onClick={onClose}><Close s={17} /></button></div>
        <div className="e6-sheet-body">
          <div className="e6-setrow">
            <span className="lb">Time Per Question</span>
            <span className="e6-stepper">
              <button disabled={ti === 0} onClick={() => setT(TIMES[ti - 1])}>−</button>
              <span className="v">{t}s</span>
              <button disabled={ti === TIMES.length - 1} onClick={() => setT(TIMES[ti + 1])}>+</button>
            </span>
          </div>
          <div className="e6-setrow" style={{ borderBottom: 'none' }}>
            <span className="lb">Question font size</span>
            <span className="e6-stepper">
              <button disabled={si === 0} onClick={() => setS(SIZES[si - 1])}>−</button>
              <span className="v">{s}</span>
              <button disabled={si === SIZES.length - 1} onClick={() => setS(SIZES[si + 1])}>+</button>
            </span>
          </div>
          <button className="e6-btn e6-btn-navy" style={{ marginTop: 18 }} onClick={() => { onApply(t, s); onClose() }}>Okay</button>
        </div>
      </div>
    </div>
  )
}

// §4.22 / §4.23 — Overview overlay. The stats strip is mode-dependent: with
// Show Answers OFF it must not expose accuracy or a correct/incorrect split.
export function Overview({ blockName, questions, statusOf, showAnswers, onSettings, onClose }) {
  const [view, setView] = useState('grid')

  const counts = questions.reduce((a, q) => {
    const st = statusOf(q.id)
    a[st] = (a[st] || 0) + 1
    return a
  }, {})
  const attempted = questions.length - (counts.unattempted || 0)
  const accuracy = attempted ? Math.round(((counts.correct || 0) / attempted) * 100) : 0

  return (
    <div className="e6-scrim" onClick={onClose}>
      <div className="e6-sheet" onClick={e => e.stopPropagation()}>
        <span className="e6-grip" />
        <div className="e6-sheet-head">
          <button onClick={() => setView(v => (v === 'grid' ? 'list' : 'grid'))} style={{ color: 'var(--ink2)' }}>
            {view === 'grid' ? <List /> : <Grid9 />}
          </button>
          <span style={{ flex: 1 }} />
          <button onClick={onSettings} style={{ color: 'var(--ink2)', marginRight: 12 }}><Settings /></button>
          <button onClick={onClose}><Close s={17} /></button>
        </div>

        <div className="e6-sheet-body">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>{blockName}</h3>

          <div style={{ border: '1px solid var(--line)', borderRadius: 12, padding: 12 }}>
            <div className="e6-ovstat">
              {showAnswers ? (
                <>
                  <Stat n={counts.correct || 0}   label="Correct"     bg="#16A978" />
                  <Stat n={counts.incorrect || 0} label="Incorrect"   bg="#E95454" />
                  <Stat n={counts.missed || 0}    label="Missed"      bg="#fff" fg="#8F5D00" border />
                  <Stat n={counts.unattempted || 0} label="Unattempted" bg="#101828" />
                  <span style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <b style={{ fontSize: 17 }}>{accuracy}%</b>
                    <span style={{ display: 'block', fontSize: 10, color: 'var(--ink2)' }}>Accuracy</span>
                  </span>
                </>
              ) : (
                <>
                  <Stat n={attempted} label="Attemped" bg="#16A978" />
                  <Stat n={counts.unattempted || 0} label="Unattempted" bg="#101828" />
                </>
              )}
            </div>
            <div className="e6-bar" style={{ marginTop: 12 }}>
              <i style={{ width: `${(attempted / questions.length) * 100}%`, background: showAnswers ? 'var(--red)' : 'var(--green)' }} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0 10px' }}>
            <span style={{ fontSize: 12, fontWeight: 600, flex: 1 }}>Summary</span>
            <span style={{ fontSize: 11, color: 'var(--ink2)' }}>{attempted}/{questions.length} attempted</span>
          </div>

          {/* Chips are a status display, not navigation — non-interactive. */}
          {view === 'grid' ? (
            <div className="e6-ovgrid">
              {questions.map((q, i) => (
                <span key={q.id} className={`c ${normalise(statusOf(q.id), showAnswers)}`}>{i + 1}</span>
              ))}
            </div>
          ) : (
            <div>
              {questions.map((q, i) => (
                <div key={q.id} style={{ display: 'flex', gap: 11, alignItems: 'flex-start', marginBottom: 11 }}>
                  <span className={`e6-pchip ${normalise(statusOf(q.id), showAnswers)}`}>{i + 1}</span>
                  <span style={{ fontSize: 11, color: 'var(--ink2)', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {q.text}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: '10px 18px 18px' }}>
          <button className="e6-btn e6-btn-navy" onClick={onClose}>Back to Questions</button>
        </div>
      </div>
    </div>
  )
}

function normalise(status, showAnswers) {
  if (!showAnswers && (status === 'correct' || status === 'incorrect')) return 'attempted'
  return status
}

function Stat({ n, label, bg, fg = '#fff', border }) {
  return (
    <span className="s">
      <span className="n" style={{ background: bg, color: fg, border: border ? '1.5px solid #FF9500' : 'none' }}>{n}</span>
      {label}
    </span>
  )
}

// §4.24 — exit guard. Two variants, because the consequences differ.
export function ExitGuard({ isReattempt, onStay, onExit }) {
  return (
    <div className="e6-scrim" onClick={onStay}>
      <div className="e6-sheet" onClick={e => e.stopPropagation()}>
        <span className="e6-grip" />
        <div style={{ padding: '22px 24px 26px', textAlign: 'center' }}>
          <span style={{ width: 46, height: 46, borderRadius: '50%', background: 'var(--red-tint)', color: 'var(--red)', display: 'grid', placeItems: 'center', margin: '0 auto 14px' }}>
            <Warn s={24} />
          </span>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>
            {isReattempt ? 'Leave now and this reattempt is gone.' : 'So close to finishing this one.'}
          </h3>
          <p style={{ fontSize: 11.5, color: 'var(--ink2)', lineHeight: 1.55, margin: '9px 0 20px' }}>
            {isReattempt
              ? "Nothing from this reattempt will be saved, and your first attempt's score stays exactly as it is."
              : 'Complete this test to see your score, understand your strengths, and identify what needs more practice.'}
          </p>
          <button className="e6-btn e6-btn-navy" onClick={onStay}>Continue Qbank</button>
          <button style={{ marginTop: 14, color: 'var(--blue)', fontSize: 12.5, fontWeight: 600 }} onClick={onExit}>
            {isReattempt ? 'Discard reattempt' : 'Exit'}
          </button>
        </div>
      </div>
    </div>
  )
}

// §4.31 — reattempt mode selection.
export function ReattemptSheet({ wrongCount, onStart, onClose }) {
  const [mode, setMode] = useState('full')
  return (
    <div className="e6-scrim" onClick={onClose}>
      <div className="e6-sheet" onClick={e => e.stopPropagation()}>
        <span className="e6-grip" />
        <div style={{ padding: '16px 20px 0' }}>
          <h3 style={{ fontSize: 17, fontWeight: 700 }}>Choose Your Mode</h3>
          <p style={{ fontSize: 12, color: 'var(--ink2)', marginTop: 3 }}>How would you like to try again?</p>
        </div>
        <div style={{ padding: '16px 20px 0' }}>
          <div style={{ border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
            <ModeRow
              on={mode === 'full'} onSelect={() => setMode('full')}
              title="Full Quiz" titleColor="var(--blue)"
              body={<><b>All questions from the start,</b> Start fresh and attempt the complete test again</>}
            />
            {/* On a 100% attempt there are no targets, so this option is hidden. */}
            {wrongCount > 0 && (
              <ModeRow
                on={mode === 'wrong'} onSelect={() => setMode('wrong')}
                title="Wrong Ones Only" titleColor="var(--red-text)" divider
                body={<><b>{wrongCount} questions you missed or skipped,</b> focus on the ones that need more practice</>}
              />
            )}
          </div>
          <button className="e6-btn e6-btn-navy" style={{ margin: '20px 0 20px' }} onClick={() => onStart(mode)}>
            Start Reattempt
          </button>
        </div>
      </div>
    </div>
  )
}

function ModeRow({ on, onSelect, title, titleColor, body, divider }) {
  return (
    <button onClick={onSelect}
      style={{ display: 'flex', gap: 11, width: '100%', textAlign: 'left', padding: '13px 12px', borderTop: divider ? '1px solid var(--line)' : 'none', background: on ? '#F7FAFF' : '#fff' }}>
      <span style={{ width: 16, height: 16, borderRadius: '50%', border: `1.6px solid ${on ? 'var(--blue)' : '#C6CEDC'}`, display: 'grid', placeItems: 'center', flexShrink: 0, marginTop: 1 }}>
        {on && <i style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--blue)' }} />}
      </span>
      <span>
        <span style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: titleColor }}>{title}</span>
        <span style={{ display: 'block', fontSize: 11, color: 'var(--ink2)', lineHeight: 1.45, marginTop: 3 }}>{body}</span>
      </span>
    </button>
  )
}
