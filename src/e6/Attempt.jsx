import { useEffect, useRef, useState } from 'react'
import { QUESTIONS, BLOCKS, SERVER_CONFIG, blockCohort, catById } from './data'
import {
  Close, Clock, Settings, Grid9, Share, Bookmark, Back, Chevron,
} from './icons'
import {
  PyqTags, Options, Verdict, SaveCard, GuessCard, Explanation, ImageZoom,
} from './QuestionBody'
import { SessionSettings, Overview, ExitGuard } from './Overlays'

const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

// ─────────────────────────────────────────────────────────────────────────────
// §4.12 – §4.16 — the attempt engine.
//
// Two indices drive everything:
//   activeIdx — the question the student is actually on; its timer runs.
//   viewIdx   — the question on screen. When it differs, she is revisiting a
//               previous question: no timer, no answer re-reveal (§4.14 r4/r5).
// ─────────────────────────────────────────────────────────────────────────────
export default function Attempt({
  session, onFinish, onExit, revision, capture, uncapture, recategorise, toast,
}) {
  const { blockId, showAnswers, questionIds, paletteIds, isReattempt } = session
  const block = BLOCKS.find(b => b.id === blockId) || BLOCKS[0]
  // `questions` are the ones she actually attempts. In Wrong Ones Only the
  // palette still renders every original question number, preserving position;
  // only the targets are coloured and tappable (§4.32).
  const questions = questionIds.map(id => QUESTIONS.find(q => q.id === id))
  const palette = (paletteIds || questionIds).map(id => QUESTIONS.find(q => q.id === id))

  // A paused attempt resumes exactly where it left off: same answers, same
  // remaining time on the question she left, same time-per-question and font
  // size. Show Answers mode travels on the session itself (§4.14).
  const restore = session.restore

  const [activeIdx, setActiveIdx] = useState(restore?.activeIdx ?? 0)
  const [viewIdx, setViewIdx] = useState(restore?.activeIdx ?? 0)
  const [answers, setAnswers] = useState(restore?.answers ?? {})   // qId -> { choice, seconds, guess }
  const [missed, setMissed] = useState(restore?.missed ?? {})      // qId -> true
  const [timePerQ, setTimePerQ] = useState(restore?.timePerQ ?? 45) // §4.21 default
  const [fontSize, setFontSize] = useState(restore?.fontSize ?? 'Medium')
  const [remaining, setRemaining] = useState(restore?.remaining ?? {})  // qId -> seconds left
  const [sheet, setSheet] = useState(null)            // 'settings' | 'overview' | 'exit'
  const [zoom, setZoom] = useState(false)
  const [confirmSubmit, setConfirmSubmit] = useState(false)

  // A time-per-question change applies from the NEXT question onward (§4.21),
  // so the value in force is captured when a question is first shown.
  const pendingTime = useRef(restore?.timePerQ ?? 45)
  const elapsedRef = useRef(restore?.elapsed ?? {})          // qId -> seconds on screen

  const q = questions[viewIdx]
  const revisiting = viewIdx !== activeIdx
  const answer = answers[q.id]
  const isMissed = !!missed[q.id]
  const answered = !!answer || isMissed
  const last = activeIdx === questions.length - 1

  // Reveal rules: only in Show Answers ON, only for the question she is
  // currently on, and never on a revisited question (§4.14 r4).
  const reveal = showAnswers && !!answer && !revisiting

  // ── Timer ────────────────────────────────────────────────────────────────
  // Runs only on the active question, only while it is unanswered. It keeps
  // running behind every overlay — back-navigation is the only thing that
  // pauses it, which happens implicitly because viewIdx moves off activeIdx.
  useEffect(() => {
    const aq = questions[activeIdx]
    if (!aq) return
    if (remaining[aq.id] === undefined) {
      setRemaining(r => ({ ...r, [aq.id]: pendingTime.current }))
      elapsedRef.current[aq.id] = 0
    }
  }, [activeIdx])                                       // eslint-disable-line

  useEffect(() => {
    const aq = questions[activeIdx]
    if (!aq) return
    if (revisiting) return                               // §4.14 r3 — frozen
    if (answers[aq.id] || missed[aq.id]) return          // stops on selection

    const t = setInterval(() => {
      elapsedRef.current[aq.id] = (elapsedRef.current[aq.id] || 0) + 1
      setRemaining(r => {
        const left = (r[aq.id] ?? pendingTime.current) - 1
        if (left <= 0) {
          clearInterval(t)
          expire(aq)
          return { ...r, [aq.id]: 0 }
        }
        return { ...r, [aq.id]: left }
      })
    }, 1000)
    return () => clearInterval(t)
  }, [activeIdx, viewIdx, revisiting, answers, missed])  // eslint-disable-line

  // §4.14 — expiry marks Missed, auto-advances, and makes the question
  // eligible for the Ran out of time category. On the last question it enables
  // Finish instead of advancing.
  function expire(aq) {
    setMissed(m => ({ ...m, [aq.id]: true }))
    if (showAnswers) capture(aq.id, 'timeout')
    const idx = questions.findIndex(x => x.id === aq.id)
    if (idx < questions.length - 1) {
      setActiveIdx(idx + 1)
      setViewIdx(idx + 1)
      pendingTime.current = timePerQ
    }
  }

  // ── Selection ────────────────────────────────────────────────────────────
  function pick(optId) {
    if (revisiting && showAnswers) return               // locked (§4.14 r4)
    if (isMissed) return                                // no selection after expiry
    if (showAnswers && answer) return                   // selection is final

    const spent = elapsedRef.current[q.id] || 0
    const guess = spent <= SERVER_CONFIG.guessThresholdSec
    setAnswers(a => ({ ...a, [q.id]: { choice: optId, seconds: spent, guess } }))

    // §4.16 — capture is immediate in ON mode, deferred to submission in OFF.
    if (showAnswers) {
      if (guess) capture(q.id, 'guess')
      else if (optId !== q.correct) capture(q.id, 'wrong')
    }
  }

  // §4.13 — Clear Choice exists only in Show Answers OFF. Clearing leaves the
  // question unanswered again and the countdown resumes where it stopped.
  function clearChoice() {
    setAnswers(a => {
      const n = { ...a }
      delete n[q.id]
      return n
    })
  }

  // ── Navigation ───────────────────────────────────────────────────────────
  function next() {
    // From a revisited question, Next returns to the one she left (§4.14 r6).
    if (revisiting) { setViewIdx(activeIdx); return }
    if (last) { setConfirmSubmit(true); return }
    pendingTime.current = timePerQ
    setActiveIdx(i => i + 1)
    setViewIdx(i => i + 1)
  }

  function back() {
    if (viewIdx > 0) setViewIdx(i => i - 1)
  }

  function submit() {
    // §4.13/§4.16 — with Show Answers OFF nothing is written during the
    // attempt; every question is evaluated and captured at submission.
    if (!showAnswers) {
      questions.forEach(qq => {
        const a = answers[qq.id]
        if (missed[qq.id]) capture(qq.id, 'timeout')
        else if (a?.guess) capture(qq.id, 'guess')
        else if (a && a.choice !== qq.correct) capture(qq.id, 'wrong')
      })
    }
    onFinish({ answers, missed, questions, timePerQ })
  }

  function statusOf(qId) {
    if (missed[qId]) return 'missed'
    const a = answers[qId]
    if (!a) return 'unattempted'
    if (!showAnswers) return 'attempted'
    const qq = questions.find(x => x.id === qId)
    return a.choice === qq.correct ? 'correct' : 'incorrect'
  }

  // Finish is greyed until she selects an option or the timer runs out (§4.14).
  const canProceed = !!answers[questions[activeIdx].id] || !!missed[questions[activeIdx].id]
  const nextEnabled = revisiting ? true : canProceed

  // ── Manual bookmark (§4.16) ──────────────────────────────────────────────
  const saved = revision.find(r => r.qId === q.id)
  // Bumped on every toggle and re-keyed onto the icon, so the fill animation
  // replays each time rather than only on the first save.
  const [bookmarkBeat, setBookmarkBeat] = useState(0)

  function toggleBookmark() {
    setBookmarkBeat(b => b + 1)
    if (saved) {
      uncapture(q.id)
      toast(`Removed as ${catById(saved.category).label}`)
    } else {
      // Category derives from her attempt: previously correct → Important,
      // previously incorrect → Got it Wrong.
      const a = answers[q.id]
      const cat = a && a.choice !== q.correct ? 'wrong' : 'important'
      capture(q.id, cat, 'manual')
      toast(`Added as ${catById(cat).label}`)
    }
  }

  // The inline card belongs to a capture made in THIS attempt — an item saved
  // in an earlier attempt shows only as a filled bookmark until she answers.
  const settled = reveal || (showAnswers && isMissed && !revisiting)
  const guessTagged = showAnswers && answer?.guess && saved?.category === 'guess' && settled
  const showSaveCard = settled && saved && !guessTagged

  return (
    <div className="e6-solve" data-fs={fontSize}>
      <div className="e6-chrome">
        <button onClick={() => setSheet('exit')}><Close s={18} /></button>
        <span className="ed">E6</span>
        <span className="sp" />
        {/* Filled blue when the question is saved, outline when not (§4.16). */}
        <button
          className={`e6-bookmark${saved ? ' on' : ''}`}
          onClick={toggleBookmark}
          aria-label="Save to Revision List"
          aria-pressed={!!saved}
        >
          <span key={bookmarkBeat} className="beat"><Bookmark filled={!!saved} /></span>
        </button>
        {!revisiting && !answered && (
          <span className={`timer${(remaining[q.id] ?? timePerQ) <= 10 ? ' low' : ''}`}>
            <Clock /> {fmt(remaining[q.id] ?? timePerQ)}
          </span>
        )}
        <button onClick={() => setSheet('settings')} style={{ color: 'var(--ink2)', marginLeft: 10 }}><Settings /></button>
      </div>

      <div className="e6-palette">
        <span className="strip">
          {palette.map((qq, i) => {
            const target = questionIds.includes(qq.id)
            return (
              <span
                key={qq.id}
                className={`e6-pchip ${statusOf(qq.id)}${target ? '' : ' muted'}${qq.id === q.id ? ' current' : ''}`}
              >
                {i + 1}
              </span>
            )
          })}
        </span>
        <button onClick={() => setSheet('overview')} style={{ color: 'var(--ink2)' }}><Grid9 /></button>
      </div>

      <div className="e6-body" style={{ background: '#fff' }}>
        <div className="e6-qhead">
          <span className="n">Question {palette.findIndex(p => p.id === q.id) + 1}/{palette.length}</span>
          <PyqTags tags={q.pyq} />
          <span style={{ flex: 1 }} />
          <button style={{ color: 'var(--blue)' }}><Share /></button>
        </div>

        <div className="e6-stem">{q.text}</div>

        <Options
          q={q}
          picked={answer?.choice}
          reveal={reveal}
          onPick={pick}
          disabled={isMissed || (showAnswers && (!!answer || revisiting))}
          cohortSize={blockCohort(blockId)}
        />

        {/* Clear Choice: OFF mode only, and available on revisited questions
            too — answers stay changeable until the block is submitted. */}
        {!showAnswers && answer && (
          <button className="e6-clear" onClick={clearChoice}><span>↺</span><span>Clear Choice</span></button>
        )}

        {isMissed && !revisiting && (
          <div className="e6-timeout">⏱ Oops you ran out of time.</div>
        )}

        {reveal && <Verdict q={q} picked={answer.choice} />}

        {guessTagged && (
          <GuessCard
            onRemove={() => { uncapture(q.id); toast('Removed as Guess') }}
            onChange={() => { recategorise(q.id, 'important'); toast('Added as Important') }}
          />
        )}

        {showAnswers && isMissed && saved?.category === 'timeout' && (
          <SaveCard
            item={saved} timedOut canTimeout
            onRemove={() => { uncapture(q.id); toast('Removed as Ran out of time') }}
            onChange={(c) => { recategorise(q.id, c); toast(`Added as ${catById(c).label}`) }}
          />
        )}

        {showSaveCard && saved.category !== 'timeout' && (
          <SaveCard
            item={saved} canTimeout={isMissed}
            onRemove={() => { uncapture(q.id); toast(`Removed as ${catById(saved.category).label}`) }}
            onChange={(c) => { recategorise(q.id, c); toast(`Added as ${catById(c).label}`) }}
          />
        )}

        {(reveal || (showAnswers && isMissed && !revisiting)) && (
          <Explanation q={q} onZoom={() => setZoom(true)} />
        )}

        <a className="e6-report-link" href="#report" onClick={e => e.preventDefault()}>Having trouble? Report</a>
      </div>

      <div className="e6-footer">
        {viewIdx > 0 && <button className="e6-back" onClick={back}><Chevron s={16} style={{ transform: 'rotate(180deg)' }} /></button>}
        <button className="e6-btn e6-btn-navy" disabled={!nextEnabled} onClick={next}>
          {revisiting ? 'Next' : last ? 'Finish' : 'Next'}
        </button>
      </div>

      {sheet === 'settings' && (
        <SessionSettings
          time={timePerQ} size={fontSize}
          onApply={(t, s) => { setTimePerQ(t); pendingTime.current = t; setFontSize(s) }}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet === 'overview' && (
        <Overview
          blockName={block.name} questions={questions} statusOf={statusOf}
          showAnswers={showAnswers}
          onSettings={() => setSheet('settings')}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet === 'exit' && (
        <ExitGuard
          isReattempt={isReattempt}
          onStay={() => setSheet(null)}
          onExit={() => onExit({
            attempted: Object.keys(answers).length + Object.keys(missed).length,
            // Everything needed to resume at the exact remaining second.
            snapshot: { answers, missed, remaining, activeIdx, timePerQ, fontSize, elapsed: elapsedRef.current },
          })}
        />
      )}
      {confirmSubmit && (
        <SubmitConfirm onCancel={() => setConfirmSubmit(false)} onSubmit={submit} />
      )}
      {zoom && <ImageZoom onClose={() => setZoom(false)} />}
    </div>
  )
}

// Copy authored on the submission screen in the design file. The PRD (§4.14)
// only says Finish is an explicit tap; this makes the tap doubly explicit,
// which matters most in Show Answers OFF where nothing has been revealed yet.
function SubmitConfirm({ onCancel, onSubmit }) {
  return (
    <div className="e6-scrim" onClick={onCancel}>
      <div className="e6-sheet" onClick={e => e.stopPropagation()}>
        <span className="e6-grip" />
        <div style={{ padding: '22px 24px 26px', textAlign: 'center' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Are you sure you want to submit?</h3>
          <p style={{ fontSize: 11.5, color: 'var(--ink2)', lineHeight: 1.55, margin: '9px 0 20px' }}>
            Once you submit test you can see test result and your report with solution
          </p>
          <button className="e6-btn e6-btn-navy" onClick={onSubmit}>Submit</button>
          <button style={{ marginTop: 14, color: 'var(--blue)', fontSize: 12.5, fontWeight: 600 }} onClick={onCancel}>
            Back to Questions
          </button>
        </div>
      </div>
    </div>
  )
}
