/* ============================================================
   sections.jsx — right-panel configurator UI
   exports window.Configurator, window.Progress
   ============================================================ */

/* ---------------- icons (currentColor) ---------------- */
const ShapeIcon = ({ id }) => {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 2.4 };
  return (
    <svg viewBox="0 0 56 40">
      {id === "round" && <circle cx="28" cy="20" r="15" {...p} />}
      {id === "oval" && <ellipse cx="28" cy="20" rx="22" ry="13" {...p} />}
      {id === "square" && <rect x="13" y="5" width="30" height="30" rx="2" {...p} />}
      {id === "rect" && <rect x="6" y="9" width="44" height="22" rx="3" {...p} />}
      {id === "trunk" && <path d="M28 6 C39 6 50 12 49 21 C48 30 38 35 27 34 C17 33 7 28 8 19 C9 11 18 6 28 6 Z" {...p} />}
    </svg>
  );
};

/* pattern icons — w=wood, resin = accent fill/stroke */
const PatternIcon = ({ id }) => {
  const fr = "currentColor";
  return (
    <svg viewBox="0 0 56 40">
      {id === "river" && (
        <g><rect x="6" y="8" width="44" height="24" rx="2" fill="none" stroke="currentColor" strokeWidth="2" opacity=".5" />
          <path d="M6 20 q11 -7 22 0 t22 0" fill="none" stroke={fr} strokeWidth="5" /></g>
      )}
      {id === "centerplank" && (
        <g><rect x="6" y="8" width="44" height="24" rx="2" fill="none" stroke="currentColor" strokeWidth="2" opacity=".5" />
          <rect x="6" y="13" width="44" height="3.4" fill={fr} /><rect x="6" y="23.6" width="44" height="3.4" fill={fr} /></g>
      )}
      {id === "multiband" && (
        <g><rect x="6" y="8" width="44" height="24" rx="2" fill="none" stroke="currentColor" strokeWidth="2" opacity=".5" />
          <rect x="6" y="8" width="6" height="24" fill={fr} /><rect x="25" y="8" width="6" height="24" fill={fr} /><rect x="44" y="8" width="6" height="24" fill={fr} /></g>
      )}
      {id === "frames" && (
        <g fill="none" stroke={fr} strokeWidth="2"><rect x="6" y="8" width="44" height="24" /><rect x="13" y="13" width="30" height="14" /><rect x="20" y="17" width="16" height="6" /></g>
      )}
      {id === "geospiral" && (
        <g><rect x="6" y="8" width="44" height="24" rx="2" fill="none" stroke="currentColor" strokeWidth="2" opacity=".5" />
          <path d="M44 12 L12 12 L12 28 L38 28 L38 17 L22 17 L22 23" fill="none" stroke={fr} strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" /></g>
      )}
      {id === "cookie" && (
        <g><path d="M28 6 C39 6 49 11 48 20 C47 29 38 34 27 33 C17 32 8 27 9 18 C10 10 18 6 28 6 Z" fill="none" stroke="currentColor" strokeWidth="2" opacity=".6" />
          <path d="M28 19 l6 -6 M28 19 l-5 5 l-4 -2 M28 19 l7 4" fill="none" stroke={fr} strokeWidth="2.2" strokeLinecap="round" /></g>
      )}
      {id === "spiral" && (
        <g><rect x="6" y="8" width="44" height="24" rx="2" fill="none" stroke="currentColor" strokeWidth="2" opacity=".5" />
          <path d="M28 20 m0 0 a3 3 0 1 1 5 -1 a7 7 0 1 1 -11 1 a11 11 0 1 1 18 -2" fill="none" stroke={fr} strokeWidth="2.4" strokeLinecap="round" /></g>
      )}
      {id === "edgeframe" && (
        <g><rect x="6" y="8" width="44" height="24" rx="2" fill={fr} /><rect x="13" y="13" width="30" height="14" fill="var(--surface-2)" stroke="currentColor" strokeWidth="1.5" opacity=".9" /></g>
      )}
    </svg>
  );
};

const EdgeIcon = ({ id }) => {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 2.2 };
  return (
    <svg viewBox="0 0 56 40">
      {id === "straight" && <rect x="8" y="11" width="40" height="18" rx="1" {...p} />}
      {id === "live" && <path d="M9 13 q5 -4 9 -1 t9 0 t9 -1 q4 2 4 5 v6 q0 4 -5 5 t-9 -1 t-9 1 t-8 -1 q-3 -2 -3 -5 v-6 q0 -3 3 -6 Z" {...p} />}
      {id === "bevel" && <g {...p}><rect x="8" y="11" width="40" height="18" rx="1" /><rect x="13" y="15" width="30" height="10" rx="1" opacity=".6" /></g>}
    </svg>
  );
};

