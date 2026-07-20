export const SUBJECTS = [
  { id: 1, name: 'Applied Anatomy', edition: 'E5', total: 240, done: 65, accuracy: 72, active: true },
  { id: 2, name: 'Applied Physiology', edition: 'E5', total: 180, done: 0, accuracy: 0, active: false },
  { id: 3, name: 'Biochemistry', edition: 'E4', total: 120, done: 0, accuracy: 0, active: false },
  { id: 4, name: 'Community Health Nursing', edition: 'E5', total: 200, done: 30, accuracy: 55, active: false },
  { id: 5, name: 'Fundamentals of Nursing', edition: 'E5', total: 220, done: 110, accuracy: 80, active: false },
  { id: 6, name: 'Medical-Surgical Nursing', edition: 'E5', total: 320, done: 45, accuracy: 62, active: false },
  { id: 7, name: 'Mental Health Nursing', edition: 'E4', total: 140, done: 0, accuracy: 0, active: false },
  { id: 8, name: 'Obstetric Nursing', edition: 'E5', total: 180, done: 20, accuracy: 68, active: false },
  { id: 9, name: 'Pediatric Nursing', edition: 'E5', total: 160, done: 0, accuracy: 0, active: false },
  { id: 10, name: 'Pharmacology', edition: 'E5', total: 200, done: 80, accuracy: 76, active: false },
]

export const CHAPTERS = [
  { id: 1, name: 'Anatomical Terms', topics: 4, qs: 21, marks: 21, difficulty: 'easy', state: 'unattempted', vid: true },
  { id: 2, name: 'Skeletal System', topics: 6, qs: 30, marks: 30, difficulty: 'moderate', state: 'paused', prog: { done: 14, total: 30 }, vid: true },
  { id: 3, name: 'Muscular System', topics: 5, qs: 25, marks: 25, difficulty: 'moderate', state: 'completed', res: { correct: 18, total: 25, pct: 87, ahead: 87 }, vid: true },
  { id: 4, name: 'Nervous System', topics: 8, qs: 40, marks: 40, difficulty: 'difficult', state: 'unattempted', vid: false },
  { id: 5, name: 'Cardiovascular System', topics: 5, qs: 28, marks: 28, difficulty: 'moderate', state: 'unattempted', vid: true },
  { id: 6, name: 'Respiratory System', topics: 4, qs: 22, marks: 22, difficulty: 'moderate', state: 'unattempted', vid: true },
]

export const TOPICS = [
  { id: 1, name: 'Body Movements & Terminology', qs: 6, pyqs: 2 },
  { id: 2, name: 'Body Planes & Sections', qs: 5, pyqs: 1 },
  { id: 3, name: 'Directional Terminology', qs: 6, pyqs: 3 },
  { id: 4, name: 'Body Cavities', qs: 4, pyqs: 0 },
]

