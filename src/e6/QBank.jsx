import { useState } from 'react'
import './e6.css'
import { QUESTIONS, BLOCKS } from './data'
import Home from './Home'
import BlockList from './BlockList'
import PreAttempt from './PreAttempt'
import Attempt from './Attempt'
import Result from './Result'
import RevisionList from './RevisionList'
import { ReattemptSheet } from './Overlays'

// The block the prototype fully authors. Its 15 questions back every attempt.
const ALL_QIDS = QUESTIONS.map(q => q.id)

export default function QBank({ onTab }) {
  const [screen, setScreen] = useState('home')
  const [blockId, setBlockId] = useState(1)
  const [session, setSession] = useState(null)

  // Per-student state, all in-memory for the prototype.
  const [blocks, setBlocks] = useState({})        // blockId -> { status, accuracy, attempted }
  const [resume, setResume] = useState(null)      // { blockId, attempted }
  const [attempts, setAttempts] = useState([])    // completed attempts, ordered
  const [attemptIdx, setAttemptIdx] = useState(0)
  const [revision, setRevision] = useState([])    // { qId, category, source, ts }
  const [coachSeen, setCoachSeen] = useState(false)
  const [toastMsg, setToastMsg] = useState(null)
  const [reattemptSheet, setReattemptSheet] = useState(false)

  const toast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 2200)
  }

  // §4.16 — a question is captured automatically only once. Later triggers
  // never re-categorise, duplicate, overwrite a manual change, or reset the
  // timestamp, which always reflects when the item was first saved.
  const capture = (qId, category, source = 'auto') => {
    setRevision(list => (list.some(r => r.qId === qId) ? list : [...list, { qId, category, source, ts: Date.now() }]))
  }
  const uncapture = (qId) => setRevision(list => list.filter(r => r.qId !== qId))
  const recategorise = (qId, category) =>
    setRevision(list => list.map(r => (r.qId === qId ? { ...r, category, source: 'manual' } : r)))

  const openBlock = (id) => { setBlockId(id); setScreen('pre') }

  const start = ({ blockId: bid, showAnswers, lang }, opts = {}) => {
    setBlockId(bid)
    setSession({
      blockId: bid, showAnswers, lang,
      questionIds: opts.questionIds || ALL_QIDS,
      paletteIds: ALL_QIDS,
      isReattempt: !!opts.isReattempt,
    })
    setScreen('attempt')
  }

  const finish = ({ answers, missed, questions, timePerQ }) => {
    const correct = questions.filter(q => answers[q.id]?.choice === q.correct).length
    const missedCount = questions.filter(q => missed[q.id]).length
    const incorrect = questions.length - correct - missedCount
    const accuracy = Math.round((correct / questions.length) * 100)

    const spent = questions.reduce((s, q) => s + (answers[q.id]?.seconds ?? timePerQ), 0)
    const byDiff = ['Easy', 'Moderate', 'Difficult'].map(label => {
      const set = questions.filter(q => q.difficulty === label)
      const c = set.filter(q => answers[q.id]?.choice === q.correct).length
      return { label, total: set.length, correct: c, incorrect: set.length - c, acc: set.length ? Math.round((c / set.length) * 100) : 0 }
    })

    const record = {
      blockId, questions, answers, missed,
      correct, incorrect, missedCount, accuracy,
      total: questions.length,
      timeTakenMin: Math.max(1, Math.round(spent / 60)),
      avgTimeMin: (spent / questions.length / 60).toFixed(1),
      timeCorrect: mmss(spent * 0.42), timeIncorrect: mmss(spent * 0.38), timeMissed: mmss(spent * 0.2),
      difficulty: byDiff,
    }

    const next = [...attempts, record]
    setAttempts(next)
    setAttemptIdx(next.length - 1)
    // Accuracy recorded against the block is always the first attempt's (§3).
    setBlocks(b => ({
      ...b,
      [blockId]: { status: 'completed', accuracy: attempts.length ? attempts[0].accuracy : accuracy },
    }))
    setResume(null)
    setSession(null)
    setScreen('result')
  }

  // §4.24 — exiting a first attempt saves it as paused; exiting a reattempt
  // discards it entirely and leaves the block's Completed treatment intact.
  const exitAttempt = ({ attempted }) => {
    if (!session?.isReattempt) {
      setBlocks(b => ({ ...b, [blockId]: { status: 'paused', attempted } }))
      setResume({ blockId, attempted })
    }
    setSession(null)
    setScreen('blocks')
  }

  const startReattempt = (mode) => {
    const a = attempts[attemptIdx]
    const targets = a.questions
      .filter(q => a.missed[q.id] || a.answers[q.id]?.choice !== q.correct)
      .map(q => q.id)
    setReattemptSheet(false)
    start(
      { blockId, showAnswers: true, lang: 'en' },
      { isReattempt: true, questionIds: mode === 'wrong' ? targets : ALL_QIDS },
    )
  }

  const wrongCount = attempts[attemptIdx]
    ? attempts[attemptIdx].questions.filter(q =>
        attempts[attemptIdx].missed[q.id] || attempts[attemptIdx].answers[q.id]?.choice !== q.correct).length
    : 0

  const progress = { blocks, resume, saved: revision, completedBlocks: Object.keys(blocks) }

  return (
    <div className="e6">
      {screen === 'home' && <Home go={setScreen} progress={progress} openBlock={openBlock} onTab={onTab} />}
      {screen === 'blocks' && <BlockList go={setScreen} openBlock={openBlock} progress={progress} isFree />}
      {screen === 'pre' && (
        <PreAttempt blockId={blockId} go={setScreen} start={start}
          coachSeen={coachSeen} dismissCoach={() => setCoachSeen(true)} />
      )}
      {screen === 'attempt' && session && (
        <Attempt
          session={session} onFinish={finish} onExit={exitAttempt}
          revision={revision} capture={capture} uncapture={uncapture}
          recategorise={recategorise} toast={toast}
        />
      )}
      {screen === 'result' && attempts.length > 0 && (
        <Result
          attempts={attempts} attemptIdx={attemptIdx} setAttemptIdx={setAttemptIdx}
          go={setScreen} onReattempt={() => setReattemptSheet(true)}
          revision={revision} uncapture={uncapture} recategorise={recategorise} toast={toast}
        />
      )}
      {screen === 'revision' && <RevisionList revision={revision} go={setScreen} uncapture={uncapture} />}

      {reattemptSheet && (
        <ReattemptSheet wrongCount={wrongCount} onStart={startReattempt} onClose={() => setReattemptSheet(false)} />
      )}

      {toastMsg && <div className="e6-toast">✓ {toastMsg}</div>}
    </div>
  )
}

const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.round(s % 60)).padStart(2, '0')}`
