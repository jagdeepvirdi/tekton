# CLAUDE.md — Tekton India Website Project

## Project Overview
Full static website for **Tekton India** — a custom resin/epoxy furniture brand based in Kanpur, India.
The site showcases and sells existing finished products, AND offers an interactive custom table configurator.

**Live domain**: Purchased on GoDaddy (URL TBD — update here when confirmed)
**Hosting**: GoDaddy Shared Hosting (cPanel + File Manager / FTP)
**Current Shopify site** (reference only): https://tektonindia.com/

---

## Tech Stack
- **Pure static HTML/CSS/JS** — no framework, no build step, deploys directly to GoDaddy
- **Products managed via** `data/products.json` — edit this file to add/remove/update products
- **Configurator** — from `tektonindiadesign.zip` (Claude Design output), integrated as `/configurator.html`
- **Contact/inquiry forms** — Formspree (free tier, handles email without a backend)
- **No React, no Node, no npm** — everything runs in the browser as-is

---

## File Structure
```
tekton-website/
├── index.html                  # Home page — hero, featured products, brand story, CTA
├── products.html               # Full product gallery with filters
├── configurator.html           # The interactive custom table designer
├── about.html                  # Company story + "Built by [Studio Name]" credit
├── contact.html                # Contact + inquiry form
├── admin.html                  # Simple product manager UI (local use only, not indexed)
│
├── css/
│   ├── main.css                # Global styles, design tokens, nav, footer
│   ├── products.css            # Product cards, gallery, filters
│   └── configurator.css        # Configurator page wrapper styles
│
├── js/
│   ├── main.js                 # Nav, mobile menu, scroll effects
│   ├── products.js             # Loads products.json, renders cards, handles filters
│   └── cart.js                 # Inquiry cart / wishlist (no payment, just quote builder)
│
├── data/
│   └── products.json           # THE PRODUCT CATALOG — edit this to manage inventory
│
├── images/
│   ├── products/               # One folder per product: [slug]/1.jpg, 2.jpg, etc.
│   ├── brand/                  # Logo, favicon, hero images, texture backgrounds
│   └── team/                   # (optional) founder photo
│
├── assets/                     # All files extracted from tektonindiadesign.zip
│   └── configurator/           # Raw Claude Design output lives here
│
├── CLAUDE.md                   # This file
├── TASKS.md                    # Session-by-session task tracker
└── README.md                   # Setup and deployment instructions
```

---

## Design Tokens (use these everywhere — do not hardcode colors)
```css
--color-bg:           #0A0B0D;   /* Near-black background */
--color-surface:      #141518;   /* Cards, panels */
--color-border:       #2A2B2F;   /* Subtle dividers */
--color-brand:        #2ECC71;   /* Tekton green — use sparingly for CTAs */
--color-text-primary: #F5F6F7;   /* Headlines */
--color-text-muted:   #8A8B91;   /* Body copy, captions */
--color-wood:         #8B5E3C;   /* Wood accent color */
--color-resin:        #1A6B8A;   /* Default resin blue accent */
--font-display:       'Cormorant Garamond', serif;   /* Headlines — elegant, artisan */
--font-body:          'DM Sans', sans-serif;          /* Body — clean, modern */
```

---

## Product Catalog — products.json Schema
Every product entry must follow this exact structure:

```json
{
  "id": "black-brook",
  "name": "Black Brook",
  "subtitle": "River Resin Coffee Table",
  "category": "coffee-table",
  "tableType": "river",
  "resinPattern": "river",
  "resinColor": "black",
  "woodType": "mango",
  "shape": "rectangle",
  "price": 42000,
  "originalPrice": 49000,
  "inStock": false,
  "featured": true,
  "images": ["images/products/black-brook/1.jpg", "images/products/black-brook/2.jpg"],
  "description": "Full description here.",
  "dimensions": { "length": 48, "width": 24, "height": 18, "unit": "inches" },
  "tags": ["river", "black", "coffee-table", "bestseller"]
}
```

**Category values**: `dining-table`, `coffee-table`, `end-table`, `centre-table`, `console-table`
**Resin pattern values**: `river`, `multi-band`, `cookie`, `spiral`, `edge-frame`, `full-resin`
**Shape values**: `rectangle`, `oval`, `round`, `freeform-cookie`

---

## All 22 Existing Products (from tektonindia.com — pre-populate into products.json)

