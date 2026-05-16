// Listing Generator app shell.
// Left column: bundle picker + title editor + card selector + Canva note.
// Right column: scrollable preview rail of all 7 cards at 2000×2000 scaled.

const { useState, useMemo, useEffect, useRef } = React;

// ── Resolve a bundle's product list from its "products" field ──────────
//   bundle.products looks like "DS02 + DS03" or "FR01 + D11 + DS03 + F03 + M01"
//   product ids are lowercase in TEMPLIX_DATA.products
function resolveProducts(bundle, allProducts) {
  if (!bundle?.products) return [];
  const ids = bundle.products.split('+').map(s => s.trim().toLowerCase()).filter(Boolean);
  return ids
    .map(id => allProducts.find(p => p.id === id))
    .filter(Boolean);
}

// ── Title suggestions: 4 deterministic formulas. AI button refreshes ──
function buildTitleSuggestions(bundle, products) {
  const names = products.map(p => p.name).join(' + ');
  const tier = bundle.tier;
  const cats = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
  const cat = cats[0] || 'Productivity';
  return [
    // Formula A: name | for reMarkable | tier
    `${bundle.name} for reMarkable Paper Pro & 2 — ${names} | ${tier} Bundle`,
    // Formula B: hook + name + tier
    `${cat} Bundle for reMarkable | ${bundle.name} | ${names} | ${tier}`,
    // Formula C: outcome-led
    `${bundle.name} Digital Planner Bundle for reMarkable — ${products.length} Hyperlinked PDFs | ${tier} Tier`,
    // Formula D: keyword-stack
    `reMarkable Planner Bundle · ${bundle.name} · ${names} · ${tier} Tier · Hyperlinked PDF`,
  ];
}

// ── Card preview tile (scaled) ─────────────────────────────────────────
function CardTile({ card, bundle, products, title, scale, focused, onFocus }) {
  const Comp = card.Component;
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 12,
      width: 2000 * scale,
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        fontFamily: 'Geist Mono, monospace',
        fontSize: 11, color: '#A8A296', letterSpacing: '0.16em', textTransform: 'uppercase',
      }}>
        <span>{card.label}</span>
        <span>2000 × 2000</span>
      </div>
      <button
        onClick={onFocus}
        onMouseDown={(e) => {
          // If nudge captured this click, swallow it so the button doesn't fire.
          if (e.target.closest && e.target.closest('[data-card-frame]')) {
            // nudge.jsx's capture handler already handled selection.
            // We still let onClick happen for the "outside" case where nudge cleared.
          }
        }}
        style={{
          all: 'unset', cursor: 'zoom-in', display: 'block',
          width: 2000 * scale, height: 2000 * scale,
          background: '#F4EFE3',
          boxShadow: focused
            ? '0 0 0 3px #B8843E, 0 30px 60px -20px rgba(0,0,0,0.5)'
            : '0 20px 50px -25px rgba(0,0,0,0.45)',
          overflow: 'hidden',
        }}
      >
        <div style={{
          width: 2000, height: 2000,
          transform: `scale(${scale})`, transformOrigin: 'top left',
        }}>
          <window.CardIdContext.Provider value={card.id}>
            <Comp bundle={bundle} products={products} title={title} />
          </window.CardIdContext.Provider>
        </div>
      </button>
    </div>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────
