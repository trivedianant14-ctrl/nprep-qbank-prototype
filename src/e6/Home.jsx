import { useState } from 'react'
import {
  SUBJECTS, BLOCKS, CHAPTERS, ABOUT_ROWS,
} from './data'
import {
  Search, Index, Info, Chevron, Bookmark, Play, Close, Back, Mute,
  HomeIcon, BookIcon, VideoIcon, TestIcon, BuyIcon,
} from './icons'

// §4.1 / §4.2 — QBank Home. One layout, two data states.
export default function Home({ go, progress, openBlock, onTab }) {
  const [about, setAbout] = useState(false)
  const [video, setVideo] = useState(false)

  // §4.1 Hero selection: first subject by ordinal, then its first block.
  // §4.2 Returning user: Continue card for the most recently interacted-with
  // incomplete block, which takes precedence over the first-block hero.
  const resume = progress.resume
  const heroBlock = resume
    ? BLOCKS.find(b => b.id === resume.blockId)
    : BLOCKS.find(b => b.chapterId === CHAPTERS[0].id)

  const savedCount = progress.saved.length
  const returning = progress.completedBlocks.length > 0 || !!resume

  return (
    <>
      <header className="e6-appbar">
        <h1>Question Bank</h1>
        <button className="ic" style={{ width: 20 }} onClick={() => setAbout(true)} aria-label="About QBank"><Info /></button>
        <span className="sp" />
        <button className="ic"><Search /></button>
        <button className="ic"><Index /></button>
      </header>

      <div className="e6-body">
        <div className="e6-pad" style={{ paddingTop: 8 }}>
          {/* Hero ------------------------------------------------------- */}
          <div className="e6-hero">
            <span className="e6-hero-art">💊</span>
            <h2>{heroBlock?.name}</h2>
            {resume ? (
              <>
                <div className="sub">{resume.attempted}/{heroBlock?.questions ?? 60} Questions</div>
                <div className="e6-bar" style={{ margin: '10px 0 14px' }}>
                  <i style={{ width: `${(resume.attempted / (heroBlock?.questions || 60)) * 100}%` }} />
                </div>
                <button className="e6-btn e6-btn-blue" onClick={() => openBlock(heroBlock.id)}>Continue</button>
              </>
            ) : (
              <>
                <div className="sub">60 MCQs • 60 Min</div>
                <button className="e6-btn e6-btn-blue" style={{ marginTop: 14 }} onClick={() => openBlock(heroBlock.id)}>
                  Start Attempt
                </button>
              </>
            )}
          </div>

          {/* Motivational video strip (§4.1) ----------------------------- */}
          <div className="e6-hero-strip">
            <span className="thumb"><Play s={11} /></span>
            <span>How QBank helped <b>AIR 15</b> in their journey</span>
            <button className="watch" onClick={() => setVideo(true)}>Watch</button>
          </div>

          {/* Revision List entry (§4.1) --------------------------------- */}
          <button className="e6-card e6-row" style={{ width: '100%', marginTop: 18, textAlign: 'left' }} onClick={() => go('revision')}>
            <span className="e6-icontile" style={{ color: '#008DFF' }}><Bookmark s={20} filled /></span>
            <span style={{ flex: 1 }}>
              <span style={{ display: 'block', fontSize: 13, fontWeight: 700 }}>
                Revision List{savedCount > 0 && <span style={{ fontWeight: 500 }}> ({savedCount})</span>}
              </span>
              <span style={{ display: 'block', fontSize: 11, color: 'var(--ink2)', marginTop: 2 }}>
                Your mistake log book, now inside NPrep
              </span>
            </span>
            <Chevron className="e6-chev" />
          </button>

          {/* Subject list (§4.1 / §4.2) --------------------------------- */}
          <div className="e6-sec">All Subjects (E6)</div>
          {SUBJECTS.map(s => {
            const done = returning ? s.done : 0
            return (
              <button
                key={s.id}
                className="e6-card e6-row"
                style={{ width: '100%', marginBottom: 9, textAlign: 'left' }}
                onClick={() => s.ordinal === 1 && go('blocks')}
              >
                <span className="e6-icontile">{s.icon}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 13, fontWeight: 700 }}>{s.name}</span>
                  {done > 0 ? (
                    <>
                      <span className="e6-bar thin" style={{ margin: '6px 0 5px' }}>
                        <i style={{ width: `${(done / s.blocks) * 100}%` }} />
                      </span>
                      <span style={{ fontSize: 10, color: 'var(--ink2)' }}>
                        {String(done).padStart(2, '0')}/{s.blocks} Blocks Completed • {s.accuracy}% Accuracy
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="e6-bar thin" style={{ margin: '6px 0 5px', background: '#EEF1F7' }} />
                      <span style={{ fontSize: 10, color: 'var(--ink2)' }}>
                        {s.comingSoon
                          ? <em style={{ color: 'var(--red-text)', fontStyle: 'normal' }}>Coming soon</em>
                          : s.pyqAvg > 0
                            ? <>{s.blocks} Blocks • <b style={{ color: 'var(--blue)' }}>
                                {s.pyqExam ? `${s.pyqAvg} Ques asked in ${s.pyqExam}` : `Avg. ${s.pyqAvg} Questions from PYQ`}
                              </b></>
                            : `${s.blocks} Blocks to complete`}
                      </span>
                    </>
                  )}
                </span>
                <Chevron className="e6-chev" />
              </button>
            )
          })}

          <div className="e6-watermark">
            <div className="e">— EDITION 6 —</div>
            <div className="m">Exam Crack Karana Easy He!</div>
          </div>
        </div>
      </div>

      <nav className="e6-tabs">
        <button className="e6-tab"><HomeIcon /><span>Home</span></button>
        <button className="e6-tab on"><BookIcon /><span>QBank</span></button>
        <button className="e6-tab" onClick={() => onTab?.('videos')}><VideoIcon /><span>Videos</span></button>
        <button className="e6-tab" onClick={() => onTab?.('livetest')}><TestIcon /><span>Tests</span></button>
        <button className="e6-tab"><BuyIcon /><span>Buy</span></button>
      </nav>

      {about && <AboutSheet onClose={() => setAbout(false)} />}
      {video && <MotivationalVideo onClose={() => setVideo(false)} />}
    </>
  )
}

