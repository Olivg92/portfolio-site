# portfolio-site

The portfolio of Olivier Guandalini, DevOps and SRE engineer: the projects, what each one shows,
and the debugging stories behind them.

**Live:** https://olivg92.github.io/portfolio-site/ in English, and
https://olivg92.github.io/portfolio-site/fr/ in French.

This is the skeleton: the site is online, checked and deployed, and its pages arrive one pull
request at a time.

## How it is built

- **Astro, static output.** Plain HTML and CSS, a few lines of script where a page needs one, no
  client-side framework: the pages stay fast and readable without JavaScript.
- **Two languages.** English at the root, French under `/fr/`, with Astro's i18n routing. Every
  string lives in [`src/i18n.ts`](src/i18n.ts), typed so that a missing translation fails the
  build instead of leaving a blank.
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
| Dead links, internal and external | linkinator, crawling the built site |
| Performance, accessibility, best practices, SEO | Lighthouse CI on both languages, 90 or more on each |

Actions are pinned by commit, and Dependabot raises the pull requests that move them.

## Layout

```
src/
├── i18n.ts               # every string, in both languages
├── layouts/Base.astro    # metadata, language links, the link to the other language
├── components/Home.astro # the home page, shared by both languages
├── pages/
│   ├── index.astro       # English, at the root
│   ├── fr/index.astro    # French
│   └── 404.astro         # in both languages
└── styles/global.css
.github/workflows/
├── ci.yml                # the checks above
└── deploy.yml            # build, then publish to GitHub Pages
```
