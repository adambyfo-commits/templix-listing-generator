// Variation 2 — GALLERY: visual-first card grid with filter rail.
// Pinterest-style for browsing your shop. Big covers, hover stats.

function GalleryDashboard() {
  const D = window.TEMPLIX_DATA;
  const bundles = D.bundles;

  const Card = ({ b, idx }) => {
    const m = mockMetrics(b);
    return (
      <div style={{
        position: 'relative',
        background: T.paper50,
        borderRadius: 8,
        overflow: 'hidden',
        boxShadow: '0 1px 2px rgba(27,26,23,0.05), 0 0 0 1px rgba(27,26,23,0.05)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ position: 'relative', aspectRatio: '0.7', background: T.paper200 }}>
          <Cover src={b.firstImage} w="100%" h="100%" radius={0} />
          <div style={{ position: 'absolute', top: 8, left: 8 }}>
            <TierBadge tier={b.tier} />
          </div>
          <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(248,245,238,0.92)', borderRadius: 4, padding: '3px 7px', fontSize: 11, fontWeight: 600, color: T.ink900 }}>{b.price}</div>
          <div style={{ position: 'absolute', bottom: 8, left: 8, right: 8, display: 'flex', gap: 6 }}>
            <span style={{ background: 'rgba(27,26,23,0.78)', color: T.paper50, padding: '2px 6px', borderRadius: 3, fontSize: 10, fontFamily: 'Geist Mono, ui-monospace, monospace' }}>{b.totalProducts}P</span>
            <span style={{ background: 'rgba(27,26,23,0.78)', color: T.paper50, padding: '2px 6px', borderRadius: 3, fontSize: 10, fontFamily: 'Geist Mono, ui-monospace, monospace' }}>{b.gallery}img</span>
            <div style={{ flex: 1 }} />
            {m.status !== 'Live' && <span style={{ background: T.warn, color: T.paper50, padding: '2px 6px', borderRadius: 3, fontSize: 10 }}>{m.status}</span>}
          </div>
        </div>
        <div style={{ padding: '10px 12px 12px' }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: T.ink900, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.name}</div>
          <div className="mono" style={{ fontSize: 10, color: T.ink500, marginBottom: 8 }}>{b.id} · {b.heroMetric}</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 10, fontSize: 11, color: T.ink600 }}>
              <span><span style={{ color: T.ink400 }}>♡</span> <span className="num">{m.favs}</span></span>
              <span><span style={{ color: T.ink400 }}>◎</span> <span className="num">{fmtNum(m.views30)}</span></span>
              <span style={{ color: T.ink900, fontWeight: 600 }}><span style={{ color: T.ink400, fontWeight: 400 }}>$</span> <span className="num">{m.sales30}</span></span>
            </div>
            <Sparkline id={b.id} w={36} h={14} color={m.trend >= 0 ? T.good : T.danger} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="tx-root" style={{ width: 1440, height: 900, display: 'flex', flexDirection: 'column', background: T.paper50 }}>
      <div style={{ height: 56, padding: '0 28px', display: 'flex', alignItems: 'center', gap: 18, borderBottom: `1px solid ${T.paper200}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 26, height: 26, background: T.ink900, borderRadius: 6, color: T.paper50, fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>tx</div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Templix</div>
        </div>
        <div style={{ width: 1, height: 16, background: T.paper200 }} />
        {['Catalog', 'Studio', 'Orders', 'Reviews', 'Insights'].map((t, i) => (
          <div key={t} style={{ fontSize: 13, color: i === 0 ? T.ink900 : T.ink500, fontWeight: i === 0 ? 600 : 500, position: 'relative', paddingBottom: 2 }}>
            {t}
            {i === 0 && <div style={{ position: 'absolute', bottom: -19, left: 0, right: 0, height: 2, background: T.ink900 }} />}
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: T.paper100, borderRadius: 999, fontSize: 12.5, color: T.ink500, width: 280 }}>
          <span>⌕</span><span>Search 26 bundles</span>
        </div>
        <button style={{ padding: '7px 14px', fontSize: 13, fontWeight: 500, background: T.ink900, color: T.paper50, border: 0, borderRadius: 999 }}>+ New listing</button>
        <Avatar name="NK" size={30} />
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Filter rail */}
        <aside style={{ width: 220, padding: '24px 22px', borderRight: `1px solid ${T.paper200}`, display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 600, color: T.ink400, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Tier</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[['All bundles', 26, true], ['Plus', 9], ['Pro', 9], ['Ultimate', 8]].map(([l, c, a]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: a ? T.ink900 : T.ink600, fontWeight: a ? 600 : 500 }}>
                  <span>{l}</span>
                  <span className="mono num" style={{ fontSize: 11, color: T.ink400 }}>{c}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 600, color: T.ink400, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Category</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {['Dated planners', 'Project mgmt', 'Finance', 'Health', 'HR & people', 'Sales', 'Creative'].map(c => (
                <div key={c} style={{ fontSize: 13, color: T.ink600 }}>{c}</div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 600, color: T.ink400, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Status</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
              <div style={{ color: T.ink600 }}><span style={{ color: T.good }}>●</span> Live · 22</div>
              <div style={{ color: T.ink600 }}><span style={{ color: T.warn }}>●</span> Updating · 3</div>
              <div style={{ color: T.ink600 }}><span style={{ color: T.ink400 }}>●</span> Draft · 1</div>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 600, color: T.ink400, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Top sellers</div>
            <div style={{ fontSize: 12, color: T.ink600, lineHeight: 1.6 }}>
              UL01 Sales Machine · 64<br />
              PR01 Complete Pro · 58<br />
              PL03 Daily Bundle · 47
            </div>
          </div>
        </aside>

        {/* Grid */}
        <div style={{ flex: 1, padding: '20px 28px 28px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em' }}>Your shop, top to bottom</h1>
              <div style={{ fontSize: 13, color: T.ink500, marginTop: 4 }}>26 bundles · 41 source products · last refreshed 2m ago</div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {['Best sellers', 'Newest', 'A → Z', 'Tier'].map((s, i) => (
                <button key={s} style={{ padding: '6px 12px', fontSize: 12, fontWeight: 500, borderRadius: 999, border: i === 0 ? `1px solid ${T.ink900}` : `1px solid ${T.paper200}`, background: i === 0 ? T.ink900 : 'transparent', color: i === 0 ? T.paper50 : T.ink700 }}>{s}</button>
              ))}
              <div style={{ width: 1, height: 16, background: T.paper200, margin: '0 4px' }} />
              <div style={{ display: 'flex', border: `1px solid ${T.paper200}`, borderRadius: 6, overflow: 'hidden' }}>
                <button style={{ padding: '6px 10px', background: T.paper100, border: 0, fontSize: 12 }}>▦</button>
                <button style={{ padding: '6px 10px', background: 'transparent', border: 0, fontSize: 12, color: T.ink500 }}>≡</button>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
            {bundles.slice(0, 15).map((b, i) => <Card key={b.id} b={b} idx={i} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
window.GalleryDashboard = GalleryDashboard;
