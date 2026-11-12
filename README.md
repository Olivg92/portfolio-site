# portfolio-site

The portfolio of Olivier Guandalini, DevOps and SRE engineer: the projects, and what each one
shows.

**Live:** https://oguandalini.com/ in English, and https://oguandalini.com/fr/ in French.

The home page answers a recruiter in one screen of tiles (role, a plain sentence, years, place,
languages, the CV, figures, the flagship project and the tools), then shows strengths, career and
the two projects. The guided tour of platform-eks-gitops walks through the project command by
command. The experience page tells what I do at work as problems solved, then the tools, the path
and the education.

## How it is built

- **Astro, static output.** Plain HTML and CSS, a few lines of script where a page needs one, no
  client-side framework: the pages stay fast and readable without JavaScript.
- **Two languages.** English at the root, French under `/fr/`, with Astro's i18n routing. Every
  string lives in [`src/i18n.ts`](src/i18n.ts), typed so that a missing translation fails the
  build instead of leaving a blank.
- **One design system, by day and by night.** Colours, type and spacing scales are CSS variables
  in [`src/styles/tokens.css`](src/styles/tokens.css), and the components in
  [`src/components/`](src/components/) take every colour from there, so the look changes in one
  file. By day, the default: the signal colours of a control room (cyan, green, magenta,
  violet) in daylight, as an aurora behind frosted tiles on a pale page, every text colour at a
  contrast of 5:1 or more. By night, for any element with the `night` class: the control room
  itself, every text colour at 7:1 or more. The guided tour is at night, and so are a terminal
  wherever one appears and the home page's CV tile. The header is a pill of frosted glass that
  stays at the top of the screen, except in the tour, whose drawing holds the top there.
- **Drawings computed at build time.** The flagship project's three layers on the home page
  (AWS, Kubernetes, Argo CD) are a small inline SVG,
  [`Slabs.astro`](src/components/Slabs.astro), coloured by the tokens. The logos in
  [`src/logos.ts`](src/logos.ts) come from Simple Icons, the AWS Architecture Icons and the
  External Secrets repository, inline so that they cost no request.
- **A guided tour made of real runs.** The tour of platform-eks-gitops has 18 steps, from
  `git clone` to `make down`. Every terminal block in it is what the command printed, captured
  in [`src/tour/transcripts/`](src/tour/transcripts/), never a mock-up; an AWS account ID or an
  address is masked. Its drawing is computed at build time
  ([`src/tour/scene.ts`](src/tour/scene.ts)), and the one script of the site follows the
  scroll, on that page only. On a phone the drawing has a tighter layout of its own, the same
  platform with smaller chips and closer rows, framed on each step as on a wide screen, so that
  no word of it is under 8 px. Without the script, the tour reads as a page.
- **An experience page that names no employer.** Its words live in
  [`src/experience.ts`](src/experience.ts), in both languages. Employers are described by their
  kind, and the page says how I work, never what belongs to the company: no host, product,
  company figure, unannounced plan or security detail. On a phone, where the seven problems
  took seven screens, each folds to its number, title and tools, and its story unfolds from a
  line at the foot of the card, growing and fading in, and folds back the same way: a native
  `<details>`, no script. A wide screen shows every story beside its title, as before, and so
  does paper.
- **Motion that hides nothing.** Blocks rise into view as the page scrolls, and what they hold
  follows in order, as on a product page. A few lines of script in the layout mark each block as
  it comes into view, and CSS plays the animation; without script, or for anyone who asks for
  less motion, everything is simply there. A block on its way is nearly transparent, never
  fully: Safari on iPhone drops the click of a tap during which a link or a button turns visible
  from opacity 0, so a tap on a chip while the next blocks arrive would only close the open
  card. On a touch screen the lights behind the page fade before the top and bottom edges, where
  Safari floats its bars and tints them with the page's colour; the sticky header draws its
  glass on a bar inside it, not on itself, for the same reason. From page to page, the page fades into
  the next while the header stays put (cross-document view transitions, CSS only), and on a
  screen with a mouse a panel lifts under the pointer.
- **Tools that explain themselves.** Every tool on the site is a chip: a click, a tap, or on
  Chrome and Edge a pointer resting on it, opens a card with what the tool is and, on a
  project, what it does there. The tools and their words live in one catalogue,
  [`src/tools.ts`](src/tools.ts). No script needed: the card is a native popover, anchored to
  its chip by CSS, and a sheet at the bottom of a phone's screen. There, a few lines in the
  layout close the sheet once the page scrolls on, as it would cover what comes up; a slight
  move does not count, and without script it stays until a tap elsewhere. A card fades out
  when it closes only where the browser keeps it above the page while it does. Safari cannot,
  as it has no `overlay`: the fading card fell back into its panel, over the chips, and the
  tap meant for the next chip landed on it. There the card closes at once, except when the
  scroll closes it: the script fades it out while it is still open, then closes it.
- **Other sites in a new tab.** GitHub and LinkedIn open in a new tab, so that the portfolio
  stays open behind them. The arrow on the button already says it is another site, and screen
  readers hear that it opens a new tab. Links within the site open where they are.
