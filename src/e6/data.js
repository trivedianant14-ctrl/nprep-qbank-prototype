// ─────────────────────────────────────────────────────────────────────────────
// QBank Edition 6 — data model
// Mirrors §3 "System model" of the PRD: Edition → Subject → Chapter → Block →
// Question. Everything the content team owns (§M11) lives here as plain data.
// ─────────────────────────────────────────────────────────────────────────────

// Revision List categories — fixed set, always displayed in this order (§3).
export const CATEGORIES = [
  { id: 'wrong',      label: 'Got it Wrong',   color: '#C40000', tint: '#FFF2F2' },
  { id: 'revision',   label: 'Needs Revision', color: '#008DFF', tint: '#EDF7FF' },
  { id: 'important',  label: 'Important',      color: '#008DFF', tint: '#EDF7FF' },
  { id: 'timeout',    label: 'Ran out of time',color: '#B26A00', tint: '#FFF5E3' },
  { id: 'guess',      label: 'Guess',          color: '#6B4EFF', tint: '#F0EDFF' },
]
export const catById = (id) => CATEGORIES.find(c => c.id === id)

// Guess threshold, held server-side per §4.15 — mirrored here as config.
export const SERVER_CONFIG = {
  guessThresholdSec: 12,
  percentileMinCohort: 50,   // §4.27 — also gates option distribution % (§4.12)
  masteryThreshold: 65,      // §4.4 / §4.26
}

// ── Subjects (§4.1) ─────────────────────────────────────────────────────────
// `ordinal` drives the Home hero selection. `pyqAvg` = avg PYQ questions/block.
export const SUBJECTS = [
  { id: 1,  ordinal: 1,  name: 'Foundation of Nursing',        icon: '🧑‍⚕️', blocks: 29, pyqAvg: 16, pyqExam: 'NORCET 2026', done: 5,  accuracy: 72 },
  { id: 2,  ordinal: 2,  name: 'Medical Surgical Nursing',     icon: '🔬', blocks: 29, pyqAvg: 11, done: 15, accuracy: 72 },
  { id: 3,  ordinal: 3,  name: 'Obstetrics and Gynaecology',   icon: '🤰', blocks: 29, pyqAvg: 11, done: 4,  accuracy: 80 },
  { id: 4,  ordinal: 4,  name: 'Pediatrics/ Child Health Nursing', icon: '🧸', blocks: 35, pyqAvg: 0, comingSoon: true, done: 0, accuracy: 0 },
  { id: 5,  ordinal: 5,  name: 'Community Health Nursing',     icon: '🌍', blocks: 35, pyqAvg: 0,  done: 0,  accuracy: 0 },
  { id: 6,  ordinal: 6,  name: 'Anatomy & Physiology',         icon: '🫀', blocks: 35, pyqAvg: 11, done: 0,  accuracy: 0 },
  { id: 7,  ordinal: 7,  name: 'Pharmacology',                 icon: '💊', blocks: 35, pyqAvg: 11, done: 0,  accuracy: 0 },
  { id: 8,  ordinal: 8,  name: 'Psychology',                   icon: '🧠', blocks: 35, pyqAvg: 11, done: 0,  accuracy: 0 },
  { id: 9,  ordinal: 9,  name: 'Research & Statistics',        icon: '📊', blocks: 35, pyqAvg: 11, done: 0,  accuracy: 0 },
  { id: 10, ordinal: 10, name: 'Nursing Management',           icon: '📋', blocks: 35, pyqAvg: 11, done: 0,  accuracy: 0 },
  { id: 11, ordinal: 11, name: 'Pathology & Genetics',         icon: '🧬', blocks: 35, pyqAvg: 11, done: 0,  accuracy: 0 },
  { id: 12, ordinal: 12, name: 'Microbiology',                 icon: '🦠', blocks: 35, pyqAvg: 11, done: 0,  accuracy: 0 },
  { id: 13, ordinal: 13, name: 'Biochemistry & Nutrition',     icon: '🧪', blocks: 35, pyqAvg: 11, done: 0,  accuracy: 0 },
  { id: 14, ordinal: 14, name: 'Sociology',                    icon: '🌐', blocks: 35, pyqAvg: 0,  done: 0,  accuracy: 0 },
  { id: 15, ordinal: 15, name: 'English',                      icon: '📚', blocks: 35, pyqAvg: 0,  done: 0,  accuracy: 0 },
  { id: 16, ordinal: 16, name: 'Computer',                     icon: '💻', blocks: 35, pyqAvg: 0,  done: 0,  accuracy: 0 },
  { id: 17, ordinal: 17, name: 'Non-Nursing Subjects',         icon: '📖', blocks: 35, pyqAvg: 0,  done: 0,  accuracy: 0 },
  { id: 18, ordinal: 18, name: 'Toppers strategy',             icon: '🏆', blocks: 35, pyqAvg: 0,  done: 0,  accuracy: 0 },
  { id: 19, ordinal: 19, name: 'Image based questions',        icon: '🖼️', blocks: 35, pyqAvg: 0,  done: 0,  accuracy: 0 },
  { id: 20, ordinal: 20, name: 'Forensic Nursing & Indian laws', icon: '⚖️', blocks: 35, pyqAvg: 0, done: 0, accuracy: 0 },
]

