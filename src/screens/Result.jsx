import { useState, useEffect } from 'react'
import { QUESTIONS, TOPPER, COHORT, computePercentile } from '../data'

const P='#534AB7',PL='#EEEDFE',PB='#AFA9EC',PD='#3C3489'
const T1='#1a1a2e',T2='#5a5a78',T3='#9898b0',BD='#e8e8f2',BG2='#f5f5fb'
const GREEN='#3B6D11',GREEN_BG='#EAF3DE',GREEN_BD='#97C459'
const RED='#A32D2D',RED_BG='#FCEBEB',RED_BD='#F09595'

const RATING_LABELS = ['', 'Poor', 'Okay', 'Good', 'Great', 'Excellent']

const DIFFICULTY_ORDER = ['easy', 'moderate', 'difficult']
const DIFFICULTY_LABELS = { easy: 'Easy', moderate: 'Moderate', difficult: 'Difficult' }

function formatDuration(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return m === 0 ? `${s}s` : `${m}m ${s}s`
}

// This prototype has no backend, so per-question elapsed time isn't tracked live.
// Estimate a plausible time from the question id + outcome, deterministic so the
// same attempt always renders the same numbers, capped at that attempt's timer setting.
function estimateQuestionTime(qId, outcome, maxTime) {
  if (outcome === 'missed') return maxTime
  const jitter = (qId * 13) % 9 // 0..8, deterministic per question
  const base = outcome === 'correct' ? 0.38 : 0.68
  const frac = Math.min(0.95, base + jitter / 40)
  return Math.max(4, Math.round(maxTime * frac))
}

function SemiGauge({ pct }) {
  const r = 108, cx = 150, cy = 130
  const len = Math.PI * r
  const color = pct >= 80 ? '#3B6D11' : pct >= 60 ? P : pct >= 40 ? '#E65100' : RED
  const trackColor = pct >= 80 ? '#C8E6A0' : pct >= 60 ? PL : pct >= 40 ? '#FFE0B2' : '#FCEBEB'
  const angle = Math.PI * (1 - pct / 100)
  const dotX = cx + r * Math.cos(Math.PI - angle)
  const dotY = cy - r * Math.sin(Math.PI - angle)
  return (
    <svg width="100%" viewBox="0 0 300 148" style={{ overflow: 'visible', display: 'block' }}>
      <path d={`M ${cx-r},${cy} A ${r},${r} 0 0,1 ${cx+r},${cy}`}
        fill="none" stroke={trackColor} strokeWidth="18" strokeLinecap="round" />
      <path d={`M ${cx-r},${cy} A ${r},${r} 0 0,1 ${cx+r},${cy}`}
        fill="none" stroke={color} strokeWidth="18" strokeLinecap="round"
        strokeDasharray={`${len} ${len}`}
        strokeDashoffset={len * (1 - pct / 100)}
        style={{ transition: 'stroke-dashoffset 1.3s cubic-bezier(0.4,0,0.2,1)' }}
      />
      {pct > 2 && <circle cx={dotX} cy={dotY} r="9" fill={color} />}
    </svg>
  )
}

