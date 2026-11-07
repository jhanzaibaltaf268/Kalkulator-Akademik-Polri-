# Kalkulator Jasmani Polri — hub site

Static HTML for Vercel. No framework, no build step, no external fonts or images.
Phase 1 of the plan in the SEO doc: homepage (hub) + hub-and-spoke skeleton.

## Before you deploy: three find-and-replace tokens

| Token | Appears in | Replace with |
|---|---|---|
| `https://kalkulator-jasmani-polri.vercel.app` | every page, `robots.txt`, `sitemap.xml`, `_partials/build_pages.py` | the real domain, no trailing slash |
| `Kalkulator Jasmani` / `Kalkulator<b>Jasmani</b>` | header, footer, schema, `og:site_name` | the brand name |
| `isi alamat email...` | `kontak.html` (and `_partials/build_pages.py`) | a real mailbox on the domain |

One command for the domain:

```bash
grep -rl 'kalkulator-jasmani-polri.vercel.app' . \
  | xargs sed -i 's|https://kalkulator-jasmani-polri\.vercel\.app|https://YOURDOMAIN.com|g'
```

Then set `SITE` and `BRAND` at the top of `_partials/build_pages.py` to match.

## Looking at it locally

Double-click any `.html` file and the whole site works: styling, navigation, the
calculators. Every internal link is relative and carries the `.html` extension, and
every asset path is relative too, so the pages behave the same from `file://` as they
do on Vercel. No local server needed.

## The scoring data — read this before launch

`_partials/nilai_anchors.json` is the single source of truth for every nilai on the
site. `assets/js/nilai-data.js` and the six tables inside `index.html` are both
generated from it, so the calculator and the printed tables can never disagree.

```bash
python3 _partials/gen_nilai.py     # after editing the JSON
```

What the numbers are, honestly: the official table lives in **SKEP Kapolri No.Pol:
SKEP/984/XII/2004**, which is not published online in full. So each item carries two
sourced anchors — the result that scores 100, and the result that scores 0 — and the
values between them are linear. The nilai-100 anchors agree across several independent
sources; the lower anchors for push up and renang are assumptions and are flagged as
such in the JSON and on `/metodologi`. Replace the anchors (or swap the model for the
real table) once you have the document, re-run the generator, and every table, the
worked example and the calculator update together.

The formula itself is well sourced and implemented as written:
`Nilai B = average of pull up, sit up, push up, shuttle run`,
`NKJ = (Nilai A + Nilai B) / 2`, NBL 41, and a zero on any scored item fails the test.

## Files

```
index.html                         hub, served at /
kalkulator-akademik-polri.html     spoke, indexable
kalkulator-nilai-akhir-polri.html  spoke, indexable
kalkulator-tes-polri.html          overview, indexable
tentang.html metodologi.html kontak.html            trust pages, indexable
kebijakan-privasi.html syarat-ketentuan.html disclaimer.html
404.html                           served by Vercel on a miss
assets/css/style.css               the one stylesheet
assets/js/nilai-data.js            GENERATED scoring engine - do not hand-edit
assets/js/calculator.js            calculator UI only
_partials/nilai_anchors.json       the scoring anchors, single source of truth
_partials/gen_nilai.py             regenerates nilai-data.js + the tables
vercel.json robots.txt sitemap.xml ads.txt
_partials/build_pages.py           regenerates every page except index.html
```

`index.html` is hand-maintained because it is the only page with full content.
Everything else comes out of `_partials/build_pages.py` — edit the partials there and run:

```bash
python3 _partials/build_pages.py
```

## The partials (single source, in build_pages.py)

- `HEADER` — skip link, logo, CSS-only mobile menu, nav. `aria-current` set per page.
- `FOOTER` — three columns plus the legal strip.
- `AUTHOR_BOX` — redaksi + "bukan situs resmi Polri" line. Needed for AdSense review.
- `RELATED` / `CARD` / `ALL_CALCS` — the related-calculators block. Add a spoke to
  `ALL_CALCS` and it appears on every other page automatically.
- `SPOKE_BODY` — the spoke template: breadcrumb, H1, calculator slot, how-it-is-scored,
  FAQ, related calculators, author box.
- `SCHEMA_PAGE` / `SCHEMA_APP` — JSON-LD. Both reference the hub's `#website` and `#org`
  @ids, so the homepage stays the schema root.

When you copy the header or footer into `index.html` by hand, copy it from this file,
not from another page.

## Reserved space (do not change without re-measuring CLS)

- `.calc-slot` — `min-height: 520px` mobile, 460px from 640px up.
- `.ad-slot` — `min-height: 280px` mobile, 100px from 740px up. Three slots:
  after the result explainer, inside the explainer content, before the FAQ.
  No slot above the calculator.

## Pages, and what each one does

All ten pages are indexable and listed in `sitemap.xml`. `404.html` is noindex.

| Page | Calculator | Data behind it |
|---|---|---|
| `index.html` | jasmani, six items | `_partials/nilai_anchors.json` |
| `kalkulator-akademik-polri.html` | benar / soal per mata uji | plain arithmetic, equal weights |
| `kalkulator-nilai-akhir-polri.html` | weighted average across tahapan | weights the user types in |
| `kalkulator-tes-polri.html` | none, it is the overview | the 13-stage table |
| the six trust pages | none | — |

The two spoke calculators share `assets/js/spoke-calc.js`, picked by `data-calc-mode`
on the form (`akademik` or `bobot`). Rows are plain HTML marked `data-calc-row`, so a
new row needs no JavaScript change.

## Before you submit to Search Console

1. Replace the domain token and set `SITE` in both `_partials/*.py`, then re-run both
   generators so canonicals, the sitemap and the schema @ids all point at the real host.
2. Put a real email on `kontak.html`.
3. Deploy, then open `https://yourdomain/robots.txt` and `/sitemap.xml` and check they
   show the real domain.
4. Add the property in Search Console as a **domain property** and verify by DNS, so
   both apex and www are covered.
5. Submit `sitemap.xml`, then use URL Inspection on the homepage and request indexing.
6. Add the same site to Bing Webmaster Tools and import from Search Console.

`lastmod` in the sitemap is hand-maintained. Change the date on a page only when its
content actually changes — a date that moves on every deploy teaches Google to ignore it.

## Notes on the plan

- URLs keep the `.html` extension (`cleanUrls: false`, `trailingSlash: false`). That is
  deliberate: with relative `.html` links the site works identically by double-click and
  on Vercel, and there is no redirect between internal pages. Google treats `/tentang.html`
  and `/tentang` the same, so the extension costs nothing in search. The one redirect in
  `vercel.json` sends `/index.html` to `/` so the homepage has a single address.
  To switch to extensionless URLs later, flip `cleanUrls` to true and rewrite the links,
  canonicals and sitemap together - but do it before the site is indexed, not after.
- No scoring values are invented anywhere. Every table ships with its structure and a
  `[TODO]` cell until the official document is confirmed.
- Outbound links are only to `penerimaan.polri.go.id` and `polri.go.id`. The regulation
  link is a TODO because its name and number are not confirmed.
- Still to produce before launch: `/assets/og-default.png` (1200x630), `/assets/icon-180.png`,
  `/assets/logo.png` for the Organization schema.
