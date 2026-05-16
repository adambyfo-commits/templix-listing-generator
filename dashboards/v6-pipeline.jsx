// Variation 6 — PIPELINE: production tracker.
// Per-bundle progress through Mapping → Copy → Gallery → CSV → Live.

function PipelineDashboard() {
  const D = window.TEMPLIX_DATA;
  const bundles = D.bundles;

  // Deterministic per-bundle stage state
  const stageFor = (b, idx) => {
    const h = (b.id.charCodeAt(2) || 0) + idx;
    const stages = ['mapping', 'copy', 'gallery', 'csv', 'live'];
    const states = stages.map((s, i) => {
      const v = (h + i * 7) % 11;
      if (i === 0) return 'done';
      if (i < (h % 5)) return 'done';
      if (i === (h % 5)) return v < 3 ? 'block' : 'wip';
      return 'todo';
    });
    return states;
  };

  const Bar = ({ states }) => (
    <div style={{ display: 'flex', gap: 3, flex: 1 }}>
      {states.map((s, i) => {
        const c = s === 'done' ? T.pro : s === 'wip' ? T.plus : s === 'block' ? T.danger : T.paper200;
        return <div key={i} style={{ flex: 1, height: 6, background: c, borderRadius: 1 }} />;
      })}
    </div>
  );

  const stageNames = ['Mapping', 'Copy', 'Gallery', 'CSV', 'Live'];

  const totals = stageNames.map((_, idx) => {
    const counts = { done: 0, wip: 0, block: 0, todo: 0 };
    bundles.forEach((b, i) => counts[stageFor(b, i)[idx]]++);
    return counts;
  });

  return (
    <div className="tx-root" style={{ width: 1440, height: 900, background: T.paper50, display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 56, padding: '0 28px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: `1px solid ${T.paper200}` }}>
        <div style={{ fontWeight: 600, fontSize: 15 }}>Templix · Production</div>
        <div className="mono" style={{ fontSize: 11, color: T.ink500 }}>26 bundles in pipeline</div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11.5, color: T.ink600 }}>
          <span><span style={{ color: T.pro }}>■</span> Done</span>
          <span><span style={{ color: T.plus }}>■</span> In progress</span>
          <span><span style={{ color: T.danger }}>■</span> Blocked</span>
          <span><span style={{ color: T.paper300 }}>■</span> To do</span>
        </div>
        <button style={{ padding: '7px 14px', fontSize: 12.5, fontWeight: 500, background: T.ink900, color: T.paper50, border: 0, borderRadius: 6 }}>Run sync</button>
      </div>

      {/* Stage funnel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', borderBottom: `1px solid ${T.paper200}`, background: T.paper100 }}>
        {stageNames.map((name, i) => {
          const c = totals[i];
          const pct = (c.done / 26) * 100;
          return (
            <div key={name} style={{ padding: '16px 20px', borderRight: i < 4 ? `1px solid ${T.paper200}` : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>{i + 1}. {name}</div>
                <div className="mono num" style={{ fontSize: 11, color: T.ink500 }}>{c.done}/26</div>
              </div>
              <div style={{ height: 6, background: T.paper200, borderRadius: 1, overflow: 'hidden', marginBottom: 6 }}>
                <div style={{ height: '100%', width: pct + '%', background: T.pro }} />
              </div>
              <div style={{ display: 'flex', gap: 8, fontSize: 10.5, color: T.ink500 }}>
                {c.wip > 0 && <span><span style={{ color: T.plus }}>●</span> {c.wip} active</span>}
                {c.block > 0 && <span><span style={{ color: T.danger }}>●</span> {c.block} blocked</span>}
                {c.todo > 0 && <span style={{ color: T.ink400 }}>{c.todo} to do</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* List header */}
      <div style={{ display: 'flex', padding: '10px 28px', fontSize: 10.5, color: T.ink500, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, borderBottom: `1px solid ${T.paper200}`, background: T.paper50 }}>
        <div style={{ width: 220 }}>Bundle</div>
        <div style={{ width: 84 }}>Tier</div>
        <div style={{ width: 92 }}>Pages</div>
        <div style={{ flex: 1 }}>Pipeline</div>
        <div style={{ width: 130 }}>Stage</div>
        <div style={{ width: 110 }}>Owner</div>
        <div style={{ width: 100 }}>ETA</div>
        <div style={{ width: 60, textAlign: 'right' }}>%</div>
      </div>

      <div style={{ flex: 1, overflow: 'hidden' }}>
        {bundles.slice(0, 14).map((b, i) => {
          const states = stageFor(b, i);
          const doneCount = states.filter(s => s === 'done').length;
          const stageIdx = states.findIndex(s => s !== 'done');
          const currentStage = stageIdx === -1 ? 'Live' : stageNames[stageIdx];
          const stageState = stageIdx === -1 ? 'done' : states[stageIdx];
          const owner = ['Nora K.', 'Cassia M.', 'Jules T.', 'Nora K.'][i % 4];
          const eta = ['Today', 'Nov 13', 'Nov 14', 'Nov 17', 'Nov 22', '—'][i % 6];
          const pct = Math.round(doneCount / 5 * 100);
          return (
            <div key={b.id} style={{
              display: 'flex', alignItems: 'center',
              padding: '12px 28px',
              borderBottom: `1px solid ${T.paper100}`,
              background: i % 2 === 1 ? 'rgba(239,234,224,0.18)' : 'transparent',
            }}>
              <div style={{ width: 220, display: 'flex', gap: 10, alignItems: 'center' }}>
                <Cover src={b.firstImage} w={28} h={36} radius={2} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.name}</div>
                  <div className="mono" style={{ fontSize: 10, color: T.ink500 }}>{b.id}</div>
                </div>
              </div>
              <div style={{ width: 84 }}><TierBadge tier={b.tier} /></div>
              <div style={{ width: 92, display: 'flex', flexDirection: 'column' }}>
                <span className="mono num" style={{ fontSize: 12, fontWeight: 600 }}>{parseInt(b.heroMetric).toLocaleString()}</span>
                <span style={{ fontSize: 10, color: T.ink500 }}>{b.totalProducts} products</span>
              </div>
              <div style={{ flex: 1, paddingRight: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Bar states={states} />
              </div>
              <div style={{ width: 130, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: 6, background: stageState === 'done' ? T.pro : stageState === 'wip' ? T.plus : stageState === 'block' ? T.danger : T.ink400 }} />
                <span style={{ fontSize: 12 }}>{currentStage}</span>
                {stageState === 'block' && <span className="mono" style={{ fontSize: 9.5, color: T.danger, padding: '0 5px', background: '#F4DCD2', borderRadius: 2 }}>BLOCK</span>}
              </div>
              <div style={{ width: 110, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Avatar name={owner.split(' ')[0][0] + owner.split(' ')[1][0]} size={20} />
                <span style={{ fontSize: 11.5, color: T.ink600 }}>{owner}</span>
              </div>
              <div style={{ width: 100 }}>
                <span style={{ fontSize: 11.5, color: eta === 'Today' ? T.warn : T.ink600, fontWeight: eta === 'Today' ? 600 : 400 }}>{eta}</span>
              </div>
              <div style={{ width: 60, textAlign: 'right' }} className="num"><span style={{ fontSize: 12.5, fontWeight: 600 }}>{pct}%</span></div>
            </div>
          );
        })}
      </div>
      <div style={{ padding: '10px 28px', borderTop: `1px solid ${T.paper200}`, fontSize: 11.5, color: T.ink500, display: 'flex', gap: 16 }}>
        <span className="mono">Showing 14 of 26 in pipeline</span>
        <div style={{ flex: 1 }} />
        <span>Avg cycle time · 4.2 days</span>
        <span>Velocity · 3.8 bundles / week</span>
      </div>
    </div>
  );
}
window.PipelineDashboard = PipelineDashboard;
