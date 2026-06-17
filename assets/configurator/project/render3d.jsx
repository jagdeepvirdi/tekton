/* ============================================================
   render3d.jsx — isometric 3D table render + scale human
   Exposes: TableRender3D, RenderModal, generateDesignId
   Depends on: data.jsx globals (TABLE_TYPES, WOODS, LAYOUTS, THICKNESS_CM)
   ============================================================ */

const FLOOR_HEIGHT = { dining: 75, coffee: 45, endtable: 55 };

function generateDesignId() {
  const d = new Date();
  const date = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
  const rand = Math.random().toString(36).substring(2,6).toUpperCase();
  return `TI-${date}-${rand}`;
}

/* ── Stick-figure human silhouette ── */
function HumanFigure({ cx, topY, h }) {
  const s = h / 170;
  const hR  = 10  * s;
  const bTop = topY + hR * 2.4;
  const bH   = 55  * s;
  const bW   = 18  * s;
  const leg  = bTop + bH + 48 * s;
  const col  = 'rgba(245,246,247,0.16)';
  const str  = 'rgba(245,246,247,0.42)';
  const sw   = Math.max(1, 1.6 * s);
  return (
    <g fill={col} stroke={str} strokeWidth={sw} strokeLinecap="round">
      <circle cx={cx} cy={topY + hR} r={hR} />
      <rect x={cx - bW/2} y={bTop} width={bW} height={bH} rx={3*s} />
      <line x1={cx - bW/2} y1={bTop + 8*s} x2={cx - bW*1.25} y2={bTop + bH*0.75} />
      <line x1={cx + bW/2} y1={bTop + 8*s} x2={cx + bW*1.25} y2={bTop + bH*0.75} />
      <line x1={cx - bW*0.25} y1={bTop + bH} x2={cx - bW*0.35} y2={leg} />
      <line x1={cx + bW*0.25} y1={bTop + bH} x2={cx + bW*0.35} y2={leg} />
    </g>
  );
}