/* ---------------- controls ---------------- */
function Slider({ label, value, min, max, step, unit, disabled, note, onChange }) {
  return (
    <div className="field">
      <div className="field-top">
        <label>{label}</label>
        <span className={"val mono" + (disabled ? " locked" : "")}>{disabled ? note : `${value}${unit || ""}`}</span>
      </div>
      <input className="rng" type="range" min={min} max={max} step={step} value={value} disabled={disabled}
        onChange={(e) => onChange(parseFloat(e.target.value))} />
    </div>
  );
}
function Toggle({ name, blurb, on, onChange }) {
  return (
    <button className="toggle" onClick={() => onChange(!on)} type="button">
      <span className="tg-txt"><div className="tname">{name}</div><div className="tblurb">{blurb}</div></span>
      <span className={"sw" + (on ? " on" : "")} />
    </button>
  );
}
function Segmented({ label, value, options, onChange }) {
  return (
    <div className="field">
      {label && <div className="field-top"><label>{label}</label></div>}
      <div className="seg-ctrl">
        {options.map((o) => (
          <button key={o.v} type="button" className={"seg-btn" + (value === o.v ? " on" : "")} onClick={() => onChange(o.v)}>{o.t}</button>
        ))}
      </div>
    </div>
  );
}

/* river freedom controls — flow / count / angle / offset / width */
function RiverControls({ cfg, actions }) {
  return (
    <div className="rivctl">
      <Segmented label="Flow" value={cfg.riverFlow} options={[{ v: "straight", t: "Straight" }, { v: "organic", t: "Organic" }]} onChange={(v) => actions.set({ riverFlow: v })} />
      <Segmented label="Number of rivers" value={cfg.riverCount} options={[{ v: 1, t: "1" }, { v: 2, t: "2" }, { v: 3, t: "3" }]} onChange={(v) => actions.set({ riverCount: v })} />
      <Slider label="Channel width" value={cfg.gap} min={2} max={28} step={1} unit=" cm" onChange={(v) => actions.set({ gap: v })} />
      <Slider label="Angle / tilt" value={cfg.riverAngle} min={-45} max={45} step={1} unit="°" onChange={(v) => actions.set({ riverAngle: v })} />
      <Slider label="Offset across slab" value={Math.round(cfg.riverOffset * 100)} min={-40} max={40} step={2} unit="%" onChange={(v) => actions.set({ riverOffset: v / 100 })} />
    </div>
  );
}

/* ---------------- collapsible section ---------------- */
function Section({ n, title, value, open, onToggle, children }) {
  return (
    <div className={"section" + (open ? " open" : "")}>
      <button className="sec-head" onClick={onToggle} type="button">
        <span className="sec-num">{n}</span>
        <span className="sec-titles">
          <div className="t">{title}</div>
          <div className="v" dangerouslySetInnerHTML={{ __html: value }} />
        </span>
        <svg className="chev" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      <div className="sec-body"><div><div className="sec-inner">{children}</div></div></div>
    </div>
  );
}

function Progress({ steps, openId, doneSet, onJump }) {
  return (
    <div className="progress">
      {steps.map((s) => (
        <div key={s.id} title={s.label}
          className={"seg" + (doneSet.has(s.id) ? " done" : "") + (s.id === openId ? " active" : "")}
          onClick={() => onJump(s.id)} />
      ))}
    </div>
  );
}

/* ============================================================
   Configurator
   ============================================================ */