- **A page that prints as a CV.** Printed, or saved as a PDF, the experience page fits on three
  A4 pages. On paper the same tokens turn light: black text, the signal colours darkened, no sky
  and no glow. A chip reads as its name, every story shows, the header gives the site's address
  and the contact its addresses. Every page prints in the same light, and the screen does not
  change.
- **The CV as a PDF to download.** That printed page is also a file, one per language, linked
  from the experience page and from the contact section of every page:
  [`scripts/cv-pdf.mjs`](scripts/cv-pdf.mjs) saves it with Chrome from the served build, at
  `/cv/olivier-guandalini-cv-en.pdf` and `-fr.pdf` ([`src/cv.ts`](src/cv.ts) names them), in CI
  and before each deployment. It is tagged for screen readers, its headings are bookmarks, and
  it fails at more than three pages. The files are built, not committed: `npm run dev` links to
  a CV it does not have.
- **Link previews.** A link to the site on LinkedIn, or in a message, shows the page's title,
  description and a picture drawn from the page itself, in its language. The pictures are drawn
  by [`scripts/og-images.mjs`](scripts/og-images.mjs) from a served build (`npm run og`), and
  committed in [`public/og/`](public/og/): they only change when the look of a page does.
- **Found by search engines.** [`robots.txt`](src/pages/robots.txt.ts) names the sitemap,
  which `@astrojs/sitemap` writes at each build: every page but the 404, each with its other
  language. The home page describes its subject in JSON-LD ([`src/structured.ts`](src/structured.ts)):
  a `ProfilePage` about a `Person`, with his job, what he knows, his schools and his LinkedIn
  and GitHub, so that a search for the name can tie them to the site. As everywhere on the
  site, no employer: no `worksFor`, no affiliation. Google Search Console and Bing Webmaster
  Tools verify the domain by a DNS record, so nothing of theirs lives in this repository.
- **Fonts served by the site itself.** Bricolage Grotesque for headings, with its optical size
  axis, Manrope for text, and Geist Mono for the terminal transcripts of the tour come from their
  Fontsource packages through Astro's font settings: Latin subset only, Bricolage and Manrope
  preloaded on every page and Geist Mono at night, with fallback faces resized to each font's
  metrics so the text does not move when it arrives. No request leaves the site.
- **Logos for both lights.** A brand mark carries two colours, deepened to a contrast of 3:1 on
  the pale page and lightened to 3:1 on the night ([`src/logos.ts`](src/logos.ts)): a chip picks
  the one of its hour, and the drawings that are always at night take the night's at build time.
- **Deployed on every merge.** GitHub Actions builds the site and publishes it to GitHub Pages
  with a short-lived OIDC token issued for the run. No key or token is stored anywhere.

## Run it locally

With Node 22.23.4 or later (`.nvmrc` pins 24):

```bash
npm ci
npm run dev       # http://localhost:4321/
```

Without a recent Node, the same in a container:

```bash
docker run --rm -it -u "$(id -u):$(id -g)" -e HOME=/tmp -p 127.0.0.1:4321:4321 \
  -v "$PWD:/app" -w /app node:24 sh -c "npm ci && npm run dev -- --host"
```

`-u` keeps what the container writes (`node_modules/`, `dist/`) yours rather than root's, and the
port stays on this machine.

## Checks

Every pull request runs them, and a failure blocks the merge:

| What | How |
|---|---|
| Whitespace, YAML and JSON, private keys, workflow mistakes | `pre-commit`, the same hooks as locally: `pre-commit run -a` |
| Secrets in any commit of the pull request, even one a later commit deletes | gitleaks on the commits themselves, since its pre-commit hook reads what is staged and a CI checkout stages nothing. Locally: `gitleaks git --redact --log-opts="origin/main..HEAD"` |
| Types | `npm run check` (`astro check`) |
| Dead links, internal and external, and anchors within a page | linkinator, crawling the built site; LinkedIn is skipped, as it answers anything but a browser with HTTP 999 |
| The guided tour, used as a reader uses it | [`scripts/check-tour.mjs`](scripts/check-tour.mjs) in Chrome, on a wide screen and on a phone: its buttons and chapters, clicked; the end of the page; on a phone, each step's drawing framed whole, no word of it under 8 px |
| The tool cards, used as a reader uses them | [`scripts/check-cards.mjs`](scripts/check-cards.mjs) with Playwright, in Chrome and in WebKit (the engine of Safari), on a wide screen and on a phone: each chip has its card, which opens inside the screen, at the bottom of a phone's and no taller than its words, and closes; on a phone, a tap elsewhere closes it with the page left where it is, and so does scrolling on, fading it out first, though a slight move does not; with a card open, a chip further down or beside it opens its own; no chip or link waits fully transparent; a closing card goes at once where the browser cannot keep it above the page |
| What search engines read | [`scripts/check-seo.mjs`](scripts/check-seo.mjs), reading the build: `robots.txt` names a sitemap of this build; the sitemap lists every indexable page, each with both languages, and nothing else; each such page has a title, a description, a canonical address pointing at itself and its `hreflang` links; the 404 asks not to be indexed and stays out; the structured data parses, the home pages describe Olivier with his LinkedIn and GitHub, and it has no `worksFor`, `affiliation`, `employee` or `memberOf` key, under any prefix |
| The CV, as a PDF | [`scripts/cv-pdf.mjs`](scripts/cv-pdf.mjs) in Chrome, from the served build, before the dead-link check: one PDF per language, three A4 pages at most |
| Links to other sites | [`scripts/check-new-tab.mjs`](scripts/check-new-tab.mjs), reading the built pages: every link to another site opens in a new tab, with `rel="noopener"`, and says so to screen readers; no link within the site does |
| The solved problems, folded on a phone | [`scripts/check-experience.mjs`](scripts/check-experience.mjs) with Playwright, in Chrome and in WebKit, on a wide screen and on a phone: on a phone, each problem folded, unfolded whole by a tap, lit as it comes into view, folded again by a second tap; every story beside its title on a wide screen, and on paper; saved as a PDF in Chrome, three A4 pages at most; in Chrome, screen readers get the stories and skip a folded one |
| Performance, accessibility, best practices, SEO | Lighthouse CI on every page, in both languages, 90 or more on each |

