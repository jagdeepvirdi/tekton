/* ============================================================
   data.jsx — configurator data model + pricing
   Exposes everything on window for the other babel scripts.
   ============================================================ */

/* ---- Table types (selecting one sets default dimensions, cm) ---- */
const TABLE_TYPES = [
  { id: "dining",   name: "Dining Table",      blurb: "Seats 6–8, the centrepiece",  dims: { length: 220, width: 100, thickness: 4.5 }, typeMult: 1.0 },
  { id: "coffee",   name: "Coffee Table",      blurb: "Low lounge centrepiece",       dims: { length: 120, width: 60,  thickness: 4.5 }, typeMult: 0.7 },
  { id: "endtable", name: "Side Table",        blurb: "Compact bedside / sofa side",  dims: { length: 50,  width: 50,  thickness: 4.5 }, typeMult: 0.6 },
];

/* ---- Shapes ---- */
/* round + square lock width to length (rendered circle / square) */
/* trunk = natural tree-trunk / cookie form — always pairs with the cookie pattern */
const SHAPES = [
  { id: "round",  name: "Round",             locked: true },
  { id: "oval",   name: "Oval",              locked: false },
  { id: "square", name: "Square",            locked: true },
  { id: "rect",   name: "Rectangle",         locked: false },
  { id: "trunk",  name: "Tree Trunk / Cookie", locked: true, organic: true },
];

/* ---- Cookie / tree-trunk diameters ---- */
const TRUNK_SIZES = [
  { id: "sm", name: 'Small — 12"',  cm: 30 },
  { id: "md", name: 'Medium — 18"', cm: 46 },
  { id: "lg", name: 'Large — 24"',  cm: 61 },
];

const THICKNESS_CM = 4.5;   /* standard 1.75 inch slab — not user-adjustable */

/* ---- Dimension slider ranges (cm) ---- */
const DIM_RANGE = {
  length: { min: 60, max: 360, step: 5 },
  width:  { min: 30, max: 160, step: 5 },
};

/* ---- Wood tones. Each defines a tonal ramp for the SVG grain renderer ---- */
const WOODS = [
  { id: "teak",   name: "Teak Wood", rate: 98000,
    base: "#6B4226", mid: "#7D5230", light: "#9A6840", grain: "#4A2D18", sheen: "#B8885A" },
  { id: "rose",   name: "Rose Wood", rate: 120000,
    base: "#4A2020", mid: "#5C2A2A", light: "#7A3A3A", grain: "#2E1010", sheen: "#9A5050" },
  { id: "acacia", name: "Acacia",    rate: 74000,
    base: "#7A4E2A", mid: "#956237", light: "#B68150", grain: "#56331A", sheen: "#C9986A" },
];

/* ---- Design patterns (drives the resin geometry in the preview) ----
   Each pattern defines where resin goes; the resin colour fills all
   resin areas of the chosen pattern. addon = resin-work cost. ---- */
const LAYOUTS = [
  { id: "river",       name: "Classic River",         label: "River — straight · diagonal · multiple",          blurb: "Resin channel(s) — fully adjustable", addon: 18000, slider: "river" },
  { id: "frames",      name: "Nested Frames",         label: "Concentric wood frames inlaid in resin",          blurb: "Geometric tunnel of inlaid frames",   addon: 52000, slider: "frames" },
  { id: "geospiral",   name: "Geometric Spiral",      label: "Square Greek-key resin spiral",                   blurb: "Angular wood spiral set in resin",    addon: 50000, slider: null },
  { id: "spiral",      name: "Spiral Pour",           label: "Spiral Pour — smooth swirl",                      blurb: "Smooth clockwise resin swirl",        addon: 46000, slider: null },
  { id: "cookie",      name: "Cookie / Tree Trunk",   label: "Cookie / Tree Trunk Slab",                        blurb: "Natural slab, resin-filled cracks",   addon: 34000, slider: null },
  { id: "edgeframe",   name: "Edge Frame",            label: "Edge Frame — Resin border with Wood center",      blurb: "Resin border frames a wood centre",   addon: 24000, slider: "frame" },
];

