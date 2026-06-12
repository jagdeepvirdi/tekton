# TASKS.md — Tekton India Website

**Project**: Full static website for Tekton India resin furniture brand
**Stack**: HTML / CSS / JS / GoDaddy Shared Hosting
**Status tracking**: Mark tasks ✅ when done, 🔄 when in progress, ⏳ when blocked

---

## SESSION 0 — Project Bootstrap ✅
> Completed 2026-06-10

- [x] Create project folder: `tekton-website/` (D:/Project/Tekton/ is the root)
- [x] Extract `TektonIndiaDesign-handoff.zip` → all contents copied into `assets/configurator/`
- [x] Read the README inside the zip
- [x] `CLAUDE.md` and `TASKS.md` already in project root
- [x] Create folder structure: `css/`, `js/`, `data/`, `images/products/`, `images/brand/`, `images/team/`
- [x] Create empty placeholder files: `index.html`, `products.html`, `product.html`, `configurator.html`, `about.html`, `contact.html`, `admin.html`, `css/main.css`, `css/products.css`, `css/configurator.css`, `js/main.js`, `js/products.js`, `js/cart.js`
- [x] Populate `data/products.json` with all 22 products (validated: 22 entries, correct schema)
- [x] Create `images/products/[slug]/` folder for all 22 products
- [ ] Download product images from tektonindia.com and sort into `images/products/[slug]/` *(manual step — do before Session 3)*
- [ ] Place Tekton India logo in `images/brand/logo.png` *(manual step — do before Session 1)*

**Claude Code prompt for Session 0:**
```
Read CLAUDE.md and TASKS.md.
Set up the project structure exactly as defined in CLAUDE.md.
Create all empty placeholder files and folders.
Then populate data/products.json with all 22 products from the table in CLAUDE.md,
using the exact schema defined there. Use placeholder image paths.
Validate the JSON is parseable. Mark Session 0 tasks done in TASKS.md.
```

---

## SESSION 1 — Global CSS + Navigation + Footer ✅
> Completed 2026-06-10

- [x] Create `css/main.css` with all CSS custom properties from CLAUDE.md design tokens
- [x] Import Google Fonts: Cormorant Garamond (display) + DM Sans (body)
- [x] Build sticky top navigation: logo left, links center (Home, Products, Custom Table, About, Contact), mobile hamburger right
- [x] Build site footer: logo, tagline, nav links, social links (Instagram), contact info, "Built by [STUDIO_NAME]" credit
- [x] Mobile-first responsive breakpoints: 375px (base), 768px/900px tablet, 1024px/1280px desktop
- [x] Create `js/main.js`: mobile menu toggle + close-on-escape, nav scroll shadow, active link detection, scroll-to-top button, intersection-based reveal, smooth anchor scroll
- [x] Nav + footer HTML written into `index.html` as the copy-paste template for all pages

**Claude Code prompt for Session 1:**
```
Read CLAUDE.md and TASKS.md. Active session: Session 1.
Create css/main.css with the design tokens defined in CLAUDE.md.
Import Cormorant Garamond and DM Sans from Google Fonts.
Build a reusable nav and footer as HTML snippets — they'll be copy-pasted into each page.
Nav: sticky, dark background, logo left, links right, hamburger on mobile.
Footer: dark, logo, tagline "Crafted in India. Designed to Last.", nav links, Instagram link,
company address (120/192 (96) Lajpat Nagar, Kanpur-208005), phone (+91 9919629846),
email (tektonindia.biz@gmail.com), and a small "Website by [STUDIO_NAME]" line.
Create js/main.js for mobile menu and smooth scroll.
Mark Session 1 tasks done in TASKS.md.
```

---

## SESSION 2 — Home Page (index.html) ✅
> Completed 2026-06-10

- [x] Full-viewport hero: CSS gradient fallback (replaced by images/brand/hero.jpg when added), headline "Living Art. Crafted for You.", subline, two CTA buttons
- [x] "Our Craft" section: 3 value pillars with inline SVG icons — Handcrafted, Custom Made, Ships Across India
- [x] Featured Products: 4 cards loaded via fetch() from products.json where featured=true; graceful fallback on fetch failure
- [x] "How It Works": 3 numbered steps with connector line on desktop
- [x] Design Pattern showcase: 5 inline SVG illustrations (River, Multi-band, Cookie, Spiral, Edge Frame) — top-down view with wood grain, resin fills, gradients
- [x] Brand story teaser: two paragraphs + pattern tile visual + "Read Our Story" link
- [x] Final CTA banner: full-width section with green glow radial gradient + configurator link
- [x] `[data-reveal]` scroll-reveal CSS + staggered delay classes added to main.css
- [x] Shared section components added to main.css: .eyebrow, .section-header, .section-link, .product-card, .btn variants

