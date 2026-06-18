/* ============================================================
   app.jsx — main application
   ============================================================ */
const { useState, useEffect, useRef } = React;

function generateDesignId() {
  const d = new Date();
  const date = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
  const rand = Math.random().toString(36).substring(2,6).toUpperCase();
  return `TI-${date}-${rand}`;
}

const FONT_PAIRS = {
  editorial: { display: '"Bricolage Grotesque", serif', body: '"Hanken Grotesk", sans-serif' },
  grotesque: { display: '"Space Grotesk", sans-serif', body: '"Space Grotesk", sans-serif' },
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#2ECC71",
  "typeScale": 1,
  "fontPair": "editorial",
  "floorGrid": true
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  const [cfg, setCfg] = useState({
    type: "dining",
    shape: "rect", shapeLocked: false,
    length: 220, width: 100, thickness: 4.5,
    layout: "river", wood: "teak",
    gap: 11, bandResin: 0.34, frameW: 12, trunkSize: "md",
    riverFlow: "organic", riverCount: 1, riverAngle: 0, riverOffset: 0,
    plankSpread: 0.30, frames: 5,
    resinColor: "#1763B8", resinOpacity: 0.85, metallic: false,
    edge: "live", base: "hairpin",
  });

  const [openId, setOpenId] = useState("type");
  const [touched, setTouched] = useState(new Set(["type"]));
  const [modal, setModal] = useState(false);
  const [renderModal, setRenderModal] = useState(false);
  const [designId, setDesignId] = useState('');
  const reviewRef = useRef(null);

  const openQuoteModal = () => { setDesignId(generateDesignId()); setModal(true); };

  /* ---- apply tweaks to :root ---- */
  useEffect(() => {
    const r = document.documentElement.style;
    r.setProperty("--accent", t.accent);
    r.setProperty("--type-scale", t.typeScale);
    document.body.style.fontSize = `${16 * t.typeScale}px`;
    const fp = FONT_PAIRS[t.fontPair] || FONT_PAIRS.editorial;
    r.setProperty("--font-display", fp.display);
    r.setProperty("--font-body", fp.body);
  }, [t.accent, t.typeScale, t.fontPair]);

  /* ---- actions ---- */
  const markTouched = (id) => setTouched((s) => new Set(s).add(id));
  const openSection = (id) => { setOpenId(id); if (id) markTouched(id); };

  const actions = {
    set: (partial) => { setCfg((c) => ({ ...c, ...partial })); markTouched(openId); },
    setType: (id) => {
      const ty = TABLE_TYPES.find((x) => x.id === id);
      setCfg((c) => (c.layout === "cookie"
        ? { ...c, type: id, thickness: ty.dims.thickness }   // keep cookie diameter
        : { ...c, type: id, ...ty.dims }));
      markTouched("type");
    },
    setShape: (id) => {
      const sh = SHAPES.find((x) => x.id === id);
      if (id === "trunk") {
        const cm = (TRUNK_SIZES.find((s) => s.id === "md")).cm;
        setCfg((c) => ({ ...c, shape: "trunk", shapeLocked: true, layout: "cookie", trunkSize: c.trunkSize || "md", length: cm, width: cm, edge: "live" }));
      } else {
        setCfg((c) => {
          if (c.layout === "cookie") {
            // leaving the cookie form — restore a standard pattern + rectangular dims
            const ty = TABLE_TYPES.find((x) => x.id === c.type);
            return { ...c, shape: id, shapeLocked: sh.locked, layout: "river", ...ty.dims };
          }
          return { ...c, shape: id, shapeLocked: sh.locked };
        });
      }
      markTouched("shape");
    },
    setPattern: (id) => {
      if (id === "cookie") {
        const cm = (TRUNK_SIZES.find((s) => s.id === "md")).cm;
        setCfg((c) => ({ ...c, layout: "cookie", shape: "trunk", shapeLocked: true, trunkSize: c.trunkSize || "md", length: cm, width: cm, edge: "live" }));
      } else {
        setCfg((c) => {
          if (c.layout === "cookie") {
            // leaving cookie — restore sensible rectangular defaults from type
            const ty = TABLE_TYPES.find((x) => x.id === c.type);
            return { ...c, layout: id, shape: "rect", shapeLocked: false, ...ty.dims };
          }
          return { ...c, layout: id };
        });
      }
      markTouched("wood");
    },
    setTrunk: (id) => {
      const cm = (TRUNK_SIZES.find((s) => s.id === id)).cm;
      setCfg((c) => ({ ...c, trunkSize: id, length: cm, width: cm }));
      markTouched("size");
    },
  };

  const price = computePrice(cfg);
  const isCookie = cfg.layout === "cookie";
  const effW = (cfg.shapeLocked || isCookie) ? cfg.length : cfg.width;


  const wood = WOODS.find((w) => w.id === cfg.wood);
  const type = TABLE_TYPES.find((x) => x.id === cfg.type);
  const shape = SHAPES.find((s) => s.id === cfg.shape);
  const layout = LAYOUTS.find((l) => l.id === cfg.layout);
  const rColor = RESIN_COLORS.find((c) => c.hex.toLowerCase() === cfg.resinColor.toLowerCase());
  const edge = EDGES.find((e) => e.id === cfg.edge);
  const base = BASES.find((b) => b.id === cfg.base);
  const trunk = TRUNK_SIZES.find((s) => s.id === cfg.trunkSize) || TRUNK_SIZES[1];

  const specs = [
    ["Type", type.name],
    ["Shape", isCookie ? "Tree Trunk / Cookie" : shape.name],
    ["Dimensions", isCookie ? `⌀ ${cfg.length} cm (${trunk.name}) · 4.5 cm thick` : `${cfg.length} × ${effW} × 4.5 cm`],
    ["Surface area", `${price.areaM2.toFixed(2)} m²`],
    ["Pattern", layout.label],
    ["Wood", wood.name],
    ["Resin", `${rColor ? rColor.name + " · " + rColor.coll : "Custom " + cfg.resinColor.toUpperCase()} · ${Math.round(cfg.resinOpacity * 100)}%${cfg.metallic ? " · Metallic" : ""}`],
    ["Edge", isCookie ? "Natural live edge" : edge.name],
    ["Base", base.name],
  ];

  const scrollToReview = () => reviewRef.current && reviewRef.current.scrollIntoView ? reviewRef.current.parentElement.scrollTo({ top: reviewRef.current.offsetTop - 12, behavior: "smooth" }) : null;

  return (
    <div className="app" data-grid={t.floorGrid ? "on" : "off"}>
      {/* ---------- top bar ---------- */}
      <header className="topbar">
        <div className="logo">
          <span className="badge"><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 8h18M6 8v10M18 8v10M3 18h18" stroke="var(--text-dim)" strokeWidth="1.6" strokeLinecap="round" /><circle cx="12" cy="13" r="3" fill="var(--accent)" /></svg></span>
          <div>
            <div className="eyebrow">Handcrafted by</div>
            <div className="mark">TEKT<span className="dot" />N</div>
            <div className="sub">★ INDIA ★</div>
          </div>
        </div>
        <div className="right">
          <span className="tagline">Bespoke resin &amp; wood, made to order</span>
          <button className="btn ghost" type="button" onClick={() => setModal(true)}>Request a quote</button>
        </div>
      </header>

      {/* ---------- split ---------- */}
      <div className="split">
        {/* live preview */}
        <div className="stage">
          <div className="stage-label"><span className="live" /> Live preview · top view</div>
          <div className="stage-inner"><TablePreview cfg={cfg} accent={t.accent} /></div>
        </div>

        {/* options */}
        <aside className="panel">
          <div className="panel-head">
            <h2>Design your table</h2>
            <p>Every Tekton piece is made to order. Shape it below — the preview &amp; price update live.</p>
            <Progress steps={STEPS} openId={openId} doneSet={touched} onJump={openSection} />
          </div>

          <div className="panel-scroll scroll">
            <Configurator cfg={cfg} actions={actions} openId={openId} setOpenId={openSection} />

            {/* review card */}
            <div className="review" ref={reviewRef} style={{ marginTop: 24 }}>
              <h3>Review your design</h3>
              <div className="rsub">Your bespoke specification</div>
              {specs.map(([k, v]) => (
                <div className="spec-row" key={k}><span className="k">{k}</span><span className="vv">{v}</span></div>
              ))}
              <div className="hint" style={{ marginTop:20, justifyContent:"center" }}>
                Pricing confirmed by our workshop within 2 working days.
              </div>
            </div>
          </div>

          {/* sticky summary */}
          <div className="summary" style={{ padding:'14px 20px' }}>
            <div style={{ display:'flex', gap:10, width:'100%' }}>
              <button className="btn ghost" type="button" onClick={() => setRenderModal(true)}
                style={{ flex:1, justifyContent:'center' }}>Preview</button>
              <button className="btn primary" type="button" onClick={openQuoteModal}
                style={{ flex:1, justifyContent:'center' }}>Get Quote</button>
            </div>
          </div>
        </aside>
      </div>

      {modal && <QuoteModal cfg={cfg} specs={specs} price={price} designId={designId} onClose={() => setModal(false)} />}
      {renderModal && <PreviewModal cfg={cfg} accent={t.accent} onClose={() => setRenderModal(false)} />}

      {/* ---------- Tweaks ---------- */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="Brand" />
        <TweakColor label="Accent" value={t.accent} options={["#2ECC71", "#0E7C86", "#C8791B", "#7A5AE0"]} onChange={(v) => setTweak("accent", v)} />
        <TweakSection label="Typography" />
        <TweakRadio label="Type pairing" value={t.fontPair} options={["editorial", "grotesque"]} onChange={(v) => setTweak("fontPair", v)} />
        <TweakSlider label="Type scale" value={t.typeScale} min={0.9} max={1.15} step={0.05} onChange={(v) => setTweak("typeScale", v)} />
        <TweakSection label="Preview" />
        <TweakToggle label="Floor grid" value={t.floorGrid} onChange={(v) => setTweak("floorGrid", v)} />
      </TweaksPanel>
    </div>
  );
}

/* ============================================================
   Blueprint preview — architectural line-art elevation
   Standing figure (left) · Table (centre) · Sitting figure (right)
   ============================================================ */
function BlueprintPreview({ cfg }) {
  const SVG_H = 450;
  const gY    = 408;                        // ground line Y
  const SC    = (gY - 56) / 175;           // ~2.01 px/cm — 175 cm figure fills height

  const TABLE_H = { dining: 75, coffee: 45, endtable: 55 };
  const th    = TABLE_H[cfg.type] || 75;
  const thPx  = th * SC;
  const slabT = 4.5 * SC;
  const isCookie = cfg.layout === 'cookie';
  const twCm  = (cfg.shapeLocked || isCookie) ? cfg.length : cfg.width;
  const twPx  = Math.min(twCm * SC, 252);   // visual width, capped

  /* ── X layout: centre table, figures on each side ── */
  const SVG_W   = 720;
  const tCX     = SVG_W / 2;
  const tL      = tCX - twPx / 2;
  const tR      = tCX + twPx / 2;
  const tTopY   = gY - thPx;
  const standCX = tL - 58;
  const sitCX   = tR + 62;

  /* ── palette ── */
  const FG = 'rgba(228,232,242,0.88)';   // figures + table
  const DM = 'rgba(120,124,138,0.90)';   // dimension lines & labels

  const s = SC;   // shorthand

  /* ─────────────────────────────────────────────
     STANDING FIGURE  (front-facing, 175 cm)
  ───────────────────────────────────────────── */
  const stTopY = gY - 175 * s;
  const hR     = 11  * s;
  const hCY    = stTopY + hR;
  const shW    = 33  * s;   // shoulder width half = shW/2
  const trW    = 21  * s;   // waist width half    = trW/2
  const trH    = 50  * s;
  const trY    = hCY + hR + 4 * s;
  const hpW    = 27  * s;
  const hpH    = 13  * s;
  const hpY    = trY + trH;
  const lgW    = 10  * s;
  const lgH    = gY - (hpY + hpH) - 5 * s;
  const lgGap  = 5   * s;
  const ftW    = 14  * s;
  const ftH    = 5   * s;

  const standFig = (
    <g stroke={FG} strokeWidth={1.5} fill="none"
       strokeLinejoin="round" strokeLinecap="round">
      {/* head */}
      <circle cx={standCX} cy={hCY} r={hR} />
      {/* torso */}
      <path d={`M${standCX-shW/2},${trY} L${standCX-trW/2},${trY+trH} L${standCX+trW/2},${trY+trH} L${standCX+shW/2},${trY} Z`} />
      {/* arms */}
      <line x1={standCX-shW/2}   y1={trY+7*s}  x2={standCX-shW/2-9*s}  y2={trY+trH*0.82} strokeWidth={6*s} />
      <line x1={standCX+shW/2}   y1={trY+7*s}  x2={standCX+shW/2+9*s}  y2={trY+trH*0.82} strokeWidth={6*s} />
      {/* hips */}
      <path d={`M${standCX-trW/2},${hpY} L${standCX-hpW/2},${hpY+hpH} L${standCX+hpW/2},${hpY+hpH} L${standCX+trW/2},${hpY} Z`} />
      {/* legs */}
      <rect x={standCX-lgGap/2-lgW} y={hpY+hpH} width={lgW} height={lgH} rx={lgW/2} />
      <rect x={standCX+lgGap/2}     y={hpY+hpH} width={lgW} height={lgH} rx={lgW/2} />
      {/* feet */}
      <rect x={standCX-lgGap/2-lgW-3} y={gY-ftH} width={ftW} height={ftH} rx={2} />
      <rect x={standCX+lgGap/2-2}     y={gY-ftH} width={ftW} height={ftH} rx={2} />
    </g>
  );

  /* ─────────────────────────────────────────────
     SITTING FIGURE  (profile facing left, ~44 cm seat height)
  ───────────────────────────────────────────── */
  const seatY   = gY - 44  * s;
  const siHR    = 10  * s;
  const siShY   = seatY - 46 * s;
  const siHCY   = siShY - siHR - 3 * s;
  const siShW   = 28  * s;
  const siTrW   = 19  * s;
  const thighL  = (sitCX - siTrW/2) - tR - 12;  // thigh reaches toward table
  const thighW  = 10  * s;
  const calfH   = 40  * s;
  const calfW   = 9   * s;
  const kneeX   = sitCX - siTrW/2 - Math.max(thighL, 30*s);
  const armExtY = siShY + 13 * s;
  const cupX    = kneeX - 15 * s;
  const cupW    = 8  * s;
  const cupH    = 11 * s;

  const sitFig = (
    <g stroke={FG} strokeWidth={1.5} fill="none"
       strokeLinejoin="round" strokeLinecap="round">
      {/* head — offset left for profile */}
      <circle cx={sitCX - 5*s} cy={siHCY} r={siHR} />
      {/* torso */}
      <path d={`M${sitCX-siShW/2},${siShY} L${sitCX-siTrW/2},${seatY} L${sitCX+siTrW/2},${seatY} L${sitCX+siShW/2},${siShY} Z`} />
      {/* thighs — horizontal toward table */}
      <rect x={kneeX} y={seatY-thighW*0.9} width={sitCX-siTrW/2-kneeX} height={thighW} rx={thighW/2} />
      {/* back thigh slightly offset */}
      <rect x={kneeX+7*s} y={seatY-thighW*0.9+7*s} width={sitCX+siTrW/4-kneeX-7*s} height={thighW*0.9} rx={thighW/2} />
      {/* calves — vertical */}
      <rect x={kneeX-calfW/2}       y={seatY} width={calfW} height={calfH}       rx={calfW/2} />
      <rect x={kneeX+7*s-calfW/2}   y={seatY} width={calfW} height={calfH*0.88}  rx={calfW/2} />
      {/* left arm extended, holding coffee */}
      <line x1={sitCX-siShW/2} y1={armExtY} x2={cupX+cupW} y2={armExtY} strokeWidth={5*s} />
      {/* coffee cup body */}
      <rect x={cupX} y={armExtY-cupH*0.55} width={cupW} height={cupH} rx={2} />
      {/* cup handle */}
      <path d={`M${cupX+cupW},${armExtY-cupH*0.25} Q${cupX+cupW+6*s},${armExtY} ${cupX+cupW},${armExtY+cupH*0.25}`} />
      {/* right arm resting down */}
      <line x1={sitCX+siShW/2} y1={siShY+10*s} x2={sitCX+siShW/2+5*s} y2={seatY} strokeWidth={5*s} />
    </g>
  );

  /* ─────────────────────────────────────────────
     TABLE  (base + slab)
  ───────────────────────────────────────────── */
  const legPad = 10 * s;
  const lp1 = tL + legPad;
  const lp2 = tR - legPad;

  const tableSVG = (
    <g stroke={FG} strokeWidth={1.5} fill="none" strokeLinecap="round">
      {cfg.base === 'hairpin' && [lp1, lp2].map((lx, i) => (
        <g key={i}>
          <line x1={lx} y1={tTopY+slabT} x2={lx-11} y2={gY} />
          <line x1={lx} y1={tTopY+slabT} x2={lx+11} y2={gY} />
        </g>
      ))}
      {cfg.base === 'uframe' && [lp1, lp2].map((lx, i) => (
        <g key={i} strokeWidth={2}>
          <line x1={lx-7} y1={tTopY+slabT} x2={lx-7} y2={gY-1} />
          <line x1={lx+7} y1={tTopY+slabT} x2={lx+7} y2={gY-1} />
          <line x1={lx-7} y1={gY-1}        x2={lx+7} y2={gY-1} />
        </g>
      ))}
      {cfg.base === 'pedestal' && (
        <g>
          <rect x={tCX-5} y={tTopY+slabT} width={10} height={thPx-slabT-9} />
          <rect x={tCX-twPx*0.22} y={gY-9} width={twPx*0.44} height={9} rx={2} />
        </g>
      )}
      {cfg.base === 'box' && [lp1, lp2].map((lx, i) => (
        <rect key={i} x={lx-7} y={tTopY+slabT} width={14} height={thPx-slabT} />
      ))}
      {/* slab outline */}
      <rect x={tL} y={tTopY} width={twPx} height={slabT} />
    </g>
  );

  /* ─────────────────────────────────────────────
     DIMENSION LINES  (architectural arrows)
  ───────────────────────────────────────────── */
  const toLabel = (cm) => `${cm} cm  /  ${Math.round(cm / 2.54)}"`;
  const dimX  = tL - 22;
  const dimY  = gY + 26;
  const midHY = (tTopY + gY) / 2;

  const dims = (
    <g stroke={DM} strokeWidth={1} fill="none">
      {/* ── height dim (left of table) ── */}
      <line x1={dimX} y1={tTopY} x2={dimX} y2={gY} strokeDasharray="3,3" />
      <line x1={dimX-5} y1={tTopY} x2={dimX+5} y2={tTopY} />
      <line x1={dimX-5} y1={gY}    x2={dimX+5} y2={gY} />
      <polygon points={`${dimX},${tTopY+2} ${dimX-3},${tTopY+10} ${dimX+3},${tTopY+10}`} fill={DM} stroke="none" />
      <polygon points={`${dimX},${gY-2}    ${dimX-3},${gY-10}    ${dimX+3},${gY-10}`}    fill={DM} stroke="none" />
      {/* height label — rotated */}
      <text x={dimX-10} y={midHY} fill={DM} fontSize={10}
        fontFamily="'DM Sans',sans-serif" textAnchor="middle" dominantBaseline="middle"
        transform={`rotate(-90,${dimX-10},${midHY})`}>{toLabel(th)}</text>

      {/* ── width dim (below table) ── */}
      <line x1={tL} y1={dimY} x2={tR} y2={dimY} strokeDasharray="3,3" />
      <line x1={tL} y1={dimY-5} x2={tL} y2={dimY+5} />
      <line x1={tR} y1={dimY-5} x2={tR} y2={dimY+5} />
      <polygon points={`${tL+2},${dimY}  ${tL+10},${dimY-3}  ${tL+10},${dimY+3}`} fill={DM} stroke="none" />
      <polygon points={`${tR-2},${dimY}  ${tR-10},${dimY-3}  ${tR-10},${dimY+3}`} fill={DM} stroke="none" />
      <text x={tCX} y={dimY+14} fill={DM} fontSize={10}
        fontFamily="'DM Sans',sans-serif" textAnchor="middle">{toLabel(twCm)}</text>

      {/* figure labels */}
      <text x={standCX} y={gY+16} fill={DM} fontSize={9}
        fontFamily="'DM Sans',sans-serif" textAnchor="middle" letterSpacing="0.4">5′9″ · 175 cm</text>
      <text x={sitCX}   y={gY+16} fill={DM} fontSize={9}
        fontFamily="'DM Sans',sans-serif" textAnchor="middle" letterSpacing="0.4">Seated</text>

      {/* table type label */}
      <text x={tCX} y={tTopY - 14} fill={DM} fontSize={10}
        fontFamily="'DM Sans',sans-serif" textAnchor="middle" letterSpacing="1.2">
        {cfg.type === 'dining' ? 'DINING TABLE' : cfg.type === 'coffee' ? 'COFFEE TABLE' : 'SIDE TABLE'}
      </text>
    </g>
  );

  return (
    <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      style={{ display:'block', width:'100%', borderRadius:10 }}>
      <rect width={SVG_W} height={SVG_H} fill="#090A0C" />
      {/* ground */}
      <line x1={16} y1={gY} x2={SVG_W-16} y2={gY} stroke={DM} strokeWidth={1} />
      {tableSVG}
      {standFig}
      {sitFig}
      {dims}
    </svg>
  );
}

function PreviewModal({ cfg, onClose }) {
  const type = TABLE_TYPES.find(t => t.id === cfg.type) || TABLE_TYPES[0];
  const wood = WOODS.find(w => w.id === cfg.wood)       || WOODS[0];
  return (
    <div className="overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true"
        style={{ maxWidth: 760, width: '92vw' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
          <div>
            <h3 style={{ margin:0 }}>Scale Preview</h3>
            <p className="msub" style={{ margin:'4px 0 0' }}>{type.name} · {wood.name}</p>
          </div>
          <button className="btn ghost" type="button" onClick={onClose}
            style={{ padding:'6px 14px', flexShrink:0 }}>Close</button>
        </div>
        <div style={{ background:'#090A0C', borderRadius:10, overflow:'hidden' }}>
          <BlueprintPreview cfg={cfg} />
        </div>
        <p style={{ fontSize:12, color:'var(--text-faint)', marginTop:10, textAlign:'center', marginBottom:0 }}>
          Architectural elevation · standing 175 cm · sitting with coffee
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   Quote modal — collects contact info, sends price to merchant only
   ============================================================ */
function QuoteModal({ cfg, specs, price, designId, onClose }) {
  const [sent, setSent]           = useState(false);
  const [form, setForm]           = useState({ name:'', mobile:'', email:'', notes:'' });
  const [err, setErr] = useState({});

  const upd = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const iErr = (k) => err[k] ? { borderColor:'var(--dot)' } : {};

  const submit = () => {
    const e = {};
    if (!form.name.trim()) e.name = 1;
    if (form.mobile.replace(/\D/g,'').length < 10) e.mobile = 1;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = 1;
    setErr(e);
    if (Object.keys(e).length) return;

    const lines = [
      `Design Reference: ${designId}`,
      ``,
      `Name: ${form.name}`,
      `Mobile: ${form.mobile}`,
      `Email: ${form.email}`,
      ``,
      ...specs.map(([k, v]) => `${k}: ${v}`),
      ...(form.notes ? [``, `Notes: ${form.notes}`] : []),
    ];
    const mailto = `mailto:jagdeep.singh.virdi@gmail.com`
      + `?subject=${encodeURIComponent('Quote ' + designId + ' — Tekton India')}`
      + `&body=${encodeURIComponent(lines.join('\n'))}`;
    window.open(mailto, '_blank');
    setSent(true);
  };

  return (
    <div className="overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true">
        {!sent ? (
          <>
            <h3>Request a Quote</h3>
            <p className="msub">We'll confirm pricing and timeline within 2 working days.</p>

            {/* design ID badge */}
            <div style={{ background:'var(--surface-1)', border:'1px solid var(--line)', borderRadius:8,
              padding:'9px 14px', marginBottom:18, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ color:'var(--text-faint)', fontSize:11, letterSpacing:'0.5px' }}>DESIGN REF</span>
              <span style={{ fontFamily:'monospace', color:'var(--accent)', fontSize:13, letterSpacing:'1px' }}>
                {designId}
              </span>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label className="flbl">Full name</label>
                <input className="inp" value={form.name} placeholder="Aarav Mehta"
                  style={iErr('name')} onChange={upd('name')} />
              </div>
              <div>
                <label className="flbl">Mobile number</label>
                <input className="inp" value={form.mobile} placeholder="+91 98765 43210"
                  type="tel" style={iErr('mobile')} onChange={upd('mobile')} />
                {err.mobile && <span style={{ color:'var(--dot)', fontSize:11, marginTop:4, display:'block' }}>
                  Please enter a valid 10-digit mobile number
                </span>}
              </div>
              <div>
                <label className="flbl">Email</label>
                <input className="inp" value={form.email} placeholder="you@example.com"
                  style={iErr('email')} onChange={upd('email')} />
              </div>
              <div>
                <label className="flbl">Notes <span style={{ color:'var(--text-faint)' }}>(optional)</span></label>
                <textarea className="inp" value={form.notes}
                  placeholder="Delivery city, deadline, finish preferences…" onChange={upd('notes')} />
              </div>
            </div>

            {/* design summary — no price */}
            <div className="breakdown" style={{ marginTop:18 }}>
              <div className="bd-row" style={{ color:'var(--text-dim)' }}>
                <span>{specs[0] && specs[0][1]}</span>
                <span className="mono">{specs[2] && specs[2][1].split(' · ')[0]}</span>
              </div>
              <div className="bd-row" style={{ color:'var(--text-dim)', paddingTop:6 }}>
                <span>{specs[3] && specs[3][1]}</span>
                <span className="mono">{specs[5] && specs[5][1]}</span>
              </div>
            </div>

            <div style={{ display:'flex', gap:10, marginTop:16 }}>
              <button className="btn ghost" type="button" onClick={onClose}
                style={{ flex:'0 0 auto' }}>Cancel</button>
              <button className="btn primary block" type="button" onClick={submit}>
                Send request →
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign:'center', padding:'10px 0' }}>
            <div className="done-tick">✓</div>
            <h3>Request Received!</h3>
            <p className="msub" style={{ maxWidth:320, margin:'8px auto 16px' }}>
              Thank you, <b>{form.name.split(' ')[0]}</b>. Our team will reach out at{' '}
              <b style={{ color:'var(--text)' }}>{form.mobile}</b> within 2 working days.
            </p>
            <div style={{ background:'var(--surface-1)', border:'1px solid var(--line)', borderRadius:8,
              padding:'12px 24px', display:'inline-block', marginBottom:20 }}>
              <div style={{ color:'var(--text-faint)', fontSize:11, marginBottom:6, letterSpacing:'0.5px' }}>
                YOUR DESIGN REFERENCE
              </div>
              <div style={{ fontFamily:'monospace', color:'var(--accent)', fontSize:18, letterSpacing:'2px' }}>
                {designId}
              </div>
              <div style={{ color:'var(--text-dim)', fontSize:11, marginTop:6 }}>
                Keep this for follow-up enquiries
              </div>
            </div>
            <button className="btn primary block" type="button" onClick={onClose}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
