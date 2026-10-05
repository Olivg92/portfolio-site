// The three projects, in the order they are built: each one finished and
// documented before the next starts. A project's words exist in both
// languages, so a missing translation is a type error.
import type { Lang } from './i18n';
import type { ToolName } from './tools';
import { links } from './links';

// French puts a no-break space before a colon or a semicolon; written with a
// plain space here, for legibility.
const NBSP = String.fromCharCode(0xa0);
const t = (en: string, fr: string) => ({ en, fr: fr.replace(/ ([:;?!])/g, `${NBSP}$1`) });

export type Project = {
  name: string;
  status: 'finished' | 'building' | 'next';
  summary: Record<Lang, string>;
  stack: ToolName[];
  /** What a tool does in this project, on its card, under what the tool is. */
  here?: Partial<Record<ToolName, Record<Lang, string>>>;
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
      'kubernetes',
      'terraform',
      'eks',
      'k3d',
      'argo',
      'envoy',
      'externalsecrets',
      'vault',
      'prometheus',
      'grafana',
      'sloth',
      'githubactions',
    ],
    here: {
      kubernetes: t(
        'The platform runs on it twice, on k3d on a laptop and on EKS, at the same version.',
        'La plateforme y tourne deux fois, sur k3d sur un portable et sur EKS, dans la même version.',
      ),
      terraform: t(
        'Creates the VPC, the EKS cluster, its Spot nodes and IAM roles, 28 resources, then destroys them all.',
        'Crée le VPC, le cluster EKS, ses nœuds Spot et ses rôles IAM, 28 ressources, puis les détruit toutes.',
      ),
      eks: t(
        'Two Spot nodes and no NAT Gateway: about $0.18 an hour, and `make down` leaves nothing that bills.',
        "Deux nœuds Spot et pas de NAT Gateway : environ 0,18 $ de l'heure, et `make down` ne laisse rien qui facture.",
      ),
      k3d: t(
        'The whole platform on a laptop, in under 5 minutes from a fresh clone.',
        'Toute la plateforme sur un portable, en moins de 5 minutes depuis un clone neuf.',
      ),
      argo: t(
        'One manifest is applied by hand; Argo CD installs everything else from the repository, wave by wave.',
        'Un seul manifeste est appliqué à la main ; Argo CD installe tout le reste depuis le dépôt, vague par vague.',
      ),
      envoy: t(
        'The single way in, over HTTPS, to Grafana and to the demo API.',
        "L'unique entrée, en HTTPS, vers Grafana et vers l'API de démo.",
      ),
      externalsecrets: t(
        'Reads Vault on k3d and AWS Secrets Manager on EKS: only the store changes between the two.',
        'Lit Vault sur k3d et AWS Secrets Manager sur EKS : seul le coffre change entre les deux.',
      ),
      vault: t(
        'The secret store on k3d, in dev mode, standing in for AWS Secrets Manager.',
        "Le coffre sur k3d, en mode dev, à la place d'AWS Secrets Manager.",
      ),
      prometheus: t(
        'Scrapes the demo API and evaluates the burn-rate rules of its SLOs.',
        "Collecte les métriques de l'API de démo et évalue les règles de burn rate de ses SLO.",
      ),
      grafana: t(
        'The SLO dashboard, shipped with the application, behind the gateway.',
        "Le tableau de bord des SLO, livré avec l'application, derrière la gateway.",
      ),
      sloth: t(
        'Two SLOs of the demo API, availability and latency, become 6 groups of rules.',
        "Deux SLO de l'API de démo, disponibilité et latence, deviennent 6 groupes de règles.",
      ),
      githubactions: t(
        'The 14 checks of the repository on every pull request; the image built, scanned by Trivy and published from main.',
        "Les 14 contrôles du dépôt à chaque pull request ; l'image construite, scannée par Trivy et publiée depuis main.",
      ),
    },
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
      'astro',
      'typescript',
      'githubactions',
      'githubpages',
      'lighthouse',
    ],
    here: {
      astro: t(
        'Every page of this site, in two languages, with script only on the guided tour.',
        'Toutes les pages de ce site, en deux langues, avec du script seulement sur la visite guidée.',
      ),
      typescript: t(
        'The words of every page are typed: a missing translation fails the build.',
        'Les textes de chaque page sont typés : une traduction manquante fait échouer le build.',
      ),
      githubactions: t(
        'Links, types, the tour clicked through in Chrome and Lighthouse on every pull request, then the deployment.',
        'Liens, types, la visite cliquée dans Chrome et Lighthouse à chaque pull request, puis le déploiement.',
      ),
      githubpages: t(
        'Hosts this site, deployed with a short-lived OIDC token rather than a stored key.',
        "Héberge ce site, déployé avec un jeton OIDC éphémère plutôt qu'une clé stockée.",
      ),
      lighthouse: t(
        'Scores every page of each pull request, which fails if one falls under 90.',
        'Note chaque page de chaque pull request, qui échoue si l\'une passe sous 90.',
      ),
    },
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
      'python',
      'fastapi',
      'qdrant',
      'langfuse',
      'prometheus',
      'k6',
    ],
  },
];
