# PromptShot

Free, interactive prompt builder for AI product photography and UGC ads. Pick product type, platform, and style — get a complete, platform-safe prompt for any AI image generator (ImagineArt, Freepik, GPT Image, Midjourney, Flux…).

**Zero dependencies.** Plain HTML/CSS/JS, no build step, no external requests (system fonts, inline SVG favicon). The whole builder runs client-side.

## Files

| File | What it is |
|---|---|
| [index.html](index.html) | The landing page + embedded builder |
| [css/styles.css](css/styles.css) | All styling (dark theme, responsive) |
| [js/app.js](js/app.js) | Prompt recipe data + assembly engine |
| [docs/landing-page-copy.md](docs/landing-page-copy.md) | Stage 5 copy deck (source of truth for page copy) |
| `.claude/serve.ps1` | Dev-only local static server (PowerShell, no Node needed) |

## Run locally

Open `index.html` directly in a browser, or serve it:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .claude/serve.ps1
# → http://localhost:3000
```

## Deploy

Any static host takes this folder as-is: Cloudflare Pages, Netlify, Vercel, GitHub Pages. No build command, output directory = repo root.

## Before launch — placeholder checklist

Search the code for `TODO` to find every spot. In short:

1. **Affiliate links** — in `js/app.js`, `GENERATORS[*].affiliate` is `null`; drop in your real ImagineArt / Freepik affiliate URLs (plain product URLs are used until then). Verify program terms first (commission, payout method, country eligibility).
2. **Fiverr gig URL** — two `href="#"` links marked `data-placeholder="fiverr-gig"` in `index.html` (gig section + footer).
3. **Domain** — `canonical` and `og:url` point at `promptshot.example.com`; also verify the PromptShot name for domain availability + trademark.
4. **OG image** — create a 1200×630 social share image and add `og:image`.
5. **Social proof images** — drop the three ad-creative images into `img/` as `proof-1.jpg`, `proof-2.jpg`, `proof-3.jpg` (see `img/SAVE-IMAGES-HERE.txt`); the page shows labeled dashed slots until they exist. Swap in testimonial cards as Fiverr reviews arrive.
6. **Pressure-test the copy** against the shipped builder before publishing (per the copy deck's publishing notes).

## How the prompt engine works

`js/app.js` assembles prompts from four layers:

- **Product type** → material/detail language (fabric weave, label legibility, fingerprint-free surfaces…)
- **Style** → opener + scene + lighting + camera (three-point softbox / golden-hour window light / 100mm macro…)
- **Platform** → aspect ratio + composition with real safe zones (TikTok's bottom quarter + right rail, Reel's top 12% / bottom 20%, feed's center-square crop, marketplace pure-white compliance)
- **Quality tail** → commercial photography grading terms

Special cases: marketplace listings force a pure-white compliant background over any scene-based style (with an explanatory note in the UI), and Midjourney mode strips negative words from prose (MJ treats them as attractors) in favor of `--no` flags, plus `--ar` and `--style raw`.

**Product photo reference mode:** users can add their own product photo (click / drop / paste). The prompt then switches to image-reference language — preserve the exact product, restage the scene — and the photo's dominant colors (extracted on a canvas in the browser; nothing is uploaded) drive a "color story" line. Midjourney is the exception: its prompt stays descriptive and the UI tells the user to supply the photo as an Omni-Reference (`--oref`).
