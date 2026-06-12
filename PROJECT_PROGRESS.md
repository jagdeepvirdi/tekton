# Tekton India Website — Project Progress

**Project**: Full static website for Tekton India, a custom resin/epoxy furniture brand based in Kanpur, India.
**Stack**: Pure HTML / CSS / JS — no framework, no build step. Hosted on GoDaddy Shared Hosting.
**Developer**: Jagdeep Singh Virdi — [jagdeepsinghvirdi.com](https://www.jagdeepsinghvirdi.com/)
**Reference site (Shopify)**: https://tektonindia.com/
**Admin panel password**: `tekton2024` (local use only)
**Local dev server**: Python HTTP server on port 4200 — `python -m http.server 4200 --directory D:\Project\Tekton`

---

## Project At a Glance

| Area | Status |
|---|---|
| Global nav + footer | Done |
| Home page | Done |
| Products gallery | Done |
| Product detail page | Done |
| Configurator integration | Done |
| About page | Done |
| Contact page + admin tool | Done |
| SEO, 404, sitemap | Done |
| Archive / product lifecycle system | Done |
| Real product photos | **Pending (manual)** |
| Formspree endpoint | **Pending (pre-launch)** |
| GoDaddy deployment | **Pending** |

---

## Session History

---

### Session 0 — Project Bootstrap
**Date**: 2026-06-10

- Created full folder structure: `css/`, `js/`, `data/`, `images/products/`, `images/brand/`, `images/team/`
- Extracted `TektonIndiaDesign-handoff.zip` into `assets/configurator/` (the interactive table configurator from Claude Design)
- Created all empty placeholder files: `index.html`, `products.html`, `product.html`, `configurator.html`, `about.html`, `contact.html`, `admin.html`, and all CSS/JS files
- Populated `data/products.json` with all 22 products using the exact schema defined in `CLAUDE.md`
- Created individual image subfolders under `images/products/` for all 22 product slugs

**Pending from this session (still manual)**:
- Download product images from tektonindia.com and sort into `images/products/[slug]/`
- Place Tekton India logo in `images/brand/logo.png`

---

### Session 1 — Global CSS + Navigation + Footer
**Date**: 2026-06-10

- Created `css/main.css` with all design tokens (colours, fonts, spacing)
- Imported Google Fonts: Cormorant Garamond (display/headlines) + DM Sans (body)
- Built sticky top navigation: logo left, links centre, "Design Yours" CTA right, hamburger for mobile
- Built site footer: logo, tagline, nav columns, social links, contact address, "Built by" developer credit
- Mobile-first responsive: 375px base → 768/900px tablet → 1024/1280px desktop
- Created `js/main.js`: mobile menu toggle, close-on-escape, nav scroll shadow, active link detection, scroll-to-top button, scroll-reveal animations, smooth anchor scroll
- Nav + footer HTML finalised in `index.html` as the copy-paste template for all other pages

---

### Session 2 — Home Page (index.html)
**Date**: 2026-06-10

- Full-viewport hero: CSS gradient background (upgrades to `images/brand/hero.jpg` when photo is added), headline "Living Art. Crafted for You.", two CTA buttons
- "Our Craft" section: 3 value pillars with inline SVG icons — Handcrafted, Custom Made, Ships Across India
- Featured Products strip: 4 cards loaded via `fetch()` from `products.json` where `featured: true`
- "How It Works": 3 numbered steps with connector line on desktop
- Design Pattern showcase: 5 inline SVG illustrations showing River, Multi-Band, Cookie, Spiral, Edge Frame patterns (top-down table view with wood grain and resin fills)
- Brand story teaser: two paragraphs + "Read Our Story" link
- Final CTA banner: full-width section with Tekton green glow + configurator link
- Added `[data-reveal]` scroll-reveal CSS with staggered delay classes

---

### Session 3 — Products Gallery (products.html + products.js + products.css)
**Date**: 2026-06-10

- Page hero: "Our Collection" with radial gradient, eyebrow count, description
- Sticky filter bar (below nav at `top: 68px`): Category (5 options) + Pattern (6 options) + In Stock toggle + Clear Filters + live product count
- Product grid: 4-col desktop / 3-col / 2-col tablet / 1-col mobile
- Product cards: primary/secondary image swap on hover, name, subtitle, ₹-formatted price, sale/sold-out badges, "View Details →" CTA
- All 22 products loaded from `data/products.json` via `fetch()`
- Cards link to `product.html?id=[slug]`
- Client-side filtering with URL param sync (`history.replaceState`) — `?cat=` `?pattern=` `?availability=`
- Empty state: icon + message + "Clear Filters" button
- Skeleton loading: 6 shimmer cards shown while JSON is fetching
- Footer studio credit set to Jagdeep Singh Virdi + jagdeepsinghvirdi.com

---

### Session 4 — Product Detail Page (product.html + product.js + product.css)
**Date**: 2026-06-12

- Reads `?id=` URL param → finds matching product in `products.json` → renders full detail
- Image gallery: large main image + thumbnail strip with click-to-swap
- Product info panel: name, subtitle, price (with sale crossed-out original), availability badge (In Stock / Made to Order), full description
- Specs table: dimensions, wood type, resin pattern, shape, finish, category
- "Request This Design" button → smooth scrolls to the inquiry form
- Inquiry form: name, email, phone, city, message (pre-filled with product name), AJAX POST to Formspree, success/error states without page reload
- "Or design your own →" link to configurator
- Related products: up to 3 cards from the same category
- Not-found state: friendly message + "Browse All Tables" link when `?id=` is missing or invalid
- Loading skeleton while JSON fetches

---

### Session 5 — Configurator Integration (configurator.html)
**Date**: 2026-06-12

- Created `configurator.html` as a full-page wrapper with site nav + footer
- Loaded the Claude Design output from `assets/configurator/` with correct relative paths
- Page header: "Design Your Own Table" headline + subtext
- Configurator fills full viewport height below the nav
- "Request My Quote" button at end of configurator flow POSTs to Formspree (placeholder endpoint)

**Pending**: Replace `YOUR_FORMSPREE_ID` in Session 9

---

### Session 6 — About Page (about.html + about.css)
**Date**: 2026-06-12

- Brand story section: founding story — rooftop origin (2022), innovation/sustainability/quality values, sourced from tektonindia.com
- "The Making" section (`id="craft"`): 4 process steps — The Wood, The Pour, Cure & Finish, Yours Forever — with SVG placeholder visuals (replace with `images/brand/craft-*.jpg` when available)
- Values: 3 pillars — Handcrafted Quality, Sustainable Sourcing, Custom-First Approach
- "Website designed & built by Jagdeep Singh Virdi" section above footer
- Contact info block + Google Maps iframe (Lajpat Nagar, Kanpur) with CSS dark filter
- Created `css/about.css`

---

### Session 7 — Contact Page + Admin Tool (contact.html + admin.html)
**Date**: 2026-06-12

**contact.html**:
- Two-column layout: form (left, wider) + sidebar (right, sticky on desktop)
- Form: name, email, phone, subject dropdown (4 options), message — AJAX POST to Formspree
- Client-side validation with inline field error messages; no page reload on submit
- Sidebar: address, phone/WhatsApp, email, Instagram, workshop hours, configurator CTA
- Created `css/contact.css`

**admin.html** (local tool, not linked from nav/footer, `noindex`):
- Password modal on load (password: `tekton2024`)
- Loads `data/products.json` via `fetch()`
- Table view: all 22 products with inline editable price, original price, in-stock toggle, featured toggle
- Search + category filter + stock filter with live count
- "Export products.json" button — downloads current in-memory state as a file
- "Unsaved changes" indicator + `beforeunload` warning
- Lock button returns to password screen

---

### Session 8 — SEO, Performance, Polish
**Date**: 2026-06-12

- Added `<meta>` tags to all 6 HTML pages: `<title>`, `<meta description>`, `og:title`, `og:description`, `og:image`, `twitter:card`, `<link rel="canonical">`
- Created `sitemap.xml`: all 5 main pages + all 22 product pages (`product.html?id=[slug]`)
- Created `robots.txt`: allows all bots, disallows `/admin.html`, references sitemap
- `loading="lazy"` on all product images; main gallery image uses `loading="eager"` (above fold, correct)
- Created `compress-images.sh`: ImageMagick script — resizes to max 800px wide, quality 82, strips EXIF, reports file size before/after
- Created `404.html`: branded not-found page with full nav + footer, italic "404" in display font, "Shop All Tables" + "Go Home" CTAs, `noindex` meta

**Still manual before launch**:
- Test all pages on mobile (375px viewport)
- Verify Formspree form submissions work
- Verify `products.json` loads on the live server

---

### Session 9 (Current) — Local Dev Server + Product Archive System
**Date**: 2026-06-12

#### Local development server
- Checked `D:\Project\common\ports-in-use.csv` to find a free port (occupied: 5000, 5173–5177, 3001–3002, 8000, 8080, 9080, 4177, and system ports)
- Started Python HTTP server on **port 4200**: `python -m http.server 4200 --directory D:\Project\Tekton`
- Updated `ports-in-use.csv` to record port 4200 as the Tekton Stack entry

**Site is now live at**: http://localhost:4200

#### Product archive / lifecycle system
Added a complete product status system so sold pieces are preserved for customers to discover and request similar work.

**Schema change** — `data/products.json`:
- Added `"status"` field to all 22 products (default: `"active"`)
- Valid values: `"active"` (in main catalog) | `"archived"` (sold, moved to Past Pieces)
- Note: `"status"` is separate from `"inStock"` — an active product can be made-to-order; archiving means it's sold and off the main catalog permanently

**products.js changes**:
- `getFiltered()` now excludes archived products from the main gallery
- New `buildArchivedCard()` function renders archived products with a "Sold" badge and "Request Similar →" CTA instead of "View Details →"
- New `renderArchived()` function populates the Past Pieces section
- `renderArchived()` is called after the main render; if no archived products exist, the section stays hidden

**products.html changes**:
- New "Past Pieces — Pieces That Found Their Home" section below the main gallery (hidden when empty)
- Separate grid rendered by `products.js`; heading, eyebrow, and descriptive paragraph included

**product.js changes**:
- Archived products show an amber "This piece has found its home" banner at the top of the page
- Availability badge changes to "Sold" (amber colour)
- "Request This Design" button becomes "Request a Similar Piece"
- Inquiry form heading and default message adapt for similar-piece requests
- Related products section excludes archived pieces

**admin.html changes**:
- New "Status" column in the product table (between Featured and Pattern)
- Dropdown: `Active` / `Archived` — updates on change, styled in amber when archived
- Change handler updated to handle `<select>` elements alongside existing `<input>` handlers
- Exported `products.json` includes the status field

**css/products.css additions**:
- `.past-pieces-section` — warm wood-toned radial gradient background, centred header
- `.product-card--archived` — 82% opacity, fades to full on hover
- `.badge-sold` — amber/brown badge style distinct from "Sold Out"
- `.product-card-cta--similar` — uses `--color-wood` accent

**css/product.css additions**:
- `.pd-archived-banner` / `.pd-archived-banner-inner` — amber border box at top of page
- `.pd-avail--sold` — amber availability badge

---

## How to Manage Products Going Forward

### To add a new product
1. Edit `data/products.json` — copy any existing entry, fill in all fields, set `"status": "active"`
2. Create folder `images/products/[new-id]/` and add `1.jpg`, `2.jpg` (under 200KB each)
3. No code changes needed — it appears automatically on the site

### To mark a product as sold (archive it)
1. Open `http://localhost:4200/admin.html` (password: `tekton2024`)
2. Find the product, change the **Status** dropdown to `Archived`
3. Click **Export products.json** — download the file
4. Replace `data/products.json` on the GoDaddy server with the downloaded file

Result: the product disappears from the main catalog and appears in the "Past Pieces" section with a "Request Similar" CTA — keeping it visible for customer inspiration.

### To add real product photos
Photos are expected at `images/products/[product-id]/1.jpg` and `2.jpg`.

Steps:
1. Photograph the product (natural light works best)
2. Compress to under 200KB using [squoosh.app](https://squoosh.app) or run `compress-images.sh`
3. Name and place in the correct folder — e.g. `images/products/black-brook/1.jpg`
4. No code changes needed; the site picks them up automatically

If an image file is missing, the site shows a tasteful CSS gradient as fallback — nothing breaks.

---

## Pre-Launch Checklist (Session 9 — Deployment)

- [ ] Sign up at [formspree.io](https://formspree.io), create a form, get the endpoint `https://formspree.io/f/XXXXXXXX`
- [ ] Find-replace `YOUR_FORMSPREE_ID` across `contact.html`, `product.html` (via `product.js`), `configurator.html`
- [ ] Confirm studio name — currently `Jagdeep Singh Virdi` with link to `jagdeepsinghvirdi.com` (already set in footer and about.html)
- [ ] Set the real domain in `sitemap.xml` and all `<link rel="canonical">` and `og:url` meta tags
- [ ] Add actual product photos to `images/products/` folders
- [ ] Add logo to `images/brand/logo.png`
- [ ] Add hero photo to `images/brand/hero.jpg` (optional — gradient fallback is in place)
- [ ] Run `compress-images.sh` on all images before upload
- [ ] Upload all files via GoDaddy File Manager → `public_html/`
- [ ] Test all pages live: products gallery, product detail, configurator, contact form
- [ ] Activate SSL in GoDaddy cPanel (free, one click)
- [ ] Submit `sitemap.xml` to Google Search Console

---

## V2 Backlog (after launch)

- WhatsApp chat widget (high-converting for Indian market)
- Product inquiry counter ("12 people inquired this week")
- Instagram feed embed from @takshanambytekton
- Testimonials / reviews section
- Razorpay payment integration (when ready to transact)
- CMS migration (Contentful or Sanity) if catalog grows past 50 items
- Blog / "Inspiration" section for SEO
