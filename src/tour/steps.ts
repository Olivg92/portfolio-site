// The guided tour of platform-eks-gitops: eighteen steps, from `git clone` to
// `make down`. Each step says what a command does, shows what it printed in
// transcripts/ (a real run, never a mock-up), and gives the scene its one
// number. The scene itself is drawn by scene.ts, step by step.
import type { Lang } from '../i18n';
import clone from './transcripts/clone.txt?raw';
import checkTools from './transcripts/check-tools.txt?raw';
import localUp from './transcripts/local-up.txt?raw';
import localVerify from './transcripts/local-verify.txt?raw';
import explore from './transcripts/explore.txt?raw';
import demoBreak from './transcripts/demo-break.txt?raw';
import localDown from './transcripts/local-down.txt?raw';
import awsSetup from './transcripts/aws-setup.txt?raw';
import plan from './transcripts/plan.txt?raw';
import up from './transcripts/up.txt?raw';
import awsVerify from './transcripts/aws-verify.txt?raw';
import down from './transcripts/down.txt?raw';
import lint from './transcripts/lint.txt?raw';

export type Chapter = 'prepare' | 'local' | 'aws' | 'continuous';
type Text = Record<Lang, string>;

export type Step = {
  /** The anchor of the step, the same in both languages. */
  id: string;
  chapter: Chapter;
  title: Text;
  body: Text;
  /** The make target the step runs, when `make local-up` or `make up` calls it. */
  target?: string;
  transcript: string;
  /** The line of the transcript the step explains, counted from 0. */
  current?: number;
  /** The number the scene shows for this step, and what it counts. */
  metric: { value: Text; caption: Text };
};

// French puts a no-break space before a colon or a semicolon, so neither
// starts a line on its own; written with a plain space here, for legibility.
const NBSP = String.fromCharCode(0xa0);
const t = (en: string, fr: string): Text => ({ en, fr: fr.replace(/ ([:;?!])/g, `${NBSP}$1`) });

// The first lines of a transcript, and the index of the first line holding
// some words: a step of `make local-up` shows the lines printed so far.
const head = (text: string, lines: number) => text.split('\n').slice(0, lines).join('\n');
const lineOf = (text: string, words: string) => text.split('\n').findIndex((line) => line.includes(words));
const until = (text: string, words: string) => head(text, lineOf(text, words) + 1);

export const chapters: { id: Chapter; name: Text }[] = [
  { id: 'prepare', name: t('Prepare', 'Préparer') },
  { id: 'local', name: t('Locally', 'En local') },
  { id: 'aws', name: t('On AWS', 'Sur AWS') },
  { id: 'continuous', name: t('Continuously', 'En continu') },
];

