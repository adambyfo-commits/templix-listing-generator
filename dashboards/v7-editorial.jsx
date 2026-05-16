// Variation 7 — EDITORIAL: magazine-style spotlight.
// Big serif headlines, asymmetric grid, one bundle in the spotlight.

function EditorialDashboard() {
  const D = window.TEMPLIX_DATA;
  const bundles = D.bundles;
  const featured = bundles.find(b => b.id === 'UL01') || bundles[19] || bundles[0];
  const fm = mockMetrics(featured);

  return (
    <div className="tx-root" style={{ width: 1440, height: 900, background: T.paper50, padding: '24px 36px', display: 'flex', flexDirection: 'column' }}>
      {/* Masthead */}
      <header style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', borderBottom: `2px solid ${T.ink900}`, paddingBottom: 14 }}>
        <div className="serif" style={{ fontSize: 30, letterSpacing: '-0.025em', lineHeight: 1 }}>
          The Templix Quarterly
        </div>
        <div className="mono" style={{ fontSize: 10.5, color: T.ink600, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
          Vol. IV · Issue 11 · Nov 2026 · An Etsy Shop Review
        </div>
        <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
          {['Catalog', 'Studio', 'Insights', 'Reviews'].map(l => <span key={l} style={{ fontSize: 11.5, color: T.ink700 }}>{l}</span>)}
          <Avatar name="NK" size={26} />
        </div>
      </header>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1.6fr 0.9fr', gap: 24, padding: '20px 0 0', minHeight: 0 }}>
        {/* Left col — issue notes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <div className="mono" style={{ fontSize: 10, color: T.ink500, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Editor's note</div>
            <div className="serif" style={{ fontSize: 22, lineHeight: 1.15, marginTop: 6, letterSpacing: '-0.01em' }}>
              Eight new bundles. Three sold out by lunch.
            </div>
            <p style={{ fontSize: 12.5, color: T.ink700, lineHeight: 1.55, marginTop: 10 }}>
              The Ultimate tier is finally pulling its weight. Sales Machine continues to lead, but it's the Project Manager Suite — quiet for two months — that posted a {fmtTrend(38)} jump after the homepage refresh on Nov&nbsp;3rd.
            </p>
          </div>
          <div className="hr" />
          <div>
            <div className="mono" style={{ fontSize: 10, color: T.ink500, letterSpacing: '0.14em', textTransform: 'uppercase' }}>By the numbers · 30d</div>
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[['Revenue', '$5,940', '+18%'], ['Orders', '643', '+12%'], ['Visitors', '54,212', '+24%'], ['Favorites', '2,861', '+9%'], ['Avg. order', '$9.24', '+5%']].map(([k, v, d]) => (
                <div key={k} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', borderBottom: `1px dotted ${T.paper200}`, paddingBottom: 7 }}>
                  <span style={{ fontSize: 12, color: T.ink600 }}>{k}</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span className="serif num" style={{ fontSize: 18 }}>{v}</span>
                    <span className="mono num" style={{ fontSize: 10.5, color: T.good }}>{d}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="hr" />
          <div>
            <div className="mono" style={{ fontSize: 10, color: T.ink500, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Inventory at a glance</div>
            <div style={{ display: 'flex', gap: 4, marginTop: 10 }}>
              <div style={{ flex: 9, height: 8, background: T.plus, borderRadius: 1 }} />
              <div style={{ flex: 9, height: 8, background: T.pro, borderRadius: 1 }} />
              <div style={{ flex: 8, height: 8, background: T.ultimate, borderRadius: 1 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: T.ink500, marginTop: 6 }}>
              <span>9 Plus</span><span>9 Pro</span><span>8 Ultimate</span>
            </div>
          </div>
        </div>

        {/* Center — featured */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="mono" style={{ fontSize: 10, color: T.ink500, letterSpacing: '0.14em', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between' }}>
            <span>Cover story · {featured.tier} bundle</span>
            <span style={{ color: T.ultimate }}>★ Best seller of November</span>
          </div>
          <div className="serif" style={{ fontSize: 56, lineHeight: 1.02, letterSpacing: '-0.03em', margin: '8px 0 4px' }}>
            {featured.name}
          </div>
          <div className="serif" style={{ fontSize: 22, fontStyle: 'italic', color: T.ink600, lineHeight: 1.25 }}>
            {featured.heroMetric}, five products, one absurdly clean cover.
          </div>
          <div style={{ display: 'flex', gap: 18, marginTop: 18, flex: 1, minHeight: 0 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Cover src={featured.firstImage} w="100%" h="100%" radius={4} />
            </div>
            <div style={{ width: 220, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ fontSize: 12.5, color: T.ink800, lineHeight: 1.6, margin: 0, columnCount: 1 }}>
                The {featured.name.toLowerCase()} bundles {featured.products.replace(/\+/g, ',')} into a single download — designed for the reMarkable Paper Pro, ready for sales teams who keep one notebook for everything.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11 }}>
                <div><div style={{ color: T.ink500 }}>Price</div><div className="serif num" style={{ fontSize: 19 }}>{featured.price}</div></div>
                <div><div style={{ color: T.ink500 }}>Sales · 30d</div><div className="serif num" style={{ fontSize: 19 }}>{fm.sales30}</div></div>
                <div><div style={{ color: T.ink500 }}>Revenue</div><div className="serif num" style={{ fontSize: 19 }}>{fmtRev(fm.revenue)}</div></div>
                <div><div style={{ color: T.ink500 }}>Conv.</div><div className="serif num" style={{ fontSize: 19 }}>{fm.conv.toFixed(1)}%</div></div>
              </div>
              <div className="hr" />
              <div>
                <div className="mono" style={{ fontSize: 9.5, color: T.ink500, letterSpacing: '0.12em' }}>30-DAY SALES</div>
                <Sparkline id={featured.id} w={210} h={42} color={T.ink900} fill />
              </div>
              <button style={{ padding: '9px 14px', fontSize: 12.5, fontWeight: 600, background: T.ink900, color: T.paper50, border: 0, borderRadius: 4, marginTop: 'auto' }}>Open the listing →</button>
            </div>
          </div>
        </div>

        {/* Right — also in this issue */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="mono" style={{ fontSize: 10, color: T.ink500, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Also in this issue</div>
          {bundles.filter(b => b.id !== featured.id).slice(0, 5).map((b, i) => {
            const m = mockMetrics(b);
            return (
              <article key={b.id} style={{ display: 'flex', gap: 12, paddingBottom: 12, borderBottom: i < 4 ? `1px solid ${T.paper200}` : 'none' }}>
                <Cover src={b.firstImage} w={64} h={84} radius={3} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="mono" style={{ fontSize: 9.5, color: T.ink500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{b.tier} · {b.id}</div>
                  <div className="serif" style={{ fontSize: 18, lineHeight: 1.1, letterSpacing: '-0.01em', marginTop: 1 }}>{b.name}</div>
                  <div style={{ fontSize: 11, color: T.ink600, marginTop: 4, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{b.heroTagline.split('|')[0]}</div>
                  <div style={{ display: 'flex', gap: 10, fontSize: 10.5, color: T.ink500, marginTop: 4 }} className="mono num">
                    <span>{m.sales30} sold</span><span>·</span><span style={{ color: m.trend >= 0 ? T.good : T.danger }}>{fmtTrend(m.trend)}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
window.EditorialDashboard = EditorialDashboard;
