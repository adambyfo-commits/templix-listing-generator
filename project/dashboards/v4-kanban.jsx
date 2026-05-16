// Variation 4 — KANBAN: 3 columns by tier (Plus / Pro / Ultimate).
// Stack of mini-cards in each column, drag-by-tier metaphor.

function KanbanDashboard() {
  const D = window.TEMPLIX_DATA;
  const bundles = D.bundles;
  const byTier = { Plus: [], Pro: [], Ultimate: [] };
  bundles.forEach(b => byTier[b.tier]?.push(b));

  const colMeta = {
    Plus:     { sub: 'Single-vertical bundles · $4.99', desc: '2-product starter kits' },
    Pro:      { sub: 'Multi-vertical bundles · $9.99', desc: '4-5 product systems' },
    Ultimate: { sub: 'Full suites · $19.99',           desc: '5-8 product mega-bundles' },
  };

  const Card = ({ b }) => {
    const m = mockMetrics(b);
    const c = tierColor(b.tier);
    return (
      <div style={{
        background: T.paper50, borderRadius: 6, padding: 12,
        boxShadow: '0 1px 0 rgba(27,26,23,0.08), 0 0 0 1px rgba(27,26,23,0.05)',
        display: 'flex', flexDirection: 'column', gap: 9,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <Cover src={b.firstImage} w={42} h={56} radius={3} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="mono" style={{ fontSize: 10, color: T.ink400, marginBottom: 1 }}>{b.id} · {b.totalProducts}p · {b.gallery}img</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.ink900, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.name}</div>
            <div style={{ fontSize: 10.5, color: T.ink500, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.products}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 12, fontSize: 11 }}>
            <span><span style={{ color: T.ink400 }}>$</span> <span className="num" style={{ fontWeight: 600 }}>{m.sales30}</span></span>
            <span style={{ color: T.ink500 }}><span style={{ color: T.ink400 }}>♡</span> <span className="num">{m.favs}</span></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Sparkline id={b.id} w={36} h={12} color={m.trend >= 0 ? T.good : T.danger} />
            <span className="mono num" style={{ fontSize: 10, color: m.trend >= 0 ? T.good : T.danger }}>{fmtTrend(m.trend)}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4, fontSize: 9.5 }}>
          {m.status === 'Live' && <span style={{ background: T.proBg, color: T.pro, padding: '1px 6px', borderRadius: 3 }}>● LIVE</span>}
          {m.status !== 'Live' && <span style={{ background: T.paper200, color: T.ink600, padding: '1px 6px', borderRadius: 3 }}>○ {m.status.toUpperCase()}</span>}
          {m.conv > 1.8 && <span style={{ background: c.bg, color: c.fg, padding: '1px 6px', borderRadius: 3, fontWeight: 600 }}>★ TOP</span>}
          {m.trend < 0 && <span style={{ background: '#F4DCD2', color: T.danger, padding: '1px 6px', borderRadius: 3 }}>↓ NEEDS LOVE</span>}
        </div>
      </div>
    );
  };

  const Column = ({ tier, items }) => {
    const c = tierColor(tier);
    const meta = colMeta[tier];
    const tierAgg = items.reduce((a, b) => {
      const m = mockMetrics(b);
      return { sales: a.sales + m.sales30, rev: a.rev + m.revenue };
    }, { sales: 0, rev: 0 });
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: T.paper100, borderRadius: 10, padding: 14 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{ width: 8, height: 8, borderRadius: 8, background: c.fg }} />
              <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em' }}>{tier}</span>
              <span className="mono num" style={{ fontSize: 11, color: T.ink500, padding: '2px 7px', background: T.paper50, borderRadius: 999 }}>{items.length}</span>
            </div>
            <div style={{ fontSize: 11, color: T.ink500, marginTop: 2 }}>{meta.sub}</div>
          </div>
          <button style={{ width: 24, height: 24, borderRadius: 6, border: 'none', background: T.paper50, color: T.ink600, fontSize: 14 }}>+</button>
        </div>
        <div style={{ display: 'flex', gap: 10, padding: '8px 0 12px', borderBottom: `1px dashed ${T.paper300}`, marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <div className="mono" style={{ fontSize: 9.5, color: T.ink400, letterSpacing: '0.08em' }}>SALES·30D</div>
            <div className="num" style={{ fontSize: 17, fontWeight: 600 }}>{tierAgg.sales}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div className="mono" style={{ fontSize: 9.5, color: T.ink400, letterSpacing: '0.08em' }}>REV·30D</div>
            <div className="num" style={{ fontSize: 17, fontWeight: 600 }}>{fmtRev(tierAgg.rev)}</div>
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.slice(0, 7).map(b => <Card key={b.id} b={b} />)}
          <div style={{
            border: `1.5px dashed ${T.paper300}`, borderRadius: 6, padding: '14px 12px',
            color: T.ink500, fontSize: 12, textAlign: 'center', fontStyle: 'italic',
          }}>+ Drag a bundle here to retier</div>
        </div>
      </div>
    );
  };

  return (
    <div className="tx-root" style={{ width: 1440, height: 900, background: T.paper50, padding: '20px 28px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div className="mono" style={{ fontSize: 10.5, color: T.ink500, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Templix · catalog board</div>
          <h1 style={{ margin: '2px 0 0', fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em' }}>Tier mix</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 11, color: T.ink500 }}>Group by</div>
          <div style={{ display: 'flex', gap: 0, border: `1px solid ${T.paper200}`, borderRadius: 6, overflow: 'hidden' }}>
            {['Tier', 'Category', 'Status', 'Price'].map((s, i) => (
              <button key={s} style={{ padding: '6px 12px', fontSize: 12, border: 0, background: i === 0 ? T.ink900 : T.paper50, color: i === 0 ? T.paper50 : T.ink600 }}>{s}</button>
            ))}
          </div>
          <button style={{ padding: '7px 14px', fontSize: 12.5, fontWeight: 500, background: T.ink900, color: T.paper50, border: 0, borderRadius: 6 }}>+ New bundle</button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 14, flex: 1, minHeight: 0 }}>
        <Column tier="Plus" items={byTier.Plus} />
        <Column tier="Pro" items={byTier.Pro} />
        <Column tier="Ultimate" items={byTier.Ultimate} />
      </div>
    </div>
  );
}
window.KanbanDashboard = KanbanDashboard;
