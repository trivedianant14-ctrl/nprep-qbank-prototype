import { useState } from 'react'
import './e6.css'
import { QUESTIONS, BLOCKS } from './data'
import VariantSwitcher from './VariantSwitcher'
import Home from './Home'
import BlockList from './BlockList'
import PreAttempt from './PreAttempt'
import Attempt from './Attempt'
import Result from './Result'
import RevisionList from './RevisionList'
import { ReattemptSheet } from './Overlays'

// The block the prototype fully authors. Its 15 questions back every attempt.
const ALL_QIDS = QUESTIONS.map(q => q.id)

// The per-student state an "existing user" arrives with. A "new user" starts
// from nothing, which is what separates Home §4.1 from §4.2.
const EXISTING_STATE = {
  // Accuracies land on values a 15-question block can actually produce, so the
  // block row and its results screen agree to the percentage point.
  blocks: {
    2: { status: 'completed', accuracy: 73 },   // 11/15
    3: { status: 'completed', accuracy: 80 },   // 12/15
    5: { status: 'paused', attempted: 10 },
  },
  revision: [
    { qId: 1, category: 'wrong',     source: 'auto',   ts: Date.now() - 1 * 86400000 },
    { qId: 2, category: 'wrong',     source: 'auto',   ts: Date.now() - 2 * 86400000 },
    { qId: 3, category: 'revision',  source: 'manual', ts: Date.now() - 3 * 86400000 },
    { qId: 4, category: 'important', source: 'manual', ts: Date.now() - 3 * 86400000 },
    { qId: 5, category: 'guess',     source: 'auto',   ts: Date.now() - 1 * 86400000 },
    { qId: 6, category: 'timeout',   source: 'auto',   ts: Date.now() - 4 * 86400000 },
  ],
}

// Builds the record the results surface renders. Shared by a real submission
// and by the synthetic attempt a seeded completed block needs.
function buildAttempt({ blockId, questions, answers, missed, timePerQ }) {
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

  return {
    blockId, questions, answers, missed,
    correct, incorrect, missedCount, accuracy,
    total: questions.length,
    timeTakenMin: Math.max(1, Math.round(spent / 60)),
    avgTimeMin: (spent / questions.length / 60).toFixed(1),
    timeCorrect: mmss(spent * 0.42), timeIncorrect: mmss(spent * 0.38), timeMissed: mmss(spent * 0.2),
    difficulty: byDiff,
  }
}

// A block seeded as Completed carries an accuracy but no per-question record.
// Reconstruct one that lands on exactly that accuracy so its results screen,
// detailed report and solutions view all have something real to render.
function synthesizeAttempt(blockId, accuracy) {
  const questions = QUESTIONS
  const rightCount = Math.round((accuracy / 100) * questions.length)
  const answers = {}
  questions.forEach((q, i) => {
    const right = i < rightCount
    const wrong = q.options.find(o => o.id !== q.correct).id
    answers[q.id] = { choice: right ? q.correct : wrong, seconds: 30 + (i % 5) * 4, guess: false }
  })
  return buildAttempt({ blockId, questions, answers, missed: {}, timePerQ: 45 })
}

const seedFor = (userType) =>
  userType === 'existing'
    ? { blocks: { ...EXISTING_STATE.blocks }, revision: [...EXISTING_STATE.revision] }
    : { blocks: {}, revision: [] }

