// Variation 8 — CONSOLE: master/detail split pane.
// Left: terse list. Right: deep detail of one bundle (hero copy, products, gallery).

function ConsoleDashboard() {
  const D = window.TEMPLIX_DATA;
  const bundles = D.bundles;
  const products = D.products;
  const selected = bundles.find(b => b.id === 'PR01') || bundles[9];
  const m = mockMetrics(selected);

  // Map products in selected bundle
  const ids = (selected.products || '').split(/\s*\+\s*/).map(s => s.trim().toLowerCase());
  const inBundle = ids.map(id => products.find(p => p.id === id) || { id, name: id.toUpperCase(), category: '—', price: '—' });

  // Mock pages from product covers
  const pageThumbs = inBundle.flatMap(p => p.sampleUrl ? [p.sampleUrl] : []).slice(0, 8);

  return (
    <div className="tx-root" style={{ width: 1440, height: 900, background: T.paper50, display: 'flex' }}>
      {/* List pane */}
      <div style={{ width: 360, background: T.paper100, borderRight: `1px solid ${T.paper200}`, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '14px 16px', borderBottom: `1px solid ${T.paper200}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 22, height: 22, background: T.ink900, borderRadius: 5, color: T.paper50, fontWeight: 700, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>tx</div>
          <div style={{ fontWeight: 600, fontSize: 13.5 }}>Bundles</div>
          <span className="mono num" style={{ fontSize: 10.5, color: T.ink500, marginLeft: 'auto' }}>26</span>
          <button style={{ width: 22, height: 22, borderRadius: 5, border: 'none', background: T.ink900, color: T.paper50, fontSize: 13, lineHeight: 1 }}>+</button>
        </div>
        <div style={{ padding: '8px 12px', borderBottom: `1px solid ${T.paper200}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: T.paper50, border: `1px solid ${T.paper200}`, borderRadius: 5, fontSize: 11.5, color: T.ink500 }}>
            <span>⌕</span><span>Filter…</span>
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {bundles.slice(0, 14).map(b => {
            const isSel = b.id === selected.id;
            const bm = mockMetrics(b);
            return (
              <div key={b.id} style={{
                padding: '10px 14px',
                background: isSel ? T.paper50 : 'transparent',
                borderBottom: `1px solid ${T.paper200}`,
                borderLeft: `3px solid ${isSel ? T.ink900 : 'transparent'}`,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <Cover src={b.firstImage} w={32} h={42} radius={2} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="mono" style={{ fontSize: 9.5, color: T.ink500 }}>{b.id}</span>
                    <TierBadge tier={b.tier} />
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: isSel ? 600 : 500, color: T.ink900, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.name}</div>
                  <div style={{ fontSize: 10.5, color: T.ink500, display: 'flex', gap: 8 }} className="num">
                    <span>{bm.sales30} sold</span><span>·</span><span style={{ color: bm.trend >= 0 ? T.good : T.danger }}>{fmtTrend(bm.trend)}</span>
                  </div>
                </div>
                <Sparkline id={b.id} w={32} h={14} color={bm.trend >= 0 ? T.good : T.danger} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail pane */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Toolbar */}
        <div style={{ height: 50, padding: '0 24px', borderBottom: `1px solid ${T.paper200}`, display: 'flex', alignItems: 'center', gap: 14 }}>
          <span className="mono" style={{ fontSize: 11, color: T.ink500 }}>{selected.id}</span>
          <span style={{ color: T.ink300 }}>/</span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{selected.name}</span>
          <TierBadge tier={selected.tier} />
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: T.good }}>
            <span style={{ width: 6, height: 6, borderRadius: 6, background: T.good }} /> Live on Etsy
          </span>
          <div style={{ flex: 1 }} />
          <button style={{ padding: '6px 12px', fontSize: 12, fontWeight: 500, background: 'transparent', border: `1px solid ${T.paper200}`, borderRadius: 5, color: T.ink700 }}>Preview</button>
          <button style={{ padding: '6px 12px', fontSize: 12, fontWeight: 500, background: 'transparent', border: `1px solid ${T.paper200}`, borderRadius: 5, color: T.ink700 }}>Export CSV</button>
          <button style={{ padding: '6px 14px', fontSize: 12, fontWeight: 600, background: T.ink900, color: T.paper50, border: 0, borderRadius: 5 }}>Publish update</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 24, padding: '0 24px', borderBottom: `1px solid ${T.paper200}` }}>
          {['Overview', 'Listing copy', 'Products', 'Gallery', 'Pricing', 'Activity'].map((t, i) => (
            <div key={t} style={{ padding: '12px 0', fontSize: 12.5, color: i === 0 ? T.ink900 : T.ink500, fontWeight: i === 0 ? 600 : 500, borderBottom: `2px solid ${i === 0 ? T.ink900 : 'transparent'}`, marginBottom: -1 }}>{t}</div>
          ))}
        </div>

        <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
          {/* Center column */}
          <div style={{ flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 }}>
            <div style={{ display: 'flex', gap: 18 }}>
              <div style={{ width: 168, height: 224, flexShrink: 0 }}>
                <Cover src={selected.firstImage} radius={6} />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div className="mono" style={{ fontSize: 10, color: T.ink500, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Hero copy</div>
                <div className="serif" style={{ fontSize: 30, lineHeight: 1.05, letterSpacing: '-0.02em', marginTop: 4 }}>{selected.heroTitle}</div>
                <div style={{ fontSize: 13, color: T.ink600, marginTop: 4, fontFamily: 'Geist Mono, ui-monospace, monospace' }}>{selected.heroMetric}</div>
                <p style={{ fontSize: 12.5, color: T.ink700, lineHeight: 1.55, margin: '10px 0 0' }}>{selected.heroTagline}</p>
                <div style={{ flex: 1 }} />
                <div style={{ display: 'flex', gap: 22, marginTop: 14 }}>
                  {[['Price', selected.price], ['Products', selected.totalProducts], ['Pages', parseInt(selected.heroMetric).toLocaleString()], ['Gallery', selected.gallery + ' img']].map(([k, v]) => (
                    <div key={k}>
                      <div style={{ fontSize: 10, color: T.ink500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{k}</div>
                      <div className="serif num" style={{ fontSize: 22, lineHeight: 1.05, marginTop: 2 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Products in bundle */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>Products in this bundle <span style={{ color: T.ink400, fontWeight: 400 }}>· {inBundle.length}</span></div>
                <span style={{ fontSize: 11, color: T.ink500 }}>Reorder · Replace</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(inBundle.length, 5)}, 1fr)`, gap: 10 }}>
                {inBundle.map((p, i) => (
                  <div key={p.id} style={{ background: T.paper100, borderRadius: 6, padding: 10, display: 'flex', gap: 9 }}>
                    <Cover src={p.sampleUrl} w={36} h={48} radius={2} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div className="mono" style={{ fontSize: 9.5, color: T.ink500, textTransform: 'uppercase' }}>{p.id}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                      <div style={{ fontSize: 10.5, color: T.ink500 }}>{p.category}</div>
                      <div className="num" style={{ fontSize: 10.5, color: T.ink600, marginTop: 2 }}>{p.galleryImages || 0} img</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gallery strip */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>Gallery preview <span style={{ color: T.ink400, fontWeight: 400 }}>· first 8 of {selected.gallery}</span></div>
                <span style={{ fontSize: 11, color: T.ink500 }}>Open gallery editor →</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 6 }}>
                {Array.from({length: 8}).map((_, i) => (
                  <div key={i} style={{ aspectRatio: '0.7' }}>
                    <Cover src={pageThumbs[i] || selected.firstImage} radius={3} label={`P${i + 1}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right rail — performance */}
          <div style={{ width: 280, borderLeft: `1px solid ${T.paper200}`, padding: '20px 20px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <div className="mono" style={{ fontSize: 10, color: T.ink500, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Performance · 30 days</div>
              <Sparkline id={selected.id} w={240} h={56} color={T.ink900} fill />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
                {[['Sales', m.sales30, fmtTrend(m.trend)], ['Revenue', fmtRev(m.revenue), '+22%'], ['Views', fmtNum(m.views30), '+15%'], ['Favorites', m.favs, '+9%']].map(([k, v, d]) => (
                  <div key={k}>
                    <div style={{ fontSize: 10, color: T.ink500 }}>{k}</div>
                    <div className="num" style={{ fontSize: 16, fontWeight: 600 }}>{v}</div>
                    <div className="mono num" style={{ fontSize: 10, color: T.good }}>{d}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="hr" />
            <div>
              <div className="mono" style={{ fontSize: 10, color: T.ink500, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Recent activity</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                {[
                  ['Sale', '5 min ago', 'M. Larsen · DK'],
                  ['Favorite', '1h ago', 'planner_studio'],
                  ['Review (5★)', '2h ago', 'A. Okafor'],
                  ['Sale', '3h ago', 'C. Fischer · DE'],
                  ['Listing edited', '1d ago', 'You'],
                ].map(([t, when, who], i) => (
                  <div key={i} style={{ fontSize: 11.5, color: T.ink700, display: 'flex', justifyContent: 'space-between' }}>
                    <span><span style={{ fontWeight: 600 }}>{t}</span> · {who}</span>
                    <span style={{ color: T.ink400 }}>{when}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="hr" />
            <div>
              <div className="mono" style={{ fontSize: 10, color: T.ink500, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Listing health</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8, fontSize: 11.5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>13 tags filled</span><span style={{ color: T.good }}>✓</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{selected.gallery} gallery images</span><span style={{ color: T.good }}>✓</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>SEO description (340 chars)</span><span style={{ color: T.good }}>✓</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>2026 dates</span><span style={{ color: T.warn }}>⚠ partial</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Holiday sale</span><span style={{ color: T.ink400 }}>not set</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
window.ConsoleDashboard = ConsoleDashboard;