**Claude Code prompt for Session 2:**
```
Read CLAUDE.md and TASKS.md. Active session: Session 2.
Create index.html — the home page.
Include the nav and footer from Session 1.
Load featured products from data/products.json using fetch() + JS — show 4 cards where featured=true.
Build all sections listed in TASKS.md Session 2.
For the Design Pattern showcase, draw 5 small SVG illustrations (top-down table view, ~120x80px each)
showing: River (wood|resin|wood), Multi-band (resin|wood|resin|wood|resin), Cookie (irregular oval
with crack-fill resin), Spiral (swirl resin on wood), Edge-Frame (wood center, resin border).
Use the design tokens from CLAUDE.md throughout. Make it premium and editorial in feel.
Mark Session 2 tasks done in TASKS.md.
```

---

## SESSION 3 — Products Gallery Page (products.html) ✅
> Completed 2026-06-10

- [x] Page hero: "Our Collection" with radial gradient background, eyebrow, description, desktop CTA
- [x] Filter bar: sticky below nav (top: 68px), glass backdrop — Category (5 options) + Pattern (6 options) + In Stock toggle + Clear Filters button + live product count
- [x] Product grid: 3-col desktop / 2-col tablet (≤860px) / 1-col mobile (≤480px)
- [x] Product cards: primary/secondary image swap on hover, name, subtitle, price (₹en-IN format), sale/sold-out badges, "View Details" CTA with arrow
- [x] All 22 products loaded from data/products.json via fetch() in products.js
- [x] Cards link to product.html?id=[id]
- [x] Client-side filtering with URL param sync (history.replaceState) — ?cat= ?pattern= ?availability=
- [x] Empty state with icon, message, and "Clear Filters" button
- [x] Skeleton loading state (6 shimmer cards while fetching)
- [x] Footer studio credit updated to Jagdeep Singh Virdi + jagdeepsinghvirdi.com on products.html and index.html

**Claude Code prompt for Session 3:**
```
Read CLAUDE.md and TASKS.md. Active session: Session 3.
Create products.html — the full product gallery.
Load all products from data/products.json via fetch().
Build filter controls (category, availability, resin pattern) that filter client-side.
Build the product card grid. Each card shows: primary image, on-hover swap to secondary image (CSS transition),
product name, subtitle, price formatted as ₹XX,XXX, sale badge if originalPrice exists, Sold Out badge if inStock=false.
Clicking a card navigates to product.html?id=[id].
Use the design tokens from CLAUDE.md. Cards should feel like a luxury furniture catalog.
Mark Session 3 tasks done in TASKS.md.
```

---

## SESSION 4 — Product Detail Page (product.html) ✅
> Completed 2026-06-12

- [x] Read `?id=` URL param → find product in products.json → render full detail
- [x] Image gallery: large main image + thumbnail strip (click to swap)
- [x] Product info: name, subtitle, price, availability badge, full description
- [x] Specs table: dimensions, wood type, resin pattern, finish
- [x] "Request This Design" button → scrolls to an inquiry form at the bottom of the page
- [x] Inquiry form: name, email, phone, message (pre-filled with product name), submit to Formspree
- [x] "Or design your own" CTA → configurator.html
- [x] Related products: 3 cards from same category, loaded from products.json

**Claude Code prompt for Session 4:**
```
Read CLAUDE.md and TASKS.md. Active session: Session 4.
Create product.html — the single product detail page.
Read the ?id= URL param. Fetch data/products.json. Find the matching product. Render all fields.
Build the image gallery with thumbnail strip.
Build a specs table showing dimensions, wood type, resin pattern.
Build an inquiry form at the bottom — POST to Formspree (use placeholder endpoint YOUR_FORMSPREE_ID for now),
pre-fill the subject with the product name.
Show 3 related products from the same category at the bottom.
Handle the case where the product ID is not found: show a friendly "Product not found" message with a
link back to products.html.
Mark Session 4 tasks done in TASKS.md.
```