function Sidebar({ mode, setMode, bundles, bundle, setBundleId, title, setTitle, suggestions, onRefresh, aiBusy, products, focusId, setFocusId, onGenerateAll, genBusy, genProgress, allProducts, selectedCards, toggleCard, onExportSingle, onExportText, singleBusy, singleProgress, onIconChange, orderedCards, dragCardId, setDragCardId, moveCard, deleteCard, restoreAllCards, hasRemovedCards }) {
  const t = { fg: '#FFFFFF', bg: (window.TIER[bundle.tier] || window.TIER.Plus).accent };
  const isCore = mode === 'core';
  return (
    <div style={{
      width: 440, flexShrink: 0,
      background: '#211E19', color: '#EFEAE0',
      padding: '32px 32px 40px',
      display: 'flex', flexDirection: 'column', gap: 28,
      overflow: 'auto',
      borderRight: '1px solid #000',
    }}>
      {/* Header */}
      <div>
        <div style={{
          fontFamily: 'Geist Mono, monospace', fontSize: 11,
          color: '#A8A296', letterSpacing: '0.22em', textTransform: 'uppercase',
        }}>Templix · Listing Generator</div>
        <div style={{
          marginTop: 8,
          fontFamily: '"Instrument Serif", serif',
          fontSize: 38, lineHeight: 1, color: '#F4EFE3',
        }}>Etsy gallery · 7 cards</div>
        <div style={{ marginTop: 10, fontSize: 13, color: '#A8A296', lineHeight: 1.5 }}>
          Pick a bundle, edit the title, preview seven 2000×2000 gallery images.
          When ready, ask me to send any card or all seven to Canva.
        </div>
      </div>

      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: 0, background: '#15130F', border: '1px solid #3F3D38', borderRadius: 6, padding: 4 }}>
        {['bundles','core'].map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            flex: 1, cursor: 'pointer', border: 'none', borderRadius: 4,
            padding: '10px 12px', fontSize: 13, fontWeight: 600,
            background: mode === m ? '#3F3D38' : 'transparent',
            color: mode === m ? '#F4EFE3' : '#A8A296',
            fontFamily: 'Geist, system-ui, sans-serif',
          }}>{m === 'bundles' ? 'Bundles' : 'Core products'}</button>
        ))}
      </div>

      {/* Bundle picker */}
      <Section label={isCore ? 'Core product' : 'Bundle'}>
        <select
          value={bundle.id}
          onChange={(e) => setBundleId(e.target.value)}
          style={{
            width: '100%', appearance: 'none',
            background: '#15130F', color: '#F4EFE3',
            border: '1px solid #3F3D38', borderRadius: 6,
            padding: '14px 16px',
            fontFamily: 'Geist, system-ui, sans-serif', fontSize: 15,
          }}
        >
          {bundles.map(b => (
            <option key={b.id} value={b.id}>
              {b.id} · {b.tier} · {b.name}
            </option>
          ))}
        </select>
        <div style={{
          marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap',
        }}>
          <Pill bg={t.bg} fg={t.fg}>{bundle.tier}</Pill>
          <Pill bg="#15130F" fg="#EFEAE0" border>{bundle.price}</Pill>
          <Pill bg="#15130F" fg="#EFEAE0" border>{bundle.totalProducts} planners</Pill>
          <Pill bg="#15130F" fg="#EFEAE0" border>{bundle.gallery} pages</Pill>
        </div>
        <div style={{
          marginTop: 14, fontFamily: 'Geist Mono, monospace',
          fontSize: 11, color: '#A8A296', letterSpacing: '0.14em', textTransform: 'uppercase',
        }}>Includes</div>
        <ul style={{ margin: '8px 0 0', padding: 0, listStyle: 'none', display: 'grid', gap: 6 }}>
          {products.map(p => (
            <li key={p.id} style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: 13, color: '#EFEAE0',
              padding: '6px 0', borderBottom: '1px solid #2A2722',
            }}>
              <span>{p.name}</span>
              <span style={{ color: '#A8A296', fontFamily: 'Geist Mono, monospace', fontSize: 11 }}>
                {p.id.toUpperCase()}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      {/* Title editor */}
      <Section
        label="Title"
        meta={`${title.length} / 140`}
        metaTone={title.length > 140 ? '#E8765F' : title.length > 130 ? '#E8C547' : '#A8A296'}
      >
        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          rows={4}
          style={{
            width: '100%',
            background: '#15130F', color: '#F4EFE3',
            border: '1px solid #3F3D38', borderRadius: 6,
            padding: '12px 14px', resize: 'vertical',
            fontFamily: 'Geist, system-ui, sans-serif',
            fontSize: 14, lineHeight: 1.4,
            boxSizing: 'border-box',
          }}
        />
        <button
          onClick={onRefresh}
          disabled={aiBusy}
          style={{
            marginTop: 12, width: '100%', cursor: aiBusy ? 'wait' : 'pointer',
            background: aiBusy ? '#3F3D38' : '#F4EFE3', color: aiBusy ? '#A8A296' : '#1B1A17',
            border: 'none', borderRadius: 6,
            padding: '12px 14px', fontWeight: 600, fontSize: 14,
            fontFamily: 'Geist, system-ui, sans-serif',
          }}
        >{aiBusy ? 'Drafting…' : '✦ Suggest titles with AI'}</button>
        <div style={{
          marginTop: 12,
          fontFamily: 'Geist Mono, monospace', fontSize: 11,
          color: '#A8A296', letterSpacing: '0.14em', textTransform: 'uppercase',
        }}>Or pick a template</div>
        <div style={{ marginTop: 8, display: 'grid', gap: 6 }}>
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => setTitle(s)}
              style={{
                cursor: 'pointer', textAlign: 'left',
                background: 'transparent', color: '#EFEAE0',
                border: '1px solid #3F3D38', borderRadius: 6,
                padding: '10px 12px',
                fontFamily: 'Geist, system-ui, sans-serif',
                fontSize: 12, lineHeight: 1.4,
              }}
            >
              <span style={{ color: '#A8A296', marginRight: 8 }}>{String.fromCharCode(65 + i)}</span>
              {s}
            </button>
          ))}
        </div>
      </Section>

      {/* Discount ribbon toggle */}
      <Section label="Discount ribbon">
        <label style={{
          display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
          padding: '10px 12px', background: '#15130F',
          border: '1px solid #3F3D38', borderRadius: 6,
        }}>
          <input
            type="checkbox"
            checked={!window.RIBBON_HIDDEN}
            onChange={(e) => {
              window.RIBBON_HIDDEN = !e.target.checked;
              if (onIconChange) onIconChange();
            }}
            style={{ accentColor: '#B8843E', width: 16, height: 16, cursor: 'pointer' }}
          />
          <span style={{ fontSize: 13, color: '#F4EFE3' }}>Show "50% OFF" ribbon on all cards</span>
        </label>
      </Section>

      {/* Hero icon picker — live swap the 3 tile glyphs */}
      <Section label="Hero icons" meta="3 tiles">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {[1, 2, 3].map(n => {
            const defaults = ['checklist','download','layout'];
            const key = window.getCardContent
              ? window.getCardContent(bundle.id, 'hero', `tile_${n}_icon`, defaults[n-1], bundle)
              : defaults[n-1];
            const Comp = window.ICONS?.[key];
            return (
              <window.IconPicker
                key={n}
                current={key}
                label={`Tile ${n}`}
                onPick={(picked) => {
                  // session override via CARD_CONTENT — mark as user-set so
                  // CSV reloads (page refresh) don't overwrite it.
                  const k = `*:hero:tile_${n}_icon`;
                  if (window.setUserCardContent) {
                    window.setUserCardContent(k, picked);
                  } else {
                    if (!window.CARD_CONTENT) window.CARD_CONTENT = {};
                    window.CARD_CONTENT[k] = picked;
                  }
                  if (onIconChange) onIconChange();
                }}
              >
                <div style={{
                  background: '#15130F', border: '1px solid #3F3D38', borderRadius: 6,
                  padding: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  color: '#F4EFE3',
                }}>
                  <div style={{ width: 56, height: 56 }}>{Comp && <Comp />}</div>
                  <div style={{
                    fontFamily: 'Geist Mono, monospace', fontSize: 9.5, color: '#A8A296',
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                  }}>{key}</div>
                </div>
              </window.IconPicker>
            );
          })}
        </div>
        <a href="Icon Library.html"
           style={{
             display: 'block', marginTop: 10, fontSize: 11.5, color: '#A8A296',
             textDecoration: 'none', textAlign: 'center',
             padding: '6px', borderRadius: 4,
             fontFamily: 'Geist Mono, monospace', letterSpacing: '0.08em', textTransform: 'uppercase',
           }}>↗ Open full library</a>
      </Section>

      {/* Card jump links — drag to reorder, click to select for export */}
      <Section label="Cards" meta={`${selectedCards.size} / ${window.LISTING_CARDS.length}`}>
        <div style={{ display: 'grid', gap: 4 }}>
          {orderedCards.map((c, i) => {
            const sel = selectedCards.has(c.id);
            const isDragging = dragCardId === c.id;
            return (
              <div key={c.id}
                draggable
                onDragStart={(e) => {
                  setDragCardId(c.id);
                  e.dataTransfer.effectAllowed = 'move';
                  try { e.dataTransfer.setData('text/plain', c.id); } catch {}
                }}
                onDragEnd={() => setDragCardId(null)}
                onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                onDrop={(e) => {
                  e.preventDefault();
                  const from = e.dataTransfer.getData('text/plain') || dragCardId;
                  if (from) moveCard(from, c.id);
                  setDragCardId(null);
                }}
                style={{
                  display: 'flex', alignItems: 'stretch',
                  background: focusId === c.id ? '#3F3D38' : 'transparent',
                  borderRadius: 4,
                  opacity: isDragging ? 0.4 : 1,
                  outline: dragCardId && !isDragging ? '1px dashed transparent' : 'none',
                }}>
                <span style={{
                  display: 'flex', alignItems: 'center', padding: '0 6px',
                  cursor: 'grab', color: '#6F6B62', fontSize: 12,
                  userSelect: 'none',
                }} title="Drag to reorder">⋮⋮</span>
                <button
                  onClick={() => toggleCard(c.id)}
                  style={{
                    cursor: 'pointer', border: 'none', background: 'transparent',
                    padding: '8px 6px 8px 10px', display: 'flex', alignItems: 'center',
                  }}
                  title={sel ? 'Deselect' : 'Select for export'}
                >
                  <span style={{
                    display: 'inline-flex', width: 16, height: 16, borderRadius: 3,
                    background: sel ? '#B8843E' : 'transparent',
                    border: `1.5px solid ${sel ? '#B8843E' : '#6F6B62'}`,
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    {sel && (
                      <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2 2 4-4" stroke="#FFFFFF" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    )}
                  </span>
                </button>
                <button
                  onClick={() => setFocusId(c.id)}
                  style={{
                    flex: 1, cursor: 'pointer', textAlign: 'left',
                    background: 'transparent', color: '#EFEAE0',
                    border: 'none', padding: '8px 10px 8px 4px', fontSize: 13,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}
                >
                  <span>{c.label}</span>
                  <span style={{ color: '#A8A296', fontFamily: 'Geist Mono, monospace', fontSize: 10 }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteCard(c.id); }}
                  title="Delete page"
                  style={{
                    cursor: 'pointer', border: 'none', background: 'transparent',
                    color: '#6F6B62', fontSize: 16, lineHeight: 1,
                    padding: '0 10px',
                    display: 'flex', alignItems: 'center',
                  }}
                >×</button>
              </div>
            );
          })}
        </div>
        {hasRemovedCards && (
          <button
            onClick={restoreAllCards}
            style={{
              marginTop: 10, width: '100%', cursor: 'pointer',
              background: 'transparent', color: '#A8A296',
              border: '1px dashed #3F3D38', borderRadius: 6,
              padding: '8px 10px', fontSize: 11,
              fontFamily: 'Geist Mono, monospace', letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>Restore deleted pages</button>
        )}
      </Section>

      {/* Single-bundle export */}
      <div style={{
        padding: 16,
        background: '#15130F', border: '1px solid #3F3D38', borderRadius: 6,
      }}>
        <div style={{
          fontFamily: 'Geist Mono, monospace', fontSize: 10,
          color: '#A8A296', letterSpacing: '0.18em', textTransform: 'uppercase',
        }}>This bundle</div>
        <div style={{ marginTop: 8, fontSize: 12, lineHeight: 1.5, color: '#EFEAE0' }}>
          Export selected cards for <strong>{bundle.id}</strong> · {selectedCards.size} of {window.LISTING_CARDS.length}.
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button
            onClick={onExportSingle}
            disabled={singleBusy || selectedCards.size === 0}
            style={{
              flex: 1, cursor: (singleBusy || selectedCards.size === 0) ? 'not-allowed' : 'pointer',
              background: (singleBusy || selectedCards.size === 0) ? '#3F3D38' : '#B8843E',
              color: '#FFFFFF', border: 'none', borderRadius: 6,
              padding: '11px 10px', fontWeight: 600, fontSize: 12,
              fontFamily: 'Geist, system-ui, sans-serif',
            }}
          >{singleBusy ? (singleProgress || 'Rendering…') : 'PNGs (ZIP)'}</button>
          <button
            onClick={onExportText}
            style={{
              flex: 1, cursor: 'pointer',
              background: 'transparent', color: '#F4EFE3',
              border: '1px solid #3F3D38', borderRadius: 6,
              padding: '11px 10px', fontWeight: 600, fontSize: 12,
              fontFamily: 'Geist, system-ui, sans-serif',
            }}
          >Excel (.xlsx)</button>
        </div>
      </div>

      {/* Save edits */}
      <div style={{
        padding: 16,
        background: '#15130F', border: '1px solid #3F3D38', borderRadius: 6,
      }}>
        <div style={{
          fontFamily: 'Geist Mono, monospace', fontSize: 10,
          color: '#A8A296', letterSpacing: '0.18em', textTransform: 'uppercase',
        }}>Save</div>
        <div style={{ marginTop: 8, fontSize: 12, lineHeight: 1.5, color: '#EFEAE0' }}>
          Persist every nudge, icon swap, title edit & ribbon toggle to this browser.
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button
            onClick={() => {
              const r = window.saveAllEdits();
              if (r.ok) {
                const when = new Date(r.savedAt).toLocaleTimeString();
                alert(`Saved at ${when}`);
              } else {
                alert('Save failed: ' + r.error);
              }
            }}
            style={{
              flex: 1, cursor: 'pointer',
              background: '#2D6A6A', color: '#FFFFFF',
              border: 'none', borderRadius: 6,
              padding: '11px 10px', fontWeight: 600, fontSize: 12,
              fontFamily: 'Geist, system-ui, sans-serif',
            }}>Save changes</button>
          <button
            onClick={() => {
              if (!confirm('Reset all saved edits to defaults?')) return;
              window.clearAllEdits();
              location.reload();
            }}
            style={{
              cursor: 'pointer',
              background: 'transparent', color: '#A8A296',
              border: '1px solid #3F3D38', borderRadius: 6,
              padding: '11px 14px', fontWeight: 600, fontSize: 12,
              fontFamily: 'Geist, system-ui, sans-serif',
            }}>Reset</button>
        </div>
      </div>

      {/* Bulk update import */}
      <div style={{
        padding: 16,
        background: '#15130F', border: '1px solid #3F3D38', borderRadius: 6,
      }}>
        <div style={{
          fontFamily: 'Geist Mono, monospace', fontSize: 10,
          color: '#A8A296', letterSpacing: '0.18em', textTransform: 'uppercase',
        }}>Bulk update</div>
        <div style={{ marginTop: 8, fontSize: 12, lineHeight: 1.5, color: '#EFEAE0' }}>
          Import a CSV/XLSX matching the template to update every bundle's copy + image URLs in one go.
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <label style={{
            flex: 1, cursor: 'pointer', textAlign: 'center',
            background: '#B8843E', color: '#FFFFFF',
            border: 'none', borderRadius: 6,
            padding: '11px 10px', fontWeight: 600, fontSize: 12,
            fontFamily: 'Geist, system-ui, sans-serif',
          }}>
            Import file
            <input type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }}
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                try {
                  const rows = await window.readBulkFile(f);
                  const res = window.applyBulkUpdate(rows);
                  alert(`Merged ${res.merged} bundle${res.merged === 1 ? '' : 's'}`);
                  if (onIconChange) onIconChange();
                } catch (err) {
                  alert('Import failed: ' + err.message);
                }
                e.target.value = '';
              }} />
          </label>
          <button
            onClick={() => {
              if (!window.XLSX) { alert('XLSX library not loaded'); return; }
              const headers = window.BULK_TEMPLATE_HEADERS || [];
              const sample = window.BULK_TEMPLATE_SAMPLE || {};
              const ws = window.XLSX.utils.json_to_sheet([sample, {}], { header: headers });
              ws['!cols'] = headers.map(h => ({ wch: Math.min(60, Math.max(14, h.length + 2)) }));
              const wb = window.XLSX.utils.book_new();
              window.XLSX.utils.book_append_sheet(wb, ws, 'Bulk Update');
              const arr = window.XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
              const blob = new Blob([arr], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              });
              const a = document.createElement('a');
              a.href = URL.createObjectURL(blob);
              a.download = 'templix-bulk-update-template.xlsx';
              document.body.appendChild(a); a.click();
              setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 100);
            }}
            style={{
              flex: 1, cursor: 'pointer', textAlign: 'center',
              background: 'transparent', color: '#F4EFE3',
              border: '1px solid #3F3D38', borderRadius: 6,
              padding: '11px 10px', fontWeight: 600, fontSize: 12,
              fontFamily: 'Geist, system-ui, sans-serif',
            }}>Template (.xlsx)</button>
        </div>
      </div>

      {/* Batch export */}
      <div style={{
        padding: 16,
        background: '#15130F', border: '1px solid #3F3D38', borderRadius: 6,
      }}>
        <div style={{
          fontFamily: 'Geist Mono, monospace', fontSize: 10,
          color: '#A8A296', letterSpacing: '0.18em', textTransform: 'uppercase',
        }}>Batch export</div>
        <div style={{ marginTop: 8, fontSize: 12, lineHeight: 1.5, color: '#EFEAE0' }}>
          Render all {bundles.length} bundles × 7 cards to PNGs ({bundles.length * 7} total) and download as ZIP.
        </div>
        <button
          onClick={onGenerateAll}
          disabled={genBusy}
          style={{
            marginTop: 12, width: '100%', cursor: genBusy ? 'wait' : 'pointer',
            background: genBusy ? '#3F3D38' : '#B8843E', color: '#FFFFFF',
            border: 'none', borderRadius: 6,
            padding: '12px 14px', fontWeight: 600, fontSize: 13,
            fontFamily: 'Geist, system-ui, sans-serif',
          }}
        >{genBusy ? (genProgress || 'Rendering…') : 'Generate all (ZIP)'}</button>
      </div>

      {/* Canva note */}
      <div style={{
        marginTop: 'auto', padding: 16,
        background: '#15130F', border: '1px solid #3F3D38', borderRadius: 6,
      }}>
        <div style={{
          fontFamily: 'Geist Mono, monospace', fontSize: 10,
          color: '#A8A296', letterSpacing: '0.18em', textTransform: 'uppercase',
        }}>Send to Canva</div>
        <div style={{ marginTop: 8, fontSize: 12, lineHeight: 1.5, color: '#EFEAE0' }}>
          Tell me which bundle and which cards (e.g. <em>“send PR05 hero + included to Canva”</em>) and I’ll bundle and import them. Each card becomes its own editable Canva design.
        </div>
      </div>
    </div>
  );
}

