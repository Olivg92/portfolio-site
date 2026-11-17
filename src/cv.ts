// The CV, as a PDF per language, on one A4 page: the print-only page
// /cv/print/ (and /fr/cv/print/), printed by scripts/cv-pdf.mjs into the build
// at /cv/, in CI and before each deployment. The script names the files the
// same way; a link to a name it did not write fails the dead-link check.
//
// Its words are the Experience page's (src/experience.ts), condensed to fit
// one page, under the same rules: the employers are described by their kind,
// never named, and nothing that belongs to the company is told. It is public:
// no phone, no postal address, no personal email, no photo.
import type { Lang } from './i18n';
import type { ToolName } from './tools';

export const cvFile = (lang: Lang) => `olivier-guandalini-cv-${lang}.pdf`;
export const cvPath = (lang: Lang) => `/cv/${cvFile(lang)}`;
/** The print-only page the PDF is printed from, without the language prefix. */
export const cvPrint = 'cv/print/';

type Text = Record<Lang, string>;
const NBSP = String.fromCharCode(0xa0);
// French puts a no-break space before a colon, a semicolon, "?" and "!".
const t = (en: string, fr: string): Text => ({ en, fr: fr.replace(/ ([:;?!])/g, `${NBSP}$1`) });

export type Cv = {
  masthead: Text;
  eyebrow: Text;
  pitch: Text;
  /** A bullet of the current role: a few words in bold, then the rest. */
  now: { lead: Text; text: Text; ongoing?: boolean }[];
  before: { when: Text; role: Text; where: Text; text?: Text }[];
  project: { lead: Text; points: Text[] };
  /** Skill groups; a tool used in my own projects only is marked. */
  skills: { name: Text; work: ToolName[]; projects?: ToolName[] }[];
  labels: Record<
    | 'experience'
    | 'project'
    | 'skills'
    | 'education'
    | 'ownProjects'
    | 'ongoing'
    | 'site'
    | 'qrText'
    | 'languages'
    | 'place'
    | 'figures'
    | 'code'
    | 'tour'
    | 'footer',
    Text
  >;
};

