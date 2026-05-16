// Shared design tokens + primitives for all 8 Templix dashboards
// ----------------------------------------------------------------------
// SYSTEM
//   Type:    Geist (sans) · Instrument Serif (display) · Geist Mono (data)
//   Palette: paper cream / ink / tier-specific accents
//   Tier:    Plus = ochre / Pro = forest / Ultimate = plum
// ----------------------------------------------------------------------

const T = {
  // Paper
  paper50:  '#F8F5EE',
  paper100: '#EFEAE0',
  paper200: '#E2DCCC',
  paper300: '#D2CBB7',
  // Ink
  ink900: '#1B1A17',
  ink800: '#2A2722',
  ink700: '#3F3D38',
  ink600: '#55524B',
  ink500: '#6F6B62',
  ink400: '#8E887D',
  ink300: '#A8A296',
  ink200: '#C7C1B4',
  // Tier accents
  plus:     '#B8843E', plusBg:    '#F1E5CD',
  pro:      '#2F5E3A', proBg:     '#D6E2D4',
  ultimate: '#5A2E55', ultimateBg:'#E5D5E1',
  // Status
  good:  '#2F5E3A',
  warn:  '#B8843E',
  danger:'#A33D2C',
  // Misc
  highlight: '#E8C547',
};
window.T = T;

const tierColor = (tier) => {
  if (tier === 'Plus') return { fg: T.plus, bg: T.plusBg };
  if (tier === 'Pro') return { fg: T.pro, bg: T.proBg };
  if (tier === 'Ultimate') return { fg: T.ultimate, bg: T.ultimateBg };
  return { fg: T.ink700, bg: T.paper200 };
};
window.tierColor = tierColor;

// ── Mock metrics deterministically derived from bundle id so same bundle
//    always shows same numbers across all 8 designs.
function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0);
}
const mockMetrics = (b) => {
  const h = hashStr(b.id);
  const views30 = 200 + (h % 4800);
  const sales30 = Math.max(1, Math.round(views30 * (0.012 + ((h>>5) % 90)/2000)));
  const favs   = Math.round(views30 * (0.05 + ((h>>11) % 80)/1000));
  const conv   = (sales30 / views30 * 100);
  const revenue = sales30 * parseFloat((b.price || '0').replace('$',''));
  const status = ['Live','Live','Live','Live','Draft','Live','Updating','Live'][h % 8];
  const trend = ((h >> 3) % 100) - 30; // -30 .. +69
  return { views30, sales30, favs, conv, revenue, status, trend };
};
window.mockMetrics = mockMetrics;

// ── Tier badge (small)
function TierBadge({ tier, size = 'sm' }) {
  const { fg, bg } = tierColor(tier);
  const styles = {
    sm: { fontSize: 10, padding: '2px 7px', letterSpacing: '0.08em' },
    md: { fontSize: 11, padding: '3px 9px', letterSpacing: '0.1em' },
    lg: { fontSize: 12, padding: '4px 11px', letterSpacing: '0.12em' },
  }[size];
  return (
    <span style={{
      ...styles,
      background: bg,
      color: fg,
      borderRadius: 999,
      fontWeight: 600,
      textTransform: 'uppercase',
      fontFamily: 'Geist, system-ui, sans-serif',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: 5, background: fg }} />
      {tier}
    </span>
  );
}
window.TierBadge = TierBadge;