// §4.4 — About QBank bottom sheet.
// The banner is optional; with no video configured the sheet collapses and the
// content list moves up. `hasVideo` stands in for that content-team flag.
function AboutSheet({ onClose, hasVideo = true }) {
  return (
    <div className="e6-scrim" onClick={onClose}>
      <div className="e6-sheet" onClick={e => e.stopPropagation()}>
        <span className="e6-grip" />
        <div className="e6-sheet-head">
          <h3>Question Bank</h3>
          <button onClick={onClose}><Close s={18} /></button>
        </div>
        <div className="e6-sheet-body">
          {hasVideo && (
            <div style={{
              borderRadius: 14, overflow: 'hidden', marginBottom: 16, padding: '16px 14px',
              background: 'linear-gradient(110deg,#DCEEFF,#BFE0FF)', position: 'relative',
            }}>
              <span style={{ background: 'var(--blue)', color: '#fff', fontSize: 8, fontWeight: 700, padding: '2px 6px', borderRadius: 4 }}>NEW!</span>
              <div style={{ fontSize: 12, fontWeight: 600, marginTop: 7 }}>What's New in</div>
              <div style={{ fontSize: 25, fontWeight: 800, color: 'var(--blue)', letterSpacing: '-0.02em', lineHeight: 1 }}>QBank!</div>
              <div style={{ fontSize: 9, color: 'var(--ink2)', margin: '6px 0 9px' }}>Bigger. Smarter.<br />Better for Exam Success.</div>
              <button style={{ background: 'var(--navy)', color: '#fff', fontSize: 10, fontWeight: 600, borderRadius: 20, padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Play s={9} /> Watch Now
              </button>
              <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,.85)', display: 'grid', placeItems: 'center', color: 'var(--blue)' }}>
                <Play s={17} />
              </span>
            </div>
          )}

          {ABOUT_ROWS.map(r => (
            <div key={r.id} style={{ display: 'flex', gap: 13, marginBottom: 16 }}>
              <span style={{ width: 72, height: 56, borderRadius: 10, background: '#F3F6FC', border: '1px solid var(--line)', flexShrink: 0, display: 'grid', placeItems: 'center' }}>
                <AboutThumb id={r.id} />
              </span>
              <span>
                <span style={{ display: 'block', fontSize: 12.5, fontWeight: 700 }}>{r.title}</span>
                <span style={{ display: 'block', fontSize: 11, color: 'var(--ink2)', lineHeight: 1.5, marginTop: 3 }}>{r.body}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AboutThumb({ id }) {
  if (id === 'about') return (
    <span style={{ display: 'flex', gap: 5 }}>
      {['#E95454', '#16A978', '#16A978', '#D7DDE8'].map((c, i) => <i key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />)}
    </span>
  )
  if (id === 'modes') return (
    <span style={{ fontSize: 7, color: 'var(--ink2)', textAlign: 'center', lineHeight: 1.3 }}>
      Show Answer<br />immediately
      <span style={{ display: 'block', width: 24, height: 13, borderRadius: 8, background: 'var(--blue)', margin: '4px auto 0', position: 'relative' }}>
        <i style={{ position: 'absolute', right: 2, top: 2, width: 9, height: 9, borderRadius: '50%', background: '#fff' }} />
      </span>
    </span>
  )
  if (id === 'target') return (
    <span style={{ fontSize: 7, color: 'var(--ink2)', textAlign: 'center' }}>
      Target<br /><b style={{ fontSize: 13, color: 'var(--ink)' }}>65%</b>
      <span style={{ display: 'block', width: 34, height: 3, borderRadius: 2, background: 'var(--green-ring)', margin: '3px auto' }} />
      <b style={{ color: 'var(--blue)' }}>Reattempt</b>
    </span>
  )
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <svg width="26" height="26" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="14" fill="none" stroke="#E7EBF3" strokeWidth="5" />
        <circle cx="18" cy="18" r="14" fill="none" stroke="#2CC491" strokeWidth="5" strokeDasharray="88 100" transform="rotate(-90 18 18)" strokeLinecap="round" />
        <text x="18" y="20" textAnchor="middle" fontSize="8" fontWeight="700">92%</text>
      </svg>
      <span style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {['#16A978', '#E95454', '#FF9500'].map(c => <i key={c} style={{ width: 15, height: 2.5, borderRadius: 2, background: c }} />)}
      </span>
    </span>
  )
}

// §4.3 — full-bleed vertical motivational video player.
function MotivationalVideo({ onClose }) {
  const [playing, setPlaying] = useState(false)
  return (
    <div className="e6-video">
      <div className="top">
        <button className="rnd" onClick={onClose}><Back s={18} /></button>
        <span style={{ flex: 1 }} />
        <button className="rnd"><Mute s={18} /></button>
      </div>
      <button className="play" onClick={() => setPlaying(p => !p)}>
        {playing ? '❚❚' : <Play s={26} />}
      </button>
      <div className="scrub"><i /></div>
    </div>
  )
}
