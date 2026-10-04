# portfolio-site

The portfolio of Olivier Guandalini, DevOps and SRE engineer: the projects, what each one shows,
and the debugging stories behind them.

**Live:** https://olivg92.github.io/portfolio-site/ in English, and
https://olivg92.github.io/portfolio-site/fr/ in French.

The site is online, checked and deployed, and its pages arrive one pull request at a time. Until
the real home page lands, a placeholder shows the first finished project, built with the design
system the other pages will use.

## How it is built

- **Astro, static output.** Plain HTML and CSS, a few lines of script where a page needs one, no
  client-side framework: the pages stay fast and readable without JavaScript.
- **Two languages.** English at the root, French under `/fr/`, with Astro's i18n routing. Every
  string lives in [`src/i18n.ts`](src/i18n.ts), typed so that a missing translation fails the
  build instead of leaving a blank.
- **One design system.** The look of the control room at night: colours, type and spacing scales
  are CSS variables in [`src/styles/tokens.css`](src/styles/tokens.css), and the components in
  [`src/components/`](src/components/) take every colour from there, so the look changes in one
  file. Every text colour has a contrast of 7:1 or more on the background.
- **Fonts served by the site itself.** Geist and Geist Mono come from their Fontsource packages
  through Astro's font settings: Latin subset only, preloaded, with fallback faces resized to
  Geist's metrics so the text does not move when the font arrives. No request leaves the site.
- **Deployed on every merge.** GitHub Actions builds the site and publishes it to GitHub Pages
  with a short-lived OIDC token issued for the run. No key or token is stored anywhere.

## Run it locally

With Node 22.12 or later (`.nvmrc` pins 24):

```bash
npm ci
npm run dev       # http://localhost:4321/portfolio-site/
```

Without a recent Node, the same in a container:

```bash
docker run --rm -it -p 4321:4321 -v "$PWD:/app" -w /app node:24 sh -c "npm ci && npm run dev -- --host"
```

## Checks

Every pull request runs them, and a failure blocks the merge:

| What | How |
|---|---|
| Whitespace, YAML and JSON, private keys, secrets, workflow mistakes | `pre-commit`, the same hooks as locally: `pre-commit run -a` |
| Types | `npm run check` (`astro check`) |
| Dead links, internal and external, and anchors within a page | linkinator, crawling the built site; LinkedIn is skipped, as it answers anything but a browser with HTTP 999 |
| Performance, accessibility, best practices, SEO | Lighthouse CI on both languages, 90 or more on each |

Actions are pinned by commit, and Dependabot raises the pull requests that move them.

## Layout

```
src/
├── i18n.ts               # every string, in both languages
├── links.ts              # every address the site links to
├── layouts/Base.astro    # metadata, fonts, language links, header and footer
├── components/
│   ├── Home.astro        # the home page, shared by both languages
│   ├── SiteHeader.astro  # name, contact link, EN/FR switch
│   ├── SiteFooter.astro  # the contact section, on every page
│   ├── Button.astro      # a link styled as a button, primary or ghost
│   ├── Chip.astro        # a short label: a technology, a status
│   ├── Panel.astro       # a pane of glass for a block that stands alone
│   ├── Terminal.astro    # a transcript, coloured as a terminal shows it
│   └── Icon.astro
├── pages/
│   ├── index.astro       # English, at the root
│   ├── fr/index.astro    # French
│   └── 404.astro         # in both languages
└── styles/
    ├── tokens.css        # colours, type, sizes, spacing
    └── global.css        # background, type, links, layout helpers
.github/workflows/
├── ci.yml                # the checks above
└── deploy.yml            # build, then publish to GitHub Pages
```
