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
   2D Preview modal
   ============================================================ */
/* ── Side elevation SVG: table + base + human scale reference ── */
function SideElevation({ cfg }) {
  const W = 720, H = 420;
  const gY = 390;                          // ground Y
  const SC = (gY - 30) / 170;             // px per cm, human fills the height

  const TABLE_H = { dining: 75, coffee: 45, endtable: 55 };
  const th  = TABLE_H[cfg.type] || 75;    // table height in cm
  const tpx = th * SC;                    // table height in px
  const slabT = Math.round(4.5 * SC);     // slab thickness in px

  const isCookie = cfg.layout === 'cookie';
  const effW = (cfg.shapeLocked || isCookie) ? cfg.length : cfg.width;
  const tableW = Math.min(effW * SC * 0.5, 210);  // display width (side = depth)

  const tCX = W * 0.37;
  const tL  = tCX - tableW / 2;
  const tR  = tCX + tableW / 2;
  const topY     = gY - tpx;              // top surface Y
  const slabBotY = topY + slabT;          // underside of slab
  const legsH    = tpx - slabT;           // available leg height

  const hCX   = W * 0.73;
  const hH    = 170 * SC;                 // human height in px
  const hTopY = gY - hH;

  const wood = WOODS.find(w => w.id === cfg.wood) || WOODS[0];
  const rc = cfg.resinColor, op = cfg.resinOpacity;

  const legC = '#4A5060', legS = '#363840';
  const lp1  = tL + tableW * 0.22;
  const lp2  = tR - tableW * 0.22;

  const hs      = hH / 170;
  const headR   = 8  * hs;
  const bodyTop = hTopY + headR * 2.4;
  const bodyH   = 55 * hs;
  const bodyW   = 18 * hs;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}
      style={{ display:'block', maxWidth:'100%', borderRadius:10 }}>
      <rect x={0} y={0} width={W} height={H} fill="#090A0C" />

      {/* shadow */}
      <ellipse cx={tCX} cy={gY+4} rx={tableW*0.46} ry={5} fill="rgba(0,0,0,0.32)" />

      {/* ── base / legs ── */}
      {cfg.base === 'hairpin' && [lp1, lp2].map((cx, i) => (
        <g key={i} stroke={legC} strokeWidth={5} strokeLinecap="round" fill="none">
          <line x1={cx} y1={slabBotY} x2={cx-13} y2={gY} />
          <line x1={cx} y1={slabBotY} x2={cx+13} y2={gY} />
        </g>
      ))}
      {cfg.base === 'uframe' && [lp1, lp2].map((cx, i) => (
        <g key={i} stroke={legC} strokeWidth={5} strokeLinecap="round" fill="none">
          <line x1={cx-7} y1={slabBotY} x2={cx-7} y2={gY-2} />
          <line x1={cx+7} y1={slabBotY} x2={cx+7} y2={gY-2} />
          <line x1={cx-7} y1={gY-2}     x2={cx+7} y2={gY-2} />
        </g>
      ))}
      {cfg.base === 'pedestal' && (
        <g>
          <rect x={tCX-5} y={slabBotY} width={10} height={legsH-10}
            fill={legC} stroke={legS} strokeWidth={1} />
          <rect x={tCX-tableW*0.21} y={gY-10} width={tableW*0.42} height={10}
            fill={legC} stroke={legS} strokeWidth={1} rx={3} />
        </g>
      )}
      {cfg.base === 'box' && [lp1, lp2].map((cx, i) => (
        <rect key={i} x={cx-8} y={slabBotY} width={16} height={legsH}
          fill={legC} stroke={legS} strokeWidth={1} rx={2} />
      ))}

      {/* ── tabletop slab ── */}
      <rect x={tL} y={topY} width={tableW} height={slabT} fill={wood.mid} />
      <rect x={tL} y={topY} width={tableW*0.38} height={slabT} fill={wood.light} />
      <rect x={tR-tableW*0.28} y={topY} width={tableW*0.28} height={slabT} fill={wood.base} />
      {/* resin hint in slab edge */}
      {cfg.layout === 'river' && (
        <rect x={tL+tableW*0.34} y={topY} width={tableW*0.17} height={slabT}
          fill={rc} opacity={op*0.9} />
      )}
      {(cfg.layout === 'edgeframe') && (
        <>
          <rect x={tL} y={topY} width={tableW*0.12} height={slabT} fill={rc} opacity={op*0.9} />
          <rect x={tR-tableW*0.12} y={topY} width={tableW*0.12} height={slabT} fill={rc} opacity={op*0.9} />
        </>
      )}
      {(cfg.layout === 'cookie' || cfg.layout === 'frames' || cfg.layout === 'spiral' || cfg.layout === 'geospiral') && (
        <rect x={tL} y={topY} width={tableW} height={slabT} fill={rc} opacity={op*0.35} />
      )}
      {/* top sheen */}
      <rect x={tL} y={topY} width={tableW} height={2} fill="rgba(255,255,255,0.22)" />

      {/* ── ground line ── */}
      <line x1={30} y1={gY} x2={W-30} y2={gY} stroke="#2A2B2F" strokeWidth={1.5} />

      {/* ── human figure ── */}
      <g fill="rgba(245,246,247,0.12)" stroke="rgba(245,246,247,0.42)"
        strokeWidth={Math.max(1.2, 1.6*hs)} strokeLinecap="round">
        <circle cx={hCX} cy={hTopY+headR} r={headR} />
        <rect x={hCX-bodyW/2} y={bodyTop} width={bodyW} height={bodyH} rx={3*hs} />
        <line x1={hCX-bodyW/2}   y1={bodyTop+bodyH*0.12} x2={hCX-bodyW*1.1}  y2={bodyTop+bodyH*0.7} />
        <line x1={hCX+bodyW/2}   y1={bodyTop+bodyH*0.12} x2={hCX+bodyW*1.1}  y2={bodyTop+bodyH*0.7} />
        <line x1={hCX-bodyW*0.25} y1={bodyTop+bodyH}     x2={hCX-bodyW*0.35} y2={gY} />
        <line x1={hCX+bodyW*0.25} y1={bodyTop+bodyH}     x2={hCX+bodyW*0.35} y2={gY} />
      </g>

      {/* ── callout: table height ── */}
      <g stroke="#4A5060" strokeWidth={1} fill="none">
        <line x1={tL-18} y1={topY} x2={tL-18} y2={gY} strokeDasharray="3,3" />
        <line x1={tL-24} y1={topY} x2={tL-12} y2={topY} />
        <line x1={tL-24} y1={gY}   x2={tL-12} y2={gY} />
      </g>
      <text x={tL-30} y={(topY+gY)/2} fill="#8A8B91" fontSize={12}
        fontFamily="'DM Sans',sans-serif" textAnchor="end" dominantBaseline="middle">
        {th} cm
      </text>

      {/* ── callout: human height ── */}
      <g stroke="#4A5060" strokeWidth={1} fill="none">
        <line x1={hCX+26} y1={hTopY} x2={hCX+26} y2={gY} strokeDasharray="3,3" />
        <line x1={hCX+21} y1={hTopY} x2={hCX+31} y2={hTopY} />
        <line x1={hCX+21} y1={gY}    x2={hCX+31} y2={gY} />
      </g>
      <text x={hCX+36} y={(hTopY+gY)/2} fill="#8A8B91" fontSize={12}
        fontFamily="'DM Sans',sans-serif" dominantBaseline="middle">
        170 cm
      </text>

      {/* ── table type + height label ── */}
      <text x={tCX} y={topY-14} fill="#5C626B" fontSize={11}
        fontFamily="'DM Sans',sans-serif" textAnchor="middle" letterSpacing="1.5">
        {cfg.type === 'dining' ? 'DINING TABLE'
          : cfg.type === 'coffee' ? 'COFFEE TABLE'
          : 'SIDE TABLE'} · {th} CM
      </text>
    </svg>
  );
}

function PreviewModal({ cfg, onClose }) {
  const type = TABLE_TYPES.find(t => t.id === cfg.type) || TABLE_TYPES[0];
  const wood = WOODS.find(w => w.id === cfg.wood)       || WOODS[0];
  const th   = { dining: 75, coffee: 45, endtable: 55 }[cfg.type] || 75;
  return (
    <div className="overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true"
        style={{ maxWidth: 760, width: '92vw' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: 14 }}>
          <div>
            <h3 style={{ margin: 0 }}>Scale Preview</h3>
            <p className="msub" style={{ margin:'4px 0 0' }}>
              {type.name} · {wood.name} · {th} cm high
            </p>
          </div>
          <button className="btn ghost" type="button" onClick={onClose}
            style={{ padding:'6px 14px', flexShrink:0 }}>Close</button>
        </div>
        <div style={{ background:'#090A0C', borderRadius:10, overflow:'hidden' }}>
          <SideElevation cfg={cfg} />
        </div>
        <p style={{ fontSize:12, color:'var(--text-faint)', marginTop:10, textAlign:'center', marginBottom:0 }}>
          Side view · human figure = 170 cm for scale reference
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
    const mailto = `mailto:tektonindia.biz@gmail.com`
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