/* ── Isometric 3D render ── */
function TableRender3D({ cfg }) {
  const SVG_W = 720, SVG_H = 400;
  const SCALE = 1.35;
  const C30 = Math.cos(Math.PI / 6);
  const S30 = Math.sin(Math.PI / 6);

  const isCookie = cfg.layout === 'cookie';
  const L  = cfg.length;
  const TW = (cfg.shapeLocked || isCookie) ? cfg.length : cfg.width;
  const T  = THICKNESS_CM;
  const FH = FLOOR_HEIGHT[cfg.type] || 75;

  /* isometric projection: X=length, Y=up, Z=width */
  const p3 = (x, y, z) => ({
    sx: (x - z) * C30 * SCALE,
    sy: (x + z) * S30 * SCALE - y * SCALE,
  });

  /* table corners */
  const tFL = p3(0, FH, 0);    const tFR = p3(L, FH, 0);
  const tBL = p3(0, FH, TW);   const tBR = p3(L, FH, TW);
  const bFL = p3(0, FH-T, 0);  const bFR = p3(L, FH-T, 0);
  const bBR = p3(L, FH-T, TW);
  const floorRef = p3(0, 0, 0);

  /* human — right of table, at front face */
  const HUMAN_CM = 170, GAP = 24;
  const hTop = p3(L+GAP, HUMAN_CM, 0);
  const hBot = p3(L+GAP, 0, 0);

  /* centre scene */
  const allP  = [tFL, tFR, tBL, tBR, bFL, bFR, bBR, hTop, hBot];
  const minSX = Math.min(...allP.map(p => p.sx));
  const maxSX = Math.max(...allP.map(p => p.sx));
  const groundY = SVG_H * 0.82;
  const oy = groundY - floorRef.sy;
  const ox = SVG_W / 2 - (minSX + maxSX) / 2;

  const sc = ({ sx, sy }) => ({ x: +(sx+ox).toFixed(1), y: +(sy+oy).toFixed(1) });
  const pt = p => { const { x, y } = sc(p); return `${x},${y}`; };
  const poly = (...pts) => pts.map(pt).join(' ');

  /* resin polygons on top face (simplified per layout) */
  const topR = (x1, z1, x2, z2) =>
    poly(p3(x1,FH,z1), p3(x2,FH,z1), p3(x2,FH,z2), p3(x1,FH,z2));

  let resinPolys = [];
  let cookieTint = false;

  if (cfg.layout === 'river') {
    const gz  = (cfg.gap || 11) / 2;
    const zc  = TW * (0.5 + (cfg.riverOffset || 0) * 0.4);
    const n   = cfg.riverCount || 1;
    const spr = TW * 0.28;
    for (let i = 0; i < n; i++) {
      const off = n === 1 ? 0 : (i/(n-1) - 0.5) * spr * 2;
      resinPolys.push(topR(0, zc+off-gz, L, zc+off+gz));
    }
  } else if (cfg.layout === 'centerplank') {
    const gz  = (cfg.gap || 11) / 2;
    const off = TW * (cfg.plankSpread || 0.30);
    resinPolys = [topR(0, TW/2-off-gz, L, TW/2-off+gz), topR(0, TW/2+off-gz, L, TW/2+off+gz)];
  } else if (cfg.layout === 'multiband') {
    const rf = cfg.bandResin || 0.34;
    const bW = (L * rf) / 3, wW = (L * (1-rf)) / 2;
    for (let i = 0; i < 3; i++) resinPolys.push(topR(i*(bW+wW), 0, i*(bW+wW)+bW, TW));
  } else if (cfg.layout === 'edgeframe') {
    const fw = Math.min((cfg.frameW || 12), Math.min(L,TW)*0.28);
    resinPolys = [
      topR(0, 0, L, fw), topR(0, TW-fw, L, TW),
      topR(0, fw, fw, TW-fw), topR(L-fw, fw, L, TW-fw),
    ];
  } else if (cfg.layout === 'frames') {
    const N = cfg.frames || 5;
    for (let i = 0; i < N; i += 2) {
      const f = (i+0.5) / N * 0.44;
      resinPolys.push(topR(L*f, TW*f, L*(1-f), TW*(1-f)));
    }
  } else if (cfg.layout === 'spiral' || cfg.layout === 'geospiral') {
    const r = Math.min(L, TW) * 0.22;
    resinPolys = [topR(L/2-r, TW/2-r, L/2+r, TW/2+r)];
  } else if (cfg.layout === 'cookie') {
    cookieTint = true;
  }

  const wood  = WOODS.find(w => w.id === cfg.wood) || WOODS[0];
  const rc    = cfg.resinColor;
  const op    = cfg.resinOpacity;

  /* leg positions */
  const legIn = 8;
  const legPts = [[legIn,legIn],[L-legIn,legIn],[legIn,TW-legIn],[L-legIn,TW-legIn]];

  const hTopSc = sc(hTop), hBotSc = sc(hBot);
  const humanH  = hBotSc.y - hTopSc.y;

  /* annotation helpers */
  const floorPt = sc(floorRef);
  const tFLsc   = sc(tFL);
  const bFLsc   = sc(bFL), bFRsc = sc(bFR);

  return (
    <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      style={{ display:'block', maxWidth:'100%', borderRadius: 10 }}>
      <defs>
        <clipPath id="rc3d-top-clip">
          <polygon points={poly(tFL,tFR,tBR,tBL)} />
        </clipPath>
        <linearGradient id="rc3d-sheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor={wood.sheen} stopOpacity="0.45" />
          <stop offset="100%" stopColor={wood.sheen} stopOpacity="0.0"  />
        </linearGradient>
      </defs>

      {/* ground */}
      <line x1={0} y1={groundY} x2={SVG_W} y2={groundY} stroke="#2A2B2F" strokeWidth="1.5" />

      {/* table shadow */}
      <ellipse
        cx={(sc(tFL).x + sc(tFR).x) / 2} cy={groundY + 5}
        rx={Math.abs(sc(tFR).x - sc(tFL).x) * 0.48} ry={8}
        fill="rgba(0,0,0,0.32)" />

      {/* legs */}
      {legPts.map(([lx,lz], i) => {
        const t2 = sc(p3(lx, FH-T, lz)), b2 = sc(p3(lx, 0, lz));
        return <line key={i} x1={t2.x} y1={t2.y} x2={b2.x} y2={b2.y}
          stroke="#484850" strokeWidth="3.5" strokeLinecap="round" />;
      })}

      {/* right/back slab face */}
      <polygon points={poly(tFR,tBR,bBR,bFR)}
        fill={wood.base} stroke="rgba(0,0,0,0.25)" strokeWidth="0.5" />

      {/* front slab face */}
      <polygon points={poly(tFL,tFR,bFR,bFL)}
        fill={wood.mid} stroke="rgba(0,0,0,0.25)" strokeWidth="0.5" />

      {/* top face – base wood */}
      <polygon points={poly(tFL,tFR,tBR,tBL)}
        fill={cookieTint ? rc : wood.light}
        fillOpacity={cookieTint ? op * 0.7 : 1} />

      {/* top face – wood grain */}
      {!cookieTint && (
        <g clipPath="url(#rc3d-top-clip)" stroke={wood.grain} strokeWidth="0.9" opacity="0.32" fill="none">
          {[1,2,3,4,5].map(i => {
            const a = sc(p3(L*i/6, FH, 0)), b = sc(p3(L*i/6, FH, TW));
            return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
          })}
        </g>
      )}

      {/* top face – resin overlays */}
      {resinPolys.map((pts, i) => (
        <polygon key={i} points={pts} fill={rc} fillOpacity={op * 0.88}
          clipPath="url(#rc3d-top-clip)" />
      ))}

      {/* top sheen */}
      <polygon points={poly(tFL,tFR,tBR,tBL)} fill="url(#rc3d-sheen)" />

      {/* human */}
      <HumanFigure cx={hTopSc.x} topY={hTopSc.y} h={humanH} />

      {/* human height callout */}
      <g stroke="#5A5B61" strokeWidth="1" fill="none">
        <line x1={hTopSc.x+18} y1={hTopSc.y} x2={hTopSc.x+18} y2={hBotSc.y} strokeDasharray="3,2" />
        <line x1={hTopSc.x+14} y1={hTopSc.y} x2={hTopSc.x+22} y2={hTopSc.y} />
        <line x1={hTopSc.x+14} y1={hBotSc.y} x2={hTopSc.x+22} y2={hBotSc.y} />
      </g>
      <text x={hTopSc.x+25} y={(hTopSc.y+hBotSc.y)/2}
        fill="#8A8B91" fontSize="11" fontFamily="'DM Sans',sans-serif" dominantBaseline="middle">
        170 cm
      </text>

      {/* table height callout */}
      <g stroke="#5A5B61" strokeWidth="1" fill="none">
        <line x1={tFLsc.x-16} y1={tFLsc.y} x2={tFLsc.x-16} y2={floorPt.y} strokeDasharray="3,2" />
        <line x1={tFLsc.x-20} y1={tFLsc.y} x2={tFLsc.x-12} y2={tFLsc.y} />
        <line x1={tFLsc.x-20} y1={floorPt.y} x2={tFLsc.x-12} y2={floorPt.y} />
      </g>
      <text x={tFLsc.x-22} y={(tFLsc.y+floorPt.y)/2}
        fill="#8A8B91" fontSize="11" fontFamily="'DM Sans',sans-serif"
        textAnchor="end" dominantBaseline="middle">
        {FH} cm
      </text>

      {/* table length callout */}
      {(() => {
        const labelY = Math.max(bFLsc.y, bFRsc.y) + 20;
        return (
          <g>
            <line x1={bFLsc.x} y1={labelY-6} x2={bFRsc.x} y2={labelY-6}
              stroke="#5A5B61" strokeWidth="1" />
            <text x={(bFLsc.x+bFRsc.x)/2} y={labelY+8}
              fill="#8A8B91" fontSize="11" fontFamily="'DM Sans',sans-serif" textAnchor="middle">
              {L} cm
            </text>
          </g>
        );
      })()}
    </svg>
  );
}