export const cv: Cv = {
  masthead: t('Curriculum vitae · Open to a conversation', 'Curriculum vitae · Ouvert à la discussion'),
  eyebrow: t('DevOps · SRE · Platform engineering', 'DevOps · SRE · Platform engineering'),
  pitch: t(
    'I keep critical services running, and turn the infrastructure behind them into code: 400+ Linux servers and Kubernetes clusters, from Terraform to GitOps, SLOs and runbooks.',
    "Je garde des services critiques en marche, et je transforme l'infrastructure qui les porte en code : 400+ serveurs Linux et des clusters Kubernetes, de Terraform au GitOps, aux SLO et aux runbooks.",
  ),
  now: [
    {
      lead: t('Kubernetes platform.', 'Plateforme Kubernetes.'),
      text: t(
        'Clusters on vSphere created as code in 10 to 15 minutes (Terraform, Rancher, RKE2); their components deployed through GitOps with Argo CD.',
        'Des clusters sur vSphere créés en code en 10 à 15 minutes (Terraform, Rancher, RKE2) ; leurs composants déployés en GitOps par Argo CD.',
      ),
    },
    {
      lead: t('Linux fleet.', 'Parc Linux.'),
      text: t(
        '400+ Debian and CentOS servers run with Ansible; my Ansible role for Java (Eclipse Temurin) serves 16 projects.',
        "400+ serveurs Debian et CentOS gérés par Ansible ; mon rôle Ansible pour Java (Eclipse Temurin) sert 16 projets.",
      ),
    },
    {
      lead: t('Observability.', 'Observabilité.'),
      text: t(
        'Monitoring as code (Prometheus, Alertmanager, Grafana), SLOs and SLAs in Datadog; application logs in ELK that developers search on their own.',
        'Le monitoring en code (Prometheus, Alertmanager, Grafana), des SLO et SLA dans Datadog ; des logs applicatifs dans ELK, que les développeurs consultent seuls.',
      ),
    },
    {
      lead: t('Secrets.', 'Secrets.'),
      text: t(
        'HashiCorp Vault and External Secrets on Kubernetes, Ansible Vault on the servers: no secret in clear text in a repository.',
        'HashiCorp Vault et External Secrets sur Kubernetes, Ansible Vault sur les serveurs : aucun secret en clair dans un dépôt.',
      ),
    },
    {
      lead: t('AI in production.', 'IA en production.'),
      text: t(
        'An AI assistant taken to a production beta: LLM providers, Qdrant, Langfuse, an MCP server, an OpenResty gateway for WebSockets, deployed by Ansible.',
        'Un assistant IA mené jusqu’à une bêta en production : fournisseurs de LLM, Qdrant, Langfuse, un serveur MCP, une gateway OpenResty pour les WebSockets, déployés par Ansible.',
      ),
    },
    {
      lead: t('CI/CD and run.', 'CI/CD et run.'),
      text: t(
        'Jenkins on Kubernetes (Helm, Configuration as Code) and Rundeck; incidents from start to finish, post-mortems and runbooks; two apprentices mentored to autonomy.',
        'Jenkins sur Kubernetes (Helm, Configuration as Code) et Rundeck ; les incidents de bout en bout, post-mortems et runbooks ; deux alternants formés jusqu’à l’autonomie.',
      ),
    },
    {
      lead: t('Network and DMZ.', 'Réseau et DMZ.'),
      text: t(
        'vSphere, internal and in a DMZ: Debian VMs, routing, firewalls, and a PHP application put in production on isolated servers.',
        'vSphere, en interne et en DMZ : VM Debian, routage, pare-feux, et une application PHP mise en production sur des serveurs isolés.',
      ),
    },
    {
      ongoing: true,
      lead: t('Critical API.', 'API critique.'),
      text: t(
        'Moving it from its servers to Kubernetes, behind a 3scale and OpenResty gateway.',
        'Sa migration de ses serveurs vers Kubernetes, derrière une gateway 3scale et OpenResty.',
      ),
    },
  ],
  before: [
    {
      when: t('2022 to 2023', '2022 à 2023'),
      role: t('DevOps engineer, apprentice', 'Ingénieur DevOps en alternance'),
      where: t('An adtech SME', "Une PME de l'adtech"),
      text: t(
        'Applications moved to Docker and Kubernetes; a first Prometheus and Grafana monitoring, from proof of concept to production.',
        'Des applications passées sur Docker et Kubernetes ; un premier monitoring Prometheus et Grafana, du POC à la production.',
      ),
    },
    {
      when: t('2021 to 2022', '2021 à 2022'),
      role: t('Automation engineer, apprentice', 'Automaticien en alternance'),
      where: t(
        "The energy branch of a large construction group: a metro line's electrical distribution",
        "La branche énergie d'un grand groupe du BTP : la distribution électrique d'une ligne de métro",
      ),
    },
  ],
  project: {
    lead: t(
      'A complete Kubernetes platform I built on my own, on a laptop then on AWS EKS, driven entirely through GitOps; open source.',
      "Une plateforme Kubernetes complète, construite seul, sur un portable puis sur AWS EKS, pilotée entièrement en GitOps ; open source.",
    ),
    points: [
      t(
        'AWS infrastructure in Terraform, built to cost little (EKS on Spot, no NAT Gateway); Argo CD deploys the whole cluster; the same platform runs locally (k3d), ready in 4 min 33 s.',
        'Infrastructure AWS en Terraform, pensée pour coûter peu (EKS sur Spot, sans NAT Gateway) ; Argo CD déploie tout le cluster ; la même plateforme tourne en local (k3d), prête en 4 min 33 s.',
      ),
      t(
        'No password or key written anywhere: secrets read from Vault or AWS Secrets Manager (External Secrets), GitHub Actions CI signed in without keys (OIDC).',
        'Aucun mot de passe ni clé écrits en dur : secrets lus dans Vault ou AWS Secrets Manager (External Secrets), CI GitHub Actions connectée sans clé (OIDC).',
      ),
      t(
        'Two availability targets (SLOs) with their alerts and a runbook per alert; images with no known vulnerability (Trivy).',
        'Deux objectifs de disponibilité (SLO) avec leurs alertes et un runbook par alerte ; images sans vulnérabilité connue (Trivy).',
      ),
    ],
  },
  skills: [
    { name: t('Kubernetes and GitOps', 'Kubernetes et GitOps'), work: ['rke2', 'rancher', 'argo', 'helm', 'kustomize', 'docker', 'envoy', 'longhorn'], projects: ['k3d'] },
    { name: t('Infrastructure as code', 'Infrastructure en code'), work: ['terraform', 'ansible', 'bash', 'python'] },
    { name: t('Systems and cloud', 'Systèmes et cloud'), work: ['linux', 'debian', 'centos', 'vsphere', 'vcloud', 'ovh'], projects: ['eks', 'awscore'] },
    { name: t('Observability', 'Observabilité'), work: ['prometheus', 'alertmanager', 'grafana', 'datadog', 'elk', 'opensearch', 'opentelemetry'], projects: ['sloth'] },
    { name: t('CI/CD', 'CI/CD'), work: ['jenkins', 'gitlab', 'rundeck'], projects: ['githubactions'] },
    { name: t('Security and API', 'Sécurité et API'), work: ['vault', 'externalsecrets', 'threescale', 'openresty'], projects: ['secretsmanager', 'certmanager', 'trivy'] },
    { name: t('AI in production', 'IA en production'), work: ['qdrant', 'langfuse', 'mcp', 'mistral'] },
  ],
  labels: {
    experience: t('Experience', 'Expérience'),
    project: t('Personal project', 'Projet personnel'),
    skills: t('Skills', 'Compétences'),
    education: t('Education', 'Formation'),
    ownProjects: t('* in my own projects', '* dans mes projets'),
    ongoing: t('In progress', 'En cours'),
    site: t('The whole story, online', 'Toute l’histoire, en ligne'),
    qrText: t(
      'Each problem solved, told in full, and a guided tour of the platform.',
      'Chaque problème résolu, raconté en entier, et une visite guidée de la plateforme.',
    ),
    languages: t('Languages', 'Langues'),
    place: t('Based', 'Lieu'),
    figures: t('Key figures', 'Chiffres clés'),
    code: t('Code', 'Code'),
    tour: t('Guided tour', 'Visite guidée'),
    footer: t('This CV is code: Astro, HTML and CSS, printed by Chrome', 'Ce CV est du code : Astro, HTML et CSS, imprimé par Chrome'),
  },
};