/* Catalog resin colour swatches (name · collection · hex) */
const RESIN_COLORS = [
  { id: "black",   name: "Black",         coll: "Black Brook",      hex: "#0D0F13" },
  { id: "teal",    name: "Teal Green",    coll: "Celestial Stream", hex: "#009688" },
  { id: "ocean",   name: "Ocean Blue",    coll: "Azure Allure",     hex: "#1763B8" },
  { id: "slate",   name: "Slate Grey",    coll: "Dove Tail",        hex: "#5A626B" },
  { id: "gold",    name: "Gold",          coll: "Amber Love",       hex: "#D4A017" },
  { id: "emerald", name: "Emerald Green", coll: "Emerald Allure",   hex: "#1FA86B" },
];

/* ---- Edge profiles ---- */
const EDGES = [
  { id: "live",   name: "Live edge", blurb: "Natural, irregular contour" },
  { id: "straight", name: "Straight", blurb: "Clean, machined edge" },
  { id: "bevel",  name: "Beveled",   blurb: "Chamfered top facet" },
];

/* ---- Bases / legs ---- */
const BASES = [
  { id: "hairpin",  name: "Steel hairpin", blurb: "Mid-century, minimal", addon: 8000 },
  { id: "uframe",   name: "U-frame",       blurb: "Industrial flat bar",  addon: 14000 },
  { id: "pedestal", name: "Pedestal",      blurb: "Sculptural single column", addon: 22000 },
  { id: "box",      name: "Box frame",     blurb: "Architectural square", addon: 18000 },
];

/* ============================================================
   Pricing
   ============================================================ */
function computePrice(cfg) {
  const wood  = WOODS.find(w => w.id === cfg.wood)   || WOODS[0];
  const type  = TABLE_TYPES.find(t => t.id === cfg.type) || TABLE_TYPES[0];
  const layout = LAYOUTS.find(l => l.id === cfg.layout) || LAYOUTS[0];
  const base  = BASES.find(b => b.id === cfg.base)   || BASES[0];

  const isCookie = cfg.layout === "cookie";
  const effW = (cfg.shapeLocked || isCookie) ? cfg.length : cfg.width;
  const areaM2 = isCookie
    ? (Math.PI / 4) * (cfg.length / 100) * (effW / 100)   // organic oval
    : (cfg.length / 100) * (effW / 100);
  const thicknessFactor = THICKNESS_CM / 4;           // fixed 4.5 cm slab

  const woodMaterial  = (2 / 3) * areaM2 * wood.rate * thicknessFactor * type.typeMult;
  const resinAdd = layout.addon;
  const metallic = cfg.metallic ? 12000 : 0;
  const baseAdd  = base.addon;

  const subtotal = woodMaterial + resinAdd + metallic + baseAdd;
  const total = Math.round(subtotal / 100) * 100;

  return {
    areaM2,
    breakdown: [
      { label: `${wood.name} slab · 2/3 vol · ${areaM2.toFixed(2)} m²`, value: Math.round(woodMaterial) },
      { label: `${layout.name} resin work · 1/3 vol`, value: resinAdd },
      ...(cfg.metallic ? [{ label: "Metallic / pearl pigment", value: metallic }] : []),
      { label: `${base.name} base`, value: baseAdd },
    ],
    total,
  };
}

const formatINR = (n) =>
  "₹" + Math.round(n).toLocaleString("en-IN");

const STEPS = [
  { id: "type",   label: "Table type" },
  { id: "shape",  label: "Shape" },
  { id: "edge",   label: "Edge" },
  { id: "size",   label: "Size" },
  { id: "wood",   label: "Wood & pattern" },
  { id: "resin",  label: "Resin" },
  { id: "base",   label: "Base & legs" },
];

Object.assign(window, {
  TABLE_TYPES, SHAPES, TRUNK_SIZES, DIM_RANGE, THICKNESS_CM, WOODS, LAYOUTS,
  RESIN_COLORS, EDGES, BASES,
  computePrice, formatINR, STEPS,
});
