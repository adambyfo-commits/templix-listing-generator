// CSV-driven card content layer.
// Loads data/card_content.csv on boot. Exposes window.getCardContent(bundleCode, cardId, slot, fallback).
// Cards call this to look up overrides; if a row is missing they get the fallback baked into code.
// `bundleCode = "*"` acts as a wildcard (default for all bundles). Bundle-specific rows beat wildcards.

(function () {
  window.CARD_CONTENT = window.CARD_CONTENT || {};

  function splitLine(line) {
    const out = []; let cur = ''; let q = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') { q = !q; continue; }
      if (c === ',' && !q) { out.push(cur); cur = ''; continue; }
      cur += c;
    }
    out.push(cur);
    return out;
  }

  function parseCSV(text) {
    const lines = text.split(/\r?\n/).filter(l => l.trim() && !l.startsWith('#'));
    if (!lines.length) return [];
    const headers = splitLine(lines[0]).map(h => h.trim());
    return lines.slice(1).map(l => {
      const cols = splitLine(l);
      const row = {};
      headers.forEach((h, i) => { row[h] = (cols[i] ?? '').trim(); });
      return row;
    });
  }

  window.loadCardContent = async function () {
    try {
      const r = await fetch('data/card_content.csv', { cache: 'no-store' });
      if (!r.ok) throw new Error('csv ' + r.status);
      const text = await r.text();
      const rows = parseCSV(text);
      // Preserve any user-set values that were already loaded (e.g. from
      // persist.js's localStorage snapshot). CSV provides DEFAULTS only —
      // never overwrites a key the user has explicitly picked.
      const m = window.CARD_CONTENT || {};
      const userKeys = new Set(window.__USER_SET_CONTENT_KEYS__ || []);
      for (const row of rows) {
        if (!row.bundleCode || !row.cardId || !row.slot) continue;
        const key = `${row.bundleCode}:${row.cardId}:${row.slot}`;
        if (userKeys.has(key)) continue;        // user override wins
        if (m[key] != null && m[key] !== '') continue; // already persisted
        m[key] = row.value;
      }
      window.CARD_CONTENT = m;
      window.dispatchEvent(new CustomEvent('cardcontentloaded'));
    } catch (e) {
      console.warn('[content] CSV load failed (using fallback defaults):', e);
    }
  };

  // Helper for the icon picker / inline editors: marks a key as user-set so
  // subsequent CSV reloads won't clobber it.
  window.setUserCardContent = function (key, value) {
    window.CARD_CONTENT = window.CARD_CONTENT || {};
    window.CARD_CONTENT[key] = value;
    window.__USER_SET_CONTENT_KEYS__ = window.__USER_SET_CONTENT_KEYS__ || [];
    if (!window.__USER_SET_CONTENT_KEYS__.includes(key)) {
      window.__USER_SET_CONTENT_KEYS__.push(key);
    }
  };

  // Substitute {token}s using a context object.
  function interpolate(str, ctx) {
    if (!str) return str;
    return str.replace(/\{(\w+)\}/g, (_, k) => (ctx && ctx[k] != null ? ctx[k] : `{${k}}`));
  }

  window.getCardContent = function (bundleCode, cardId, slot, fallback, ctx) {
    const m = window.CARD_CONTENT || {};
    const raw = m[`${bundleCode}:${cardId}:${slot}`] ?? m[`*:${cardId}:${slot}`];
    if (raw == null || raw === '') return fallback;
    return interpolate(raw, ctx).replace(/\\n/g, '\n');
  };
})();
