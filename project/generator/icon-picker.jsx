// Inline icon picker — drops a popover next to any tile icon.
// Usage: <IconPicker current="stack" onPick={(key)=>...}>{children}</IconPicker>

function IconPicker({ current, onPick, children, label }) {
  const [open, setOpen] = React.useState(false);
  const wrapRef = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const keys = Object.keys(window.ICONS || {});

  return (
    <span ref={wrapRef} style={{ position: 'relative', display: 'inline-block' }}>
      <span
        onClick={(e) => { e.stopPropagation(); setOpen(v => !v); }}
        style={{ cursor: 'pointer', display: 'inline-block' }}
        title={label || 'Change icon'}
      >{children}</span>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)',
          background: '#211E19', border: '1px solid #3F3D38',
          borderRadius: 10, padding: 12,
          boxShadow: '0 24px 50px -20px rgba(0,0,0,0.8)',
          zIndex: 50, width: 320,
        }}>
          <div style={{
            fontFamily: 'Geist Mono, monospace', fontSize: 10,
            color: '#A8A296', letterSpacing: '0.18em', textTransform: 'uppercase',
            marginBottom: 8,
          }}>{label || 'Choose icon'}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            {keys.map(k => {
              const Comp = window.ICONS[k];
              const sel = k === current;
              return (
                <button key={k}
                  onClick={(e) => { e.stopPropagation(); onPick(k); setOpen(false); }}
                  title={k}
                  style={{
                    background: sel ? '#3F3D38' : 'transparent',
                    border: '1px solid ' + (sel ? '#B8843E' : '#2A2722'),
                    borderRadius: 6, padding: 6, cursor: 'pointer',
                    aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#F4EFE3',
                  }}>
                  <div style={{ width: 36, height: 36 }}><Comp /></div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </span>
  );
}

window.IconPicker = IconPicker;