// ── Chapters and blocks (§4.5) ──────────────────────────────────────────────
// The prototype models one fully-authored subject (Applied Anatomy, id 1);
// every other subject reuses the same block shape with no per-student state.
export const CHAPTERS = [
  { id: 1, subjectId: 1, ordinal: 1, name: 'Biological Basis of Behaviour', videoId: 'v1' },
  { id: 2, subjectId: 1, ordinal: 2, name: 'Fundamentals of Patient Care',  videoId: null },
  { id: 3, subjectId: 1, ordinal: 3, name: 'Pharmacology Essentials',       videoId: 'v3' },
]

// status: unattempted | paused | completed. `accuracy` is always the FIRST
// attempt's (§3) — reattempts never overwrite it. `cohortSize` = students who
// have made a first attempt; under 50 the percentile is suppressed (§4.27).
export const BLOCKS = [
  { id: 1,  chapterId: 1, ordinal: 1, name: 'Community Health Nursing', questions: 21, free: true, status: 'unattempted', cohortSize: 134 },
  { id: 2,  chapterId: 1, ordinal: 2, name: 'Skeletal System',       questions: 21, free: true,  status: 'completed', accuracy: 73 },
  { id: 3,  chapterId: 1, ordinal: 3, name: 'Muscular System',       questions: 21, free: false, status: 'completed', accuracy: 73 },
  // Newly published — only 12 students have a first attempt, so this block
  // exercises the percentile-suppressed layouts (Screen 23).
  { id: 4,  chapterId: 1, ordinal: 4, name: 'Nervous System',        questions: 21, free: true,  status: 'unattempted', cohortSize: 12 },
  { id: 5,  chapterId: 2, ordinal: 1, name: 'Anatomical Terms',      questions: 21, free: false, status: 'paused', attempted: 10 },
  { id: 6,  chapterId: 2, ordinal: 2, name: 'Skeletal System',       questions: 21, free: false, status: 'unattempted' },
  { id: 7,  chapterId: 2, ordinal: 3, name: 'Body Planes',           questions: 21, free: false, status: 'unattempted' },
  { id: 8,  chapterId: 2, ordinal: 4, name: 'Directional Terms',     questions: 21, free: false, status: 'unattempted' },
  { id: 9,  chapterId: 3, ordinal: 1, name: 'Muscular System',       questions: 21, free: false, status: 'unattempted' },
  { id: 10, chapterId: 3, ordinal: 2, name: 'Nervous System',        questions: 21, free: false, status: 'unattempted' },
  { id: 11, chapterId: 3, ordinal: 3, name: 'Cardiovascular System', questions: 21, free: false, status: 'unattempted' },
  { id: 12, chapterId: 3, ordinal: 4, name: 'Respiratory System',    questions: 21, free: false, status: 'unattempted' },
]

// ── Chapter Index sheet (§4.7) ──────────────────────────────────────────────
export const CHAPTER_INDEX = [
  'Introduction to Anatomical Terms',
  'Fundamentals of Anatomical Terminology',
  'Directional Terms in Anatomy',
  'Body Planes and Sections',
  'Regional Anatomy Overview',
  'Anatomical Position and Movements',
  'Skeletal Terminology',
  'Muscle Anatomy and Terminology',
  'Nervous System Terminology',
]

// ── Study plan timeline (§4.8) — authored by the content team ───────────────
export const STUDY_PLAN = {
  days: 10,
  subject: 'Applied Anatomy',
  chaptersDone: 1,
  chaptersTotal: 6,
  nodes: [
    { range: 'Day 1–2', chapter: 'Anatomical Terms',      rationale: 'Start here — foundation for everything.', ques: 20, state: 'done' },
    { range: 'Day 3–4', chapter: 'Skeletal System',       rationale: 'High-yield PYQ zone.',                    ques: 30, state: 'done' },
    { range: 'Day 5',   chapter: 'Muscular System',       rationale: 'Focus on muscle actions.',                ques: 30, state: 'current' },
    { range: 'Day 6–7', chapter: 'Cardiovascular System', rationale: 'Focus on muscle actions.',                ques: 30, state: 'upcoming' },
    { range: 'Day 8',   chapter: 'Respiratory System',    rationale: 'Focus on muscle actions.',                ques: 30, state: 'upcoming' },
    { range: 'Day 9',   chapter: 'Nervous System',        rationale: 'Focus on muscle actions.',                ques: 30, state: 'upcoming' },
  ],
}