// Deterministic pseudo-random generator (mulberry32) — used to simulate a stable
// cohort score distribution without a backend. Same seed always produces the same numbers.
function mulberry32(seed) {
  let a = seed
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Mock cohort of students who've completed Chapter 1 (Anatomical Terms), used to
// compute percentile. Scores cluster around a plausible mean with natural spread.
export const COHORT = (() => {
  const rand = mulberry32(20260713)
  const completed = 134
  const scores = Array.from({ length: completed }, () => {
    // Sum of 3 uniform draws approximates a bell curve, scaled to 0-100
    const bell = (rand() + rand() + rand()) / 3
    return Math.max(0, Math.min(100, Math.round(bell * 70 + 15)))
  })
  return { completed, threshold: 100, scores }
})()

export function computePercentile(accuracy) {
  if (COHORT.completed < COHORT.threshold) return null
  const below = COHORT.scores.filter(s => s < accuracy).length
  return Math.round((below / COHORT.scores.length) * 100)
}

export const QUESTIONS = [
  {
    id: 1,
    topicId: 1,
    topicName: 'Body Movements & Terminology',
    difficulty: 'easy',
    text: 'Which anatomical term describes movement of a limb away from the midline of the body?',
    options: [
      { id: 'a', text: 'Adduction', pct: 18 },
      { id: 'b', text: 'Abduction', pct: 67 },
      { id: 'c', text: 'Flexion', pct: 10 },
      { id: 'd', text: 'Extension', pct: 5 },
    ],
    correct: 'b',
    explanation: 'Abduction refers to the movement of a limb or body part away from the midline of the body. It is the anatomical opposite of adduction, which brings the limb toward the midline. Common examples include raising the arms sideways or spreading the fingers apart.',
    distractors: [
      { optId: 'a', reason: 'Adduction brings the limb TOWARD the midline — the opposite of abduction. The prefix "ad-" means toward (add, adjacent), while "ab-" means away (absent, abnormal, abduct).' },
      { optId: 'c', reason: 'Flexion decreases the angle at a joint (bending). It describes rotational movement around a joint, not movement relative to the midline.' },
      { optId: 'd', reason: 'Extension increases the angle at a joint (straightening). Like flexion, it describes joint angle changes — not movement toward or away from the midline.' },
    ],
    approach: 'Focus on the Latin prefix: "ab-" = away from (abnormal, absent, abduct). "ad-" = toward (add, adjacent, adduct). When you see any anatomical movement term, split it into prefix + root. This works for abduction, adduction, abductor muscles, and more.',
    referenceBook: { name: "Gray's Anatomy", edition: '41st Edition', page: 84 },
    visual: '/img/visual-movements.svg',
    clinical: 'Range-of-motion (ROM) exercises are a core nursing intervention for immobilised patients. Correctly documenting "shoulder abduction to 90°" vs "adduction contracture" guides physiotherapy and helps assess recovery after stroke or hip arthroplasty. Nurses must distinguish these terms precisely in care plans.',
    glossary: {
      'Abduction': 'Movement of a limb AWAY from the midline. From Latin "ab-" (away from). Example: raising your arms sideways out from the body.',
      'adduction': 'Movement of a limb TOWARD the midline. The direct opposite of abduction. From Latin "ad-" (toward). Example: bringing arms back to your sides.',
      'midline': 'An imaginary vertical line dividing the body into equal left and right halves, used as the central reference axis for directional movements.',
    },
    isPYQ: true,
    pyqExam: 'NORCET',
    pyqYear: 2023,
    learnTopic: 'Body Movements',
  },
  {
    id: 2,
    topicId: 2,
    topicName: 'Body Planes & Sections',
    difficulty: 'moderate',
    text: 'The sagittal plane divides the body into which two sections?',
    options: [
      { id: 'a', text: 'Superior and Inferior halves', pct: 12 },
      { id: 'b', text: 'Anterior and Posterior halves', pct: 23 },
      { id: 'c', text: 'Left and Right halves', pct: 58 },
      { id: 'd', text: 'Medial and Lateral sections', pct: 7 },
    ],
    correct: 'c',
    explanation: 'The sagittal plane is a vertical plane that runs front to back, dividing the body into left and right sections. The midsagittal (median) plane divides the body into equal left and right halves. The parasagittal plane divides the body into unequal left and right portions.',
    distractors: [
      { optId: 'a', reason: 'Superior and inferior halves are created by the transverse (horizontal) plane, which runs parallel to the ground — not the sagittal plane.' },
      { optId: 'b', reason: 'Anterior and posterior halves are created by the coronal (frontal) plane, which runs side to side vertically. The sagittal plane runs front to back instead.' },
      { optId: 'd', reason: 'Medial and lateral are directional terms, not section names produced by the sagittal plane. The sagittal plane does run along the medial axis, but it produces left and right sections.' },
    ],
    approach: 'Match the plane to its axis of cut: Sagittal = front-to-back cut → Left/Right. Coronal = side-to-side cut → Anterior/Posterior. Transverse = horizontal cut → Superior/Inferior. Memory trick: "Sagittal Splits Left and Right."',
    referenceBook: { name: 'Clinical Anatomy by Regions', edition: '9th Edition', page: 12 },
    visual: '/img/visual-planes.svg',
    clinical: 'CT and MRI reports describe anatomy using these planes daily. When a physician requests "a sagittal MRI of the lumbar spine," understanding the plane helps you position the patient correctly, interpret the report, and relay findings accurately to the care team.',
    glossary: {
      'sagittal plane': 'A vertical plane running front-to-back that divides the body into left and right sections. The midsagittal plane creates equal halves.',
      'midsagittal': 'A sagittal plane running exactly through the midline, dividing the body into two perfectly equal left and right halves.',
      'parasagittal': 'Any sagittal plane that does NOT pass through the midline, producing unequal left and right sections.',
    },
    isPYQ: false,
    pyqExam: null,
    pyqYear: null,
    learnTopic: 'Body Planes',
  },
  {
    id: 3,
    topicId: 3,
    topicName: 'Directional Terminology',
    difficulty: 'moderate',
    text: 'In anatomical terminology, which term correctly describes the position of the heart relative to the stomach?',
    options: [
      { id: 'a', text: 'Inferior to the stomach', pct: 15 },
      { id: 'b', text: 'Posterior to the stomach', pct: 20 },
      { id: 'c', text: 'Superior to the stomach', pct: 55 },
      { id: 'd', text: 'Lateral to the stomach', pct: 10 },
    ],
    correct: 'c',
    explanation: "The heart is located superior (above) to the stomach in standard anatomical position. The heart lies in the thoracic cavity while the stomach is in the abdominal cavity. 'Superior' in anatomical terminology refers to a position closer to the head.",
    distractors: [
      { optId: 'a', reason: 'The heart is ABOVE the stomach, not below it. The thoracic cavity (heart) sits superior to the abdominal cavity (stomach) — they are separated by the diaphragm.' },
      { optId: 'b', reason: 'The heart and stomach are not primarily in a posterior-anterior relationship. Both sit centrally in the trunk. The question tests their vertical (head-to-foot) relationship, where superior/inferior is the correct category.' },
      { optId: 'd', reason: 'Lateral means to the side. The heart is a midline structure and is not lateral to the stomach. The question asks about their vertical positioning, not side-to-side.' },
    ],
    approach: 'First identify the type of directional relationship: vertical (superior/inferior), front-back (anterior/posterior), or side (medial/lateral). Here, the heart is in the CHEST and the stomach is in the ABDOMEN. Chest is above the abdomen — so the correct directional term is superior.',
    referenceBook: { name: "Moore's Clinically Oriented Anatomy", edition: '8th Edition', page: 28 },
    visual: '/img/visual-planes.svg',
    clinical: 'Precise directional language prevents errors in clinical documentation. Describing a wound as "3 cm superior to the umbilicus" is unambiguous across all clinicians. This matters in wound care charting, IV site documentation, surgical referrals, and handover communication.',
    glossary: {
      'superior': 'A directional term meaning above or closer to the head end of the body. Opposite of inferior (below). Example: the heart is superior to the stomach.',
      'thoracic cavity': 'The chest cavity bounded by the rib cage, sternum, and diaphragm. Contains the heart, lungs, trachea, esophagus, and major blood vessels.',
      'abdominal cavity': 'The cavity below the diaphragm containing the stomach, liver, intestines, kidneys, and spleen. NOT the heart or lungs.',
    },
    isPYQ: true,
    pyqExam: 'AIIMS',
    pyqYear: 2022,
    learnTopic: 'Directional Terms',
  },
  {
    id: 4,
    topicId: 1,
    topicName: 'Body Movements & Terminology',
    difficulty: 'easy',
    text: 'In standard anatomical position, the palms of the hands face which direction?',
    options: [
      { id: 'a', text: 'Posteriorly (backward)', pct: 8 },
      { id: 'b', text: 'Anteriorly (forward)', pct: 72 },
      { id: 'c', text: 'Medially (inward)', pct: 14 },
      { id: 'd', text: 'Laterally (outward)', pct: 6 },
    ],
    correct: 'b',
    explanation: 'In standard anatomical position, the body stands erect with feet together, arms at the sides, and palms facing anteriorly (forward). This is the reference position from which all anatomical descriptions and directional terms are derived.',
    distractors: [
      { optId: 'a', reason: 'Palms facing posteriorly (backward) would be the natural relaxed position — but standard anatomical position specifically rotates the forearms so the palms face FORWARD (anteriorly). This is a key distinction.' },
      { optId: 'c', reason: 'Medially means toward the body midline (palms facing each other). In anatomical position the palms face forward (anteriorly), not toward the midline.' },
      { optId: 'd', reason: 'Laterally means away from the midline (palms facing outward/sideways). In anatomical position the palms face forward (anteriorly), not to the sides.' },
    ],
    approach: 'Memorize the standard anatomical position as a fixed mental image: standing upright, facing forward, feet together, arms at sides with PALMS FORWARD (supinated). Every directional term in anatomy is defined relative to this position. When in doubt, return to this mental picture.',
    referenceBook: { name: "Gray's Anatomy", edition: '41st Edition', page: 3 },
    visual: '/img/visual-movements.svg',
    clinical: 'All physical assessment documentation assumes standard anatomical position. When a nurse writes "tenderness 4 cm inferior to the right clavicle," both the recording nurse and any reviewing clinician must share the same reference frame. Deviations from this convention cause dangerous miscommunication.',
    glossary: {
      'anatomical position': 'The standard body reference position: standing erect, facing forward, feet together, arms at sides with palms facing anteriorly. All directional terms are defined relative to this position.',
      'anteriorly': 'Toward the front of the body. In anatomical position, palms face anteriorly (forward). Synonymous with "ventrally".',
      'erect': 'Standing upright in the vertical position with the spine straight. Anatomical descriptions assume this posture.',
    },
    isPYQ: true,
    pyqExam: 'NORCET',
    pyqYear: 2024,
    learnTopic: 'Anatomical Position',
  },
  {
    id: 5,
    topicId: 3,
    topicName: 'Directional Terminology',
    difficulty: 'easy',
    text: 'Which term refers to the front surface of the body in standard anatomical position?',
    options: [
      { id: 'a', text: 'Dorsal', pct: 18 },
      { id: 'b', text: 'Posterior', pct: 22 },
      { id: 'c', text: 'Anterior / Ventral', pct: 52 },
      { id: 'd', text: 'Inferior', pct: 8 },
    ],
    correct: 'c',
    explanation: "The anterior (or ventral) surface refers to the front of the body. Posterior (or dorsal) refers to the back. These paired terms are used extensively in clinical anatomy — for example, the anterior cruciate ligament (ACL) is located on the front side of the knee joint.",
    distractors: [
      { optId: 'a', reason: 'Dorsal means the BACK surface (posterior). Think of a fish\'s dorsal fin on its back — same concept. Anterior and ventral are the correct terms for the front of the body.' },
      { optId: 'b', reason: 'Posterior is the BACK surface of the body — the direct opposite of anterior/ventral. This is a classic paired opposite: anterior ↔ posterior, ventral ↔ dorsal.' },
      { optId: 'd', reason: 'Inferior refers to a position closer to the feet — it is a vertical positional term, not a surface descriptor. The question asks which surface is the front (anterior/ventral vs posterior/dorsal), not a vertical position.' },
    ],
    approach: 'Learn directional terms in pairs: Anterior/Ventral (front) ↔ Posterior/Dorsal (back). Superior (head end) ↔ Inferior (feet end). Medial (toward midline) ↔ Lateral (away from midline). Recognising these pairs makes elimination much faster in exams.',
    referenceBook: { name: 'Principles of Anatomy and Physiology', edition: '15th Edition', page: 17 },
    visual: '/img/visual-planes.svg',
    clinical: 'The anterior cruciate ligament (ACL) is among the most common sports injuries managed in orthopedic nursing. Knowing "anterior" refers to the front of the knee lets you understand injury mechanics, accurately explain anatomy to patients, and correctly implement post-op rehabilitation and weight-bearing protocols.',
    glossary: {
      'anterior': 'The front surface of the body. Synonymous with ventral. Opposite of posterior (back). Example: the anterior surface of the hand is the palm side.',
      'ventral': 'Relating to the front or belly side of the body. Synonymous with anterior. Opposite of dorsal (back).',
      'dorsal': 'Relating to the back surface of the body. Think of a fish\'s dorsal fin on its back. In human anatomy, synonymous with posterior.',
    },
    isPYQ: true,
    pyqExam: 'NORCET',
    pyqYear: 2023,
    learnTopic: 'Directional Terms',
  },
  {
    id: 6,
    topicId: 4,
    topicName: 'Body Cavities',
    difficulty: 'moderate',
    text: 'Which body cavity houses both the heart and lungs?',
    options: [
      { id: 'a', text: 'Abdominal cavity', pct: 10 },
      { id: 'b', text: 'Pelvic cavity', pct: 5 },
      { id: 'c', text: 'Thoracic cavity', pct: 78 },
      { id: 'd', text: 'Cranial cavity', pct: 7 },
    ],
    correct: 'c',
    explanation: 'The thoracic cavity is located within the chest and is bounded by the rib cage, sternum, thoracic vertebrae, and diaphragm. It contains the heart (in the pericardial cavity), both lungs (in pleural cavities), esophagus, trachea, and major blood vessels.',
    distractors: [
      { optId: 'a', reason: 'The abdominal cavity contains digestive organs (stomach, liver, intestines, kidneys, spleen) but NOT the heart or lungs. It is located below the diaphragm, while the heart and lungs are above it in the thoracic cavity.' },
      { optId: 'b', reason: 'The pelvic cavity contains the bladder, rectum, and reproductive organs. It is the lowest body cavity, far removed from the heart and lungs.' },
      { optId: 'd', reason: 'The cranial cavity is within the skull and contains only the brain. It is part of the dorsal body cavity, completely separate from the ventral thoracic cavity where the heart and lungs reside.' },
    ],
    approach: 'Divide the body into two major cavity groups: Dorsal (cranial + spinal) and Ventral (thoracic + abdominopelvic). The diaphragm separates thoracic from abdominal. When asked which cavity holds the heart AND lungs together — always thoracic.',
    referenceBook: { name: "Gray's Anatomy", edition: '41st Edition', page: 52 },
    visual: '/img/visual-cavities.svg',
    clinical: 'Critical care procedures directly target thoracic cavity structures: chest tube insertion drains the pleural space, pericardiocentesis removes pericardial fluid, and intubation navigates the thoracic airway. Knowing the exact boundaries and contents of this cavity prevents procedural errors and helps anticipate complications.',
    glossary: {
      'thoracic cavity': 'The chest cavity bounded by the rib cage, sternum, thoracic vertebrae, and diaphragm. Contains the heart and both lungs.',
      'pericardial cavity': 'The fluid-filled space surrounding the heart, enclosed within the pericardium (a double-walled protective sac).',
      'pleural cavities': 'Two separate serous cavities, each enclosing one lung. They contain pleural fluid that allows friction-free lung movement during breathing.',
      'diaphragm': 'A dome-shaped skeletal muscle that forms the floor of the thoracic cavity. Its contraction during inhalation increases thoracic volume, drawing air into the lungs.',
    },
    isPYQ: false,
    pyqExam: null,
    pyqYear: null,
    learnTopic: 'Body Cavities',
  },
  {
    id: 7,
    topicId: 5,
    topicName: 'Cardiovascular System',
    difficulty: 'difficult',
    text: 'Based on the diagram, identify the cardiac chamber marked ★. This chamber receives oxygenated blood directly from the pulmonary veins.',
    options: [
      { id: 'a', text: 'Right Atrium (RA)', pct: 12 },
      { id: 'b', text: 'Right Ventricle (RV)', pct: 15 },
      { id: 'c', text: 'Left Atrium (LA)', pct: 62 },
      { id: 'd', text: 'Left Ventricle (LV)', pct: 11 },
    ],
    correct: 'c',
    visual: '/img/visual-heart.svg',
    explanation: 'The Left Atrium (LA) receives oxygenated blood from all four pulmonary veins after blood is oxygenated in the lungs. It then passes blood through the mitral (bicuspid) valve into the Left Ventricle, which pumps it to the entire body via the aorta.',
    distractors: [
      { optId: 'a', reason: 'The Right Atrium (RA) receives deoxygenated blood from the body via the superior and inferior vena cava — not oxygenated blood from pulmonary veins.' },
      { optId: 'b', reason: 'The Right Ventricle (RV) pumps deoxygenated blood to the lungs via the pulmonary artery. It plays no role in receiving blood from pulmonary veins.' },
      { optId: 'd', reason: 'The Left Ventricle (LV) receives blood FROM the Left Atrium (via the mitral valve) and pumps it to the body. The pulmonary veins drain into the LA, not LV.' },
    ],
    approach: 'Trace oxygenated blood flow: Lungs → Pulmonary veins → Left Atrium (LA) → Mitral valve → Left Ventricle (LV) → Aorta → Body. Pulmonary veins always drain into the LA.',
    referenceBook: { name: "Gray's Anatomy", edition: '41st Edition', page: 992 },
    isPYQ: false,
    pyqExam: null,
    pyqYear: null,
    learnTopic: 'Cardiac Anatomy',
  },
]

export const TOPPER = {
  name: 'Priya Sharma',
  rank: 'AIR 1',
  exam: 'NORCET 2024',
  quote: 'I solved 1,200+ QBank questions in 90 days. Reviewing wrong answers daily was the real game-changer.',
  strategy: 'QBank every morning, videos every evening. No shortcuts.',
  // Reference stats for this chapter, used in the result-screen comparison chart
  stats: { correct: 7, incorrect: 0, total: 7, accuracy: 100, timeTakenSec: 210 },
}

export const VIDEO_SUBJECTS = [
  { id: 1, name: 'Medical Surgical Nursing', tutor: 'Amar Singhal', year: 2, totalLectures: 8, watched: 5 },
  { id: 2, name: 'Applied Anatomy', tutor: 'Aman Singhal', year: 1, totalLectures: 5, watched: 2 },
  { id: 3, name: 'Fundamentals of Nursing', tutor: 'Priya Sharma', year: 1, totalLectures: 6, watched: 0 },
  { id: 4, name: 'Community Health Nursing', tutor: 'Ravi Kumar', year: 3, totalLectures: 4, watched: 4 },
  { id: 5, name: 'Obstetric Nursing', tutor: 'Sunita Patel', year: 4, totalLectures: 5, watched: 1 },
  { id: 6, name: 'Applied Physiology', tutor: 'Dr. Mehta', year: 1, totalLectures: 7, watched: 7 },
  { id: 7, name: 'Mental Health Nursing', tutor: 'Rekha Iyer', year: 3, totalLectures: 5, watched: 0 },
  { id: 8, name: 'Pediatric Nursing', tutor: 'Kavita Joshi', year: 3, totalLectures: 6, watched: 2 },
  { id: 9, name: 'Pharmacology', tutor: 'Dr. Nair', year: 2, totalLectures: 9, watched: 3 },
  { id: 10, name: 'Biochemistry', tutor: 'Dr. Gupta', year: 1, totalLectures: 5, watched: 0 },
  { id: 11, name: 'Nutrition & Dietetics', tutor: 'Anita Singh', year: 1, totalLectures: 4, watched: 4 },
  { id: 12, name: 'Geriatric Nursing', tutor: 'Dr. Patel', year: 4, totalLectures: 3, watched: 0 },
]

export const VIDEO_CHAPTERS = [
  {
    id: 1, subjectId: 2, name: 'Anatomical Terms',
    videos: [
      { id: 101, title: 'Introduction to Anatomical Terms', duration: '12:00', watched: true },
      { id: 102, title: 'Body Planes & Directional Terms', duration: '14:30', watched: false },
    ]
  },
  {
    id: 2, subjectId: 2, name: 'Skeletal System',
    videos: [
      { id: 201, title: 'Overview of Skeletal System', duration: '15:00', watched: true },
      { id: 202, title: 'Axial Skeleton', duration: '18:30', watched: true },
      { id: 203, title: 'Appendicular Skeleton', duration: '16:20', watched: false },
      { id: 204, title: 'Joints & Articulations', duration: '13:45', watched: false },
      { id: 205, title: 'Bone Markings', duration: '11:10', watched: false },
      { id: 206, title: 'Clinical Correlations', duration: '8:50', watched: false },
    ]
  },
  {
    id: 3, subjectId: 2, name: 'Muscular System',
    videos: [
      { id: 301, title: 'Types of Muscles', duration: '13:00', watched: false },
      { id: 302, title: 'Muscle Actions & Groups', duration: '16:20', watched: false },
      { id: 303, title: 'Clinical Applications', duration: '11:30', watched: false },
      { id: 304, title: 'Revision & MCQ Strategy', duration: '9:00', watched: false },
    ]
  },
  {
    id: 4, subjectId: 2, name: 'Nervous System',
    videos: [
      { id: 401, title: 'CNS Overview', duration: '14:00', watched: false },
      { id: 402, title: 'PNS & Reflexes', duration: '17:00', watched: false },
      { id: 403, title: 'Autonomic Nervous System', duration: '15:30', watched: false },
      { id: 404, title: 'Cranial Nerves', duration: '22:00', watched: false },
      { id: 405, title: 'Spinal Cord & Tracts', duration: '19:00', watched: false },
    ]
  },
  {
    id: 5, subjectId: 2, name: 'Cardiovascular System',
    videos: [
      { id: 501, title: 'Heart Anatomy', duration: '16:00', watched: false },
      { id: 502, title: 'Cardiac Cycle & Conduction', duration: '18:00', watched: false },
      { id: 503, title: 'Blood Vessels', duration: '14:00', watched: false },
    ]
  },
]

export const SAVE_TAGS = [
  { id: 'wrong', label: 'Got it Wrong', color: '#791F1F', bg: '#FCEBEB', border: '#F09595' },
  { id: 'important', label: 'Important', color: '#3C3489', bg: '#EEEDFE', border: '#AFA9EC' },
  { id: 'revision', label: 'Needs Revision', color: '#633806', bg: '#FAEEDA', border: '#FAC775' },
  { id: 'tricky', label: 'Tricky Concept', color: '#3B6D11', bg: '#EAF3DE', border: '#97C459' },
]
