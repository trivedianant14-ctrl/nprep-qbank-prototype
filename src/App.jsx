import { useState, useRef } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import Videos from './screens/Videos'
import VideoSubject from './screens/VideoSubject'
import VideoPlayer from './screens/VideoPlayer'
import LiveTest from './screens/LiveTest'
import LiveTestPreTest from './screens/LiveTestPreTest'
import LiveTestSolve from './screens/LiveTestSolve'
import QBankE6 from './e6/QBank'
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
  videos: 1, livetest: 1,
  videosubject: 2, livetestpretest: 2,
  videoplayer: 3, livetestsolve: 3,
}

function NprepPrototype() {
  const [screen, setScreen] = useState('home')
  const [currentLiveTest, setCurrentLiveTest] = useState(null)
  const [liveTestInterface, setLiveTestInterface] = useState('nprep')
  const [isNewUser, setIsNewUser] = useState(true)
  const [currentVideo, setCurrentVideo] = useState(null)
  const [savedVideos, setSavedVideos] = useState([])
  const [savedResources, setSavedResources] = useState([])
  const animDirRef = useRef('forward')

  const goTo = (next) => {
    const currDepth = SCREEN_DEPTH[screen] ?? 0
    const nextDepth = SCREEN_DEPTH[next] ?? 0
    animDirRef.current = nextDepth >= currDepth ? 'forward' : 'backward'
    setScreen(next)
  }
  const navigate = goTo

  const toggleUserMode = () => setIsNewUser(prev => !prev)

  const saveVideo = (v) => setSavedVideos(prev => prev.some(x => x.id === v.id) ? prev : [...prev, v])
  const unsaveVideo = (id) => setSavedVideos(prev => prev.filter(v => v.id !== id))
  const saveResource = (r) => setSavedResources(prev => prev.some(x => x.id === r.id) ? prev : [...prev, r])
  const unsaveResource = (id) => setSavedResources(prev => prev.filter(r => r.id !== id))

  return (
    <div className="desktop-wrapper">
      <div className="phone-wrapper">
        <div className="phone">
          <div key={screen} className={`screen-trans screen-${animDirRef.current}`}>
            {/* QBank Edition 6 — the flow specified in "QBank — PRD (Edition 6)"
                and designed in "Latest - QBank Flow". It owns its own internal
                navigation (home → blocks → pre-attempt → attempt → results). */}
            {screen === 'home' && <QBankE6 onTab={navigate} />}
            {screen === 'videos' && <Videos navigate={navigate} isNewUser={isNewUser} toggleUserMode={toggleUserMode} />}
            {screen === 'videosubject' && <VideoSubject navigate={navigate} setCurrentVideo={setCurrentVideo} />}
            {screen === 'videoplayer' && <VideoPlayer navigate={navigate} currentVideo={currentVideo} savedVideos={savedVideos} saveVideo={saveVideo} unsaveVideo={unsaveVideo} savedResources={savedResources} saveResource={saveResource} unsaveResource={unsaveResource} />}
            {screen === 'livetest' && <LiveTest navigate={navigate} onJoinNow={(test) => { setCurrentLiveTest(test); navigate('livetestpretest') }} variant="series" />}
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