export default function Result({ navigate, answers, setAnswers, mode, viewSolution, setShowReattemptConfirm, showReattemptConfirm, handleReattempt, sessions = [] }) {
  const [rating, setRating] = useState(0)
  const [feedbackNote, setFeedbackNote] = useState('')
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [animPct, setAnimPct] = useState(0)
  const [attemptIdx, setAttemptIdx] = useState(0)

  // Every completed attempt for this chapter — the dropdown below switches between them.
  const attempts = sessions.filter(s => s.chapterId === 1)
  const selected = attempts[attemptIdx] || attempts[attempts.length - 1]
    || { answers, correct: 0, total: QUESTIONS.length, accuracy: 0, timerPerQ: 60, attemptNumber: 1, completedAt: Date.now() }

  const total     = QUESTIONS.length
  const correct   = QUESTIONS.filter(q => selected.answers[q.id] === q.correct).length
  const incorrect = QUESTIONS.filter(q => selected.answers[q.id] && selected.answers[q.id] !== q.correct && selected.answers[q.id] !== 'timeout').length
  const skipped   = QUESTIONS.filter(q => selected.answers[q.id] === 'timeout').length
  const accuracy  = total > 0 ? Math.round((correct / total) * 100) : 0

  useEffect(() => {
    const t1 = setTimeout(() => setMounted(true), 60)
    const t2 = setTimeout(() => setAnimPct(accuracy), 180)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [accuracy])

  const gaugeColor = accuracy >= 80 ? '#3B6D11' : accuracy >= 60 ? P : accuracy >= 40 ? '#E65100' : RED

  const getMsg = () => {
    if (accuracy >= 80) return { headline: 'Outstanding!', sub: 'You really know your stuff.' }
    if (accuracy >= 60) return { headline: 'Good effort!', sub: "You're making great progress." }
    if (accuracy >= 40) return { headline: 'Keep going!', sub: 'Practice a bit more and you\'ll nail it.' }
    return { headline: "Don't give up!", sub: 'Every attempt makes you stronger.' }
  }
  const msg = getMsg()

  const wrongQs = QUESTIONS.filter(q => {
    const a = selected.answers[q.id]
    return !a || a === 'timeout' || (a && a !== q.correct)
  })

  // Simulated per-question time, capped at the timer setting used for this attempt
  const maxTime = selected.timerPerQ || 60
  const correctTime = QUESTIONS.filter(q => selected.answers[q.id] === q.correct)
    .reduce((sum, q) => sum + estimateQuestionTime(q.id, 'correct', maxTime), 0)
  const incorrectTime = QUESTIONS.filter(q => selected.answers[q.id] && selected.answers[q.id] !== q.correct && selected.answers[q.id] !== 'timeout')
    .reduce((sum, q) => sum + estimateQuestionTime(q.id, 'incorrect', maxTime), 0)
  const missedTime = skipped * maxTime
  const totalTimeSec = correctTime + incorrectTime + missedTime
  const avgCorrectTime = correct > 0 ? Math.round(correctTime / correct) : 0
  const avgIncorrectTime = incorrect > 0 ? Math.round(incorrectTime / incorrect) : 0
  const avgMissedTime = skipped > 0 ? Math.round(missedTime / skipped) : 0

  const percentile = computePercentile(accuracy)

  const difficultyData = DIFFICULTY_ORDER.map(level => {
    const qs = QUESTIONS.filter(q => q.difficulty === level)
    if (qs.length === 0) return null
    const dCorrect = qs.filter(q => selected.answers[q.id] === q.correct).length
    const dAttempted = qs.filter(q => selected.answers[q.id] && selected.answers[q.id] !== 'timeout').length
    const dAcc = dAttempted > 0 ? Math.round((dCorrect / dAttempted) * 100) : 0
    return { level, label: DIFFICULTY_LABELS[level], total: qs.length, correct: dCorrect, attempted: dAttempted, acc: dAcc }
  }).filter(Boolean)

  const topper = TOPPER.stats
  const comparisonRows = [
    { label: 'Score', you: correct, topper: topper.correct, max: total, fmt: v => `${v}/${total}` },
    { label: 'Correct', you: correct, topper: topper.correct, max: total, fmt: v => v },
    { label: 'Incorrect', you: incorrect, topper: topper.incorrect, max: total, fmt: v => v },
    { label: 'Accuracy', you: accuracy, topper: topper.accuracy, max: 100, fmt: v => `${v}%` },
    { label: 'Time taken', you: totalTimeSec, topper: topper.timeTakenSec, max: Math.max(totalTimeSec, topper.timeTakenSec) || 1, fmt: v => formatDuration(v) },
  ]

  const viewSelectedSolutions = () => { setAnswers(selected.answers); viewSolution() }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white' }}>

      {/* Header */}
      <div style={{ flexShrink: 0 }}>
        <div style={{ padding: '12px 20px 4px', display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600 }}>
          <span style={{ color: T1 }}>9:41</span>
        </div>
        <div style={{ padding: '4px 16px 10px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${BD}` }}>
          <button onClick={() => navigate('subject')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T1, display: 'flex' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15,18 9,12 15,6"/></svg>
          </button>
          <span style={{ fontSize: 16, fontWeight: 700, color: T1 }}>Performance</span>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="scroll" style={{ flex: 1, overflowY: 'auto', paddingBottom: 88 }}>

        {/* ── HERO SECTION (animated) ── */}
        <div style={{
          padding: '22px 20px 28px',
          transform: mounted ? 'translateY(0)' : 'translateY(32px)',
          opacity: mounted ? 1 : 0,
          transition: 'transform 0.55s cubic-bezier(0.34,1.2,0.64,1), opacity 0.45s ease-out',
        }}>

          {/* Chapter context */}
          <div style={{ fontSize: 11, fontWeight: 600, color: T3, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center', marginBottom: 14 }}>
            Anatomical Terms · Applied Anatomy
          </div>

          {/* Attempt indicator */}
          {attempts.length > 1 && (
            <div style={{ background: '#FFF8E7', border: '1px solid #FFE082', borderRadius: 10, padding: '8px 14px', marginBottom: 16, fontSize: 12, color: '#5D4037', textAlign: 'center' }}>
              <span style={{ fontWeight: 700 }}>Attempt {selected.attemptNumber ?? attemptIdx + 1}</span> of {attempts.length} · switch attempts from the dropdown below
            </div>
          )}

          {/* Headline */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: T1, marginBottom: 4 }}>{msg.headline}</div>
            <div style={{ fontSize: 14, color: T2 }}>{msg.sub}</div>
          </div>

          {/* Semi-circle gauge */}
          <div style={{ width: '100%', maxWidth: 300, margin: '0 auto 6px', position: 'relative' }}>
            <SemiGauge pct={animPct} />
            <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, textAlign: 'center' }}>
              <div style={{ fontSize: 50, fontWeight: 900, color: gaugeColor, lineHeight: 1, letterSpacing: '-0.02em' }}>{accuracy}%</div>
              <div style={{ fontSize: 12, color: T3, marginTop: 2, fontWeight: 500 }}>accuracy</div>
            </div>
          </div>

          {/* Fan stat cards */}
          <div style={{ display: 'flex', gap: 10, width: '100%', alignItems: 'flex-end', marginTop: 18 }}>
            <div style={{ flex: 1, background: GREEN_BG, border: `1.5px solid ${GREEN_BD}`, borderRadius: 18, padding: '16px 10px 14px', textAlign: 'center', transform: 'rotate(-3deg) translateY(4px)', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'white', border: `2px solid ${GREEN_BD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: GREEN, lineHeight: 1 }}>{correct}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: GREEN, opacity: 0.75, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Correct</div>
            </div>
            <div style={{ flex: 1.15, background: PL, border: `1.5px solid ${P}`, borderRadius: 18, padding: '18px 10px 16px', textAlign: 'center', transform: 'translateY(-10px)', boxShadow: `0 6px 20px rgba(83,74,183,0.16)` }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'white', border: `2px solid ${P}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={P} strokeWidth="2.5" strokeLinecap="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: PD, lineHeight: 1 }}>{total}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: P, opacity: 0.8, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Questions</div>
            </div>
            <div style={{ flex: 1, background: RED_BG, border: `1.5px solid ${RED_BD}`, borderRadius: 18, padding: '16px 10px 14px', textAlign: 'center', transform: 'rotate(3deg) translateY(4px)', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'white', border: `2px solid ${RED_BD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: RED, lineHeight: 1 }}>{incorrect}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: RED, opacity: 0.75, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Incorrect</div>
            </div>
          </div>

          {/* Skipped row */}
          {skipped > 0 && (
            <div style={{ marginTop: 14, background: '#FFF8E7', border: '1px solid #FFD54F', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#B45309' }}>{skipped} question{skipped > 1 ? 's' : ''} skipped (ran out of time)</span>
            </div>
          )}

          {/* Scroll hint */}
          <div style={{ textAlign: 'center', marginTop: 22 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T3} strokeWidth="2" strokeLinecap="round"><path d="M12 5v14"/><path d="M19 12l-7 7-7-7"/></svg>
            <div style={{ fontSize: 11, color: T3, marginTop: 3 }}>Scroll for full analysis</div>
          </div>
        </div>

        {/* ── DIVIDER ── */}
        <div style={{ background: BG2, borderTop: `1px solid ${BD}`, borderBottom: `1px solid ${BD}`, padding: '10px 16px', marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T3, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Full Analysis</div>
        </div>

        {/* ── PERFORMANCE CONTENT ── */}
        <div style={{ padding: '0 16px' }}>

          {/* Attempt selector */}
          {attempts.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: T2, flexShrink: 0 }}>Viewing:</span>
              <select
                value={attemptIdx}
                onChange={e => setAttemptIdx(Number(e.target.value))}
                style={{ flex: 1, fontSize: 12, fontWeight: 600, color: PD, background: PL, border: `1.5px solid ${PB}`, borderRadius: 10, padding: '8px 10px', outline: 'none' }}
              >
                {attempts.map((a, i) => (
                  <option key={a.id} value={i}>
                    Attempt {a.attemptNumber ?? i + 1}{i === 0 ? ' (first completed)' : ''} · {new Date(a.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {a.accuracy}%
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Stats table */}
          <div style={{ background: 'white', border: `1px solid ${BD}`, borderRadius: 14, padding: '4px 14px', marginBottom: 12 }}>
            {[
              ['Total accuracy', `${accuracy}%`],
              ['Total correct', correct],
              ['Total incorrect', incorrect],
              ['Skipped (ran out of time)', skipped],
              ['Total time taken', formatDuration(totalTimeSec)],
            ].map(([label, value], i) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderTop: i > 0 ? `1px solid ${BD}` : 'none' }}>
                <span style={{ fontSize: 12, color: T2 }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: T1 }}>{value}</span>
              </div>
            ))}

            {/* Time spent breakdown */}
            <div style={{ padding: '10px 0', borderTop: `1px solid ${BD}` }}>
              <div style={{ fontSize: 12, color: T2, marginBottom: 8 }}>Time spent (avg / question)</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1, textAlign: 'center', background: GREEN_BG, border: `1px solid ${GREEN_BD}`, borderRadius: 10, padding: '8px 4px' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: GREEN }}>{correct > 0 ? `${avgCorrectTime}s` : '—'}</div>
                  <div style={{ fontSize: 9, color: GREEN, opacity: 0.8, marginTop: 2, textTransform: 'uppercase' }}>Correct</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center', background: RED_BG, border: `1px solid ${RED_BD}`, borderRadius: 10, padding: '8px 4px' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: RED }}>{incorrect > 0 ? `${avgIncorrectTime}s` : '—'}</div>
                  <div style={{ fontSize: 9, color: RED, opacity: 0.8, marginTop: 2, textTransform: 'uppercase' }}>Incorrect</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center', background: '#FFF8E7', border: '1px solid #FFD54F', borderRadius: 10, padding: '8px 4px' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#B45309' }}>{skipped > 0 ? `${avgMissedTime}s` : '—'}</div>
                  <div style={{ fontSize: 9, color: '#B45309', opacity: 0.8, marginTop: 2, textTransform: 'uppercase' }}>Missed</div>
                </div>
              </div>
            </div>

            {/* Percentile */}
            <div style={{ padding: '10px 0', borderTop: `1px solid ${BD}` }}>
              {percentile !== null ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: T2 }}>Percentile</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: P }}>{percentile}th percentile · top {Math.max(1, 100 - percentile)}%</span>
                </div>
              ) : (
                <div style={{ fontSize: 11, color: T3, lineHeight: 1.5 }}>
                  Percentile unlocks once 100+ students complete this chapter (currently {COHORT.completed}).
                </div>
              )}
            </div>
          </div>

          {/* Comparison chart — you vs topper */}
          <div style={{ border: `1px solid ${BD}`, borderRadius: 14, padding: '13px 14px', marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T1, marginBottom: 2 }}>You vs {TOPPER.rank}</div>
            <div style={{ fontSize: 11, color: T3, marginBottom: 12 }}>{TOPPER.name} · {TOPPER.exam}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {comparisonRows.map(row => (
                <div key={row.label}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: T2, marginBottom: 4 }}>{row.label}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <span style={{ fontSize: 9, color: T3, width: 36, flexShrink: 0 }}>You</span>
                    <div style={{ flex: 1, height: 7, background: BG2, borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${row.max > 0 ? Math.min(100, (row.you / row.max) * 100) : 0}%`, background: P, borderRadius: 4 }} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: T1, width: 48, textAlign: 'right', flexShrink: 0 }}>{row.fmt(row.you)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 9, color: T3, width: 36, flexShrink: 0 }}>Topper</span>
                    <div style={{ flex: 1, height: 7, background: BG2, borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${row.max > 0 ? Math.min(100, (row.topper / row.max) * 100) : 0}%`, background: '#E6A817', borderRadius: 4 }} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: T1, width: 48, textAlign: 'right', flexShrink: 0 }}>{row.fmt(row.topper)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Difficulty-wise analysis */}
          {difficultyData.length > 0 && (
            <div style={{ border: `1px solid ${BD}`, borderRadius: 14, padding: '13px 14px', marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T1, marginBottom: 3 }}>Difficulty-wise Analysis</div>
              <div style={{ fontSize: 12, color: T3, marginBottom: 10 }}>How you performed across question difficulty</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {difficultyData.map(d => (
                  <div key={d.level} style={{ background: BG2, border: `1px solid ${BD}`, borderRadius: 10, padding: '10px 12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: T1 }}>{d.label}</span>
                      <span style={{ fontSize: 11, color: T3 }}>{d.attempted > 0 ? `${d.acc}% · ${d.correct}/${d.total}` : `${d.total} question${d.total > 1 ? 's' : ''}`}</span>
                    </div>
                    <div style={{ height: 3, background: BD, borderRadius: 2 }}>
                      <div style={{ height: 3, width: `${d.attempted > 0 ? d.acc : 0}%`, background: P, borderRadius: 2, transition: 'width 0.4s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feedback */}
          <div style={{ border: `1px solid ${BD}`, borderRadius: 14, padding: '14px 16px', marginBottom: 12 }}>
            {feedbackSubmitted ? (
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T1, marginBottom: 3 }}>Thanks for your feedback!</div>
                <div style={{ fontSize: 12, color: T3 }}>It helps us improve the question set.</div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 13, fontWeight: 700, color: T1, marginBottom: 3 }}>How was your experience?</div>
                <div style={{ fontSize: 12, color: T3, marginBottom: 14 }}>How did this question set feel overall — quality, clarity, usefulness?</div>
                <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setRating(n)} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: `1.5px solid ${rating >= n ? P : BD}`, background: rating >= n ? PL : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill={rating >= n ? P : 'none'} stroke={rating >= n ? P : BD} strokeWidth="1.8"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
                    </button>
                  ))}
                </div>
                {rating > 0 && <div style={{ fontSize: 12, color: P, fontWeight: 600, textAlign: 'center', marginBottom: 12 }}>{RATING_LABELS[rating]}</div>}
                <textarea value={feedbackNote} onChange={e => setFeedbackNote(e.target.value)} placeholder="Anything to add? (optional)" style={{ width: '100%', minHeight: 60, padding: '9px 12px', border: `1px solid ${BD}`, borderRadius: 10, fontSize: 12, color: T1, resize: 'none', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', marginBottom: 12 }} />
                <button onClick={() => { if (rating > 0) setFeedbackSubmitted(true) }} style={{ width: '100%', padding: '10px', borderRadius: 10, border: `1.5px solid ${rating > 0 ? P : BD}`, background: rating > 0 ? PL : 'white', cursor: rating > 0 ? 'pointer' : 'default', fontSize: 13, fontWeight: 700, color: rating > 0 ? PD : T3, transition: 'all 0.15s' }}>
                  Submit Feedback
                </button>
              </>
            )}
          </div>

        </div>
      </div>

      {/* Fixed CTAs */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'white', borderTop: `1px solid ${BD}`, padding: '12px 16px', display: 'flex', gap: 10 }}>
        <button onClick={() => setShowReattemptConfirm(true)} className="btn-outline" style={{ flex: 1 }}>Try Again</button>
        <button onClick={viewSelectedSolutions} className="btn-primary" style={{ flex: 2 }}>View Solutions →</button>
      </div>

      {/* Re-attempt mode selector */}
      {showReattemptConfirm && (
        <div className="popup-overlay">
          <div className="popup" style={{ padding: '22px 18px 18px' }}>
            {wrongQs.length === 0 ? (
              <>
                <div style={{ textAlign: 'center', marginBottom: 18 }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>🏆</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: T1, marginBottom: 10 }}>Absolutely Brilliant!</div>
                  <div style={{ fontSize: 13, color: T2, lineHeight: 1.65 }}>
                    You answered <strong>every single question correctly</strong> — don't hold back that smile, you genuinely earned it! 🌟
                    <br /><br />
                    There are no wrong questions to retry right now. Go celebrate this win — you've worked hard for it!
                  </div>
                </div>
                <div style={{ fontSize: 12, color: '#7a5c00', background: '#FFF8E1', border: '1px solid #FFE082', borderRadius: 8, padding: '8px 12px', marginBottom: 16, lineHeight: 1.5 }}>
                  ⚠️ Every attempt is saved — switch between them anytime from the analysis dropdown.
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setShowReattemptConfirm(false)} className="btn-outline" style={{ flex: 1 }}>Back</button>
                  <button onClick={() => handleReattempt('full')} className="btn-primary" style={{ flex: 1 }}>Full Quiz Again</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 17, fontWeight: 700, color: T1, marginBottom: 4 }}>Choose Your Mode</div>
                <div style={{ fontSize: 12, color: T2, marginBottom: 16 }}>How would you like to try again?</div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                  <button
                    onClick={() => handleReattempt('full')}
                    style={{ background: PL, border: `1.5px solid ${PB}`, borderRadius: 12, padding: '14px', textAlign: 'left', cursor: 'pointer', width: '100%' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: PD, marginBottom: 3 }}>Full Quiz</div>
                        <div style={{ fontSize: 12, color: T2, lineHeight: 1.4 }}>All {QUESTIONS.length} questions from the start</div>
                        <div style={{ fontSize: 11, color: T3, marginTop: 2 }}>Start fresh and attempt the complete test again</div>
                      </div>
                      <div style={{ fontSize: 24, marginLeft: 12 }}>🔄</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleReattempt('wrong-only', wrongQs.map(q => q.id))}
                    style={{ background: RED_BG, border: `1.5px solid ${RED_BD}`, borderRadius: 12, padding: '14px', textAlign: 'left', cursor: 'pointer', width: '100%' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: RED, marginBottom: 3 }}>Wrong Ones Only</div>
                        <div style={{ fontSize: 12, color: T2, lineHeight: 1.4 }}>{wrongQs.length} question{wrongQs.length !== 1 ? 's' : ''} you missed or skipped</div>
                        <div style={{ fontSize: 11, color: T3, marginTop: 2 }}>Focus on the ones that need more practice</div>
                      </div>
                      <div style={{ fontSize: 24, marginLeft: 12 }}>🎯</div>
                    </div>
                  </button>
                </div>

                <div style={{ fontSize: 12, color: '#7a5c00', background: '#FFF8E1', border: '1px solid #FFE082', borderRadius: 8, padding: '8px 12px', marginBottom: 14, lineHeight: 1.5 }}>
                  ⚠️ Every attempt is saved — switch between them anytime from the analysis dropdown.
                </div>

                <button onClick={() => setShowReattemptConfirm(false)} className="btn-outline" style={{ width: '100%' }}>Cancel</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
