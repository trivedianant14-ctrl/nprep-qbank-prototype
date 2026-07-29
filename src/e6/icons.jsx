// Inline stroke icons matching the flow's line weight (1.6–1.8 at 20px).
const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' }

const Svg = ({ s = 20, children, ...p }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" {...S} {...p}>{children}</svg>
)

export const Search  = (p) => <Svg {...p}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></Svg>
export const Index   = (p) => <Svg {...p}><rect x="3" y="3" width="18" height="18" rx="4" /><path d="M7 9h10M7 12h10M7 15h6" /></Svg>
export const Info    = (p) => <Svg {...p} s={p.s || 16}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></Svg>
export const Chevron = (p) => <Svg {...p} s={p.s || 18}><path d="M9 5l7 7-7 7" /></Svg>
export const Back    = (p) => <Svg {...p}><path d="M15 5l-7 7 7 7" /></Svg>
export const ArrowL  = (p) => <Svg {...p}><path d="M20 12H4M10 6l-6 6 6 6" /></Svg>
export const ArrowR  = (p) => <Svg {...p} s={p.s || 16}><path d="M4 12h16M14 6l6 6-6 6" /></Svg>
export const Close   = (p) => <Svg {...p}><path d="M6 6l12 12M18 6L6 18" /></Svg>
export const Clock   = (p) => <Svg {...p} s={p.s || 14}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Svg>
export const Settings= (p) => <Svg {...p} s={p.s || 18}><path d="M4 8h11M18 8h2M4 16h5M12 16h8" /><circle cx="16" cy="8" r="2" /><circle cx="10" cy="16" r="2" /></Svg>
export const Share   = (p) => <Svg {...p} s={p.s || 15}><circle cx="18" cy="6" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="M8.3 10.8l7.4-3.6M8.3 13.2l7.4 3.6" /></Svg>
export const Refresh = (p) => <Svg {...p} s={p.s || 15}><path d="M20 11a8 8 0 10-2.3 6.3M20 5v6h-6" /></Svg>
export const Chart   = (p) => <Svg {...p} s={p.s || 18}><path d="M5 20V11M12 20V4M19 20v-6" /></Svg>
export const Play    = ({ s = 16 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
export const Pause   = ({ s = 16 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><rect x="7" y="5" width="3.5" height="14" rx="1" /><rect x="13.5" y="5" width="3.5" height="14" rx="1" /></svg>
export const List    = (p) => <Svg {...p} s={p.s || 17}><path d="M4 6h16M4 12h16M4 18h16" /></Svg>
export const Mute    = (p) => <Svg {...p}><path d="M11 5L6 9H3v6h3l5 4V5z" /><path d="M17 9l4 6M21 9l-4 6" /></Svg>
export const ZoomIn  = (p) => <Svg {...p} s={p.s || 14}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5M11 8v6M8 11h6" /></Svg>
export const ZoomOut = (p) => <Svg {...p} s={p.s || 14}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5M8 11h6" /></Svg>
export const Sound   = (p) => <Svg {...p} s={p.s || 13}><path d="M11 5L6 9H3v6h3l5 4V5z" /><path d="M15.5 9a4 4 0 010 6" /></Svg>
export const Spark   = (p) => <Svg {...p} s={p.s || 14}><path d="M3 12h4l2-5 3 10 2-5h7" /></Svg>
export const Bulb    = (p) => <Svg {...p} s={p.s || 14}><path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9V16h7v-2.1A6 6 0 0012 3z" /></Svg>
export const Copy    = (p) => <Svg {...p} s={p.s || 12}><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 012-2h8" /></Svg>
export const Book    = (p) => <Svg {...p} s={p.s || 12}><path d="M4 4h9a3 3 0 013 3v13H7a3 3 0 01-3-3V4zM16 7h4v13h-7" /></Svg>
export const Film    = (p) => <Svg {...p} s={p.s || 12}><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M10 9.5v5l4-2.5z" /></Svg>
export const Warn    = (p) => <Svg {...p}><path d="M12 4l9 16H3l9-16zM12 10v4M12 17h.01" /></Svg>
export const Check   = ({ s = 12 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5l5.5 5.5L20 6" /></svg>
export const CheckCircle = (p) => <Svg {...p} s={p.s || 14}><circle cx="12" cy="12" r="9" /><path d="M8 12.3l2.6 2.6L16 9.5" /></Svg>
export const XCircle = (p) => <Svg {...p} s={p.s || 14}><circle cx="12" cy="12" r="9" /><path d="M9 9l6 6M15 9l-6 6" /></Svg>
export const Percent = (p) => <Svg {...p} s={p.s || 14}><circle cx="12" cy="12" r="9" /><path d="M9 15l6-6M9.5 9.5h.01M14.5 14.5h.01" /></Svg>
export const Trophy  = ({ s = 13 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M7 4h10v5a5 5 0 01-10 0V4zM5 5h2v3a3 3 0 01-2-3zm14 0a3 3 0 01-2 3V5h2zM10 15h4l.6 3H9.4L10 15zM8 19h8v2H8z" /></svg>

export const Bookmark = ({ s = 18, filled }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round">
    <path d="M6 3.5h12v17l-6-4.2-6 4.2v-17z" />
  </svg>
)

export const Grid9 = ({ color = 'currentColor' }) => (
  <span className="e6-grid9" style={{ color }}>
    {Array.from({ length: 9 }, (_, i) => <i key={i} style={{ background: 'currentColor' }} />)}
  </span>
)

export const HomeIcon = (p) => <Svg {...p} s={p.s || 19}><path d="M4 11l8-7 8 7v8a1 1 0 01-1 1h-4v-6H9v6H5a1 1 0 01-1-1v-8z" /></Svg>
export const BookIcon = (p) => <Svg {...p} s={p.s || 19}><path d="M12 6.5C10.5 5 8 4.5 4 5v13c4-.5 6.5 0 8 1.5 1.5-1.5 4-2 8-1.5V5c-4-.5-6.5 0-8 1.5zM12 6.5v13" /></Svg>
export const VideoIcon = (p) => <Svg {...p} s={p.s || 19}><circle cx="12" cy="12" r="8.5" /><path d="M10.5 9.2v5.6l4.5-2.8z" /></Svg>
export const TestIcon = (p) => <Svg {...p} s={p.s || 19}><path d="M6 3.5h9l4 4V20a.5.5 0 01-.5.5h-12A.5.5 0 016 20V3.5z" /><path d="M9 12h6M9 15.5h4" /></Svg>
export const BuyIcon = (p) => <Svg {...p} s={p.s || 19}><path d="M4 5h2l2 10h9l2-7H7" /><circle cx="9.5" cy="19" r="1.2" /><circle cx="16.5" cy="19" r="1.2" /></Svg>