| ID | Name | Category | Pattern | Resin Color | Price (₹) | In Stock |
|----|------|----------|---------|-------------|-----------|----------|
| amber-love | Amber Love | end-table | edge-frame | golden-amber | 20499 | false |
| aureated-jade | Aureated Jade | end-table | edge-frame | jade-green | 20100 | false |
| azure-allure | Azure Allure | end-table | spiral | ocean-blue | 20499 | false |
| black-brook | Black Brook | coffee-table | river | black | 42000 | false |
| black-forest | Black Forest | dining-table | full-wood | none | 37500 | false |
| blue-eyes | Blue Eyes | end-table | cookie | ocean-blue | 16500 | true |
| celestial-stream-centre | Celestial Stream | centre-table | river | teal-blue | 69000 | false |
| celestial-stream-end | Celestial Stream End | end-table | river | teal-blue | 21200 | false |
| cerulean-glance | Cerulean Glance | end-table | cookie | cerulean | 18000 | true |
| crimson-bath | Crimson Bath | coffee-table | multi-band | crimson-red | 40000 | true |
| dove-tail | Dove Tail | coffee-table | multi-band | slate-grey | 45000 | true |
| elysian-basin | Elysian Basin | end-table | cookie | teal-blue | 18500 | false |
| emerald-allure | Emerald Allure | end-table | spiral | emerald-green | 20499 | true |
| lilac-illusion | Lilac Illusion | end-table | edge-frame | lilac | 20499 | true |
| onyx-rivulet | Onyx Rivulet | end-table | cookie | black | 16500 | false |
| periwinkle-nook | Periwinkle Nook | end-table | cookie | periwinkle | 17500 | true |
| royal-resplendent | Royal Resplendent | end-table | cookie | golden-blue | 18500 | true |
| sable-abyss | Sable Abyss | end-table | river | black | 17500 | true |
| sapphire-fiord | Sapphire Fiord | end-table | cookie | sapphire-blue | 18500 | true |
| serene-haven | Serene Haven | centre-table | river | teal-blue | 34500 | true |
| snowy-rancid | Snowy Rancid | end-table | cookie | white-pearl | 17000 | true |
| whispering-woods | Whispering Woods | dining-table | river | forest-green | 69000 | false |

---

## Before You Start Every Session
1. Read `TASKS.md` and identify the current active session
2. Check `data/products.json` exists and is valid JSON (`JSON.parse` test in browser console)
3. Verify image paths in products.json match actual files in `images/products/`
4. Open `index.html` locally in a browser to confirm last session's work renders correctly
5. GoDaddy file paths are **case-sensitive** on their Linux servers — always use lowercase filenames

---

## Known Pitfalls
- **Case sensitivity**: GoDaddy Linux hosting is case-sensitive. `Images/` ≠ `images/`. Always lowercase.
- **No server-side code**: This is a pure static site. No PHP, no Node, no `.htaccess` tricks beyond redirects.
- **Formspree endpoint**: Replace `YOUR_FORMSPREE_ID` in contact.html before launch.
- **Image optimization**: All product images must be under 200KB. Use `<img loading="lazy">` on gallery pages.
- **products.json editing**: Always validate JSON before saving — a missing comma breaks the entire product catalog.
- **Configurator integration**: The configurator lives in `assets/configurator/` and is loaded as a full page at `/configurator.html`. Do not try to iframe it — link to it directly.
- **admin.html**: This file is for local product management only. Add `<meta name="robots" content="noindex">` and do NOT link to it from the nav.

---

## Contact Form Setup (Formspree)
1. Go to https://formspree.io and create a free account
2. Create a new form — it gives you an endpoint like `https://formspree.io/f/XXXXXXXX`
3. Replace `YOUR_FORMSPREE_ID` in `contact.html` with that ID
4. Formspree free tier: 50 submissions/month. Sufficient for launch.

---

## GoDaddy Deployment Checklist
- [ ] Upload all files via GoDaddy File Manager or FTP (host: your-domain.com, use cPanel credentials)
- [ ] Set `index.html` as the default document (usually automatic)
- [ ] Test all pages live, especially products.json loading (check browser console for CORS errors)
- [ ] Set up a custom 404 page: create `404.html` and configure in GoDaddy cPanel
- [ ] Enable SSL: GoDaddy provides free SSL — activate it in cPanel under "SSL/TLS"
- [ ] Submit sitemap to Google Search Console after launch

---

## "Built By" Credit
The website footer and `/about.html` should include a tasteful "Website designed & built by [Studio Name]"
credit with a link. The studio name is TBD — use placeholder `[STUDIO_NAME]` for now and do a
find-replace when finalized. The studio's contact/portfolio link goes here too.

---

## Out of Scope for V1
- Payment processing / checkout (use "Request Quote" inquiry form instead)
- User accounts / login
- CMS (products managed via products.json)
- Blog / content section
- Multi-language support
