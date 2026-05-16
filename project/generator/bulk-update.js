// Bulk update importer. Reads a CSV/XLSX, merges its rows into the live
// in-memory data so all 26 bundles update in one shot.
//
// Merge keys:
//   - Bundle ID matches an existing window.TEMPLIX_DATA.bundles[].id
//   - Same row's hero_*, inc_*, p0N_*, try_*, quick_N_*, image-URL cols
//     get merged into window.TEMPLIX_CANVA[bundleId] (Canva schema rows).
//   - Top-level bundle fields (Tier, Bundle Name, Price) update the
//     bundle object itself.
//   - Image URL cols get echoed into the Canva schema *and* into a
//     dedicated window.TEMPLIX_BULK_IMAGES lookup so the cards can
//     pull from them ahead of the original cloudfront URLs.
//
// Usage: window.applyBulkUpdate(rows) — rows is an array of objects.

(function () {
  if (window.__BULK_INSTALLED__) return;
  window.__BULK_INSTALLED__ = true;

  window.TEMPLIX_BULK_IMAGES = window.TEMPLIX_BULK_IMAGES || {};

  function setIfNonEmpty(obj, k, v) {
    if (v == null) return;
    const s = String(v).trim();
    if (!s) return;
    obj[k] = s.replace(/\\n/g, '\n');
  }

  window.applyBulkUpdate = function (rows) {
    if (!Array.isArray(rows) || !rows.length) return { merged: 0 };
    const D = window.TEMPLIX_DATA;
    const CANVA = window.TEMPLIX_CANVA;
    if (!D || !CANVA) return { error: 'data not loaded' };

    let merged = 0;
    for (const row of rows) {
      const id = (row['Bundle ID'] || row.bundleId || row.id || '').trim();
      if (!id) continue;
      const bundle = D.bundles.find(b => b.id === id);
      if (!bundle) continue;

      // Top-level bundle fields
      setIfNonEmpty(bundle, 'tier', row['Tier']);
      setIfNonEmpty(bundle, 'name', row['Bundle Name']);
      setIfNonEmpty(bundle, 'price', row['Price']);
      setIfNonEmpty(bundle, 'firstImage', row['cover_image']);

      // Canva schema merge — accept any column with a known prefix
      CANVA[id] = CANVA[id] || {};
      for (const [k, v] of Object.entries(row)) {
        if (!v || v === '') continue;
        if (['Bundle ID','Tier','Bundle Name','Price'].includes(k)) continue;
        setIfNonEmpty(CANVA[id], k, v);
      }

      // Stash image URL fields for fast lookup
      const imgs = window.TEMPLIX_BULK_IMAGES[id] = window.TEMPLIX_BULK_IMAGES[id] || {};
      const imageKeys = [
        'cover_image',
        'hero_tablet_1_url','hero_tablet_2_url','hero_tablet_3_url','hero_tablet_4_url','hero_tablet_5_url',
        'handedness_screen_url',
        'try_tablet_1_url','try_tablet_2_url','try_tablet_3_url','try_tablet_4_url','try_tablet_5_url',
      ];
      for (const k of imageKeys) {
        if (row[k]) imgs[k] = row[k].trim();
      }
      // Per-product cover URLs
      for (let p = 1; p <= 5; p++) {
        const key = `p0${p}_cover_url`;
        if (row[key]) imgs[key] = row[key].trim();
      }
      // Per-quick page URLs
      for (let q = 1; q <= 5; q++) {
        const key = `quick_${q}_page_url`;
        if (row[key]) imgs[key] = row[key].trim();
      }

      merged++;
    }

    // Tell anyone listening to re-render
    window.dispatchEvent(new Event('bulk-update'));
    return { merged };
  };

  // CSV parser (handles quoted strings + embedded commas/newlines)
  function parseCSV(text) {
    const rows = [];
    let i = 0, field = '', row = [], inQ = false;
    while (i < text.length) {
      const c = text[i];
      if (inQ) {
        if (c === '"') {
          if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
          inQ = false; i++; continue;
        }
        field += c; i++; continue;
      }
      if (c === '"') { inQ = true; i++; continue; }
      if (c === ',') { row.push(field); field = ''; i++; continue; }
      if (c === '\r') { i++; continue; }
      if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; i++; continue; }
      field += c; i++;
    }
    if (field !== '' || row.length) { row.push(field); rows.push(row); }
    if (!rows.length) return [];
    const headers = rows[0];
    return rows.slice(1).filter(r => r.some(c => c !== '')).map(r => {
      const o = {};
      headers.forEach((h, idx) => { o[h] = r[idx] ?? ''; });
      return o;
    });
  }

  window.parseBulkCSV = parseCSV;

  // Read a File object, auto-detect CSV/XLSX, return array of row objects.
  window.readBulkFile = async function (file) {
    const name = (file.name || '').toLowerCase();
    if (name.endsWith('.csv')) {
      const text = await file.text();
      return parseCSV(text);
    }
    if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
      if (!window.XLSX) throw new Error('XLSX library not loaded');
      const buf = await file.arrayBuffer();
      const wb = window.XLSX.read(buf, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      return window.XLSX.utils.sheet_to_json(sheet, { defval: '' });
    }
    throw new Error('Unsupported file: ' + file.name);
  };
})();
