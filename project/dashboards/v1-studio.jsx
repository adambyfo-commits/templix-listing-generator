// Variation 1 — STUDIO: dense ops table with sidebar nav.
// Linear / Notion influence. Black-and-cream, no chrome.

function StudioDashboard() {
  const D = window.TEMPLIX_DATA;
  const bundles = D.bundles;
  const agg = window.aggregate(bundles);
  const [filter, setFilter] = React.useState('All');

  const filtered = filter === 'All' ? bundles : bundles.filter(b => b.tier === filter);

  const NavItem = ({ icon, label, count, active }) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px',
      borderRadius: 6, cursor: 'pointer',
      background: active ? T.paper100 : 'transparent',
      color: active ? T.ink900 : T.ink600,
      fontSize: 13, fontWeight: active ? 600 : 500,
    }}>
      <span style={{ width: 14, color: T.ink400 }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {count != null && <span className="mono num" style={{ fontSize: 11, color: T.ink500 }}>{count}</span>}
    </div>
  );

  const Th = ({ children, w, sort }) => (
    <th style={{
      textAlign: 'left', fontWeight: 500, fontSize: 11,
      color: T.ink500, textTransform: 'uppercase', letterSpacing: '0.06em',
      padding: '10px 12px', borderBottom: `1px solid ${T.paper200}`,
      width: w, whiteSpace: 'nowrap',
    }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        {children}
        {sort && <span style={{ color: T.ink300 }}>↓</span>}
      </span>
    </th>
  );

  const Td = ({ children, mono, num, color, right }) => (
    <td style={{
      padding: '11px 12px', borderBottom: `1px solid ${T.paper100}`,
      fontSize: 13, color: color || T.ink800, verticalAlign: 'middle',
      textAlign: right ? 'right' : 'left',
      fontFamily: mono ? 'Geist Mono, ui-monospace, monospace' : 'inherit',
      fontVariantNumeric: num ? 'tabular-nums' : 'normal',
    }}>{children}</td>
  );

  const StatusDot = ({ s }) => {
    const c = s === 'Live' ? T.good : s === 'Draft' ? T.ink400 : T.warn;
    return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 6, height: 6, borderRadius: 6, background: c }} />
      <span style={{ color: T.ink800 }}>{s}</span>
    </span>;
  };

  return (
    <div className="tx-root" style={{ width: 1440, height: 900, display: 'flex', background: T.paper50 }}>
      {/* Sidebar */}
      <aside style={{ width: 232, background: T.paper50, borderRight: `1px solid ${T.paper200}`, padding: '18px 14px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '0 6px 16px' }}>
          <div style={{ width: 26, height: 26, background: T.ink900, borderRadius: 6, color: T.paper50, fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: '-0.02em' }}>tx</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontWeight: 600, fontSize: 13.5, letterSpacing: '-0.01em' }}>Templix Studio</div>
            <div className="mono" style={{ fontSize: 10.5, color: T.ink500 }}>nora.kerr · etsy</div>
          </div>
        </div>
        <div style={{ fontSize: 10.5, fontWeight: 600, color: T.ink400, padding: '12px 10px 6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Catalog</div>
        <NavItem icon="◧" label="All bundles" count={26} active />
        <NavItem icon="◑" label="Plus" count={9} />
        <NavItem icon="◐" label="Pro" count={9} />
        <NavItem icon="●" label="Ultimate" count={8} />
        <NavItem icon="□" label="Products" count={41} />
        <div style={{ fontSize: 10.5, fontWeight: 600, color: T.ink400, padding: '18px 10px 6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Workflow</div>
        <NavItem icon="✎" label="Drafts" count={agg.drafts} />
        <NavItem icon="↻" label="Updating" count={agg.updating} />
        <NavItem icon="✓" label="Live" count={agg.live} />
        <NavItem icon="✦" label="Highlights" count={4} />
        <div style={{ fontSize: 10.5, fontWeight: 600, color: T.ink400, padding: '18px 10px 6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Insights</div>
        <NavItem icon="↗" label="Performance" />
        <NavItem icon="◦" label="Reviews" count={147} />
        <NavItem icon="$" label="Payouts" />
        <div style={{ flex: 1 }} />
        <div style={{ padding: 10, background: T.paper100, borderRadius: 8, fontSize: 11.5, color: T.ink600, lineHeight: 1.4 }}>
          <div style={{ fontWeight: 600, color: T.ink900, marginBottom: 2 }}>Holiday queue</div>
          12 listings ready to publish Nov 14.
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar */}
        <div style={{ height: 54, borderBottom: `1px solid ${T.paper200}`, padding: '0 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 11, color: T.ink500 }}>Catalog</div>
          <div style={{ color: T.ink300 }}>/</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>All bundles</div>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: T.paper100, borderRadius: 6, fontSize: 12, color: T.ink500, width: 240 }}>
            <span>⌕</span>
            <span>Search bundles, products…</span>
            <div style={{ flex: 1 }} />
            <span className="mono" style={{ fontSize: 10, color: T.ink400, padding: '1px 5px', border: `1px solid ${T.paper200}`, borderRadius: 3, background: T.paper50 }}>⌘K</span>
          </div>
          <button style={{ padding: '7px 13px', fontSize: 12.5, fontWeight: 500, background: T.paper50, border: `1px solid ${T.paper200}`, borderRadius: 6, color: T.ink800 }}>Import CSV</button>
          <button style={{ padding: '7px 13px', fontSize: 12.5, fontWeight: 500, background: T.ink900, color: T.paper50, border: 0, borderRadius: 6 }}>+ New bundle</button>
          <Avatar name="NK" size={28} />
        </div>

        {/* Stat strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, borderBottom: `1px solid ${T.paper200}` }}>
          {[
            ['Revenue · 30d', fmtRev(agg.totalRev), '+18%', 'NK01'],
            ['Sales · 30d', fmtNum(agg.totalSales), '+12%', 'NK02'],
            ['Views · 30d', fmtNum(agg.totalViews), '+24%', 'NK03'],
            ['Conversion', fmtPct(agg.conv), '+0.4pp', 'NK04'],
          ].map(([label, val, delta, id], i) => (
            <div key={i} style={{ padding: '18px 24px', borderRight: i < 3 ? `1px solid ${T.paper200}` : 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 11, color: T.ink500, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>{label}</div>
                <Sparkline id={id} w={68} h={20} color={T.ink700} fill />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <div className="num" style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em' }}>{val}</div>
                <div className="mono num" style={{ fontSize: 11, color: T.good }}>{delta}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ padding: '12px 24px', borderBottom: `1px solid ${T.paper100}`, display: 'flex', alignItems: 'center', gap: 8 }}>
          {['All', 'Plus', 'Pro', 'Ultimate'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '5px 11px', fontSize: 12, fontWeight: 500,
              borderRadius: 999, border: 'none',
              background: filter === f ? T.ink900 : 'transparent',
              color: filter === f ? T.paper50 : T.ink600,
            }}>{f}</button>
          ))}
          <div style={{ width: 1, height: 14, background: T.paper200, margin: '0 4px' }} />
          {['Status', 'Price', 'Updated', 'Sales 30d'].map(f => (
            <button key={f} style={{ padding: '5px 11px', fontSize: 12, color: T.ink600, background: 'transparent', border: `1px dashed ${T.paper300}`, borderRadius: 999 }}>+ {f}</button>
          ))}
          <div style={{ flex: 1 }} />
          <div className="mono" style={{ fontSize: 11, color: T.ink500 }}>{filtered.length} of {bundles.length}</div>
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: T.paper50 }}>
              <tr>
                <Th w={50}>{''}</Th>
                <Th w={70} sort>ID</Th>
                <Th>Bundle</Th>
                <Th w={92}>Tier</Th>
                <Th w={120}>Products</Th>
                <Th w={84}>Pages</Th>
                <Th w={90}>Status</Th>
                <Th w={120}>Sales · 30d</Th>
                <Th w={130}>Trend</Th>
                <Th w={100}>Revenue</Th>
                <Th w={36}>{''}</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 11).map((b, i) => {
                const m = mockMetrics(b);
                return (
                  <tr key={b.id} style={{ background: i % 2 === 1 ? 'rgba(239,234,224,0.25)' : 'transparent' }}>
                    <Td><div style={{ width: 14, height: 14, border: `1px solid ${T.paper300}`, borderRadius: 3 }} /></Td>
                    <Td mono color={T.ink500}>{b.id}</Td>
                    <Td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Cover src={b.firstImage} w={28} h={36} radius={2} />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 500, color: T.ink900 }}>{b.name}</span>
                          <span style={{ fontSize: 11, color: T.ink500, maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.heroMetric}</span>
                        </div>
                      </div>
                    </Td>
                    <Td><TierBadge tier={b.tier} /></Td>
                    <Td mono color={T.ink600}>{b.products}</Td>
                    <Td mono num right>{(parseInt(b.heroMetric) || 0).toLocaleString()}</Td>
                    <Td><StatusDot s={m.status} /></Td>
                    <Td num>
                      <span style={{ fontWeight: 600 }}>{m.sales30}</span>
                      <span style={{ color: T.ink400 }}> / {fmtNum(m.views30)}v</span>
                    </Td>
                    <Td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Sparkline id={b.id} w={56} h={18} color={m.trend >= 0 ? T.good : T.danger} />
                        <span className="mono num" style={{ fontSize: 11, color: m.trend >= 0 ? T.good : T.danger }}>{fmtTrend(m.trend)}</span>
                      </div>
                    </Td>
                    <Td num right><span style={{ fontWeight: 600 }}>{fmtRev(m.revenue)}</span></Td>
                    <Td><span style={{ color: T.ink400, fontSize: 16, lineHeight: 1 }}>⋯</span></Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ height: 36, borderTop: `1px solid ${T.paper200}`, padding: '0 24px', display: 'flex', alignItems: 'center', gap: 16, fontSize: 11, color: T.ink500 }}>
          <span className="mono">11 of {filtered.length}</span>
          <div style={{ flex: 1 }} />
          <span className="mono">Last sync · 2 min ago</span>
          <span style={{ color: T.good, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: 6, background: T.good }} /> Etsy connected
          </span>
        </div>
      </main>
    </div>
  );
}
window.StudioDashboard = StudioDashboard;