// ── About QBank sheet (§4.4) ────────────────────────────────────────────────
export const ABOUT_ROWS = [
  { id: 'about',  title: 'About QBank',       body: 'QBank helps you master every nursing topic through focused, topic-wise practice.' },
  { id: 'modes',  title: 'Attempt Modes',     body: 'Choose to see answers after each question or after completing the entire QBank.' },
  { id: 'target', title: 'Mastery Target',    body: 'Score 65% or higher before moving to the next QBank. If you score below 65%, revise the topic and reattempt it.' },
  { id: 'report', title: 'Detailed Analysis', body: 'Review your performance, percentile, accuracy, and detailed analysis after every QBank.' },
]

// ── Learning-content mapping per chapter (§M11) ─────────────────────────────
export const LEARNING_CARD = { title: 'Vital Signs — the basics', meta: '20min • 28 lessons' }
export const NEXT_QBANK    = { title: 'QBank: Medical Surgical Nursing', meta: '48 Questions' }

// ── Questions ───────────────────────────────────────────────────────────────
// Option `pct` = share of all students who picked that option; the four values
// sum to 100 and only render once the 50-student floor is met (§4.12).
const REFS = {
  books: [
    { name: 'Ross & Willson - Anatomy and physiology,', detail: 'Edition 4th, Page 22,28' },
    { name: 'BD Chaurasia Handbook of General Anatomy,', detail: 'Edition 3th, Page 56, 39, 88' },
  ],
  videos: [
    { name: 'Medical Surgical Nursing', dur: '15:00 Mins' },
    { name: 'Fundamental Of Anatomy',   dur: '34:40 Mins' },
    { name: 'The Chapter Name',         dur: '18:24 Mins' },
  ],
}

const WHY_WRONG_DEFAULT = [
  { title: 'Adduction brings',    body: 'Adduction brings the limb TOWARD the midline — the opposite of abduction. The prefix "ad-" means toward (add, adjacent), while "ab-" means away (absent, abnormal, abduct).' },
  { title: 'Flexion decreases',   body: 'Flexion decreases the angle at a joint (bending). It describes rotational movement around a joint, not movement relative to the midline.' },
  { title: 'Extension increases', body: 'Extension increases the angle at a joint (straightening). Like flexion, it describes joint angle changes — not movement toward or away from the midline.' },
]

const CLINICAL_DEFAULT = [
  'Accurate use of anatomical terms is fundamental for clear and unambiguous communication in all healthcare settings. It ensures that when a nurse documents a finding, or a surgeon describes a location, everyone understands the exact position.',
  'What if? If the question asked for the relationship between the ear and the nose, the correct answer would be that the ear is lateral to the nose, as it is further from the body\'s midline.',
]

const APPROACH_DEFAULT = [
  'First, identify the two structures mentioned: the nose and the chin.',
  'Second, visualize these structures on a human face or your own face.',
  'Third, determine their relative position along the vertical (head-to-toe) axis.',
  'Finally, recall the definitions of the directional terms provided in the options. \'Superior\' means \'above\', and \'inferior\' means \'below\'. Select the term that accurately reflects the position of the nose in relation to the chin.',
]

const CONCEPT_DEFAULT = [
  'This question tests your knowledge of basic anatomical directional terms, specifically relative positions on the vertical axis of the body.',
]
const KEYWORDS_DEFAULT = ['Anatomical terms', 'directional terms', 'superior', 'inferior', 'relative position']

function q(id, over) {
  return {
    id,
    qcode: 'Q824123' + id,
    difficulty: 'Moderate',
    text: 'Which drug class is most commonly used as a first-line treatment for hypertension in patients with heart failure?',
    options: [
      { id: 'A', text: 'Calcium channel blockers', pct: 20 },
      { id: 'B', text: 'ACE inhibitors',           pct: 60 },
      { id: 'C', text: 'Beta-blockers (as monotherapy)', pct: 12 },
      { id: 'D', text: 'Alpha-1 blockers',         pct: 8 },
    ],
    correct: 'B',
    explanation: 'ACE **inhibitors** reduce afterload and prevent cardiac remodeling. They are first-line in **hypertensive** heart failure patients and have a proven **mortality benefit** in this population.',
    whyWrong: WHY_WRONG_DEFAULT,
    visual: { title: 'Shoulder Anatomy (Axillary Nerve)', src: '/img/e6-shoulder.svg' },
    clinical: CLINICAL_DEFAULT,
    approach: APPROACH_DEFAULT,
    concept: CONCEPT_DEFAULT,
    keywords: KEYWORDS_DEFAULT,
    refs: REFS,
    pyq: ['PYQ 2026'],
    hindiAudio: true,
    hindiText: true,
    glossary: {
      'inhibitors': 'ACE inhibitors reduce afterload and prevent cardiac remodeling. They are first-line in hypertensive heart failure patients and have a proven mortality benefit in this population.',
      'hypertensive': 'Relating to abnormally high blood pressure. Sustained systolic ≥140 mmHg or diastolic ≥90 mmHg on repeated measurement.',
      'mortality benefit': 'A demonstrated reduction in death rate attributable to a treatment, established in randomised controlled trials.',
    },
    ...over,
  }
}

