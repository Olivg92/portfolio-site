// The structured data of the home page, in JSON-LD, read by search engines:
// who the site is about, and where else he is (LinkedIn, GitHub), so that a
// search for the name can tie them together. As everywhere on the site, the
// employer is never named: no worksFor, no affiliation. scripts/check-seo.mjs
// checks the built pages for it.
import { links } from './links';
import { ui, type Lang } from './i18n';

const name = 'Olivier Guandalini';

/** What the person knows, in the words search engines and recruiters use. */
const knowsAbout = [
  'DevOps',
  'Site reliability engineering',
  'Platform engineering',
  'Linux',
  'Kubernetes',
  'Rancher',
  'Terraform',
  'Ansible',
  'GitOps',
  'Argo CD',
  'Amazon Web Services',
  'Amazon EKS',
  'HashiCorp Vault',
  'Prometheus',
  'Grafana',
  'Datadog',
  'Elastic Stack',
  'CI/CD',
];

/** The graph of the home page in `lang`, found at `page` on `site`. */
export function profilePage(lang: Lang, page: URL, site: URL) {
  const t = ui[lang];
  const home = new URL('/', site).href;
  const website = `${home}#website`;
  const person = `${home}#person`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebSite', '@id': website, url: home, name, inLanguage: ['en', 'fr'] },
      {
        '@type': 'ProfilePage',
        '@id': `${page.href}#page`,
        url: page.href,
        name: t.title,
        description: t.description,
        inLanguage: lang,
        isPartOf: { '@id': website },
        mainEntity: { '@id': person },
      },
      {
        '@type': 'Person',
        '@id': person,
        name,
        givenName: 'Olivier',
        familyName: 'Guandalini',
        url: home,
        jobTitle: t.jobTitle,
        description: t.description,
        sameAs: [links.linkedin, links.github],
        knowsLanguage: ['fr', 'en'],
        knowsAbout,
        alumniOf: [
          { '@type': 'CollegeOrUniversity', name: 'Sup de Vinci' },
          { '@type': 'CollegeOrUniversity', name: "IUT de Ville-d'Avray" },
        ],
      },
    ],
  };
}

/** JSON for a script element: `<` escaped, so no string can close it. */
export const jsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');
