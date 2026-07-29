import { useState } from 'react'
import {
  BLOCKS, STUDENT, LEARNING_CARD, NEXT_QBANK, PEER,
  accuracyBand, computePercentile, peerMessage, catById,
} from './data'
import {
  Back, Chart, Percent, CheckCircle, XCircle, Chevron, Refresh, ArrowR,
  Trophy, Share, Bookmark, Grid9,
} from './icons'
import { PyqTags, Options, Verdict, SaveCard, Explanation, ImageZoom } from './QuestionBody'

// §4.25 – §4.30 — results surface: Overview / Solutions tabs plus the
// Detailed Report reached from the bar-chart icon.
export default function Result({ attempts, attemptIdx, setAttemptIdx, go, onReattempt, revision, uncapture, recategorise, toast }) {
  const [tab, setTab] = useState('overview')
  const [report, setReport] = useState(false)

  const attempt = attempts[attemptIdx]
  const first = attempts[0]
  const block = BLOCKS.find(b => b.id === attempt.blockId)

  const acc = attempt.accuracy
  const band = accuracyBand(acc)
  // Only first attempts enter the cohort, and position is the first attempt's
  // score — so the percentile reads the same on every attempt (§4.27).
  const percentile = computePercentile(first.accuracy)

  if (report) {
    return <DetailedReport attempt={attempt} percentile={percentile} onBack={() => setReport(false)} onNext={() => go('home')} />
  }

  return (
    <>
      <header className="e6-navbar" style={{ background: 'var(--bg)', borderBottom: 'none' }}>
        <button onClick={() => go('blocks')}><Back /></button>
        <span className="t t-center">Test : {block?.name}</span>
        <button onClick={() => setReport(true)} style={{ color: 'var(--ink)' }}><Chart /></button>
      </header>

      <div className="e6-seg">
        <button className={tab === 'overview' ? 'on' : ''} onClick={() => setTab('overview')}>Overview</button>
        <button className={tab === 'solutions' ? 'on' : ''} onClick={() => setTab('solutions')}>Solutions</button>
      </div>

      {tab === 'overview' ? (
        <>
          <div className="e6-body">
            {/* §4.28 — attempt selector appears from the second attempt. */}
            {attempts.length > 1 && (
              <div className="e6-attempt-sel">
                <select
                  value={attemptIdx}
                  onChange={e => setAttemptIdx(Number(e.target.value))}
                  style={{ border: 'none', background: 'transparent', color: 'var(--blue)', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}
                >
                  {attempts.map((a, i) => <option key={i} value={i}>Attempt {i + 1}</option>)}
                </select>
              </div>
            )}

            <div className="e6-greet">
              <div className="hi">Hey, {STUDENT.name}!</div>
              <div className="hl">{band.headline}</div>
            </div>

            <Ring value={acc} color={band.ring} />

            <StatsRow acc={acc} band={band} percentile={percentile} attempt={attempt} onSolutions={() => setTab('solutions')} />

            <div className="e6-advisory">{band.advisory}</div>

            {band.cta === 'next' && (
              <div className="e6-ctacard">
                <div className="top">
                  <span className="e6-icontile">🔬</span>
                  <span><span className="nm">{NEXT_QBANK.title}</span><span className="mt">{NEXT_QBANK.meta}</span></span>
                </div>
                <button className="e6-btn e6-btn-blue" onClick={() => go('home')}>Next Qbank</button>
              </div>
            )}
            {band.cta === 'solutions' && (
              <div style={{ padding: '12px 14px 0' }}>
                <button className="e6-btn e6-btn-blue" onClick={() => setTab('solutions')}>View Solutions</button>
              </div>
            )}
            {(band.cta === 'revise' || band.cta === 'learn') && (
              <div className="e6-ctacard">
                <div className="top">
                  <span className="e6-icontile">🧬</span>
                  <span><span className="nm">{LEARNING_CARD.title}</span><span className="mt">{LEARNING_CARD.meta}</span></span>
                </div>
                <button className="e6-btn e6-btn-blue">
                  {band.cta === 'revise' ? 'Revise This Topic' : 'Start Learning'}
                </button>
              </div>
            )}

            <div style={{ height: 24 }} />
          </div>

          {/* Next Qbank is available in every band, including below 30% (§4.26). */}
          <div className="e6-resfoot">
            <button onClick={onReattempt}><Refresh /> Reattempt</button>
            <span className="div" />
            <button onClick={() => go('home')}><ArrowR /> Next Qbank</button>
          </div>
        </>
      ) : (
        <Solutions
          attempt={attempt} revision={revision}
          uncapture={uncapture} recategorise={recategorise} toast={toast}
        />
      )}
    </>
  )
}

function Ring({ value, color }) {
  const R = 46, C = 2 * Math.PI * R
  return (
    <div className="e6-ring">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={R} fill="none" stroke="#E4E9F2" strokeWidth="11" />
        <circle cx="60" cy="60" r={R} fill="none" stroke={color} strokeWidth="11" strokeLinecap="round"
          strokeDasharray={`${(value / 100) * C} ${C}`} />
      </svg>
      <span className="mid">
        <span className="v">{value}%</span>
        <span className="l">Accuracy</span>
      </span>
    </div>
  )
}

// §4.27 — the stats row reflows as the percentile and the Incorrect tile drop.
function StatsRow({ acc, band, percentile, attempt, onSolutions }) {
  const tiles = []
  if (percentile !== null) tiles.push(
    <div className="e6-stat pct" key="p">
      <span className="ic"><Percent /></span>
      <div className="v">{percentile}%</div>
      <div className="l">Percentile</div>
    </div>
  )
  tiles.push(
    <div className="e6-stat cor" key="c">
      <span className="ic"><CheckCircle /></span>
      <div className="v">{attempt.correct}</div>
      <div className="l">Correct <Chevron s={11} /></div>
    </div>
  )
  if (band.showIncorrect) tiles.push(
    <button className="e6-stat inc" key="i" onClick={onSolutions} style={{ textAlign: 'left' }}>
      <span className="ic"><XCircle /></span>
      <div className="v">{attempt.incorrect}</div>
      <div className="l">Incorrect <Chevron s={11} /></div>
    </button>
  )

  return (
    <div className="e6-stats" style={{ gridTemplateColumns: `repeat(${tiles.length}, 1fr)` }}>
      {tiles}
    </div>
  )
}

// §4.29 — Detailed Report.
function DetailedReport({ attempt, percentile, onBack, onNext }) {
  const total = attempt.total
  const { correct, incorrect, missedCount } = attempt
  const C = 2 * Math.PI * 52
  const seg = (n) => (n / total) * C

  return (
    <>
      <header className="e6-navbar" style={{ background: 'var(--bg)', borderBottom: 'none' }}>
        <button onClick={onBack}><Back /></button>
        <span className="t t-center">Details Reports</span>
        <span style={{ width: 20 }} />
      </header>

      <div className="e6-body">
        <div className="e6-tiles">
          {percentile !== null && (
            <div className="e6-tile pct"><div className="l">Percentile</div><div className="v">{percentile}.4%</div></div>
          )}
          <div className="e6-tile acc"><div className="l">Accuracy</div><div className="v">{attempt.accuracy}%</div></div>
          <div className="e6-tile"><div className="l">Time Taken</div><div className="v">{attempt.timeTakenMin}<small>min</small></div></div>
          <div className="e6-tile"><div className="l">Avg. Time taken</div><div className="v">{attempt.avgTimeMin}<small>min</small></div></div>
        </div>

        <div className="e6-panel-t">Question&nbsp; Distribution</div>
        <div className="e6-panel">
          <div style={{ display: 'grid', placeItems: 'center', position: 'relative', padding: '6px 0' }}>
            <svg width="150" height="150" viewBox="0 0 130 130">
              <g transform="rotate(-90 65 65)">
                <circle cx="65" cy="65" r="52" fill="none" stroke="#2CC491" strokeWidth="24" strokeDasharray={`${seg(correct)} ${C}`} />
                <circle cx="65" cy="65" r="52" fill="none" stroke="#F26B6B" strokeWidth="24" strokeDasharray={`${seg(incorrect)} ${C}`} strokeDashoffset={-seg(correct)} />
                {/* The Missed slice renders only when she ran out of time. */}
                {missedCount > 0 && (
                  <circle cx="65" cy="65" r="52" fill="none" stroke="#FFB44C" strokeWidth="24" strokeDasharray={`${seg(missedCount)} ${C}`} strokeDashoffset={-(seg(correct) + seg(incorrect))} />
                )}
              </g>
            </svg>
            <span style={{ position: 'absolute', textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: 9, color: 'var(--ink2)' }}>Total Questions</span>
              <span style={{ display: 'block', fontSize: 24, fontWeight: 700 }}>{total}</span>
            </span>
          </div>
          <div className="e6-donut-legend" style={{ gridTemplateColumns: missedCount > 0 ? '1fr 1fr 1fr' : '1fr 1fr' }}>
            <Cell label="Correct" n={correct} pct={Math.round((correct / total) * 100)} color="var(--green)" />
            <Cell label="Incorrect" n={incorrect} pct={Math.round((incorrect / total) * 100)} color="var(--red-text)" />
            {missedCount > 0 && <Cell label="Missed" n={missedCount} pct={Math.round((missedCount / total) * 100)} color="var(--amber-text)" />}
          </div>
        </div>

        {/* Peer Comparison is suppressed alongside the percentile (§4.27). */}
        {percentile !== null && (
          <>
            <div className="e6-panel-t">Peer Comparison</div>
            <div className="e6-panel"><PeerCurve percentile={percentile} /></div>
          </>
        )}

        <div className="e6-panel-t">Time&nbsp; Distribution</div>
        <div className="e6-panel">
          <TimeBar label="Correct" value={attempt.timeCorrect} pct={55} color="#2CC491" />
          <TimeBar label="Incorrect" value={attempt.timeIncorrect} pct={78} color="#F26B6B" />
          <TimeBar label={missedCount > 0 ? 'Missed' : 'Unattempted'} value={attempt.timeMissed} pct={18} color="#C9D2E0" muted />
        </div>

        <div className="e6-panel-t">Overall Difficulty Analysis</div>
        <div className="e6-panel">
          <table className="e6-difftable">
            <thead><tr><th>Difficulty</th><th>Total Qs</th><th>Correct</th><th>Incorrect</th><th style={{ textAlign: 'right' }}>Accuracy</th></tr></thead>
            <tbody>
              {attempt.difficulty.map(d => (
                <tr key={d.label}>
                  <td>{d.label}</td><td>{d.total}</td><td>{d.correct}</td><td>{d.incorrect}</td>
                  <td style={{ textAlign: 'right', color: d.acc >= 65 ? 'var(--green)' : d.acc >= 30 ? '#B26A00' : 'var(--red-text)' }}>{d.acc}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ height: 12 }} />
      </div>

      <div style={{ padding: '10px 14px 16px', background: 'var(--bg)', flexShrink: 0 }}>
        <button className="e6-btn e6-btn-navy" onClick={onNext} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <ArrowR /> Next QBank
        </button>
      </div>
    </>
  )
}

function Cell({ label, n, pct, color }) {
  return (
    <div className="cell">
      <div className="r"><span>{label}</span><b style={{ color }}>{pct}%</b></div>
      <div className="n" style={{ color }}>{n}</div>
    </div>
  )
}

function TimeBar({ label, value, pct, color, muted }) {
  return (
    <div className="e6-timebar">
      <div className="r"><span>{label}</span><span style={{ color: muted ? 'var(--ink3)' : 'var(--ink)' }}>{value}</span></div>
      <div className="e6-bar" style={{ background: '#EDF0F6' }}><i style={{ width: `${pct}%`, background: color }} /></div>
    </div>
  )
}

function PeerCurve({ percentile }) {
  const x = 20 + (percentile / 100) * 220
  const isTopper = percentile >= PEER.topper
  return (
    <div className="e6-curve">
      <span className="you" style={{ left: `${(x / 260) * 100}%`, top: isTopper ? 0 : 8 }}>
        {isTopper ? <><Trophy s={9} /> You : {percentile}%ile</> : `You : ${percentile}%ile`}
      </span>
      <svg viewBox="0 0 260 96" style={{ width: '100%', marginTop: 22, overflow: 'visible' }}>
        {[[100, 8], [80, 34], [40, 62], [0, 88]].map(([label, y]) => (
          <text key={label} x="0" y={y} fontSize="7" fill="#98A2B3">{label}%</text>
        ))}
        <path d="M20 74 C60 72 76 62 96 58 C122 52 140 44 168 34 C196 24 216 16 244 10"
          fill="none" stroke="#4FA8FF" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M20 74 C60 72 76 62 96 58 C122 52 140 44 168 34 C196 24 216 16 244 10 L244 88 L20 88Z"
          fill="url(#pg)" opacity=".16" />
        <defs><linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#008DFF" /><stop offset="1" stopColor="#008DFF" stopOpacity="0" /></linearGradient></defs>
        <line x1={x} y1="10" x2={x} y2="88" stroke="#BFD9F5" strokeWidth="1" />
        <circle cx={x} cy={78 - (percentile / 100) * 66} r="4.5" fill="#008DFF" stroke="#fff" strokeWidth="2" />
        <line x1="168" y1="20" x2="168" y2="88" stroke="#E2E8F2" strokeWidth="1" />
        <line x1="228" y1="14" x2="228" y2="88" stroke="#E2E8F2" strokeWidth="1" />
        <text x="168" y="80" fontSize="6.5" fill="#5F6B7C" textAnchor="middle" fontWeight="600">{PEER.average}%</text>
        <text x="168" y="88" fontSize="6.5" fill="#98A2B3" textAnchor="middle">Average</text>
        <text x="228" y="80" fontSize="6.5" fill="#5F6B7C" textAnchor="middle" fontWeight="600">{PEER.topper}%</text>
        <text x="228" y="88" fontSize="6.5" fill="#98A2B3" textAnchor="middle">Topper</text>
      </svg>
      <p style={{ fontSize: 10.5, marginTop: 10, color: 'var(--ink2)' }}>
        {percentile >= PEER.topper
          ? <b style={{ color: 'var(--ink)' }}>{peerMessage(percentile)}</b>
          : <>Your score better than <b style={{ color: 'var(--blue)' }}>{percentile}%</b> of students</>}
      </p>
    </div>
  )
}

// §4.30 — Solutions view: every question read-only, with a Filter By control.
function Solutions({ attempt, revision, uncapture, recategorise, toast }) {
  const [idx, setIdx] = useState(0)
  const [filter, setFilter] = useState('all')
  const [menu, setMenu] = useState(false)
  const [zoom, setZoom] = useState(false)

  const all = attempt.questions
  const wrongIds = all.filter(q => attempt.answers[q.id]?.choice !== q.correct).map(q => q.id)
  const rightIds = all.filter(q => attempt.answers[q.id]?.choice === q.correct).map(q => q.id)

  // A filter option is offered only when it would return results.
  const opts = [
    rightIds.length && { k: 'correct', l: 'Correct' },
    wrongIds.length && { k: 'incorrect', l: 'Incorrect' },
    { k: 'all', l: 'All Questions' },
  ].filter(Boolean)

  const inFilter = (q) =>
    filter === 'all' ||
    (filter === 'correct' && rightIds.includes(q.id)) ||
    (filter === 'incorrect' && wrongIds.includes(q.id))

  const visible = all.filter(inFilter)
  const q = visible[Math.min(idx, visible.length - 1)] || all[0]
  const picked = attempt.answers[q.id]?.choice
  const missed = attempt.missed[q.id]
  const saved = revision.find(r => r.qId === q.id)

  const statusOf = (qq) => {
    if (attempt.missed[qq.id]) return 'missed'
    const a = attempt.answers[qq.id]
    if (!a) return 'unattempted'
    return a.choice === qq.correct ? 'correct' : 'incorrect'
  }

  return (
    <div className="e6-solve" style={{ position: 'relative', flex: 1 }}>
      <div className="e6-chrome">
        <span className="ed">E6</span>
        <span className="sp" />
        <div className="e6-filterby">
          <button className="btn" onClick={() => setMenu(m => !m)}>
            Filter By : {opts.find(o => o.k === filter)?.l || 'All'} <Chevron s={11} style={{ transform: 'rotate(90deg)' }} />
          </button>
          {menu && (
            <div className="menu">
              {opts.map(o => (
                <button key={o.k} className={filter === o.k ? 'on' : ''}
                  onClick={() => { setFilter(o.k); setIdx(0); setMenu(false) }}>{o.l}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Non-matching chips are greyed and non-navigable; matching chips jump. */}
      <div className="e6-palette">
        <span className="strip">
          {all.map((qq, i) => {
            const active = inFilter(qq)
            return (
              <button key={qq.id}
                className={`e6-pchip ${statusOf(qq)}${active ? '' : ' muted'}${qq.id === q.id ? ' current' : ''}`}
                disabled={!active}
                onClick={() => setIdx(visible.findIndex(v => v.id === qq.id))}>
                {i + 1}
              </button>
            )
          })}
        </span>
        <span style={{ color: 'var(--ink2)' }}><Grid9 /></span>
      </div>

      <div className="e6-body" style={{ background: '#fff' }}>
        <div className="e6-qhead">
          <span className="n">Question {all.findIndex(x => x.id === q.id) + 1}/{all.length}</span>
          <PyqTags tags={q.pyq} />
          <span style={{ flex: 1 }} />
          <button style={{ color: 'var(--blue)' }}><Share /></button>
        </div>
        <div className="e6-stem">{q.text}</div>
        <Options q={q} picked={picked} reveal onPick={() => {}} disabled />
        {picked && <Verdict q={q} picked={picked} />}
        {missed && <div className="e6-timeout">⏱ Oops you ran out of time.</div>}
        {saved && (
          <SaveCard
            item={saved} canTimeout={!!missed}
            onRemove={() => { uncapture(q.id); toast(`Removed as ${catById(saved.category).label}`) }}
            onChange={(c) => { recategorise(q.id, c); toast(`Added as ${catById(c).label}`) }}
          />
        )}
        <Explanation q={q} full={false} onZoom={() => setZoom(true)} />
        <div style={{ height: 18 }} />
      </div>

      <div className="e6-footer">
        <button className="e6-btn e6-btn-navy"
          disabled={idx >= visible.length - 1}
          onClick={() => setIdx(i => Math.min(visible.length - 1, i + 1))}>Next</button>
      </div>

      {zoom && <ImageZoom onClose={() => setZoom(false)} />}
    </div>
  )
}
