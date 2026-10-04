// The three projects, in the order they are built: each one finished and
// documented before the next starts. A project's words exist in both
// languages, so a missing translation is a type error.
import type { Lang } from './i18n';
import type { LogoName } from './logos';
import { links } from './links';

export type Project = {
  name: string;
  status: 'finished' | 'building' | 'next';
  summary: Record<Lang, string>;
  stack: { name: string; logo?: LogoName }[];
  /** The repository, once there is code to read in it. */
  code?: string;
  /** The page of its guided tour, without the language prefix. */
  tour?: string;
};

export const projects: Project[] = [
  {
    name: 'platform-eks-gitops',
    status: 'finished',
    summary: {
      en: 'A Kubernetes platform developed on a laptop with k3d, then validated on AWS EKS. Argo CD installs every component from git, no secret lives in the repository, the demo API has SLOs with burn-rate alerts, and one command tears the AWS side down.',
      fr: "Une plateforme Kubernetes développée sur un portable avec k3d, puis validée sur AWS EKS. Argo CD installe chaque composant depuis git, aucun secret n'est dans le dépôt, l'API de démo a ses SLO et ses alertes de burn rate, et une seule commande détruit la partie AWS.",
    },
    stack: [
      { name: 'Kubernetes', logo: 'kubernetes' },
      { name: 'Terraform', logo: 'terraform' },
      { name: 'AWS EKS', logo: 'eks' },
      { name: 'k3d' },
      { name: 'Argo CD', logo: 'argo' },
      { name: 'Envoy Gateway', logo: 'envoy' },
      { name: 'External Secrets', logo: 'externalsecrets' },
      { name: 'Vault', logo: 'vault' },
      { name: 'Prometheus', logo: 'prometheus' },
      { name: 'Grafana', logo: 'grafana' },
      { name: 'Sloth' },
      { name: 'GitHub Actions', logo: 'githubactions' },
    ],
    code: links.platform,
    tour: 'platform-eks-gitops/',
  },
  {
    name: 'portfolio-site',
    status: 'building',
    summary: {
      en: 'This site. Static pages in two languages, with script only on the guided tour, checked on every pull request (links, types, Lighthouse at 90 or more), then deployed to GitHub Pages with a short-lived OIDC token rather than a stored key.',
      fr: "Ce site. Des pages statiques en deux langues, du script seulement sur la visite guidée, vérifiées à chaque pull request (liens, types, Lighthouse à 90 ou plus), puis déployées sur GitHub Pages avec un jeton OIDC éphémère plutôt qu'une clé stockée.",
    },
    stack: [
      { name: 'Astro', logo: 'astro' },
      { name: 'TypeScript', logo: 'typescript' },
      { name: 'GitHub Actions', logo: 'githubactions' },
      { name: 'GitHub Pages', logo: 'github' },
      { name: 'Lighthouse', logo: 'lighthouse' },
    ],
    code: links.source,
  },
  {
    name: 'llm-platform-sre',
    status: 'next',
    summary: {
      en: 'An LLM application run like any production service: a RAG API deployed on the platform above, with SLOs made for AI (end-to-end latency, provider errors, token cost per request), dashboards, runbooks and load tests.',
      fr: "Une application LLM exploitée comme n'importe quel service de production\u00a0: une API RAG déployée sur la plateforme ci-dessus, avec des SLO pensés pour l'IA (latence de bout en bout, erreurs du fournisseur, coût en tokens par requête), des dashboards, des runbooks et des tests de charge.",
    },
    stack: [
      { name: 'Python', logo: 'python' },
      { name: 'FastAPI', logo: 'fastapi' },
      { name: 'Qdrant', logo: 'qdrant' },
      { name: 'Langfuse' },
      { name: 'Prometheus', logo: 'prometheus' },
      { name: 'k6', logo: 'k6' },
    ],
  },
];