export const steps: Step[] = [
  {
    id: 'repository',
    chapter: 'prepare',
    title: t('The repository', 'Le dépôt'),
    body: t(
      'Everything is in git: Terraform for AWS, the manifests Argo CD applies, the demo API and its Dockerfile, and the Makefile that runs it all. Nothing is created by hand, locally or on AWS.',
      "Tout est dans git : Terraform pour AWS, les manifestes qu'Argo CD applique, l'API de démo et son Dockerfile, et le Makefile qui enchaîne le tout. Rien n'est créé à la main, ni en local ni sur AWS.",
    ),
    transcript: clone,
    metric: { value: t('1 repo', '1 dépôt'), caption: t('where it all starts', 'là où tout commence') },
  },
  {
    id: 'tools',
    chapter: 'prepare',
    title: t('The tools', 'Les outils'),
    body: t(
      'One command says what is installed, grouped by use. Six tools are enough for the local platform; Terraform and the AWS CLI only matter from chapter 3, the linters only to contribute.',
      "Une commande dit ce qui est installé, groupé par usage. Six outils suffisent pour la plateforme locale ; Terraform et le CLI AWS ne servent qu'à partir du chapitre 3, les linters seulement pour contribuer.",
    ),
    transcript: checkTools,
    metric: { value: t('6 tools', '6 outils'), caption: t('to run it locally', 'pour le local') },
  },
  {
    id: 'cluster',
    chapter: 'local',
    title: t('The k3d cluster', 'Le cluster k3d'),
    body: t(
      '`make local-up` chains five steps, one line each. The first creates a two-node Kubernetes cluster in Docker, at the same Kubernetes version as on EKS. Its credentials go to a file of their own, never to the default kubeconfig, which may point at other clusters.',
      "`make local-up` enchaîne cinq étapes, une ligne chacune. La première crée un cluster Kubernetes de deux nœuds dans Docker, à la même version de Kubernetes que sur EKS. Ses identifiants vont dans un fichier à lui, jamais dans le kubeconfig par défaut, qui peut viser d'autres clusters.",
    ),
    target: 'make local-cluster',
    transcript: head(localUp, 2),
    current: 1,
    metric: { value: t('22 s', '22 s'), caption: t('to create the cluster', 'pour créer le cluster') },
  },
  {
    id: 'image',
    chapter: 'local',
    title: t('The API image', "L'image de l'API"),
    body: t(
      'The image of the demo API is built on the machine, then imported straight into the cluster: no registry to run locally.',
      "L'image de l'API de démo est construite sur la machine, puis importée directement dans le cluster : pas de registre à faire tourner en local.",
    ),
    target: 'make demo-image',
    transcript: head(localUp, 3),
    current: 2,
    metric: { value: t('0 registry', '0 registre'), caption: t('imported directly', 'importée directement') },
  },
  {
    id: 'argocd',
    chapter: 'local',
    title: t('Argo CD', 'Argo CD'),
    body: t(
      'Helm installs Argo CD, the one component Argo CD does not install itself. Everything else will come from git.',
      "Helm installe Argo CD, le seul composant qu'Argo CD n'installe pas lui-même. Tout le reste viendra de git.",
    ),
    target: 'make local-argocd',
    transcript: head(localUp, 4),
    current: 3,
    metric: { value: t('49 s', '49 s'), caption: t('for Argo CD', 'pour Argo CD') },
  },
  {
    id: 'root',
    chapter: 'local',
    title: t('The root application', "L'application racine"),
    body: t(
      'One Application, applied once, points Argo CD at the repository: the app-of-apps. From there, Argo CD reads git and installs the rest by itself.',
      "Une seule Application, appliquée une fois, pointe Argo CD vers le dépôt : l'app-of-apps. À partir de là, Argo CD lit git et installe le reste tout seul.",
    ),
    target: 'make local-bootstrap',
    transcript: head(localUp, 5),
    current: 4,
    metric: { value: t('1 root', '1 racine'), caption: t('the app-of-apps', "l'app-of-apps") },
  },
  {
    id: 'platform',
    chapter: 'local',
    title: t('The platform, wave by wave', 'La plateforme, vague par vague'),
    body: t(
      'Argo CD installs in waves: the operators and their CRDs first, then what uses them, then the demo API. The command waits until every application is synced and healthy, and lists while it waits what each one is still waiting on.',
      "Argo CD installe par vagues : les opérateurs et leurs CRD d'abord, puis ce qui s'en sert, puis l'API de démo. La commande attend que chaque application soit synchronisée et saine, et liste pendant l'attente ce que chacune attend encore.",
    ),
    target: 'make local-wait',
    transcript: until(localUp, 'The platform is up'),
    current: lineOf(localUp, 'Platform, synced'),
    metric: { value: t('13 / 13', '13 / 13'), caption: t('applications ready', 'applications prêtes') },
  },
  {
    id: 'verify',
    chapter: 'local',
    title: t('Check', 'Vérifier'),
    body: t(
      'Nine end-to-end checks, each of which passes or says what is missing: the applications, the gateway over HTTP and HTTPS, a secret that came from Vault, Grafana and the demo API behind the gateway, the metrics and the SLO rules.',
      "Neuf vérifications de bout en bout, chacune passe ou dit ce qui manque : les applications, la gateway en HTTP et en HTTPS, un secret venu de Vault, Grafana et l'API de démo derrière la gateway, les métriques et les règles de SLO.",
    ),
    transcript: localVerify,
    metric: { value: t('9 / 9', '9 / 9'), caption: t('checks passed', 'contrôles réussis') },
  },
  {
    id: 'explore',
    chapter: 'local',
    title: t('Explore', 'Explorer'),
    body: t(
      'Each interface opens through a port-forward of its own, until `Ctrl+C`, without touching `/etc/hosts`: Argo CD, Grafana, Prometheus. Their passwords come from `make argocd-password` and `make grafana-password`.',
      "Chaque interface s'ouvre par un port-forward à elle, jusqu'à `Ctrl+C`, sans toucher à `/etc/hosts` : Argo CD, Grafana, Prometheus. Leurs mots de passe viennent de `make argocd-password` et `make grafana-password`.",
    ),
    transcript: explore,
    metric: { value: t('3 ports', '3 ports'), caption: t('8081, 3000 and 9090', '8081, 3000 et 9090') },
  },
  {
    id: 'break',
    chapter: 'local',
    title: t('Break it on purpose', 'Casser exprès'),
    body: t(
      'The demo API can fail on demand. With 30% of requests failing against an SLO of 99.5%, the error budget burns 60 times too fast: the burn-rate alert Sloth generated fires, and links to its runbook. `make demo-fix` puts things back.',
      "L'API de démo sait échouer sur commande. Avec 30 % de requêtes en échec pour un SLO de 99,5 %, le budget d'erreur fond 60 fois trop vite : l'alerte de burn rate générée par Sloth se déclenche, avec le lien vers son runbook. `make demo-fix` remet tout en ordre.",
    ),
    transcript: demoBreak,
    metric: { value: t('74 / 245', '74 / 245'), caption: t('requests failed', 'requêtes en échec') },
  },
  {
    id: 'local-down',
    chapter: 'local',
    title: t('Delete it all', 'Tout supprimer'),
    body: t(
      'One command deletes the cluster, and nothing else: the repository stays as it was, ready for the next `make local-up`.',
      "Une commande supprime le cluster, et rien d'autre : le dépôt reste tel quel, prêt pour le prochain `make local-up`.",
    ),
    transcript: localDown,
    metric: { value: t('0 clusters', '0 cluster'), caption: t('after make local-down', 'après make local-down') },
  },
  {
    id: 'aws-setup',
    chapter: 'aws',
    title: t('Prepare the account', 'Préparer le compte'),
    body: t(
      'The first time on AWS takes one command, here in a fresh clone. It keeps the profile in `local.mk`, checks the session, finds the region (here, the one where the state bucket already is) and two zones EKS accepts, then writes `terraform.tfvars` and `backend.hcl`. Without a state bucket, it would create one, after showing its plan.',
      "La première fois sur AWS tient en une commande, ici dans un clone neuf. Elle garde le profil dans `local.mk`, vérifie la session, trouve la région (ici, celle où le bucket d'état existe déjà) et deux zones qu'EKS accepte, puis écrit `terraform.tfvars` et `backend.hcl`. Sans bucket d'état, elle en créerait un, après en avoir montré le plan.",
    ),
    transcript: awsSetup,
    metric: { value: t('1 command', '1 commande'), caption: t('the first time on AWS', 'pour débuter sur AWS') },
  },
  {
    id: 'plan',
    chapter: 'aws',
    title: t('See the plan', 'Voir le plan'),
    body: t(
      'Before anything exists, Terraform says what it would create: the VPC and its public subnets, the EKS cluster and two Spot nodes, the IAM roles and the secrets. No NAT gateway: the nodes sit in public subnets, behind strict security groups.',
      "Avant que rien n'existe, Terraform dit ce qu'il créerait : le VPC et ses sous-réseaux publics, le cluster EKS et deux nœuds Spot, les rôles IAM et les secrets. Pas de NAT gateway : les nœuds sont dans des sous-réseaux publics, derrière des groupes de sécurité stricts.",
    ),
    transcript: plan,
    metric: { value: t('28', '28'), caption: t('resources to create', 'ressources à créer') },
  },
  {
    id: 'up',
    chapter: 'aws',
    title: t('Create the infrastructure', "Créer l'infrastructure"),
    body: t(
      '`make up` shows the plan in a few lines and what it costs, then waits for a yes. Terraform applies exactly that plan: the network, the cluster, its nodes.',
      "`make up` montre le plan en quelques lignes et ce qu'il coûte, puis attend un oui. Terraform applique exactement ce plan : le réseau, le cluster, ses nœuds.",
    ),
    transcript: until(up, 'Terraform apply'),
    current: lineOf(up, 'Terraform apply'),
    metric: { value: t('$0.18', '0,18 $'), caption: t('an hour of demo', 'par heure de démo') },
  },
  {
    id: 'platform-aws',
    chapter: 'aws',
    title: t('Install the platform', 'Installer la plateforme'),
    body: t(
      'The same command writes the credentials of the new cluster to a file of their own, installs Argo CD, then the root application, as locally. Argo CD installs the AWS version: secrets from Secrets Manager through Pod Identity, the gateway behind a load balancer.',
      "La même commande écrit les identifiants du nouveau cluster dans un fichier à part, installe Argo CD, puis l'application racine, comme en local. Argo CD installe la version AWS : les secrets depuis Secrets Manager par Pod Identity, la gateway derrière un load balancer.",
    ),
    target: 'make aws-argocd, make aws-bootstrap, make aws-wait',
    transcript: until(up, 'The platform is up'),
    current: lineOf(up, 'Platform, synced'),
    metric: { value: t('12 / 12', '12 / 12'), caption: t('applications ready', 'applications prêtes') },
  },
  {
    id: 'verify-aws',
    chapter: 'aws',
    title: t('Check on EKS', 'Vérifier sur EKS'),
    body: t(
      'Ten checks for the AWS version: the nodes really run on Spot, the secret store reaches Secrets Manager with Pod Identity, the demo API answers through the load balancer, with the image the CI published. Then the same interfaces as locally, with `ENV=aws`.',
      "Dix vérifications pour la version AWS : les nœuds tournent bien en Spot, le magasin de secrets atteint Secrets Manager par Pod Identity, l'API de démo répond par le load balancer, avec l'image publiée par la CI. Ensuite, les mêmes interfaces qu'en local, avec `ENV=aws`.",
    ),
    transcript: awsVerify,
    metric: { value: t('10 / 10', '10 / 10'), caption: t('checks on EKS', 'contrôles sur EKS') },
  },
  {
    id: 'down',
    chapter: 'aws',
    title: t('Destroy it all', 'Tout détruire'),
    body: t(
      '`make down` stops Argo CD so it stops recreating what is being deleted, removes the load balancer Kubernetes made, destroys the rest with Terraform, then asks the AWS API whether anything is left that still bills.',
      "`make down` arrête Argo CD pour qu'il ne recrée pas ce qu'on supprime, retire le load balancer créé par Kubernetes, détruit le reste avec Terraform, puis demande à l'API d'AWS s'il reste quelque chose qui facture.",
    ),
    transcript: down,
    metric: { value: t('1 bucket', '1 bucket'), caption: t('the only thing left', 'seul à rester') },
  },
  {
    id: 'ci',
    chapter: 'continuous',
    title: t('The CI', 'La CI'),
    body: t(
      'The same checks run locally and on every push, from the same file: Terraform and Kubernetes linting, secrets detection. GitHub Actions then builds the image, tests it, scans it with Trivy and pushes it to GHCR; every week, a workflow checks the age of the base images and scans the published image again.',
      "Les mêmes vérifications tournent en local et à chaque push, depuis le même fichier : lint de Terraform et de Kubernetes, détection de secrets. GitHub Actions construit ensuite l'image, la teste, la scanne avec Trivy et la publie sur GHCR ; chaque semaine, un workflow vérifie l'âge des images de base et scanne à nouveau l'image publiée.",
    ),
    transcript: lint,
    metric: { value: t('14', '14'), caption: t('checks on every push', 'contrôles par push') },
  },
];
