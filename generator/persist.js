// Persistence layer — saves all in-session edits to localStorage and
// restores them on load.
//
// Public API:
//   window.saveAllEdits()  → { ok, savedAt }
//   window.loadAllEdits()  → restores snapshot (auto-called on script init)
//   window.clearAllEdits() → wipes the snapshot

(function () {
  const KEY = 'templix.generator.state.v1';

  window.saveAllEdits = function () {
    try {
      const snapshot = {
        nudge:          window.NUDGE_OFFSETS || {},
        content:        window.CARD_CONTENT || {},
        userKeys:       window.__USER_SET_CONTENT_KEYS__ || [],
        bulkImages:     window.TEMPLIX_BULK_IMAGES || {},
        ribbonHidden:   !!window.RIBBON_HIDDEN,
        canvaOverrides: window.__CANVA_OVERRIDES__ || {},
        savedTitles:    window.__SAVED_TITLES__ || {},
        cardOrder:      window.__SAVED_CARD_ORDER__ || null,
        removedCards:   window.__REMOVED_CARDS__ || [],
        savedAt:        Date.now(),
      };
      const json = JSON.stringify(snapshot);
      localStorage.setItem(KEY, json);
      console.log('[persist] saved', json.length, 'bytes');
      return { ok: true, savedAt: snapshot.savedAt, bytes: json.length };
    } catch (e) {
      console.error('[persist] save failed', e);
      return { ok: false, error: e.message };
    }
  };

  window.loadAllEdits = function () {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      // Mutate in place so existing references stay valid.
      window.NUDGE_OFFSETS = Object.assign(window.NUDGE_OFFSETS || {}, s.nudge || {});
      window.CARD_CONTENT  = Object.assign(window.CARD_CONTENT  || {}, s.content || {});
      window.__USER_SET_CONTENT_KEYS__ = Array.isArray(s.userKeys) ? s.userKeys.slice() : [];
      window.TEMPLIX_BULK_IMAGES = Object.assign(window.TEMPLIX_BULK_IMAGES || {}, s.bulkImages || {});
      window.RIBBON_HIDDEN = !!s.ribbonHidden;
      window.__SAVED_TITLES__ = s.savedTitles || {};
      if (Array.isArray(s.cardOrder)) window.__SAVED_CARD_ORDER__ = s.cardOrder;
      if (Array.isArray(s.removedCards)) window.__REMOVED_CARDS__ = s.removedCards;
      if (s.canvaOverrides && window.TEMPLIX_CANVA) {
        for (const [bundleId, fields] of Object.entries(s.canvaOverrides)) {
          window.TEMPLIX_CANVA[bundleId] = Object.assign(
            {}, window.TEMPLIX_CANVA[bundleId] || {}, fields
          );
        }
      }
      console.log('[persist] loaded snapshot from', new Date(s.savedAt).toLocaleString());
      return s;
    } catch (e) {
      console.warn('[persist] load failed', e);
      return null;
    }
  };

  window.clearAllEdits = function () {
    try { localStorage.removeItem(KEY); return { ok: true }; }
    catch (e) { return { ok: false, error: e.message }; }
  };

  // Auto-load on script init (runs before app.jsx renders).
  window.loadAllEdits();
})();