---

## SESSION 5 — Configurator Integration (configurator.html) ✅
> Completed 2026-06-12

- [x] Create `configurator.html` as a full-page wrapper with Tekton nav + footer
- [x] Load the Claude Design configurator from `assets/configurator/` (reference its HTML/JS/CSS correctly)
- [x] Add a page header: "Design Your Own Table" headline + short description
- [x] Ensure configurator fills the available viewport height below the nav
- [x] At the bottom of the configurator flow, the "Request My Quote" button should POST to Formspree
- [ ] Replace YOUR_FORMSPREE_ID placeholder with the real Formspree endpoint (done in Session 9)

**Claude Code prompt for Session 5:**
```
Read CLAUDE.md and TASKS.md. Active session: Session 5.
Read the README inside assets/configurator/ to understand how the Claude Design output is structured.
Create configurator.html that wraps the Claude Design output with the site nav and footer.
The configurator should take up the full remaining viewport height below the nav.
Add a small hero header above it: "Design Your Own Table" in the display font, with subtext
"Choose your shape, wood, resin pattern and size — we'll build it for you."
Wire the quote form at the end of the configurator to Formspree (endpoint: YOUR_FORMSPREE_ID).
Make sure all CSS and JS paths from assets/configurator/ resolve correctly.
Mark Session 5 tasks done in TASKS.md.
```

---

## SESSION 6 — About Page (about.html) ✅
> Completed 2026-06-12

- [x] Brand story: founding story using real copy from tektonindia.com — rooftop origin (2022), innovation/sustainability/quality values
- [x] "The Making" section (id="craft"): 4 process steps with SVG placeholder visuals — The Wood, The Pour, Cure & Finish, Yours Forever. Replace SVGs with real photos via images/brand/craft-*.jpg
- [x] Values: 3 pillars — Handcrafted Quality, Sustainable Sourcing, Custom-First Approach
- [x] "Built By" section above footer: "Website designed & built by Jagdeep Singh Virdi" with link
- [x] Contact info + Google Maps iframe embed (Lajpat Nagar, Kanpur) — map styled with CSS dark filter
- [x] Created css/about.css with all page-specific styles

**Claude Code prompt for Session 6:**
```
Read CLAUDE.md and TASKS.md. Active session: Session 6.
Create about.html.
Brand story section: write compelling copy about a furniture brand from Kanpur that makes handcrafted
resin and wood tables — artisan craft meeting modern design, rooted in Indian craftsmanship.
Include the company address: 120/192 (96) Lajpat Nagar, Kanpur-208005, UP, India.
At the very bottom, above the footer, add a tasteful "Website by [STUDIO_NAME]" credit section —
small text, dark background, just one line. This is the developer's portfolio credit.
Embed a Google Maps iframe pointing to Lajpat Nagar, Kanpur.
Mark Session 6 tasks done in TASKS.md.
```

---

## SESSION 7 — Contact Page + Admin Tool ✅
> Completed 2026-06-12

- [x] `contact.html`: hero + two-column layout (form 3fr, sidebar 1fr)
  - Form: name, email, phone, subject dropdown (4 options), message — AJAX POST to Formspree YOUR_FORMSPREE_ID
  - Client-side validation with inline field errors; success/error states without page reload
  - Sidebar: address, phone/WhatsApp, email, Instagram, workshop hours, configurator CTA
  - Sticky sidebar on desktop; stacks to 2-col grid on tablet, 1-col on mobile
  - Created css/contact.css
- [x] `admin.html`: self-contained single-file tool (no main.css dependency)
  - Custom HTML password modal on load — password: "tekton2024"
  - Fetches data/products.json, renders all products in a sticky-header table
  - Inline edits: price input, originalPrice input, inStock toggle, featured toggle
  - Search box + category filter + stock filter with live results count
  - Export products.json downloads the current in-memory state via Blob URL
  - "Unsaved changes" indicator; beforeunload warning when modified
  - Lock button returns to password screen
  - `<meta name="robots" content="noindex nofollow">` — not linked from any nav/footer