/* ── 3D Preview Modal ── */
function RenderModal({ cfg, onClose }) {
  const type   = TABLE_TYPES.find(t => t.id === cfg.type)   || TABLE_TYPES[0];
  const wood   = WOODS.find(w => w.id === cfg.wood)         || WOODS[0];
  const layout = LAYOUTS.find(l => l.id === cfg.layout)     || LAYOUTS[0];
  return (
    <div className="overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true"
        style={{ maxWidth: 760, width: '92vw' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: 14 }}>
          <div>
            <h3 style={{ margin: 0 }}>3D Size Preview</h3>
            <p className="msub" style={{ margin:'4px 0 0' }}>
              {type.name} · {wood.name} · {layout.name}
            </p>
          </div>
          <button className="btn ghost" type="button" onClick={onClose}
            style={{ padding:'6px 14px', flexShrink:0 }}>Close</button>
        </div>

        <div style={{ background:'#090A0C', borderRadius: 10, overflow:'hidden' }}>
          <TableRender3D cfg={cfg} />
        </div>

        <p style={{ fontSize:12, color:'var(--text-faint)', marginTop:10, textAlign:'center', marginBottom:0 }}>
          Isometric view · not to scale · human figure = 170 cm for size reference
        </p>
      </div>
    </div>
  );
}

Object.assign(window, { TableRender3D, RenderModal, HumanFigure, generateDesignId, FLOOR_HEIGHT });
