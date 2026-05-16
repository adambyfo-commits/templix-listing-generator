// ── FitText ─────────────────────────────────────────────────────────────
// Auto-sizes text to fill its container's WIDTH (and optional max height).
// Optionally scales font-weight along a curve so heavier strokes pair with
// smaller sizes and lighter strokes with display sizes.
//
// Usage:
//   <FitText max={150} min={48} weight={[800, 700]} style={{ ... }}>
//     {bundle.name}
//   </FitText>
//
// Props:
//   max          starting (largest) font size in px              default 200
//   min          smallest allowed font size in px                default 16
//   maxHeight    optional pixel height clamp; wraps + shrinks    default none
//   weight       single number, or [atMax, atMin] to interpolate default 700
//   tolerance    px gap to stop binary search                    default 0.5
//   style        passed through to the wrapping <span>
//   tag          element to render as (span, h1, h2, div…)       default 'span'
//
// Notes:
//   - Uses ResizeObserver so it re-fits when the parent resizes.
//   - Waits for document.fonts.ready so the first measurement uses real metrics.
//   - Measures via scrollWidth / scrollHeight against parentElement's clientWidth.
//     Put it inside a sized container (block-level, fixed width).

function FitText({
  children,
  max = 200,
  min = 16,
  maxHeight = null,
  weight = 700,
  tolerance = 0.5,
  tag: Tag = 'span',
  style = {},
  ...rest
}) {
  const ref = React.useRef(null);
  const [size, setSize] = React.useState(max);

  const fit = React.useCallback(() => {
    const el = ref.current;
    if (!el || !el.parentElement) return;
    const parent = el.parentElement;
    const targetW = parent.clientWidth;
    const targetH = maxHeight ?? Infinity;
    if (!targetW) return;

    let lo = min, hi = max;
    // Binary search for largest size that fits.
    while (hi - lo > tolerance) {
      const mid = (lo + hi) / 2;
      el.style.fontSize = mid + 'px';
      // Also update weight during measurement so width reflects final stroke.
      el.style.fontWeight = String(weightAt(mid, weight, min, max));
      const overflows =
        el.scrollWidth > targetW + 0.5 ||
        el.scrollHeight > targetH + 0.5;
      if (overflows) hi = mid;
      else lo = mid;
    }
    setSize(lo);
  }, [min, max, maxHeight, tolerance, JSON.stringify(weight)]);

  React.useLayoutEffect(() => {
    fit();
    // Re-fit once webfonts arrive (first paint may use fallback metrics).
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => fit());
    }
    const parent = ref.current?.parentElement;
    if (!parent || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => fit());
    ro.observe(parent);
    return () => ro.disconnect();
  }, [fit, children]);

  const w = weightAt(size, weight, min, max);

  return (
    <Tag
      ref={ref}
      style={{
        display: 'inline-block',
        fontSize: size,
        fontWeight: w,
        lineHeight: style.lineHeight ?? 1,
        whiteSpace: maxHeight ? 'normal' : 'nowrap',
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// Map current font-size → font-weight along the requested curve.
// `weight` can be:
//   - a number          → constant weight
//   - [atMax, atMin]    → interpolated (heavier at smaller sizes by convention)
function weightAt(size, weight, min, max) {
  if (typeof weight === 'number') return weight;
  if (!Array.isArray(weight) || weight.length < 2) return 700;
  const [atMax, atMin] = weight;
  if (max === min) return atMax;
  const t = (size - min) / (max - min);   // 0 at min, 1 at max
  const w = atMin + (atMax - atMin) * t;
  // Snap to nearest 100 — most webfonts only ship discrete weights.
  return Math.round(w / 100) * 100;
}

window.FitText = FitText;

// ── SectionTitle ────────────────────────────────────────────────────────
// Card-level section headline. Always fills a 1700px-wide centered band so
// every headline across every card lines up to the same visual rhythm,
// regardless of text length. Just pass children + optional color.
function SectionTitle({
  children,
  color = '#FFFFFF',
  width = 1700,
  max = 260,
  min = 80,
  weight = [700, 800],
  marginTop = 0,
  style = {},
  tag = 'h2',
}) {
  return (
    <div style={{ width, margin: `${marginTop}px auto 0` }}>
      <FitText
        tag={tag}
        max={max}
        min={min}
        weight={weight}
        style={{
          margin: 0,
          lineHeight: 0.95,
          letterSpacing: '-0.02em',
          color,
          ...style,
        }}
      >{children}</FitText>
    </div>
  );
}

window.SectionTitle = SectionTitle;