**Claude Code prompt for Session 7:**
```
Read CLAUDE.md and TASKS.md. Active session: Session 7.
Create contact.html with a full contact form (POST to Formspree YOUR_FORMSPREE_ID), plus a sidebar
showing: address, phone, email, Instagram link, and business hours.
Create admin.html — a local product management tool. It must:
  1. Show a JS password prompt on load (hardcode password as "tekton2024" for now — this is local only)
  2. Load data/products.json via fetch()
  3. Display all products in a table: name, price, inStock toggle, featured toggle, category
  4. Allow editing price, inStock, featured inline
  5. Have an "Export Updated JSON" button that downloads the modified products.json
  6. Add <meta name="robots" content="noindex nofollow"> to admin.html
  7. Do NOT link to admin.html from any page nav or footer
Mark Session 7 tasks done in TASKS.md.
```

---

## SESSION 8 — SEO, Performance, Polish ✅
> Completed 2026-06-12

- [x] Add `<meta>` tags to all pages: title, description, og:image, og:title, og:description, twitter:card, canonical — all 6 HTML pages updated (index, products, product, configurator, about, contact)
- [x] Create `sitemap.xml` with all 5 main page URLs + all 22 product page URLs
- [x] Create `robots.txt` — allows all bots, disallows /admin.html, references sitemap
- [x] `loading="lazy"` on all product images — already correct in products.js and product.js; main product gallery image uses `loading="eager"` (above fold — correct)
- [x] Create `compress-images.sh` — ImageMagick bash script: resize to max 800px wide, quality 82, strip EXIF, reports before/after file sizes
- [x] Create `404.html` — branded not-found page with full nav + footer, large italic "404" in display font, "Page Not Found" heading, "Shop All Tables" + "Go Home" CTAs, animated pulse divider, `<meta name="robots" content="noindex">`
- [ ] Test all pages on mobile (375px viewport) *(manual step)*
- [ ] Check all form submissions work (Formspree test mode) *(manual step — needs Formspree account first)*
- [ ] Verify products.json loads correctly when opened from file:// AND from a server *(manual step)*

**Claude Code prompt for Session 8:**
```
Read CLAUDE.md and TASKS.md. Active session: Session 8.
Audit all HTML pages and add proper <meta> tags: title tag, meta description, og:title, og:description,
og:image (use images/brand/og-image.jpg as placeholder).
Create sitemap.xml listing all pages. Create robots.txt that allows all bots but disallows /admin.html.
Create 404.html with the site nav, footer, a friendly message, and a "Shop All Tables" button.
Add loading="lazy" to all <img> tags in products.html and product.html.
Write a bash script compress-images.sh that uses ImageMagick to resize all images in images/products/
to max 800px width and quality 82.
Mark Session 8 tasks done in TASKS.md.
```

---

## SESSION 9 — GoDaddy Deployment ⏳

- [ ] Replace all `YOUR_FORMSPREE_ID` placeholders with real Formspree endpoint
- [ ] Replace all `[STUDIO_NAME]` placeholders with finalized studio name
- [ ] Set the real domain name in sitemap.xml and all canonical meta tags
- [ ] Run the compress-images.sh script on all product images
- [ ] Upload entire `tekton-website/` folder contents to GoDaddy File Manager (public_html/)
- [ ] Test live site: all pages, forms, product loading, configurator
- [ ] Activate SSL in GoDaddy cPanel
- [ ] Submit sitemap to Google Search Console

**Claude Code prompt for Session 9:**
```
Read CLAUDE.md and TASKS.md. Active session: Session 9 — Pre-launch.
Do a find-replace across all files:
  - Replace YOUR_FORMSPREE_ID with [THE REAL FORMSPREE ENDPOINT — user will provide]
  - Replace [STUDIO_NAME] with [THE REAL STUDIO NAME — user will provide]
  - Replace http://localhost/ and any local paths with the real domain [USER WILL PROVIDE]
Update sitemap.xml with the real domain and today's date as lastmod.
Create a deploy-checklist.txt file summarizing every manual step needed before going live.
Mark Session 9 tasks done in TASKS.md.
```

---

## Backlog / V2 Features (after launch)
- [ ] WhatsApp chat widget (for Indian market — very high conversion)
- [ ] Product inquiry counter ("12 people inquired about this table this week")
- [ ] Instagram feed embed (latest posts from takshanambytekton)
- [ ] Testimonials / reviews section
- [ ] Payment integration (Razorpay for Indian customers — when ready to transact)
- [ ] CMS migration (Contentful or Sanity) if product catalog grows past 50 items
- [ ] Blog / "Inspiration" section for SEO
- [ ] Studio portfolio page for the developer credit (links to other built sites)