// ── Cover image with paper-styled fallback (uses real cloudfront URL when available)
function Cover({ src, label, w = '100%', h = '100%', radius = 4, style = {} }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: radius, overflow: 'hidden',
      background: T.paper200,
      backgroundImage: `repeating-linear-gradient(45deg, ${T.paper100} 0 8px, ${T.paper200} 8px 16px)`,
      position: 'relative',
      boxShadow: 'inset 0 0 0 1px rgba(27,26,23,0.06)',
      ...style,
    }}>
      {src && (
        <img src={src} alt={label || ''}
             style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
             onError={(e) => { e.currentTarget.style.display = 'none'; }} />
      )}
      {label && (
        <div style={{
          position: 'absolute', left: 8, bottom: 6, fontSize: 9,
          fontFamily: 'Geist Mono, ui-monospace, monospace',
          color: T.ink600, textTransform: 'uppercase', letterSpacing: '0.1em',
          background: 'rgba(248,245,238,0.85)', padding: '1px 5px', borderRadius: 2,
        }}>{label}</div>
      )}
    </div>
  );
}
window.Cover = Cover;

// Format helpers
window.fmtNum = (n) => n.toLocaleString('en-US');
window.fmtRev = (n) => '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
window.fmtPct = (n) => n.toFixed(1) + '%';
window.fmtTrend = (n) => (n >= 0 ? '+' : '') + n + '%';

// Sparkline: deterministic fake series from id
function Sparkline({ id, w = 60, h = 18, color = T.ink700, fill = false }) {
  const seed = hashStr(id);
  const N = 14;
  const pts = [];
  let v = 0.5;
  for (let i = 0; i < N; i++) {
    const r = ((seed >> (i % 24)) & 0xFF) / 255;
    v = Math.max(0.05, Math.min(0.95, v + (r - 0.5) * 0.45));
    pts.push(v);
  }
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${(i / (N - 1)) * w},${h - p * h}`).join(' ');
  const area = path + ` L${w},${h} L0,${h} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      {fill && <path d={area} fill={color} opacity={0.12} />}
      <path d={path} fill="none" stroke={color} strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
window.Sparkline = Sparkline;

// Tiny avatar circle for the seller (uses initials)
function Avatar({ name = 'NL', size = 28 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size,
      background: T.ink900, color: T.paper50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Geist, system-ui, sans-serif', fontWeight: 600,
      fontSize: size * 0.36, letterSpacing: '0.02em',
    }}>{name}</div>
  );
}
window.Avatar = Avatar;

// Common base CSS — applied to every artboard root via className "tx-root"
const SHARED_CSS = `
.tx-root, .tx-root * { box-sizing: border-box; }
.tx-root { font-family: Geist, system-ui, -apple-system, sans-serif; color: ${T.ink900}; -webkit-font-smoothing: antialiased; font-feature-settings: "ss01", "ss02", "cv11"; }
.tx-root .mono { font-family: 'Geist Mono', ui-monospace, monospace; font-feature-settings: "ss01"; }
.tx-root .serif { font-family: 'Instrument Serif', 'Iowan Old Style', serif; font-style: normal; }
.tx-root button { font: inherit; cursor: pointer; }
.tx-root img { display: block; }
.tx-root [data-clickable]:hover { filter: brightness(1.05); }
.tx-root .num { font-variant-numeric: tabular-nums; font-feature-settings: "tnum"; }
.tx-root .hr { height: 1px; background: ${T.paper200}; }
.tx-root .vr { width: 1px; background: ${T.paper200}; }
`;
const styleEl = document.createElement('style');
styleEl.textContent = SHARED_CSS;
document.head.appendChild(styleEl);

// Bundle metrics aggregations (seller-wide)
window.aggregate = (bundles) => {
  const ms = bundles.map(b => mockMetrics(b));
  const totalRev = ms.reduce((a, m) => a + m.revenue, 0);
  const totalSales = ms.reduce((a, m) => a + m.sales30, 0);
  const totalViews = ms.reduce((a, m) => a + m.views30, 0);
  const totalFavs = ms.reduce((a, m) => a + m.favs, 0);
  const live = ms.filter(m => m.status === 'Live').length;
  const drafts = ms.filter(m => m.status === 'Draft').length;
  const updating = ms.filter(m => m.status === 'Updating').length;
  return { totalRev, totalSales, totalViews, totalFavs, live, drafts, updating, conv: totalSales / totalViews * 100 };
};
