// Variation 3 — LEDGER: dense monospace spreadsheet on cream paper.
// Print-shop / accounting feel. Tabular nums, hairline rules, no chrome.

function LedgerDashboard() {
  const D = window.TEMPLIX_DATA;
  const bundles = D.bundles;
  const agg = window.aggregate(bundles);

  const HEAD = [
    ['ID',     56, 'l'],
    ['TIER',   58, 'l'],
    ['BUNDLE', 270,'l'],
    ['PROD',   118,'l'],
    ['#',      32, 'r'],
    ['PAGES',  68, 'r'],
    ['IMG',    44, 'r'],
    ['PRICE',  56, 'r'],
    ['VIEWS·30',74, 'r'],
    ['SALES',  52, 'r'],
    ['CONV',   54, 'r'],
    ['REV·30', 74, 'r'],
    ['TREND',  52, 'r'],
    ['STATUS', 70, 'l'],
  ];

  const cell = (txt, w, align, bold, color) => (
    <div style={{
      width: w, padding: '6px 10px',
      fontFamily: 'Geist Mono, ui-monospace, monospace',
      fontSize: 11.5, color: color || T.ink800,
      textAlign: align === 'r' ? 'right' : 'left',
      fontWeight: bold ? 600 : 400,
      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      fontVariantNumeric: 'tabular-nums',
    }}>{txt}</div>
  );

  return (
    <div className="tx-root" style={{
      width: 1440, height: 900, background: T.paper100,
      padding: 28, display: 'flex', flexDirection: 'column', gap: 18,
    }}>
      {/* Masthead */}
      <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: `2px solid ${T.ink900}`, paddingBottom: 10 }}>
        <div>
          <div className="mono" style={{ fontSize: 10.5, color: T.ink500, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Templix · catalog ledger</div>
          <div className="serif" style={{ fontSize: 38, lineHeight: 1, marginTop: 4, letterSpacing: '-0.02em' }}>The Catalog, page 01</div>
        </div>
        <div style={{ display: 'flex', gap: 28, alignItems: 'flex-end' }}>
          <div className="mono" style={{ fontSize: 11, color: T.ink600 }}>
            <div>FY 2026 · NOV</div>
            <div>SHOP nora.kerr</div>
            <div>SYNC 2:14 PM EST</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="mono" style={{ fontSize: 10.5, color: T.ink500, letterSpacing: '0.1em' }}>30-DAY GROSS</div>
            <div className="serif num" style={{ fontSize: 36, lineHeight: 1, letterSpacing: '-0.02em' }}>{fmtRev(agg.totalRev)}</div>
          </div>
        </div>
      </header>

      {/* Folio strip */}
      <div style={{ display: 'flex', borderTop: `1px solid ${T.ink900}`, borderBottom: `1px solid ${T.ink900}` }}>
        {[
          ['BUNDLES', '26', 'live · 22'],
          ['PRODUCTS', '41', '15 categories'],
          ['SALES', fmtNum(agg.totalSales), 'units · 30d'],
          ['VIEWS', fmtNum(agg.totalViews), 'visits · 30d'],
          ['FAVORITES', fmtNum(agg.totalFavs), 'across shop'],
          ['CONVERSION', fmtPct(agg.conv), '+0.4 pp'],
        ].map(([k, v, sub], i, arr) => (
          <div key={k} style={{ flex: 1, padding: '14px 18px', borderRight: i < arr.length - 1 ? `1px solid ${T.ink900}` : 'none', display: 'flex', flexDirection: 'column' }}>
            <div className="mono" style={{ fontSize: 10, color: T.ink500, letterSpacing: '0.12em' }}>{k}</div>
            <div className="serif num" style={{ fontSize: 26, lineHeight: 1.05, marginTop: 2 }}>{v}</div>
            <div className="mono" style={{ fontSize: 10, color: T.ink500, marginTop: 4 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ flex: 1, background: T.paper50, border: `1px solid ${T.ink900}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: `1px solid ${T.ink900}`, background: T.paper100 }}>
          {HEAD.map(([t, w, a]) => (
            <div key={t} style={{
              width: w, padding: '6px 10px',
              fontFamily: 'Geist Mono, ui-monospace, monospace',
              fontSize: 10, color: T.ink900, fontWeight: 700,
              letterSpacing: '0.1em', textAlign: a === 'r' ? 'right' : 'left',
              borderRight: `1px dashed ${T.paper300}`,
            }}>{t}</div>
          ))}
        </div>
        {bundles.slice(0, 22).map((b, i) => {
          const m = mockMetrics(b);
          const row = [
            [b.id, T.ink500, false],
            [b.tier.toUpperCase(), tierColor(b.tier).fg, true],
            [b.name, T.ink900, true],
            [b.products, T.ink600, false],
            [b.totalProducts, T.ink800, false],
            [parseInt(b.heroMetric).toLocaleString(), T.ink800, false],
            [b.gallery, T.ink600, false],
            [b.price, T.ink800, true],
            [fmtNum(m.views30), T.ink600, false],
            [m.sales30, T.ink900, true],
            [m.conv.toFixed(1) + '%', T.ink600, false],
            [fmtRev(m.revenue), T.ink900, true],
            [fmtTrend(m.trend), m.trend >= 0 ? T.good : T.danger, true],
            [m.status === 'Live' ? '●LIVE' : m.status === 'Draft' ? '○DRAFT' : '◐UPDT', m.status === 'Live' ? T.good : m.status === 'Draft' ? T.ink400 : T.warn, false],
          ];
          return (
            <div key={b.id} style={{ display: 'flex', borderBottom: `1px dotted ${T.paper200}`, background: i % 2 === 1 ? T.paper100 : T.paper50 }}>
              {row.map(([txt, color, bold], j) => (
                <div key={j} style={{ width: HEAD[j][1], borderRight: j < row.length - 1 ? `1px dashed ${T.paper300}` : 'none' }}>
                  {cell(txt, HEAD[j][1], HEAD[j][2], bold, color)}
                </div>
              ))}
            </div>
          );
        })}
        <div style={{ marginTop: 'auto', display: 'flex', borderTop: `2px solid ${T.ink900}`, background: T.paper100 }}>
          {cell('TOTAL', HEAD[0][1] + HEAD[1][1], 'l', true, T.ink900)}
          {cell('26 bundles · 41 products', HEAD[2][1] + HEAD[3][1] + HEAD[4][1], 'l', false, T.ink600)}
          {cell('—', HEAD[5][1], 'r', false, T.ink400)}
          {cell(bundles.reduce((a,b)=>a+(parseInt(b.gallery)||0),0), HEAD[6][1], 'r', true, T.ink900)}
          {cell('—', HEAD[7][1], 'r', false, T.ink400)}
          {cell(fmtNum(agg.totalViews), HEAD[8][1], 'r', true, T.ink900)}
          {cell(fmtNum(agg.totalSales), HEAD[9][1], 'r', true, T.ink900)}
          {cell(fmtPct(agg.conv), HEAD[10][1], 'r', true, T.ink900)}
          {cell(fmtRev(agg.totalRev), HEAD[11][1], 'r', true, T.ink900)}
          {cell('+18%', HEAD[12][1], 'r', true, T.good)}
          {cell('22L · 3U · 1D', HEAD[13][1], 'l', false, T.ink600)}
        </div>
      </div>

      <footer className="mono" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: T.ink500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        <span>Templix Master Mapping · v2026.11</span>
        <span>Page 01 of 03</span>
        <span>n.kerr@etsy · printed Tue Nov 11</span>
      </footer>
    </div>
  );
}
window.LedgerDashboard = LedgerDashboard;
