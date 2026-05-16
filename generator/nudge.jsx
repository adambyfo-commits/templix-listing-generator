// ── Universal Nudge ─────────────────────────────────────────────────────
// Click ANY text or image inside a [data-card-frame] to select it.
// Shift+click adds/removes from a multi-selection.
// Arrow keys move every selected element. Shift = ±10px, Alt = ±0.5px.
// Esc clears selection.
//
// Offsets are stored per (cardId, structural path) so edits to one card slot
// don't replicate to other slots that share the same component.

(function () {
  if (window.__NUDGE_INSTALLED__) return;
  window.__NUDGE_INSTALLED__ = true;

  // Persistent state: key = "cardId|path" -> {x, y}
  const OFFSETS = window.NUDGE_OFFSETS = window.NUDGE_OFFSETS || {};
  let SELECTED = window.__NUDGE_SELECTED__ = window.__NUDGE_SELECTED__ || new Set();

  // Inject stylesheet
  const styleEl = document.createElement('style');
  styleEl.id = '__nudge_styles__';
  document.head.appendChild(styleEl);

  function cssEscape(s) { return s.replace(/"/g, '\\"'); }

  function applyStyles() {
    const lines = [];
    for (const [key, off] of Object.entries(OFFSETS)) {
      if (!off || (off.x === 0 && off.y === 0)) continue;
      lines.push(`[data-nudge-key="${cssEscape(key)}"]{transform:translate(${off.x}px,${off.y}px)!important}`);
    }
    for (const key of SELECTED) {
      lines.push(`[data-nudge-key="${cssEscape(key)}"]{outline:2px dashed #B8843E!important;outline-offset:4px!important}`);
    }
    styleEl.textContent = lines.join('\n');
    retagAllFrames();
  }

  function pathOf(el, frame) {
    const parts = [];
    let cur = el;
    while (cur && cur !== frame) {
      const parent = cur.parentNode;
      if (!parent) break;
      const idx = Array.prototype.indexOf.call(parent.children, cur);
      const tag = cur.tagName ? cur.tagName.toLowerCase() : '?';
      parts.unshift(tag + '[' + idx + ']');
      cur = parent;
    }
    return parts.join('/');
  }

  function elFromPath(path, frame) {
    if (!path) return null;
    let cur = frame;
    for (const seg of path.split('/')) {
      const m = /^([a-z0-9]+)\[(\d+)\]$/i.exec(seg);
      if (!m || !cur) return null;
      const [, tag, idxStr] = m;
      const idx = parseInt(idxStr, 10);
      const child = cur.children[idx];
      if (!child || child.tagName.toLowerCase() !== tag.toLowerCase()) return null;
      cur = child;
    }
    return cur;
  }

  function retagAllFrames() {
    const live = new Set([...Object.keys(OFFSETS), ...SELECTED]);
    // Clear stale tags
    document.querySelectorAll('[data-nudge-key]').forEach(el => {
      if (!live.has(el.getAttribute('data-nudge-key'))) {
        el.removeAttribute('data-nudge-key');
      }
    });
    // Apply live tags by walking each frame
    const frames = document.querySelectorAll('[data-card-frame]');
    for (const frame of frames) {
      const cardId = frame.getAttribute('data-card-id') || '';
      for (const key of live) {
        const [kCard, kPath] = key.split('|', 2);
        if (kCard !== cardId) continue;
        const el = elFromPath(kPath, frame);
        if (el) el.setAttribute('data-nudge-key', key);
      }
    }
  }

  function isLeafCandidate(el) {
    if (!el || el.nodeType !== 1) return false;
    const tag = el.tagName;
    if (tag === 'IMG' || tag === 'SVG' || tag === 'svg') return true;
    for (const n of el.childNodes) {
      if (n.nodeType === 3 && n.textContent.trim()) return true;
    }
    return false;
  }

  // Any element under a card frame counts. Climbs SVG primitives to their
  // root <svg>, otherwise returns the exact clicked element so text,
  // images, pills, containers, and decorative shapes are all selectable.
  function findLeaf(target, frame) {
    if (!target || target === frame) return null;
    let cur = target;
    while (cur && cur !== frame && cur !== document.body) {
      // Climb out of nested SVG primitives to the root <svg>.
      if (cur.ownerSVGElement) {
        cur = cur.ownerSVGElement;
        return cur;
      }
      if (cur.tagName === 'svg' || cur.tagName === 'SVG') return cur;
      if (cur.nodeType === 1) return cur;
      cur = cur.parentNode;
    }
    return null;
  }

  document.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    const frame = e.target.closest && e.target.closest('[data-card-frame]');
    if (!frame) {
      if (SELECTED.size) {
        SELECTED.clear();
        applyStyles();
      }
      return;
    }
    const leaf = findLeaf(e.target, frame);
    if (!leaf) return;
    e.preventDefault();
    e.stopPropagation();
    const cardId = frame.getAttribute('data-card-id') || '';
    const path = pathOf(leaf, frame);
    if (!path) return;
    const key = cardId + '|' + path;
    leaf.setAttribute('data-nudge-key', key);
    if (e.shiftKey) {
      if (SELECTED.has(key)) SELECTED.delete(key);
      else SELECTED.add(key);
    } else {
      const onlyThis = SELECTED.size === 1 && SELECTED.has(key);
      SELECTED.clear();
      if (!onlyThis) SELECTED.add(key);
    }
    applyStyles();
  }, true);

  // Auto-save offsets to localStorage so they survive reloads without
  // requiring the Save button. Debounced so rapid arrow-key presses don't
  // hammer storage.
  let saveTimer = null;
  function autoSave() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        localStorage.setItem('templix.nudge.offsets', JSON.stringify(OFFSETS));
      } catch (e) {}
    }, 250);
  }

  // Restore previously saved offsets on script init.
  try {
    const raw = localStorage.getItem('templix.nudge.offsets');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        for (const [k, v] of Object.entries(parsed)) OFFSETS[k] = v;
      }
    }
  } catch (e) {}

  window.addEventListener('keydown', (e) => {
    if (!SELECTED.size) return;
    if (e.key === 'Escape') {
      SELECTED.clear();
      applyStyles();
      return;
    }
    if (!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) return;
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    e.preventDefault();
    const step = e.shiftKey ? 10 : (e.altKey ? 0.5 : 1);
    let dx = 0, dy = 0;
    if (e.key === 'ArrowUp')    dy = -step;
    if (e.key === 'ArrowDown')  dy = step;
    if (e.key === 'ArrowLeft')  dx = -step;
    if (e.key === 'ArrowRight') dx = step;
    for (const key of SELECTED) {
      const cur = OFFSETS[key] || { x: 0, y: 0 };
      OFFSETS[key] = { x: cur.x + dx, y: cur.y + dy };
    }
    applyStyles();
    autoSave();
  });

  const mo = new MutationObserver(() => {
    if (mo._pending) return;
    mo._pending = true;
    requestAnimationFrame(() => {
      mo._pending = false;
      retagAllFrames();
    });
  });
  mo.observe(document.body, { childList: true, subtree: true });

  requestAnimationFrame(() => applyStyles());
  if (document.fonts?.ready) document.fonts.ready.then(applyStyles);

  window.clearNudge = () => {
    for (const k of Object.keys(OFFSETS)) delete OFFSETS[k];
    SELECTED.clear();
    applyStyles();
    autoSave();
  };
})();