export const QUESTIONS = [
  q(1, {
    difficulty: 'Easy',
    pyq: ['NORCET 2025', 'AIIMS 2021', 'AIIMS 2022', 'AIIMS 2023', 'AIIMS 2021'],
  }),
  q(2,  { difficulty: 'Easy' }),
  q(3,  { difficulty: 'Easy', pyq: ['NORCET 2025', 'AIIMS 2021'] }),
  q(4,  { difficulty: 'Easy' }),
  q(5,  { difficulty: 'Easy', pyq: [] }),
  q(6,  { difficulty: 'Easy' }),
  q(7,  { difficulty: 'Moderate' }),
  q(8,  { difficulty: 'Moderate', pyq: ['NORCET 2024'] }),
  q(9,  { difficulty: 'Moderate' }),
  q(10, { difficulty: 'Moderate', pyq: [] }),
  q(11, { difficulty: 'Moderate' }),
  q(12, { difficulty: 'Difficult' }),
  q(13, { difficulty: 'Difficult', pyq: ['AIIMS 2023'] }),
  q(14, { difficulty: 'Difficult' }),
  q(15, { difficulty: 'Difficult', pyq: [] }),
]

// ── Cohort / percentile (§4.27) ─────────────────────────────────────────────
// Deterministic pseudo-random cohort so percentile is stable across renders.
function mulberry32(seed) {
  let a = seed
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const COHORT = (() => {
  const rand = mulberry32(20260729)
  const size = 134   // ≥ 50, so percentile and option % both render
  const scores = Array.from({ length: size }, () => {
    const bell = (rand() + rand() + rand()) / 3
    return Math.max(0, Math.min(100, Math.round(bell * 70 + 18)))
  })
  return { size, scores }
})()

// Only first attempts enter the cohort, and a student's position is her first
// attempt's score — so the percentile reads the same on every attempt (§4.27).
// `cohortSize` is per block — the number of students who have made a FIRST
// attempt at it. Below the 50-student floor the percentile is not rendered and
// the stats row reflows (§4.27); the same floor gates the option distribution
// percentages on the question card (§4.12).
export function computePercentile(firstAttemptAccuracy, cohortSize = COHORT.size) {
  if (cohortSize < SERVER_CONFIG.percentileMinCohort) return null
  const pool = COHORT.scores.slice(0, cohortSize)
  const below = pool.filter(s => s < firstAttemptAccuracy).length
  return Math.round((below / pool.length) * 100)
}

export const blockCohort = (blockId) =>
  BLOCKS.find(b => b.id === blockId)?.cohortSize ?? COHORT.size

// ── Accuracy bands (§4.26) ──────────────────────────────────────────────────
export function accuracyBand(acc) {
  if (acc === 100) return {
    key: 'perfect',
    headline: 'Outstanding! You really know your stuff.',
    ring: '#2CC491',
    showIncorrect: false,
    advisory: "You've hit 100%. Keep the streak going by practicing the next set.",
    cta: 'next',
  }
  if (acc >= 65) return {
    key: 'good',
    headline: "Good Efforts! You're making great progress.",
    ring: '#2CC491',
    showIncorrect: true,
    advisory: 'Almost there. Understand the few you missed by checking the solutions.',
    cta: 'solutions',
  }
  if (acc >= 30) return {
    key: 'mid',
    headline: "Keep Going! Practice a bit more and you'll nail it",
    ring: '#008DFF',
    showIncorrect: true,
    advisory: 'A stronger foundation will change this score. Start with the basics.',
    cta: 'revise',
  }
  return {
    key: 'low',
    headline: "Don't give up! Every attempt makes you stronger",
    ring: '#FF6B6B',
    showIncorrect: true,
    advisory: 'Every topper started somewhere. Build this one from the fundamentals up.',
    cta: 'learn',
  }
}

// ── Peer comparison copy (§4.29) ────────────────────────────────────────────
export const PEER = { average: 64, topper: 92 }
export function peerMessage(percentile) {
  if (percentile >= PEER.topper) return 'Congratulation! You are topper'
  if (percentile >= PEER.average) return 'Better than most, almost at topper level.'
  return 'Not there yet, keep practicing.'
}

export const STUDENT = { name: 'Priyanka' }