function Configurator({ cfg, actions, openId, setOpenId }) {
  const type = TABLE_TYPES.find((t) => t.id === cfg.type);
  const shape = SHAPES.find((s) => s.id === cfg.shape);
  const wood = WOODS.find((w) => w.id === cfg.wood);
  const layout = LAYOUTS.find((l) => l.id === cfg.layout);
  const rColor = RESIN_COLORS.find((c) => c.hex.toLowerCase() === cfg.resinColor.toLowerCase());
  const edge = EDGES.find((e) => e.id === cfg.edge);
  const base = BASES.find((b) => b.id === cfg.base);
  const trunk = TRUNK_SIZES.find((s) => s.id === cfg.trunkSize) || TRUNK_SIZES[1];
  const isCookie = cfg.layout === "cookie";
  const effW = (cfg.shapeLocked || isCookie) ? cfg.length : cfg.width;
  const toggle = (id) => setOpenId(openId === id ? null : id);

  return (
    <>
      <Section n="1" title="Table type" value={`<b>${type.name}</b>`} open={openId === "type"} onToggle={() => toggle("type")}>
        <div className="tiles c2" style={{ gap: 8 }}>
          {TABLE_TYPES.map((t) => (
            <button key={t.id} type="button" className={"tile" + (cfg.type === t.id ? " sel" : "")} onClick={() => actions.setType(t.id)}>
              <div className="tname">{t.name}</div><div className="tblurb">{t.blurb}</div>
            </button>
          ))}
        </div>
      </Section>

      <Section n="2" title="Shape" value={isCookie ? `<b>Tree Trunk / Cookie</b>` : `<b>${shape.name}</b>`} open={openId === "shape"} onToggle={() => toggle("shape")}>
        <div className="tiles" style={{ gridTemplateColumns: "repeat(5,1fr)" }}>
          {SHAPES.map((s) => (
            <button key={s.id} type="button" className={"tile icon" + (cfg.shape === s.id ? " sel" : "")} onClick={() => actions.setShape(s.id)}>
              <ShapeIcon id={s.id} /><div className="tname">{s.name}</div>
            </button>
          ))}
        </div>
        {isCookie
          ? <div className="hint">↳ Tree-trunk uses the slab’s natural live-edge contour. Pick any other shape to switch back to a standard form.</div>
          : <div className="hint">↳ Round, square &amp; tree-trunk lock width to length for true proportions.</div>}
      </Section>

      <Section n="3" title="Size" value={isCookie ? `<b>${trunk.name}</b> · ⌀${cfg.length} cm` : `<b>${cfg.length}</b> × <b>${effW}</b> cm`} open={openId === "size"} onToggle={() => toggle("size")}>
        {isCookie ? (
          <>
            <div className="field-top"><label>Cookie diameter</label></div>
            <div className="tiles" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
              {TRUNK_SIZES.map((s) => (
                <button key={s.id} type="button" className={"tile" + (cfg.trunkSize === s.id ? " sel" : "")} style={{ alignItems: "center", textAlign: "center" }} onClick={() => actions.setTrunk(s.id)}>
                  <div className="tname">{s.name}</div><div className="tblurb">{s.cm} cm ⌀</div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <Slider label="Length" value={cfg.length} {...DIM_RANGE.length} unit=" cm" onChange={(v) => actions.set({ length: v })} />
            <Slider label="Width" value={cfg.width} {...DIM_RANGE.width} unit=" cm" disabled={cfg.shapeLocked} note={`${cfg.length} cm · locked`} onChange={(v) => actions.set({ width: v })} />
          </>
        )}
        <div className="hint">↳ Thickness is standard 4.5 cm (1.75") on all pieces.</div>
      </Section>

      <Section n="4" title="Wood &amp; design pattern" value={`<b>${layout.name}</b> · <b>${wood.name}</b>`} open={openId === "wood"} onToggle={() => toggle("wood")}>
        <div className="field-top"><label>Design pattern</label></div>
        <div className="patterns">
          {LAYOUTS.map((l) => (
            <button key={l.id} type="button" className={"pattile" + (cfg.layout === l.id ? " sel" : "")} onClick={() => actions.setPattern(l.id)}>
              <span className="pic"><PatternIcon id={l.id} /></span>
              <span className="pmeta">
                <span className="tname">{l.name}</span>
                <span className="plabel">{l.label}</span>
              </span>
            </button>
          ))}
        </div>

        {layout.slider === "river" && <RiverControls cfg={cfg} actions={actions} />}
        {layout.slider === "plank" && (
          <>
            <Slider label="Resin band width" value={cfg.gap} min={2} max={24} step={1} unit=" cm" onChange={(v) => actions.set({ gap: v })} />
            <Slider label="Centre board width" value={Math.round(cfg.plankSpread * 100)} min={20} max={42} step={1} unit="%" onChange={(v) => actions.set({ plankSpread: v / 100 })} />
          </>
        )}
        {layout.slider === "band" && <Slider label="Resin band proportion" value={Math.round(cfg.bandResin * 100)} min={18} max={55} step={1} unit="% resin" onChange={(v) => actions.set({ bandResin: v / 100 })} />}
        {layout.slider === "frames" && <Slider label="Number of frames" value={cfg.frames} min={3} max={8} step={1} unit=" rings" onChange={(v) => actions.set({ frames: v })} />}
        {layout.slider === "frame" && <Slider label="Resin border width" value={cfg.frameW} min={3} max={28} step={1} unit=" cm" onChange={(v) => actions.set({ frameW: v })} />}

        <div className="field-top" style={{ marginTop: 4 }}><label>Wood tone</label></div>
        <div className="tiles c4">
          {WOODS.map((w) => (
            <button key={w.id} type="button" className={"tile icon" + (cfg.wood === w.id ? " sel" : "")} onClick={() => actions.set({ wood: w.id })} style={{ padding: "10px 6px" }}>
              <span style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg, ${w.light}, ${w.base})`, border: "1px solid rgba(255,255,255,.12)" }} />
              <div className="tname">{w.name}</div>
            </button>
          ))}
        </div>
      </Section>

      <Section n="5" title="Resin" value={`<b>${rColor ? rColor.name : "Custom"}</b> · <b>${Math.round(cfg.resinOpacity * 100)}%</b>${cfg.metallic ? " · Metallic" : ""}`} open={openId === "resin"} onToggle={() => toggle("resin")}>
        <div className="field-top"><label>Resin colour</label><span className="val mono" style={{ fontSize: 12 }}>{rColor ? rColor.coll : "Custom"}</span></div>
        <div className="swatches c3">
          {RESIN_COLORS.map((c) => (
            <button key={c.id} type="button" className={"cswatch" + (cfg.resinColor.toLowerCase() === c.hex.toLowerCase() ? " sel" : "")} onClick={() => actions.set({ resinColor: c.hex })}>
              <span className="csw" style={{ background: c.hex }} />
              <span className="cmeta"><span className="cn">{c.name}</span><span className="cc">{c.coll}</span></span>
            </button>
          ))}
          <label className={"cswatch custom" + (!rColor ? " sel" : "")}>
            <span className="csw" style={{ background: !rColor ? cfg.resinColor : "conic-gradient(from 0deg,#f43,#fd3,#3f6,#3cf,#63f,#f3a,#f43)" }} />
            <span className="cmeta"><span className="cn">Custom</span><span className="cc mono">{!rColor ? cfg.resinColor.toUpperCase() : "Pick any"}</span></span>
            <input type="color" value={cfg.resinColor} onChange={(e) => actions.set({ resinColor: e.target.value })} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
          </label>
        </div>
        <Slider label="Opacity / translucency" value={Math.round(cfg.resinOpacity * 100)} min={20} max={100} step={5} unit="%" onChange={(v) => actions.set({ resinOpacity: v / 100 })} />
        <Toggle name="Metallic / pearl pigment" blurb="Adds shimmer & depth to the pour" on={cfg.metallic} onChange={(v) => actions.set({ metallic: v })} />
      </Section>

      <Section n="6" title="Edge" value={`<b>${edge.name}</b>`} open={openId === "edge"} onToggle={() => toggle("edge")}>
        {isCookie ? (
          <div className="hint">↳ Tree-trunk slabs always keep their natural live edge.</div>
        ) : (
          <>
            <div className="tiles" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
              {EDGES.map((e) => (
                <button key={e.id} type="button" className={"tile icon" + (cfg.edge === e.id ? " sel" : "")} onClick={() => actions.set({ edge: e.id })}>
                  <EdgeIcon id={e.id} /><div className="tname">{e.name}</div>
                </button>
              ))}
            </div>
            <div className="hint">↳ {edge.blurb}.</div>
          </>
        )}
      </Section>

      <Section n="7" title="Base &amp; legs" value={`<b>${base.name}</b>`} open={openId === "base"} onToggle={() => toggle("base")}>
        <div className="tiles c2">
          {BASES.map((b) => (
            <button key={b.id} type="button" className={"tile" + (cfg.base === b.id ? " sel" : "")} onClick={() => actions.set({ base: b.id })}>
              <div style={{ height: 38, marginBottom: 4 }}><BaseThumb id={b.id} accent={cfg.base === b.id ? "var(--accent)" : "var(--text-dim)"} /></div>
              <div className="tname">{b.name}</div><div className="tblurb">{b.blurb}</div>
            </button>
          ))}
        </div>
      </Section>
    </>
  );
}

Object.assign(window, { Configurator, Progress, ShapeIcon });