export default function QBank({ onTab }) {
  const [screen, setScreen] = useState('home')
  const [blockId, setBlockId] = useState(1)
  const [session, setSession] = useState(null)

  // Prototype variants — see VariantSwitcher.
  const [plan, setPlanState] = useState('free')
  const [userType, setUserTypeState] = useState('new')

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

  // Switching a variant resets progress to that state — otherwise a new user
  // would inherit the completed blocks of the existing one.
  const applySeed = (nextUserType) => {
    const seed = seedFor(nextUserType)
    setBlocks(seed.blocks)
    setRevision(seed.revision)
    // A seeded pause has no snapshot behind it — Continue routes through
    // pre-attempt so the student sets the mode, rather than resuming mid-block.
    const paused = Object.entries(seed.blocks).find(([, b]) => b.status === 'paused')
    setResume(paused ? { blockId: Number(paused[0]), attempted: paused[1].attempted } : null)
    setAttempts([])
    setAttemptIdx(0)
    setSession(null)
    setCoachSeen(nextUserType === 'existing')  // an existing user has seen it
    setScreen('home')
  }
  const setUserType = (v) => { setUserTypeState(v); applySeed(v) }
  const setPlan = (v) => { setPlanState(v); applySeed(userType) }

  // §4.16 — a question is captured automatically only once. Later triggers
  // never re-categorise, duplicate, overwrite a manual change, or reset the
  // timestamp, which always reflects when the item was first saved.
  const capture = (qId, category, source = 'auto') => {
    setRevision(list => (list.some(r => r.qId === qId) ? list : [...list, { qId, category, source, ts: Date.now() }]))
  }
  const uncapture = (qId) => setRevision(list => list.filter(r => r.qId !== qId))
  const recategorise = (qId, category) =>
    setRevision(list => list.map(r => (r.qId === qId ? { ...r, category, source: 'manual' } : r)))

  // A paused block goes straight back into the attempt — the mode was locked
  // when it started and can only be set on the pre-attempt screen (§4.10).
  const openBlock = (id) => {
    if (resume?.blockId === id && resume.snapshot) { resumeAttempt(); return }

    // A completed block has a score behind it, so tapping it opens its result
    // screen rather than starting the block over.
    const rec = blocks[id]
    if (rec?.status === 'completed') { showResults(id, rec.accuracy); return }

    setBlockId(id)
    setScreen('pre')
  }

  const showResults = (id, accuracy) => {
    setBlockId(id)
    const existing = attempts.filter(a => a.blockId === id)
    if (!existing.length) setAttempts(list => [...list, synthesizeAttempt(id, accuracy)])
    setAttemptIdx(Math.max(0, existing.length - 1))
    setScreen('result')
  }

  const resumeAttempt = () => {
    setBlockId(resume.blockId)
    setSession({ ...resume.session, restore: resume.snapshot })
    setScreen('attempt')
  }

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
    const record = buildAttempt({ blockId, questions, answers, missed, timePerQ })
    const accuracy = record.accuracy

    const next = [...attempts, record]
    const priorForBlock = attempts.filter(a => a.blockId === blockId)
    setAttempts(next)
    setAttemptIdx(priorForBlock.length)
    // Accuracy recorded against the block is always the first attempt's (§3).
    setBlocks(b => ({
      ...b,
      [blockId]: { status: 'completed', accuracy: priorForBlock.length ? priorForBlock[0].accuracy : accuracy },
    }))
    // Only the block just finished stops being resumable — a pause on any
    // other block survives (§4.14).
    setResume(r => (r?.blockId === blockId ? null : r))
    setSession(null)
    setScreen('result')
  }

  // §4.24 — exiting a first attempt saves it as paused; exiting a reattempt
  // discards it entirely and leaves the block's Completed treatment intact.
  const exitAttempt = ({ attempted, snapshot }) => {
    if (!session?.isReattempt && attempted > 0) {
      setBlocks(b => ({ ...b, [blockId]: { status: 'paused', attempted } }))
      // Keep the whole snapshot so the question she left resumes at its exact
      // remaining second, in the mode and at the time-per-question she set.
      setResume({ blockId, attempted, session, snapshot })
    }
    setSession(null)
    setScreen('blocks')
  }

  const startReattempt = (mode) => {
    const a = blockAttempts[attemptIdx]
    const targets = a.questions
      .filter(q => a.missed[q.id] || a.answers[q.id]?.choice !== q.correct)
      .map(q => q.id)
    setReattemptSheet(false)
    start(
      { blockId, showAnswers: true, lang: 'en' },
      { isReattempt: true, questionIds: mode === 'wrong' ? targets : ALL_QIDS },
    )
  }

  const blockAttempts = attempts.filter(a => a.blockId === blockId)
  const selected = blockAttempts[attemptIdx]
  const wrongCount = selected
    ? selected.questions.filter(q => selected.missed[q.id] || selected.answers[q.id]?.choice !== q.correct).length
    : 0

  const progress = {
    blocks, resume, saved: revision,
    completedBlocks: Object.keys(blocks).filter(id => blocks[id].status === 'completed'),
    userType,
  }

  return (
    <div className="e6">
      {screen === 'home' && <Home go={setScreen} progress={progress} openBlock={openBlock} onTab={onTab} />}
      {screen === 'blocks' && (
        <BlockList go={setScreen} openBlock={openBlock} progress={progress} isFree={plan === 'free'} />
      )}
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
      {screen === 'result' && blockAttempts.length > 0 && (
        <Result
          attempts={blockAttempts} attemptIdx={Math.min(attemptIdx, blockAttempts.length - 1)} setAttemptIdx={setAttemptIdx}
          go={setScreen} onReattempt={() => setReattemptSheet(true)}
          revision={revision} uncapture={uncapture} recategorise={recategorise} toast={toast}
        />
      )}
      {screen === 'revision' && <RevisionList revision={revision} go={setScreen} uncapture={uncapture} />}

      {reattemptSheet && (
        <ReattemptSheet wrongCount={wrongCount} onStart={startReattempt} onClose={() => setReattemptSheet(false)} />
      )}

      {toastMsg && <div className="e6-toast">✓ {toastMsg}</div>}

      <VariantSwitcher plan={plan} setPlan={setPlan} userType={userType} setUserType={setUserType} />
    </div>
  )
}

const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.round(s % 60)).padStart(2, '0')}`