function Section({ label, meta, metaTone = '#A8A296', children, collapsible = true, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <div
        onClick={collapsible ? () => setOpen(o => !o) : undefined}
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: open ? 10 : 0,
          cursor: collapsible ? 'pointer' : 'default',
          userSelect: 'none',
        }}>
        <span style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: 'Geist Mono, monospace', fontSize: 11,
          color: '#A8A296', letterSpacing: '0.18em', textTransform: 'uppercase',
        }}>
          {collapsible && (
            <span style={{
              display: 'inline-block', width: 8, color: '#6F6B62',
              transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 120ms ease',
            }}>▶</span>
          )}
          {label}
        </span>
        {meta && (
          <span style={{
            fontFamily: 'Geist Mono, monospace', fontSize: 11, color: metaTone,
          }}>{meta}</span>
        )}
      </div>
      {open && children}
    </div>
  );
}

function Pill({ bg, fg, border, children }) {
  return (
    <span style={{
      background: bg, color: fg,
      border: border ? '1px solid #3F3D38' : 'none',
      padding: '4px 10px', borderRadius: 999,
      fontFamily: 'Geist Mono, monospace', fontSize: 10,
      letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600,
    }}>{children}</span>
  );
}

// ── Main ───────────────────────────────────────────────────────────────
function App() {
  const data = window.TEMPLIX_DATA;
  const coreProducts = window.TEMPLIX_CORE || [];
  const [mode, setMode] = useState('bundles'); // 'bundles' | 'core'

  // In core mode, each product becomes a virtual single-item bundle
  const bundles = mode === 'core'
    ? coreProducts.map(p => ({
        id: p.id.toUpperCase(),
        tier: 'Core',
        name: p.name,
        price: p.price,
        products: p.id,
        totalProducts: 1,
        gallery: p.galleryImages,
        heroTagline: `${p.name} for reMarkable Paper Pro & Move — ${p.category}`,
        heroMetric: `${p.galleryImages} Pages · 1 Product`,
        firstImage: p.sampleUrl,
      }))
    : data.bundles;
  const allProducts = data.products;

  const [bundleId, setBundleId] = useState(bundles[0].id);
  const bundle = useMemo(() => bundles.find(b => b.id === bundleId) || bundles[0], [bundleId, bundles]);
  const products = useMemo(() => {
    if (mode === 'core') {
      const p = allProducts.find(x => x.id === bundle.products);
      return p ? [p] : [];
    }
    return resolveProducts(bundle, allProducts);
  }, [bundle, allProducts, mode]);

  // Reset bundle selection when mode changes
  useEffect(() => { setBundleId(bundles[0].id); }, [mode]);

  // Title state — when bundle changes, default back to formula A
  const [titlesByBundle, setTitlesByBundle] = useState(() => window.__SAVED_TITLES__ || {});
  // Expose to window so persist.js can snapshot it
  useEffect(() => { window.__SAVED_TITLES__ = titlesByBundle; }, [titlesByBundle]);
  const suggestions = useMemo(() => buildTitleSuggestions(bundle, products), [bundle, products]);
  const title = titlesByBundle[bundle.id] ?? suggestions[0];
  const setTitle = (v) => setTitlesByBundle(prev => ({ ...prev, [bundle.id]: v }));

  const [aiBusy, setAiBusy] = useState(false);
  const refreshAI = async () => {
    if (!window.claude?.complete) {
      // Fallback: cycle through deterministic suggestions
      const i = suggestions.indexOf(title);
      setTitle(suggestions[(i + 1) % suggestions.length]);
      return;
    }
    setAiBusy(true);
    try {
      const prompt = `You are an Etsy listing copywriter for a digital planner shop named Templix that sells PDF planners for the reMarkable tablet.

Write ONE Etsy listing title for the bundle below.

Rules:
- Max 140 characters. Aim for 130–140.
- No emoji. No ALL CAPS words. Title-case the bundle name.
- Front-load the highest-intent keywords (reMarkable, planner, the bundle category).
- Mention the tier ("Plus", "Pro", or "Ultimate") at the end.
- Use " | " or " — " as separators. No quotes around the title.

Bundle: ${bundle.name} (${bundle.tier} tier, ${bundle.price})
Includes: ${products.map(p => p.name).join(', ')}
Categories: ${Array.from(new Set(products.map(p => p.category))).join(', ')}

Return ONLY the title, nothing else.`;
      const out = await window.claude.complete(prompt);
      const cleaned = (out || '').trim().replace(/^["']|["']$/g, '').slice(0, 140);
      if (cleaned) setTitle(cleaned);
    } catch (e) {
      console.error(e);
    } finally {
      setAiBusy(false);
    }
  };

  // Focus / scroll target
  const [focusId, setFocusId] = useState('hero');

  // CSV content load on mount
  useEffect(() => {
    if (window.loadCardContent) {
      window.loadCardContent().then(() => {
        // force re-render so cards pick up the new content
        setTitlesByBundle(p => ({ ...p }));
      });
    }
  }, []);

  // Generate-all batch export
  const [genBusy, setGenBusy] = useState(false);
  const [genProgress, setGenProgress] = useState('');

  // Re-render trigger for live icon swaps
  const [, setIconBump] = useState(0);
  const onIconChange = () => setIconBump(n => n + 1);

  // Single-bundle export state
  const [selectedCards, setSelectedCards] = useState(new Set(window.LISTING_CARDS.map(c => c.id)));

  // Custom card order — stored as ids; restored from save if present.
  const [cardOrder, setCardOrder] = useState(() => {
    const saved = window.__SAVED_CARD_ORDER__;
    if (Array.isArray(saved) && saved.length) return saved;
    return window.LISTING_CARDS.map(c => c.id);
  });
  useEffect(() => { window.__SAVED_CARD_ORDER__ = cardOrder; }, [cardOrder]);
  // Removed cards (deleted by user from the sidebar). Persisted on window.
  const [removedCards, setRemovedCards] = useState(() => new Set(window.__REMOVED_CARDS__ || []));
  useEffect(() => { window.__REMOVED_CARDS__ = Array.from(removedCards); }, [removedCards]);
  const orderedCards = useMemo(() => {
    const byId = Object.fromEntries(window.LISTING_CARDS.map(c => [c.id, c]));
    return cardOrder.map(id => byId[id]).filter(c => c && !removedCards.has(c.id));
  }, [cardOrder, removedCards]);
  const deleteCard = (id) => {
    setRemovedCards(prev => { const n = new Set(prev); n.add(id); return n; });
    setSelectedCards(prev => { const n = new Set(prev); n.delete(id); return n; });
  };
  const restoreAllCards = () => setRemovedCards(new Set());
  const moveCard = (fromId, toId) => {
    if (fromId === toId) return;
    setCardOrder(prev => {
      const next = prev.slice();
      const from = next.indexOf(fromId);
      const to = next.indexOf(toId);
      if (from < 0 || to < 0) return prev;
      next.splice(to, 0, next.splice(from, 1)[0]);
      return next;
    });
  };
  const [dragCardId, setDragCardId] = useState(null);
  const toggleCard = (id) => setSelectedCards(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const [singleBusy, setSingleBusy] = useState(false);
  const [singleProgress, setSingleProgress] = useState('');

  // Build the structured text export (markdown) for a single bundle.
  // Pulls everything a listing needs: title, hero copy, features, products, etc.
  const buildBundleText = () => {
    const lines = [];
    const totalPages = products.reduce((s, p) => s + (parseInt(p.galleryImages, 10) || 0), 0);
    lines.push(`# ${bundle.name}`);
    lines.push('');
    lines.push(`**${bundle.id} · ${bundle.tier} Bundle · ${bundle.price}**`);
    lines.push('');
    lines.push(`> ${bundle.heroTagline || ''}`);
    lines.push('');
    lines.push('## Etsy listing title');
    lines.push('');
    lines.push(title);
    lines.push('');
    lines.push(`*${title.length} / 140 characters*`);
    lines.push('');
    lines.push('## At a glance');
    lines.push('');
    lines.push(`- **Products:** ${bundle.totalProducts}`);
    lines.push(`- **Pages:** ${totalPages.toLocaleString()}`);
    lines.push(`- **Gallery images:** ${bundle.gallery}`);
    lines.push(`- **Tier:** ${bundle.tier}`);
    lines.push(`- **Price:** ${bundle.price}`);
    lines.push('');
    lines.push('## Included products');
    lines.push('');
    products.forEach((p, i) => {
      lines.push(`${i + 1}. **${p.name}** (${p.id.toUpperCase()}) — ${p.category || '—'} · ${p.galleryImages || '?'} pages`);
    });
    lines.push('');

    // Card 01 — Hero
    if (selectedCards.has('hero')) {
      lines.push('## Card 01 · Hero / cover');
      lines.push('');
      lines.push(`- **Headline:** ${bundle.name}`);
      lines.push(`- **Subhead:** Designed for *reMarkable* Pro Move Devices`);
      lines.push(`- **Metric strip:** ${totalPages.toLocaleString()} Pages · ${bundle.totalProducts} Products`);
      lines.push('- **Key features:**');
      const features = (window.getCardContent ? [
        window.getCardContent(bundle.id, 'hero', 'feature_1', 'Left & Right Handed Versions'),
        window.getCardContent(bundle.id, 'hero', 'feature_2', '6 Color Editions'),
        window.getCardContent(bundle.id, 'hero', 'feature_3', 'Fully Hyperlinked System'),
        window.getCardContent(bundle.id, 'hero', 'feature_4', '5 Language Systems'),
      ] : ['Left & Right Handed Versions','6 Color Editions','Fully Hyperlinked System','5 Language Systems']);
      features.forEach(f => lines.push(`  - ${f}`));
      lines.push('- **Tiles:**');
      lines.push('  - Optimized Pages');
      lines.push('  - Multi-Purpose System');
      lines.push('  - Seamless Navigation');
      lines.push('');
    }

    // Card 02 — What's included
    if (selectedCards.has('included')) {
      lines.push('## Card 02 · What\'s included');
      lines.push('');
      lines.push(`**${bundle.totalProducts} planners. One workflow.**`);
      lines.push('');
      lines.push(`Complete ${bundle.name} system`);
      lines.push('');
      products.forEach(p => {
        lines.push(`- ✓ **${p.name}** — ${p.galleryImages || '?'} pages`);
      });
      lines.push('');
    }

    // Card 03 — Tiers
    if (selectedCards.has('tiers')) {
      lines.push('## Card 03 · Choose your system');
      lines.push('');
      lines.push('**Choose Your System** — Built for real work, designed for clarity, speed, and execution.');
      lines.push('');
      lines.push('- **CORE** — Essential System · standalone templates, hyperlinked, distraction-free.');
      lines.push('- **PLUS** — More Structure · multiple templates, full planning cycle, reviews.');
      lines.push('- **PRO** — Full Productivity · specialist systems, end-to-end workflow.');
      lines.push('- **ULTIMATE** — Complete System · every template, no limits, best value.');
      lines.push('');
      lines.push('> Start with a free sample · Link in the description');
      lines.push('');
    }

    // Card 04 — Features
    if (selectedCards.has('features')) {
      lines.push('## Card 04 · Why this bundle');
      lines.push('');
      lines.push(`1. **Tap to navigate** — Every TOC, index and back-link is wired up. Fingers stay on the page.`);
      lines.push(`2. **Made for reMarkable** — Sized for Paper Pro and Paper Pro Move. ${totalPages.toLocaleString()} pages, no scaling artifacts.`);
      lines.push(`3. **Lifetime updates** — New years roll out automatically. One purchase, every future revision.`);
      lines.push(`4. **Universal PDF** — Works on reMarkable, Supernote, GoodNotes, Noteshelf — anywhere PDF works.`);
      lines.push(`5. **Mix & match** — Each planner stands alone. Pull what you need into your existing workflow.`);
      lines.push(`6. **Buy once. Use forever.** — No subscriptions, no accounts, no ads. Download, sideload, done.`);
      lines.push('');
    }

    // Card 05 — How to use
    if (selectedCards.has('howto')) {
      lines.push('## Card 05 · How to use');
      lines.push('');
      lines.push('**Three steps. Five minutes.**');
      lines.push('');
      lines.push('1. **Buy & Download** — Instant download after checkout. PDF files, zero install.');
      lines.push('2. **Sideload to Tablet** — Drag onto reMarkable Cloud or USB-transfer. Two minutes.');
      lines.push('3. **Start Planning** — Tap into any month, page, or section. Hyperlinks do the rest.');
      lines.push('');
    }

    // Card 06 — Lifestyle (placeholder)
    if (selectedCards.has('lifestyle')) {
      lines.push('## Card 06 · In real life');
      lines.push('');
      lines.push('**On an actual reMarkable.** Lifestyle photo placeholder — 2000×2000, sRGB.');
      lines.push('');
    }

    // Card 07 — Stats
    if (selectedCards.has('stats')) {
      lines.push('## Card 07 · By the numbers');
      lines.push('');
      lines.push(`- **${bundle.totalProducts}** Planners`);
      lines.push(`- **${totalPages.toLocaleString()}** Pages of templates`);
      lines.push(`- **${Array.from(new Set(products.map(p => p.category).filter(Boolean))).length || 1}** Categories covered`);
      lines.push(`- **3** Devices supported (reMarkable Paper Pro, Paper Pro Move, rM2)`);
      lines.push(`- **∞** Lifetime updates`);
      lines.push(`- **${bundle.price}** One-time price`);
      lines.push('');
    }

    // Etsy fields block at the end
    lines.push('---');
    lines.push('');
    lines.push('## Etsy fields');
    lines.push('');
    lines.push(`**Title (140 max):**`);
    lines.push(title);
    lines.push('');
    lines.push(`**Price:** ${bundle.price}`);
    lines.push('');
    lines.push(`**Tags (suggested):** reMarkable, planner, digital planner, PDF planner, ${bundle.tier} bundle, hyperlinked, ${products.map(p=>p.category).filter(Boolean).slice(0,3).join(', ')}`);
    lines.push('');
    return lines.join('\n');
  };

  // Build an XLSX matching the original "Canva Copy (All Fields)" schema,
  // populated with the current bundle's row + new image-URL columns appended.
  const buildBundleXLSX = () => {
    if (!window.XLSX) { alert('XLSX library not loaded'); return null; }
    const headers = window.TEMPLIX_CANVA_HEADERS || [];
    const src = (window.TEMPLIX_CANVA && window.TEMPLIX_CANVA[bundle.id]) || {};
    // Original schema row
    const row = {};
    for (const h of headers) row[h] = src[h] != null ? src[h] : '';
    // Append image URL columns for each card slot
    row['cover_image'] = bundle.firstImage || '';
    // Key pages used in the hero fan (5 tablets, one per product slot)
    const keyUrls = [];
    for (let i = 0; i < 5; i++) {
      const p = products[i % Math.max(products.length, 1)];
      if (!p) { keyUrls.push(''); continue; }
      const slotIdx = Math.floor(i / Math.max(1, products.length));
      const pages = (window.TEMPLIX_PAGES?.[p.id] || []).filter(x =>
        x.pageKey !== 'cover' && !/^toc/.test(x.pageKey) && x.url
      );
      keyUrls.push(pages[slotIdx % Math.max(pages.length, 1)]?.url || p.sampleUrl || '');
    }
    keyUrls.forEach((u, i) => { row[`hero_tablet_${i + 1}_url`] = u; });
    // Per-product sample URLs (the cover of each included product)
    products.forEach((p, i) => {
      row[`p${String(i + 1).padStart(2, '0')}_cover_url`] = p.sampleUrl || '';
      row[`p${String(i + 1).padStart(2, '0')}_product_id`] = p.id ? p.id.toUpperCase() : '';
    });
    // Etsy title (editable in the app — overrides the bundle hero tagline)
    row['etsy_listing_title'] = title;
    row['etsy_listing_title_length'] = title.length;

    // Final column order: original headers, then image URLs, then etsy title
    const extraOrder = ['etsy_listing_title','etsy_listing_title_length','cover_image'];
    for (let i = 0; i < 5; i++) extraOrder.push(`hero_tablet_${i + 1}_url`);
    products.forEach((_, i) => {
      extraOrder.push(`p${String(i + 1).padStart(2, '0')}_product_id`);
      extraOrder.push(`p${String(i + 1).padStart(2, '0')}_cover_url`);
    });
    const fullHeader = [...headers, ...extraOrder];

    // Build sheet (1 data row matches Canva-copy structure)
    const ws = window.XLSX.utils.json_to_sheet([row], { header: fullHeader });
    // Reasonable column widths so it's readable when opened
    ws['!cols'] = fullHeader.map(h => ({
      wch: Math.min(60, Math.max(12, (h.length + 2)))
    }));
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, 'Canva Copy');
    return wb;
  };

  const exportText = () => {
    const wb = buildBundleXLSX();
    if (!wb) return;
    const safeName = bundle.name.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '');
    window.XLSX.writeFile(wb, `${bundle.id}-${safeName}.xlsx`);
  };

  const exportSingle = async () => {
    if (singleBusy) return;
    if (!window.JSZip || !window.htmlToImage) { alert('Export libs not loaded'); return; }
    const cards = orderedCards.filter(c => selectedCards.has(c.id));
    if (!cards.length) return;
    setSingleBusy(true);
    const zip = new window.JSZip();
    const safeName = bundle.name.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '');

    // Pre-fetch all cloudfront URLs used by these cards into data: URIs once,
    // so html-to-image can inline them reliably regardless of CORS quirks.
    const urlCache = (window.__DATA_URI_CACHE__ ||= {});
    const collectUrls = () => {
      const urls = new Set();
      const add = (u) => { if (u && /^https?:/.test(u) && !urlCache[u]) urls.add(u); };
      add(bundle.firstImage);
      products.forEach(p => add(p.sampleUrl));
      const pages = window.TEMPLIX_PAGES || {};
      products.forEach(p => (pages[p.id] || []).forEach(pg => add(pg.url)));
      return Array.from(urls);
    };
    const fetchAsDataURI = async (url) => {
      try {
        const r = await fetch(url, { mode: 'cors', credentials: 'omit' });
        if (!r.ok) throw new Error('http ' + r.status);
        const blob = await r.blob();
        return await new Promise(res => {
          const fr = new FileReader();
          fr.onload = () => res(fr.result);
          fr.readAsDataURL(blob);
        });
      } catch (e) {
        console.warn('preload failed', url, e);
        return null;
      }
    };
    const allUrls = collectUrls();
    setSingleProgress(`Preloading ${allUrls.length} images…`);
    await Promise.all(allUrls.map(async (u) => {
      const dataUri = await fetchAsDataURI(u);
      if (dataUri) urlCache[u] = dataUri;
    }));

    try {
      try { await document.fonts.ready; } catch {}
      for (let ci = 0; ci < cards.length; ci++) {
        const card = cards[ci];
        setSingleProgress(`${ci + 1}/${cards.length} · ${card.id}`);
        const container = document.createElement('div');
        container.style.cssText = 'position:fixed;left:0;top:0;width:2000px;height:2000px;z-index:-1;opacity:1;pointer-events:none;overflow:hidden;';
        document.body.appendChild(container);
        const root = ReactDOM.createRoot(container);
        await new Promise(resolve => {
          root.render(React.createElement(window.CardIdContext.Provider, { value: card.id },
            React.createElement(card.Component, { bundle, products, title })));
          setTimeout(resolve, 1500);
        });
        // Swap any cached cloudfront URLs to data URIs in <img> AND background-image
        container.querySelectorAll('img').forEach(img => {
          const cached = urlCache[img.src];
          if (cached) img.src = cached;
        });
        container.querySelectorAll('[style*="url("]').forEach(el => {
          const bg = el.style.backgroundImage;
          const m = bg && bg.match(/url\(["']?(https?:[^"')]+)["']?\)/);
          if (m && urlCache[m[1]]) {
            el.style.backgroundImage = `url("${urlCache[m[1]]}")`;
          }
        });
        // Wait for any new <img> swaps to settle
        await new Promise(r => setTimeout(r, 600));
        const imgs = Array.from(container.querySelectorAll('img'));
        await Promise.all(imgs.map(img => img.complete ? Promise.resolve() :
          new Promise(r => { img.onload = r; img.onerror = r; setTimeout(r, 4000); })
        ));
        try {
          const blob = await window.htmlToImage.toBlob(container.firstElementChild || container, {
            width: 2000, height: 2000, pixelRatio: 1, cacheBust: true,
            backgroundColor: '#2C1A3D',
          });
          if (blob && blob.size > 1000) {
            const origIdx = orderedCards.findIndex(c => c.id === card.id);
            const idx = String(origIdx + 1).padStart(2, '0');
            zip.file(`${idx}-${card.id}.png`, blob);
          } else {
            console.warn('blob too small or empty', card.id, blob?.size);
          }
        } catch (e) {
          console.error('capture failed', card.id, e);
        }
        root.unmount();
        container.remove();
      }
      const wb = buildBundleXLSX();
      if (wb) {
        const xlsxArr = window.XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        zip.file(`${bundle.id}-${safeName}.xlsx`, xlsxArr);
      }
      setSingleProgress('Zipping…');
      const content = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(content);
      a.download = `${bundle.id}-${safeName}.zip`;
      document.body.appendChild(a); a.click(); a.remove();
    } finally {
      setSingleBusy(false);
      setSingleProgress('');
    }
  };
  const generateAll = async () => {
    if (genBusy) return;
    if (!window.JSZip || !window.htmlToImage) { alert('Export libs not loaded'); return; }
    setGenBusy(true);
    const zip = new window.JSZip();
    try {
      try { await document.fonts.ready; } catch {}
      for (let bi = 0; bi < bundles.length; bi++) {
        const b = bundles[bi];
        const prods = resolveProducts(b, allProducts);
        const safeName = b.name.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '');
        const folder = `${b.id}-${safeName}`;
        for (let ci = 0; ci < orderedCards.length; ci++) {
          const card = orderedCards[ci];
          setGenProgress(`${bi + 1}/${bundles.length} · ${b.id} · ${card.id}`);
          const container = document.createElement('div');
          container.style.cssText = 'position:fixed;left:0;top:0;width:2000px;height:2000px;z-index:-1;pointer-events:none;overflow:hidden;';
          document.body.appendChild(container);
          const root = ReactDOM.createRoot(container);
          await new Promise(resolve => {
            root.render(React.createElement(window.CardIdContext.Provider, { value: card.id },
            React.createElement(card.Component, { bundle: b, products: prods, title: '' })));
            setTimeout(resolve, 2000);
          });
          const imgs = Array.from(container.querySelectorAll('img'));
          await Promise.all(imgs.map(img => img.complete ? Promise.resolve() :
            new Promise(r => { img.onload = r; img.onerror = r; setTimeout(r, 4000); })
          ));
          try {
            const blob = await window.htmlToImage.toBlob(container.firstElementChild || container, {
              width: 2000, height: 2000, pixelRatio: 1, cacheBust: true,
              backgroundColor: '#2C1A3D',
              fetchRequestInit: { mode: 'cors', credentials: 'omit' },
            });
            if (blob && blob.size > 1000) {
              const idx = String(ci + 1).padStart(2, '0');
              zip.file(`${folder}/${idx}-${card.id}.png`, blob);
            }
          } catch (e) {
            console.error('capture failed', b.id, card.id, e);
          }
          root.unmount();
          container.remove();
        }
      }
      setGenProgress('Zipping…');
      const content = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(content);
      a.download = `templix-listings-${new Date().toISOString().slice(0,10)}.zip`;
      document.body.appendChild(a); a.click(); a.remove();
    } finally {
      setGenBusy(false);
      setGenProgress('');
    }
  };
  const railRef = useRef(null);
  useEffect(() => {
    const el = railRef.current?.querySelector(`[data-card-id="${focusId}"]`);
    if (el && railRef.current) {
      const top = el.offsetTop - 32;
      railRef.current.scrollTo({ top, behavior: 'smooth' });
    }
  }, [focusId]);

  const SCALE = 0.32; // 2000 × 0.32 = 640px wide preview

  return (
    <div style={{
      display: 'flex', height: '100vh', overflow: 'hidden',
      background: '#15130F', color: '#1B1A17',
      fontFamily: 'Geist, system-ui, sans-serif',
    }}>
      <Sidebar
        mode={mode} setMode={setMode}
        bundles={bundles} bundle={bundle} setBundleId={setBundleId}
        title={title} setTitle={setTitle}
        suggestions={suggestions} onRefresh={refreshAI} aiBusy={aiBusy}
        products={products} allProducts={allProducts}
        focusId={focusId} setFocusId={setFocusId}
        onGenerateAll={generateAll} genBusy={genBusy} genProgress={genProgress}
        selectedCards={selectedCards} toggleCard={toggleCard}
        onExportSingle={exportSingle} onExportText={exportText}
        singleBusy={singleBusy} singleProgress={singleProgress}
        onIconChange={onIconChange}
        orderedCards={orderedCards}
        dragCardId={dragCardId} setDragCardId={setDragCardId}
        moveCard={moveCard}
        deleteCard={deleteCard}
        restoreAllCards={restoreAllCards}
        hasRemovedCards={removedCards.size > 0}
      />

      <div ref={railRef} style={{
        flex: 1, overflow: 'auto', padding: '40px 60px 80px',
      }}>
        {/* Top bar over rail */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          marginBottom: 24, color: '#A8A296',
          fontFamily: 'Geist Mono, monospace', fontSize: 11,
          letterSpacing: '0.18em', textTransform: 'uppercase',
        }}>
          <span>Preview · {bundle.id} · {bundle.name}</span>
          <span>7 cards · 2000 × 2000 · sRGB</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 56, alignItems: 'center' }}>
          {orderedCards.map(card => (
            <div key={card.id} data-card-id={card.id}>
              <CardTile
                card={card}
                bundle={bundle}
                products={products}
                title={title}
                scale={SCALE}
                focused={focusId === card.id}
                onFocus={() => setFocusId(card.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('app')).render(<App />);