Actions are pinned by commit, and Dependabot raises the pull requests that move them. The tour
check and the link previews drive Chrome through its DevTools protocol, with nothing to install
but Chrome; against a served build (`npm run build && npm run preview`), `npm run check:tour`
runs the tour's check. The checks of the cards and of the solved problems need Playwright and
its browsers, which its image has:

```bash
docker run --rm --network host -u "$(id -u):$(id -g)" -e HOME=/tmp -v "$PWD:/app" -w /app \
  mcr.microsoft.com/playwright:v1.63.0-noble \
  sh -c "npm install --no-save playwright@1.63.0 && node scripts/check-cards.mjs && node scripts/check-experience.mjs"
```

## Layout

```
src/
├── i18n.ts               # every string, in both languages
├── projects.ts           # the two projects: status, summary, stack
├── experience.ts         # the words of the experience page, in both languages
├── tools.ts              # every tool on the site: what it is, and its kind
├── tour/
│   ├── steps.ts          # the 18 steps of the guided tour, in both languages
│   ├── scene.ts          # its drawing, step by step, for a wide screen and for a phone
│   └── transcripts/      # what each command printed in a real run
├── logos.ts              # the logos of the tools, drawn inline
├── links.ts              # every address the site links to
├── cv.ts                 # the names of the CV's PDFs
├── structured.ts         # the JSON-LD of the home page: who the site is about
├── layouts/Base.astro    # metadata, fonts, language links, header and footer
├── components/
│   ├── Home.astro        # the home page: a grid of tiles, then strengths, career and projects
│   ├── Tile.astro        # a tile of frosted glass, the block of the home page
│   ├── Slabs.astro       # the flagship project's three layers
│   ├── ProjectCard.astro # one project, with its stack, its tour and its code
│   ├── Experience.astro  # the experience page, shared by both languages
│   ├── ToolChip.astro    # a tool's chip, with the card it opens
│   ├── ToolCard.astro    # that card: a popover, a sheet at the bottom of a phone
│   ├── Tour.astro        # the guided tour, and the one script of the site
│   ├── TourScene.astro   # the drawing of the tour
│   ├── SiteHeader.astro  # name, contact link, EN/FR switch
│   ├── SiteFooter.astro  # the contact section, on every page
│   ├── Button.astro      # a link styled as a button, primary or ghost
│   ├── Chip.astro        # a short label: a technology with its logo, a status
│   ├── Panel.astro       # a pane of glass for a block that stands alone
│   ├── Terminal.astro    # a transcript, coloured as a terminal shows it
│   ├── Logo.astro        # a tool's logo
│   └── Icon.astro
├── pages/
│   ├── index.astro       # English, at the root
│   ├── platform-eks-gitops/index.astro  # the guided tour
│   ├── experience/index.astro           # the experience page
│   ├── fr/                # the same pages, in French
│   ├── 404.astro         # in both languages
│   └── robots.txt.ts     # robots.txt, naming the sitemap
└── styles/
    ├── tokens.css        # colours, type, sizes, spacing
    └── global.css        # background, type, links, layout helpers
scripts/
├── check-tour.mjs        # the guided tour, clicked through in Chrome
├── check-cards.mjs       # the tool cards, in Chrome and WebKit
├── check-experience.mjs  # the solved problems, folded and unfolded, in Chrome and WebKit
├── check-new-tab.mjs     # links to other sites open in a new tab, read from the build
├── check-seo.mjs         # robots.txt, sitemap, metadata and structured data, read from the build
├── cv-pdf.mjs            # the CV, one PDF per language, saved from the experience page
├── og-images.mjs         # the pictures of link previews
└── lib/cdp.mjs           # a minimal Chrome DevTools client
public/og/                # the pictures, one per page and language
.github/workflows/
├── ci.yml                # the checks above
└── deploy.yml            # build, then publish to GitHub Pages
```
