/* ============================================================
   preview.jsx — top-down 2D table renderer (SVG)
   Resin geometry is driven by the chosen design PATTERN (cfg.layout).
   River supports angle / count / offset / straight-or-organic flow.
   exports window.TablePreview, window.BaseThumb
   ============================================================ */
const { useMemo } = React;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ---------- math helpers ---------- */
function wnoise(t, seed) {
  return (
    0.55 * Math.sin(t * Math.PI * 2 * 1.3 + seed * 1.7) +
    0.30 * Math.sin(t * Math.PI * 2 * 2.7 + seed * 2.3 + 1.1) +
    0.18 * Math.sin(t * Math.PI * 2 * 5.1 + seed * 0.7 + 2.0)
  );
}
function smoothClosed(pts) {
  const n = pts.length, f = (v) => v.toFixed(1);
  let d = `M ${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${f(c1x)} ${f(c1y)}, ${f(c2x)} ${f(c2y)}, ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + " Z";
}
const fx = (v) => v.toFixed(1);

/* ---------- rectangular / round / live outline ---------- */
function buildOutline(shape, edge, x0, y0, tw, th, inset = 0, seed = 7) {
  const left = x0 + inset, right = x0 + tw - inset, top = y0 + inset, bot = y0 + th - inset;
  const cx = (left + right) / 2, cy = (top + bot) / 2;
  const rx = (right - left) / 2, ry = (bot - top) / 2;
  const live = edge === "live", round = shape === "round" || shape === "oval";
  if (round) {
    const n = 76, pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2, r = live ? 1 + wnoise(i / n, seed) * 0.045 : 1;
      pts.push([cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r]);
    }
    return smoothClosed(pts);
  }
  if (live) {
    const amp = Math.min(14, (bot - top) * 0.05), nT = 16, pts = [];
    for (let i = 0; i <= nT; i++) { const t = i / nT; pts.push([left + (right - left) * t, top + wnoise(t, seed) * amp]); }
    for (let i = 1; i <= 4; i++) { const t = i / 5; pts.push([right + wnoise(t, seed + 3) * amp * 0.5, top + (bot - top) * t]); }
    for (let i = nT; i >= 0; i--) { const t = i / nT; pts.push([left + (right - left) * t, bot + wnoise(t, seed + 9) * amp]); }
    for (let i = 4; i >= 1; i--) { const t = i / 5; pts.push([left + wnoise(t, seed + 5) * amp * 0.5, top + (bot - top) * t]); }
    return smoothClosed(pts);
  }
  const cr = shape === "rect" ? Math.min(20, rx * 0.1) : 5;
  return `M ${fx(left + cr)} ${fx(top)} L ${fx(right - cr)} ${fx(top)} Q ${fx(right)} ${fx(top)} ${fx(right)} ${fx(top + cr)}` +
         ` L ${fx(right)} ${fx(bot - cr)} Q ${fx(right)} ${fx(bot)} ${fx(right - cr)} ${fx(bot)}` +
         ` L ${fx(left + cr)} ${fx(bot)} Q ${fx(left)} ${fx(bot)} ${fx(left)} ${fx(bot - cr)}` +
         ` L ${fx(left)} ${fx(top + cr)} Q ${fx(left)} ${fx(top)} ${fx(left + cr)} ${fx(top)} Z`;
}

/* ---------- organic tree-trunk (cookie) outline ---------- */
function cookieOutline(cx, cy, rx, ry, seed) {
  const n = 88, pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = 1 + 0.085 * Math.sin(a * 2 + seed) + 0.060 * Math.sin(a * 3 + seed * 1.7 + 1)
      + 0.045 * Math.sin(a * 5 + seed * 2.3) + 0.030 * Math.cos(a * 7 + seed * 0.9) + 0.040 * Math.cos(a + seed);
    pts.push([cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r]);
  }
  return smoothClosed(pts);
}
function makeCracks(cx, cy, R, seed) {
  const cracks = [];
  for (let k = 0; k < 4; k++) {
    const a0 = (k / 4) * Math.PI * 2 + seed * 0.7 + 0.4;
    let x = cx + Math.cos(a0) * R * 0.06, y = cy + Math.sin(a0) * R * 0.06, ang = a0;
    const steps = 7, len = R * (0.62 + 0.3 * Math.abs(Math.sin(seed + k * 1.3)));
    let d = `M ${fx(x)} ${fx(y)}`; const mids = [];
    for (let s = 1; s <= steps; s++) {
      ang += wnoise(s / steps, seed + k * 3) * 0.7; x += Math.cos(ang) * (len / steps); y += Math.sin(ang) * (len / steps);
      d += ` L ${fx(x)} ${fx(y)}`; if (s === 3 || s === 5) mids.push([x, y, ang]);
    }
    cracks.push({ d, w: 7 - k * 0.7 });
    mids.forEach((m, bi) => {
      let [bx, by, ba] = m; ba += (bi % 2 ? 1 : -1) * (0.7 + 0.3 * bi);
      let bd = `M ${fx(bx)} ${fx(by)}`; const bl = len * 0.4;
      for (let s = 1; s <= 3; s++) { ba += wnoise(s / 3, seed + k + bi) * 0.6; bx += Math.cos(ba) * (bl / 3); by += Math.sin(ba) * (bl / 3); bd += ` L ${fx(bx)} ${fx(by)}`; }
      cracks.push({ d: bd, w: 3.4 - bi * 0.6 });
    });
  }
  return cracks;
}

/* ---------- spirals ---------- */
function spiralPath(cx, cy, rMax, turns) {
  const total = turns * Math.PI * 2, steps = Math.round(turns * 48); let d = "";
  for (let i = 0; i <= steps; i++) { const th = (i / steps) * total, r = (th / total) * rMax; d += (i === 0 ? "M " : " L ") + fx(cx + Math.cos(th) * r) + " " + fx(cy + Math.sin(th) * r); }
  return d;
}
function rectSpiral(cx, cy, W, H, loops) {
  let l = cx - W / 2, r = cx + W / 2, t = cy - H / 2, b = cy + H / 2;
  const stepX = (W / 2) / (loops + 0.6), stepY = (H / 2) / (loops + 0.6);
  const pts = [[l, t]];
  for (let i = 0; i < loops; i++) {
    pts.push([r, t]); pts.push([r, b]); pts.push([l, b]);
    t += stepY; pts.push([l, t]); l += stepX; pts.push([l, t]); r -= stepX; b -= stepY;
  }
  return "M " + pts.map((p) => fx(p[0]) + " " + fx(p[1])).join(" L ");
}

/* ---------- bands ---------- */
function bandPath(xL, xR, yc, h, organic, seed) {
  if (!organic) return `M ${fx(xL)} ${fx(yc - h / 2)} L ${fx(xR)} ${fx(yc - h / 2)} L ${fx(xR)} ${fx(yc + h / 2)} L ${fx(xL)} ${fx(yc + h / 2)} Z`;
  const n = 18, amp = Math.min(13, h * 0.3); let d = "";
  for (let i = 0; i <= n; i++) { const t = i / n, x = xL + (xR - xL) * t; d += (i === 0 ? "M " : " L ") + fx(x) + " " + fx(yc - h / 2 + wnoise(t, seed) * amp); }
  for (let i = n; i >= 0; i--) { const t = i / n, x = xL + (xR - xL) * t; d += " L " + fx(x) + " " + fx(yc + h / 2 + wnoise(t, seed + 7) * amp); }
  return d + " Z";
}
function wavyVBand(xc, w, y0, y1, amp, seed) {
  const left = xc - w / 2, right = xc + w / 2, n = 16; let d = "";
  for (let i = 0; i <= n; i++) { const t = i / n, y = y0 + (y1 - y0) * t; d += (i === 0 ? "M " : " L ") + fx(left + wnoise(t, seed) * amp) + " " + fx(y); }
  for (let i = n; i >= 0; i--) { const t = i / n, y = y0 + (y1 - y0) * t; d += " L " + fx(right + wnoise(t, seed + 5) * amp) + " " + fx(y); }
  return d + " Z";
}
function rrect(cx, cy, w, h, r) {
  const l = cx - w / 2, t = cy - h / 2, R = cx + w / 2, B = cy + h / 2, rr = Math.max(0, Math.min(r, w / 2, h / 2));
  return `M ${fx(l + rr)} ${fx(t)} L ${fx(R - rr)} ${fx(t)} Q ${fx(R)} ${fx(t)} ${fx(R)} ${fx(t + rr)} L ${fx(R)} ${fx(B - rr)} Q ${fx(R)} ${fx(B)} ${fx(R - rr)} ${fx(B)} L ${fx(l + rr)} ${fx(B)} Q ${fx(l)} ${fx(B)} ${fx(l)} ${fx(B - rr)} L ${fx(l)} ${fx(t + rr)} Q ${fx(l)} ${fx(t)} ${fx(l + rr)} ${fx(t)} Z`;
}

/* ---------- wood grain ---------- */
function makeGrain(x0, y0, w, h, seed) {
  const lines = [], rows = Math.max(16, Math.round(h / 14));
  for (let r = 0; r < rows; r++) {
    const t = r / rows, baseY = y0 + h * t + (h / rows) * 0.5, n = 10; let d = "";
    for (let i = 0; i <= n; i++) {
      const tt = i / n, x = x0 + w * tt;
      const y = baseY + wnoise(tt + t * 3, seed + r * 0.9) * (h / rows) * 0.42 + Math.sin(tt * Math.PI) * (r % 4 === 0 ? 5 : 1.4);
      d += (i === 0 ? "M " : " L ") + fx(x) + " " + fx(y);
    }
    lines.push({ d, w: r % 5 === 0 ? 1.5 : 0.8, o: r % 5 === 0 ? 0.5 : 0.28 });
  }
  return lines;
}
function makeRings(cx, cy, R, seed) {
  const rings = [], n = 9;
  for (let k = 1; k <= n; k++) {
    const rr = R * (k / n) * 0.94, pts = [], pn = 60;
    for (let i = 0; i < pn; i++) { const a = (i / pn) * Math.PI * 2, wob = 1 + wnoise(i / pn, seed + k) * 0.05 + 0.02 * Math.sin(a * 3 + k); pts.push([cx + Math.cos(a) * rr * wob, cy + Math.sin(a) * rr * wob * 0.96]); }
    rings.push({ d: smoothClosed(pts), o: 0.18 + (k % 2) * 0.12 });
  }
  return rings;
}

/* ---------- base thumbnails ---------- */
function BaseThumb({ id, accent }) {
  const s = { fill: "none", stroke: accent, strokeWidth: 2.4, strokeLinecap: "round", strokeLinejoin: "round" };
  const top = { stroke: "var(--text-dim)", strokeWidth: 3, strokeLinecap: "round" };
  const draw = {
    hairpin: <g><line x1="8" y1="14" x2="76" y2="14" {...top} /><path d="M16 15 L12 40 M16 15 L22 40" {...s} /><path d="M68 15 L64 40 M68 15 L74 40" {...s} /></g>,
    uframe:  <g><line x1="8" y1="14" x2="76" y2="14" {...top} /><path d="M16 15 L16 40 L30 40 L30 15" {...s} /><path d="M54 15 L54 40 L68 40 L68 15" {...s} /></g>,
    pedestal:<g><line x1="8" y1="14" x2="76" y2="14" {...top} /><path d="M42 15 L42 36" {...s} /><path d="M28 40 Q42 33 56 40" {...s} /><path d="M42 36 L42 40" {...s} /></g>,
    box:     <g><line x1="8" y1="14" x2="76" y2="14" {...top} /><rect x="16" y="15" width="14" height="25" {...s} /><rect x="54" y="15" width="14" height="25" {...s} /></g>,
  };
  return <svg viewBox="0 0 84 48" style={{ width: "100%", height: "100%" }}>{draw[id] || draw.hairpin}</svg>;
}

/* ---------- layered resin painter for an array of (filled) paths ---------- */
function ResinShapes({ paths, rc, op, metallic }) {
  return (
    <>
      {paths.map((d, i) => <path key={"sub" + i} d={d} fillRule="evenodd" fill="#0B0D10" opacity={0.82} />)}
      {paths.map((d, i) => <path key={"col" + i} d={d} fillRule="evenodd" fill={rc} opacity={op} />)}
      {paths.map((d, i) => <path key={"dep" + i} d={d} fillRule="evenodd" fill="#000" opacity={0.18 * op} />)}
      {paths.map((d, i) => <path key={"shn" + i} d={d} fillRule="evenodd" fill="url(#resinSheen)" />)}
      {metallic && paths.map((d, i) => <path key={"met" + i} d={d} fillRule="evenodd" fill="url(#metalShimmer)" style={{ mixBlendMode: "screen" }} opacity={0.7} />)}
      {paths.map((d, i) => <path key={"rim" + i} d={d} fillRule="evenodd" fill="none" stroke="#fff" strokeWidth="1" opacity={0.18} />)}
    </>
  );
}
/* layered resin painter for stroked paths (spirals) */
function ResinStroke({ d, w, rc, op, metallic }) {
  return (
    <g strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d={d} stroke="#0B0D10" strokeWidth={w + 4} opacity={0.8} />
      <path d={d} stroke={rc} strokeWidth={w} opacity={op} />
      <path d={d} stroke="#000" strokeWidth={w} opacity={0.16 * op} />
      {metallic && <path d={d} stroke="url(#metalShimmer)" strokeWidth={w} style={{ mixBlendMode: "screen" }} opacity={0.55} />}
      <path d={d} stroke="#fff" strokeWidth={Math.max(1.2, w * 0.16)} opacity={0.22} />
    </g>
  );
}

/* ============================================================
   TablePreview
   ============================================================ */
function TablePreview({ cfg, accent }) {
  const VBW = 1000, VBH = 720;
  const M = { t: 92, r: 124, b: 100, l: 92 };
  const availW = VBW - M.l - M.r, availH = VBH - M.t - M.b;

  const wood = WOODS.find((w) => w.id === cfg.wood) || WOODS[0];
  const isCookie = cfg.layout === "cookie";
  const effW = (cfg.shapeLocked || isCookie) ? cfg.length : cfg.width;

  const geom = useMemo(() => {
    const ratio = cfg.length / effW;
    let tw = availW, th = tw / ratio;
    if (th > availH) { th = availH; tw = th * ratio; }
    const x0 = M.l + (availW - tw) / 2, y0 = M.t + (availH - th) / 2;
    return { tw, th, x0, y0 };
  }, [cfg.length, effW]);

  const { tw, th, x0, y0 } = geom;
  const cxc = x0 + tw / 2, cyc = y0 + th / 2;
  const Rk = Math.min(tw, th) / 2, diag = Math.hypot(tw, th);

  const outline = useMemo(
    () => isCookie ? cookieOutline(cxc, cyc, Rk * 1.04, Rk * 0.98, 3.1) : buildOutline(cfg.shape, cfg.edge, x0, y0, tw, th),
    [isCookie, cfg.shape, cfg.edge, x0, y0, tw, th, Rk]
  );
  const grain = useMemo(() => makeGrain(x0 - 6, y0 - 6, tw + 12, th + 12, wood.id.length + 3), [x0, y0, tw, th, wood.id]);
  const rings = useMemo(() => isCookie ? makeRings(cxc, cyc, Rk, wood.id.length + 2) : [], [isCookie, cxc, cyc, Rk, wood.id]);
  const cracks = useMemo(() => isCookie ? makeCracks(cxc, cyc, Rk, 2.4) : [], [isCookie, cxc, cyc, Rk]);

  const pxPerCm = th / effW;
  const rc = cfg.resinColor, op = cfg.resinOpacity;

  /* ============ geometry per pattern ============ */
  let linearPaths = null, linearAngle = 0, regionPaths = [], frameSeams = [];
  let spiralD = null, rectSpiralD = null, spiralW = 0;

  if (cfg.layout === "river") {
    linearAngle = cfg.riverAngle;
    const n = cfg.riverCount;
    const bandW = clamp(cfg.gap * pxPerCm, 8, th * (n > 1 ? 0.26 : 0.55));
    const reach = diag * 0.62;                 // horizontal length (covers rotation)
    const placeHalf = th * 0.34;               // vertical spread, slab-relative
    linearPaths = [];
    for (let i = 0; i < n; i++) {
      const f = n === 1 ? 0 : (i / (n - 1) - 0.5);
      const yc = cyc + f * 2 * placeHalf + cfg.riverOffset * th * 0.9;
      linearPaths.push(bandPath(cxc - reach, cxc + reach, yc, bandW, cfg.riverFlow === "organic", i * 5 + 4));
    }
  } else if (cfg.layout === "edgeframe") {
    const fw = clamp(cfg.frameW * pxPerCm, 10, Math.min(tw, th) * 0.42);
    const inner = buildOutline(cfg.shape, cfg.edge, x0 + fw, y0 + fw, tw - 2 * fw, th - 2 * fw, 0, 7);
    regionPaths.push(outline + " " + inner);
  } else if (cfg.layout === "frames") {
    const N = cfg.frames;
    const r0 = Math.min(tw, th) * 0.06;
    for (let i = 0; i < N; i++) {
      const frac = i / N;
      const w = tw * (1 - frac * 0.94), h = th * (1 - frac * 0.94);
      frameSeams.push(rrect(cxc, cyc, w, h, r0 * (1 - frac)));
      if (i % 2 === 0) {
        const fracN = (i + 1) / N;
        const w2 = tw * (1 - fracN * 0.94), h2 = th * (1 - fracN * 0.94);
        regionPaths.push(rrect(cxc, cyc, w, h, r0 * (1 - frac)) + " " + rrect(cxc, cyc, w2, h2, r0 * (1 - fracN)));
      }
    }
  } else if (cfg.layout === "spiral") {
    spiralD = spiralPath(cxc, cyc, Rk * 1.18, 3.2); spiralW = Rk * 0.16;
  } else if (cfg.layout === "geospiral") {
    rectSpiralD = rectSpiral(cxc, cyc, tw * 0.9, th * 0.9, 4); spiralW = Math.min(tw, th) * 0.09;
  }

  return (
    <svg viewBox={`0 0 ${VBW} ${VBH}`} style={{ width: "100%", height: "100%", display: "block" }} preserveAspectRatio="xMidYMid meet">
      <defs>
        <clipPath id="outlineClip"><path d={outline} /></clipPath>
        <linearGradient id="woodGrad" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor={wood.light} /><stop offset="45%" stopColor={wood.mid} /><stop offset="100%" stopColor={wood.base} />
        </linearGradient>
        <radialGradient id="woodVig" cx="50%" cy="42%" r="75%">
          <stop offset="55%" stopColor="#000" stopOpacity="0" /><stop offset="100%" stopColor="#000" stopOpacity="0.32" />
        </radialGradient>
        <linearGradient id="resinSheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.0" /><stop offset="45%" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="55%" stopColor="#fff" stopOpacity="0.04" /><stop offset="100%" stopColor="#fff" stopOpacity="0.0" />
        </linearGradient>
        <linearGradient id="metalShimmer" x1="0" y1="0" x2="1" y2="0.6">
          <stop offset="0%" stopColor="#fff" stopOpacity="0" /><stop offset="30%" stopColor="#fff" stopOpacity="0.42" />
          <stop offset="42%" stopColor={rc} stopOpacity="0.1" /><stop offset="60%" stopColor="#fff" stopOpacity="0.30" />
          <stop offset="78%" stopColor="#fff" stopOpacity="0.05" /><stop offset="100%" stopColor="#fff" stopOpacity="0.34" />
        </linearGradient>
        <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="9" /></filter>
        <filter id="contactShadow" x="-30%" y="-30%" width="160%" height="180%"><feGaussianBlur stdDeviation="20" /></filter>
      </defs>

      <path d={outline} fill="#000" opacity="0.55" filter="url(#contactShadow)" transform="translate(10 26)" />

      {/* ============ TABLE TOP ============ */}
      <g clipPath="url(#outlineClip)" style={{ transition: "all .15s linear" }}>
        <rect x={x0 - 14} y={y0 - 14} width={tw + 28} height={th + 28} fill="url(#woodGrad)" className="anim-fill" />

        {!isCookie && (
          <g stroke={wood.grain} fill="none" style={{ mixBlendMode: "multiply" }}>
            {grain.map((g, i) => <path key={i} d={g.d} strokeWidth={g.w} opacity={g.o} />)}
          </g>
        )}
        {isCookie && (
          <g style={{ mixBlendMode: "multiply" }}>
            {rings.map((r, i) => <path key={i} d={r.d} fill="none" stroke={wood.grain} strokeWidth={i % 2 ? 1.6 : 1} opacity={r.o} />)}
            {[0.4, 2.1, 3.7, 5.0].map((a, i) => <line key={"rc" + i} x1={cxc} y1={cyc} x2={cxc + Math.cos(a) * Rk * 0.92} y2={cyc + Math.sin(a) * Rk * 0.92} stroke={wood.grain} strokeWidth="1" opacity="0.18" />)}
          </g>
        )}

        <ellipse cx={cxc - tw * 0.12} cy={cyc - th * 0.16} rx={tw * 0.42} ry={th * 0.3} fill={wood.sheen} opacity="0.12" filter="url(#softGlow)" />
        <rect x={x0 - 14} y={y0 - 14} width={tw + 28} height={th + 28} fill="url(#woodVig)" />

        {/* nested-frame inlay seams (under resin so resin reads as the gap) */}
        {frameSeams.length > 0 && (
          <g fill="none" stroke="#000" strokeOpacity="0.35" strokeWidth="2">
            {frameSeams.map((d, i) => <path key={i} d={d} />)}
          </g>
        )}

        {/* ---- RESIN: linear (river / center plank), rotatable ---- */}
        {linearPaths && (
          <g className="anim-resin" transform={`rotate(${linearAngle} ${cxc} ${cyc})`}>
            <ResinShapes paths={linearPaths} rc={rc} op={op} metallic={cfg.metallic} />
          </g>
        )}

        {/* ---- RESIN: regions (multiband / edge frame / nested frames) ---- */}
        {regionPaths.length > 0 && (
          <g className="anim-resin"><ResinShapes paths={regionPaths} rc={rc} op={op} metallic={cfg.metallic} /></g>
        )}

        {/* nested-frame seam lines on top edge for crispness */}
        {frameSeams.length > 0 && (
          <g fill="none" stroke={wood.sheen} strokeOpacity="0.2" strokeWidth="1">
            {frameSeams.map((d, i) => <path key={i} d={d} />)}
          </g>
        )}

        {/* ---- RESIN: smooth spiral ---- */}
        {spiralD && <g className="anim-resin"><ResinStroke d={spiralD} w={spiralW} rc={rc} op={op} metallic={cfg.metallic} /></g>}
        {/* ---- RESIN: geometric square spiral ---- */}
        {rectSpiralD && <g className="anim-resin"><ResinStroke d={rectSpiralD} w={spiralW} rc={rc} op={op} metallic={cfg.metallic} /></g>}

        {/* ---- RESIN: cookie cracks ---- */}
        {isCookie && (
          <g className="anim-resin">
            {cracks.map((c, i) => <path key={"cs" + i} d={c.d} fill="none" stroke="#0B0D10" strokeWidth={c.w + 3} strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />)}
            {cracks.map((c, i) => <path key={"cc" + i} d={c.d} fill="none" stroke={rc} strokeWidth={c.w} strokeLinecap="round" strokeLinejoin="round" opacity={op} />)}
            {cfg.metallic && cracks.map((c, i) => <path key={"cm" + i} d={c.d} fill="none" stroke="url(#metalShimmer)" strokeWidth={c.w} strokeLinecap="round" style={{ mixBlendMode: "screen" }} opacity="0.6" />)}
            {cracks.map((c, i) => <path key={"ch" + i} d={c.d} fill="none" stroke="#fff" strokeWidth={Math.max(0.8, c.w * 0.18)} strokeLinecap="round" opacity="0.2" />)}
          </g>
        )}

        {cfg.edge === "bevel" && !isCookie && (
          <path d={buildOutline(cfg.shape, cfg.edge, x0, y0, tw, th, Math.min(tw, th) * 0.045)} fill="none" stroke="#fff" strokeWidth={Math.min(tw, th) * 0.04} opacity="0.1" />
        )}
      </g>

      {/* outline stroke */}
      <path d={outline} fill="none" stroke="#000" strokeWidth="2.5" opacity="0.4" className="anim-fill" />
      <path d={outline} fill="none" stroke={wood.sheen} strokeWidth="1" opacity="0.25" className="anim-fill" />

      {/* ============ DIMENSIONS ============ */}
      {!isCookie && (
        <>
          <g stroke="var(--text-faint)" strokeWidth="1.2" fill="none" opacity="0.85">
            <line x1={x0} y1={y0 + th + 34} x2={x0 + tw} y2={y0 + th + 34} />
            <line x1={x0} y1={y0 + th + 28} x2={x0} y2={y0 + th + 40} />
            <line x1={x0 + tw} y1={y0 + th + 28} x2={x0 + tw} y2={y0 + th + 40} />
            <line x1={x0 + tw + 38} y1={y0} x2={x0 + tw + 38} y2={y0 + th} />
            <line x1={x0 + tw + 32} y1={y0} x2={x0 + tw + 44} y2={y0} />
            <line x1={x0 + tw + 32} y1={y0 + th} x2={x0 + tw + 44} y2={y0 + th} />
          </g>
          <g fill="var(--text-dim)" fontFamily="var(--font-mono)" fontSize="19">
            <text x={cxc} y={y0 + th + 60} textAnchor="middle">{cfg.length} cm</text>
            <text x={x0 + tw + 54} y={cyc} textAnchor="middle" dominantBaseline="middle" transform={`rotate(90 ${x0 + tw + 54} ${cyc})`}>{effW} cm</text>
          </g>
        </>
      )}
      {isCookie && (
        <g fill="var(--text-dim)" fontFamily="var(--font-mono)" fontSize="19">
          <text x={cxc} y={y0 + th + 56} textAnchor="middle">⌀ {cfg.length} cm</text>
        </g>
      )}
      <g transform={`translate(${x0}, ${y0 - 30})`}>
        <rect x="0" y="-16" width="118" height="24" rx="6" fill="var(--surface-2)" stroke="var(--line)" />
        <text x="59" y="1" textAnchor="middle" fill="var(--text-dim)" fontFamily="var(--font-mono)" fontSize="13.5" dominantBaseline="middle">4.5 cm (1.75") · standard</text>
      </g>

      {/* ============ BASE INSET ============ */}
      <g transform={`translate(${VBW - 168}, ${VBH - 92})`}>
        <rect x="0" y="0" width="150" height="74" rx="12" fill="var(--surface-2)" stroke="var(--line)" />
        <text x="14" y="20" fill="var(--text-faint)" fontFamily="var(--font-mono)" fontSize="11" letterSpacing="1.5">BASE</text>
        <foreignObject x="14" y="24" width="122" height="42">
          <div xmlns="http://www.w3.org/1999/xhtml" style={{ width: "100%", height: "100%" }}>
            <BaseThumb id={cfg.base} accent={accent} />
          </div>
        </foreignObject>
      </g>
    </svg>
  );
}

window.TablePreview = TablePreview;
window.BaseThumb = BaseThumb;
