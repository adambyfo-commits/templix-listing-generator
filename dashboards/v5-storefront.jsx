// Variation 5 — STOREFRONT: warm seller-home with hero performance
// + scrolling shelves of bundles below.

function StorefrontDashboard() {
  const D = window.TEMPLIX_DATA;
  const bundles = D.bundles;
  const agg = window.aggregate(bundles);

  const Shelf = ({ title, items, sub }) => (
    <div style={{ marginTop: 18 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em' }}>{title}</div>
          <div style={{ fontSize: 11.5, color: T.ink500 }}>{sub}</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: T.ink500 }}>See all →</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, overflow: 'hidden' }}>
        {items.slice(0, 6).map(b => {
          const m = mockMetrics(b);
          return (
            <div key={b.id} style={{ width: 168, flexShrink: 0 }}>
              <div style={{ position: 'relative', aspectRatio: '0.72' }}>
                <Cover src={b.firstImage} radius={6} />
                <div style={{ position: 'absolute', top: 6, left: 6 }}><TierBadge tier={b.tier} /></div>
                <div style={{ position: 'absolute', bottom: 6, right: 6, background: 'rgba(248,245,238,0.94)', padding: '2px 7px', borderRadius: 3, fontSize: 11, fontWeight: 600 }}>{b.price}</div>
              </div>
              <div style={{ marginTop: 7, fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.name}</div>
              <div className="mono" style={{ fontSize: 10, color: T.ink500, marginTop: 1 }}>{b.id} · {m.sales30} sold · ♡{m.favs}</div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="tx-root" style={{ width: 1440, height: 900, background: T.paper50, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ height: 56, padding: '0 32px', display: 'flex', alignItems: 'center', gap: 24, borderBottom: `1px solid ${T.paper200}` }}>
        <div className="serif" style={{ fontSize: 22, letterSpacing: '-0.02em' }}>Templix</div>
        <div style={{ width: 1, height: 18, background: T.paper200 }} />
        {['Home', 'Bundles', 'Products', 'Studio', 'Insights'].map((t, i) => (
          <div key={t} style={{ fontSize: 13, color: i === 0 ? T.ink900 : T.ink500, fontWeight: i === 0 ? 600 : 500 }}>{t}</div>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: T.paper100, borderRadius: 999, fontSize: 12.5, color: T.ink500, width: 240 }}>
          <span>⌕</span><span>Search shop</span>
        </div>
        <Avatar name="NK" size={30} />
      </div>

      <div style={{ padding: '22px 32px 32px' }}>
        {/* Hero */}
        <div style={{ background: T.ink900, color: T.paper50, borderRadius: 14, padding: 28, display: 'flex', gap: 28, position: 'relative', overflow: 'hidden' }}>
          <div style={{ flex: 1.2 }}>
            <div className="mono" style={{ fontSize: 10.5, color: T.paper200, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Good afternoon, Nora</div>
            <div className="serif" style={{ fontSize: 46, lineHeight: 1.05, marginTop: 6, letterSpacing: '-0.025em' }}>
              You earned {fmtRev(agg.totalRev)} <br/>
              <span style={{ color: T.paper200, fontStyle: 'italic' }}>this month so far.</span>
            </div>
            <div style={{ display: 'flex', gap: 24, marginTop: 20 }}>
              {[
                ['Sales', fmtNum(agg.totalSales), '+12%'],
                ['Views', fmtNum(agg.totalViews), '+24%'],
                ['Favorites', fmtNum(agg.totalFavs), '+9%'],
                ['Conv.', fmtPct(agg.conv), '+0.4 pp'],
              ].map(([k, v, d]) => (
                <div key={k} style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className="mono" style={{ fontSize: 9.5, color: T.paper200, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.7 }}>{k}</div>
                  <div className="num" style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.1, marginTop: 2 }}>{v}</div>
                  <div className="mono num" style={{ fontSize: 11, color: '#9DC79E', marginTop: 1 }}>{d}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button style={{ padding: '9px 18px', fontSize: 12.5, fontWeight: 600, background: T.paper50, color: T.ink900, border: 0, borderRadius: 999 }}>Open performance</button>
              <button style={{ padding: '9px 18px', fontSize: 12.5, fontWeight: 500, background: 'transparent', color: T.paper50, border: `1px solid rgba(248,245,238,0.3)`, borderRadius: 999 }}>Schedule a sale</button>
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: 'rgba(248,245,238,0.08)', borderRadius: 10, padding: '14px 16px' }}>
              <div className="mono" style={{ fontSize: 10, color: T.paper200, letterSpacing: '0.1em', opacity: 0.8 }}>BEST SELLER · 30 DAYS</div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <Cover src={bundles[19]?.firstImage} w={64} h={84} radius={4} />
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{bundles[19]?.name}</div>
                  <div style={{ fontSize: 11.5, color: T.paper200, opacity: 0.85, maxWidth: 280, lineHeight: 1.3, marginTop: 2 }}>{bundles[19]?.heroMetric} · {bundles[19]?.tier} bundle</div>
                  <div className="num" style={{ fontSize: 13, marginTop: 6 }}><span style={{ color: T.paper200 }}>$</span>1,277 · 64 sold · ♡{mockMetrics(bundles[19]||{id:'a'}).favs}</div>
                </div>
              </div>
            </div>
            <div style={{ background: 'rgba(248,245,238,0.08)', borderRadius: 10, padding: '14px 16px', display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div className="mono" style={{ fontSize: 10, color: T.paper200, letterSpacing: '0.1em', opacity: 0.8 }}>NEEDS YOUR ATTENTION</div>
                <ul style={{ margin: '8px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                  <li>· 3 listings missing 2026 dates</li>
                  <li>· 1 review (4★) awaiting reply</li>
                  <li>· Holiday sale starts in 4 days</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <Shelf title="Best sellers" sub="Top 6 by revenue · last 30 days" items={[...bundles].sort((a,b) => mockMetrics(b).revenue - mockMetrics(a).revenue)} />
        <Shelf title="Plus tier · $4.99 starters" sub={`9 bundles · most popular tier`} items={bundles.filter(b => b.tier === 'Plus')} />
      </div>
    </div>
  );
}
window.StorefrontDashboard = StorefrontDashboard;
