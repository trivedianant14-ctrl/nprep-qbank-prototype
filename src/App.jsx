import { useState, useRef } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import Home from './screens/Home'
import Subject from './screens/Subject'
import PreTest from './screens/PreTest'
import Solve from './screens/Solve'
import Result from './screens/Result'
import Saved from './screens/Saved'
import Summary from './screens/Summary'
import Videos from './screens/Videos'
import VideoSubject from './screens/VideoSubject'
import VideoPlayer from './screens/VideoPlayer'
import LiveTest from './screens/LiveTest'
import LiveTestPreTest from './screens/LiveTestPreTest'
import LiveTestSolve from './screens/LiveTestSolve'
import { QUESTIONS } from './data'
import Nav from './components/Nav'
import FormShell from './components/form/FormShell'
import Dashboard from './components/dashboard/Dashboard'
import { QueryProvider } from './context/QueryContext'
import { NotificationProvider } from './context/NotificationContext'
import { AuthProvider } from './context/AuthContext'
import ResolverDashboard from './pages/ResolverDashboard'
import ManagerDashboard from './pages/ManagerDashboard'
import UnifiedDashboard from './pages/UnifiedDashboard'
import LoginPage from './pages/LoginPage'

const SCREEN_DEPTH = {
  home: 0,
  subject: 1, videos: 1, saved: 1, livetest: 1,
  pretest: 2, videosubject: 2, livetestpretest: 2,
  solve: 3, videoplayer: 3, livetestsolve: 3,
  summary: 4, result: 4,
}

const EXISTING_USER_SAVES = [
  { qId: 1, tag: 'wrong' },
  { qId: 3, tag: 'important' },
  { qId: 5, tag: 'tricky' },
  { qId: 2, tag: 'revision' },
]

function NprepPrototype() {
  const [screen, setScreen] = useState('home')
  const [currentLiveTest, setCurrentLiveTest] = useState(null)
  const [liveTestInterface, setLiveTestInterface] = useState('nprep')
  const [mode, setMode] = useState('guide')
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timerPerQ, setTimerPerQ] = useState(60)
  const [autoAdvance, setAutoAdvance] = useState(false)
  const [isReviewMode, setIsReviewMode] = useState(false)
  const [isNewUser, setIsNewUser] = useState(true)
  const [savedQs, setSavedQs] = useState([])
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [showReattemptConfirm, setShowReattemptConfirm] = useState(false)
  const [currentVideo, setCurrentVideo] = useState(null)
  const [sessions, setSessions] = useState([])
  const [isReattempt, setIsReattempt] = useState(false)
  const [attemptCount, setAttemptCount] = useState(0)
  const [savedVideos, setSavedVideos] = useState([])
  const [savedResources, setSavedResources] = useState([])
  const [reattemptQIds, setReattemptQIds] = useState([])
  const animDirRef = useRef('forward')

  const goTo = (next) => {
    const currDepth = SCREEN_DEPTH[screen] ?? 0
    const nextDepth = SCREEN_DEPTH[next] ?? 0
    if (next === 'result' || next === 'summary') {
      animDirRef.current = 'up'
    } else if (next === 'solve') {
      animDirRef.current = 'forward'
    } else if (nextDepth >= currDepth) {
      animDirRef.current = 'forward'
    } else {
      animDirRef.current = 'backward'
    }
    setScreen(next)
  }

  const toggleUserMode = () => {
    const switchingToExisting = isNewUser
    setIsNewUser(prev => !prev)
    setSavedQs(switchingToExisting ? EXISTING_USER_SAVES : [])
    setBannerDismissed(false)
  }

  const navigate = goTo

  const startAttempt = (selectedMode) => {
    setMode(selectedMode)
    setCurrentQ(0)
    setAnswers({})
    setIsReviewMode(false)
    setAttemptCount(c => c + 1)
    goTo('solve')
  }

  const saveQuestion = (qId, tag) => {
    setSavedQs(prev => {
      const exists = prev.find(s => s.qId === qId)
      if (exists) return prev.map(s => s.qId === qId ? { ...s, tag } : s)
      return [...prev, { qId, tag }]
    })
  }

  const unsaveQuestion = (qId) => {
    setSavedQs(prev => prev.filter(s => s.qId !== qId))
  }

  const submitTest = () => {
    const correct = QUESTIONS.filter(q => answers[q.id] === q.correct).length
    const total = QUESTIONS.length
    const accuracy = Math.round((correct / total) * 100)
    const priorAttempts = sessions.filter(s => s.chapterId === 1).length
    setSessions(prev => [...prev, {
      id: Date.now(),
      chapterId: 1,
      chapterName: 'Anatomical Terms',
      subjectName: 'Applied Anatomy',
      attemptNumber: priorAttempts + 1,
      mode,
      timerPerQ,
      answers: { ...answers },
      correct,
      total,
      accuracy,
      completedAt: Date.now(),
    }])
    setIsReattempt(priorAttempts > 0)
    goTo('result')
  }

  const viewAnalysis = () => {
    const firstSession = sessions.find(s => s.chapterId === 1)
    if (firstSession) setAnswers(firstSession.answers)
    setIsReattempt(false)
    goTo('result')
  }

  const handleReattempt = (reattemptMode = 'full', qIds = []) => {
    setShowReattemptConfirm(false)
    setCurrentQ(0)
    setAnswers({})
    setIsReviewMode(false)
    setAttemptCount(c => c + 1)
    setReattemptQIds(reattemptMode === 'wrong-only' ? qIds : [])
    goTo('solve')
  }

  const saveVideo = (v) => setSavedVideos(prev => prev.some(x => x.id === v.id) ? prev : [...prev, v])
  const unsaveVideo = (id) => setSavedVideos(prev => prev.filter(v => v.id !== id))
  const saveResource = (r) => setSavedResources(prev => prev.some(x => x.id === r.id) ? prev : [...prev, r])
  const unsaveResource = (id) => setSavedResources(prev => prev.filter(r => r.id !== id))

  const viewSolution = () => {
    setIsReviewMode(true)
    setCurrentQ(0)
    goTo('solve')
  }

  // Persistent PYQ storage: every PYQ answered across any completed session, accumulated for later untimed review
  const pyqBankIds = [...new Set(
    sessions.flatMap(s => QUESTIONS.filter(q => q.isPYQ && s.answers[q.id] !== undefined).map(q => q.id))
  )]

  const viewPYQBank = (startQId) => {
    setReattemptQIds(pyqBankIds)
    setIsReviewMode(true)
    setCurrentQ(startQId != null ? Math.max(0, pyqBankIds.indexOf(startQId)) : 0)
    goTo('solve')
  }

  // Derived stats from real sessions
  const todayStr = new Date().toDateString()
  const todayQs = sessions
    .filter(s => new Date(s.completedAt).toDateString() === todayStr)
    .reduce((sum, s) => sum + s.total, 0)
  const overallAcc = sessions.length > 0
    ? Math.round(sessions.reduce((sum, s) => sum + s.accuracy, 0) / sessions.length)
    : 0
  const lastSession = sessions.length > 0 ? sessions[sessions.length - 1] : null

  const sharedProps = {
    navigate, mode, setMode,
    currentQ, setCurrentQ,
    answers, setAnswers,
    timerPerQ, setTimerPerQ,
    autoAdvance, setAutoAdvance,
    isReviewMode,
    isNewUser, toggleUserMode,
    savedQs, saveQuestion, unsaveQuestion,
    bannerDismissed, setBannerDismissed,
    startAttempt, submitTest,
    showReattemptConfirm, setShowReattemptConfirm,
    handleReattempt, viewSolution,
    pyqBankIds, viewPYQBank,
    sessions, todayQs, overallAcc, lastSession,
    isReattempt, viewAnalysis,
    attemptCount,
    reattemptQIds,
    savedVideos, unsaveVideo, savedResources, unsaveResource,
  }

  return (
    <div className="desktop-wrapper">
      <div className="phone-wrapper">
        <div className="phone">
          <div key={screen} className={`screen-trans screen-${animDirRef.current}`}>
            {screen === 'home' && <Home {...sharedProps} />}
            {screen === 'subject' && <Subject {...sharedProps} />}
            {screen === 'pretest' && <PreTest {...sharedProps} />}
            {screen === 'solve' && <Solve {...sharedProps} />}
            {screen === 'summary' && <Summary {...sharedProps} />}
            {screen === 'result' && <Result {...sharedProps} />}
            {screen === 'saved' && <Saved {...sharedProps} />}
            {screen === 'videos' && <Videos navigate={navigate} isNewUser={isNewUser} toggleUserMode={toggleUserMode} />}
            {screen === 'videosubject' && <VideoSubject navigate={navigate} setCurrentVideo={setCurrentVideo} />}
            {screen === 'videoplayer' && <VideoPlayer navigate={navigate} currentVideo={currentVideo} savedVideos={savedVideos} saveVideo={saveVideo} unsaveVideo={unsaveVideo} savedResources={savedResources} saveResource={saveResource} unsaveResource={unsaveResource} />}
            {screen === 'livetest' && <LiveTest navigate={navigate} onJoinNow={(test) => { setCurrentLiveTest(test); navigate('livetestpretest') }} variant="full" />}
            {screen === 'livetestpretest' && <LiveTestPreTest navigate={navigate} test={currentLiveTest} onInterfaceSelect={setLiveTestInterface} />}
            {screen === 'livetestsolve' && <LiveTestSolve navigate={navigate} test={currentLiveTest} interfaceMode={liveTestInterface} />}
          </div>
        </div>
      </div>
    </div>
  )
}

function RaiseAQueryLayout({ children }) {
  return (
    <div className="raq-app">
      <Nav />
      {children}
    </div>
  )
}

export default function App() {
  return (
    <QueryProvider>
      <NotificationProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/nprep" replace />} />
              <Route path="/nprep" element={<NprepPrototype />} />
              <Route path="/form" element={<RaiseAQueryLayout><FormShell /></RaiseAQueryLayout>} />
              <Route path="/dashboard" element={<RaiseAQueryLayout><Dashboard /></RaiseAQueryLayout>} />
              <Route path="/resolver" element={<RaiseAQueryLayout><ResolverDashboard /></RaiseAQueryLayout>} />
              <Route path="/manager" element={<RaiseAQueryLayout><ManagerDashboard /></RaiseAQueryLayout>} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/tickets" element={<UnifiedDashboard />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </NotificationProvider>
    </QueryProvider>
  )
}
