// The tools the site names, each with its logo, its kind and what it is, in a
// sentence or two, in both languages: a chip shows them on a card when it is
// clicked, tapped or hovered. A tool without a logo shows its name alone.
import type { Lang } from './i18n';
import type { LogoName } from './logos';

type Text = Record<Lang, string>;
export type Kind = keyof typeof kinds;
export type Tool = { name: string; logo?: LogoName; kind: Kind; about: Text };

/** What a chip's card shows, in one language. */
export type Tip = {
  /** Unique on the page: the card's id, and its anchor's name. */
  id: string;
  title: string;
  text: string;
  kind?: { label: string; tone: 'cyan' | 'green' | 'amber' | 'magenta' } | undefined;
  here?: { label: string; text: string } | undefined;
};

// French puts a no-break space before a colon or a semicolon; written with a
// plain space here, for legibility.
const NBSP = String.fromCharCode(0xa0);
const t = (en: string, fr: string): Text => ({ en, fr: fr.replace(/ ([:;?!])/g, `${NBSP}$1`) });

// What kind of tool it is, shown on its card in the signal colour the site
// gives that kind of thing (see tokens.css): green for GitOps and delivery,
// amber for traffic, magenta for secrets and security, cyan for the rest.
export const kinds = {
  orchestration: { label: t('Orchestration', 'Orchestration'), tone: 'cyan' },
  iac: { label: t('Infrastructure as code', 'Infrastructure en code'), tone: 'cyan' },
  cloud: { label: t('Cloud', 'Cloud'), tone: 'cyan' },
  gitops: { label: t('GitOps', 'GitOps'), tone: 'green' },
  ci: { label: t('CI/CD', 'CI/CD'), tone: 'green' },
  traffic: { label: t('Traffic', 'Trafic'), tone: 'amber' },
  secrets: { label: t('Secrets', 'Secrets'), tone: 'magenta' },
  observability: { label: t('Observability', 'Observabilité'), tone: 'cyan' },
  web: { label: t('Web', 'Web'), tone: 'cyan' },
  language: { label: t('Language', 'Langage'), tone: 'cyan' },
  ai: { label: t('AI', 'IA'), tone: 'cyan' },
  testing: { label: t('Testing', 'Tests'), tone: 'cyan' },
  containers: { label: t('Containers', 'Conteneurs'), tone: 'cyan' },
  deployment: { label: t('Deployment', 'Déploiement'), tone: 'green' },
  storage: { label: t('Storage', 'Stockage'), tone: 'cyan' },
  os: { label: t('Operating system', "Système d'exploitation"), tone: 'cyan' },
  runtime: { label: t('Runtime', "Environnement d'exécution"), tone: 'cyan' },
  virtualization: { label: t('Virtualization', 'Virtualisation'), tone: 'cyan' },
  security: { label: t('Security', 'Sécurité'), tone: 'magenta' },
  tracking: { label: t('Tracking', 'Suivi'), tone: 'cyan' },
} satisfies Record<string, { label: Text; tone: 'cyan' | 'green' | 'amber' | 'magenta' }>;

export const tools = {
  kubernetes: {
    name: 'Kubernetes',
    kind: 'orchestration',
    logo: 'kubernetes',
    about: t(
      'Runs containers across a group of machines, restarts them when they fail, and spreads the traffic between them.',
      'Fait tourner des conteneurs sur un groupe de machines, les relance quand ils tombent et répartit le trafic entre eux.',
    ),
  },
  terraform: {
    name: 'Terraform',
    kind: 'iac',
    logo: 'terraform',
    about: t(
      'Describes infrastructure as code: a plan shows what will change before anything is created or destroyed.',
      "Décrit l'infrastructure en code : un plan montre ce qui va changer avant de créer ou de détruire quoi que ce soit.",
    ),
  },
  eks: {
    name: 'AWS EKS',
    kind: 'cloud',
    logo: 'eks',
    about: t(
      'Kubernetes managed by AWS: Amazon runs the control plane, the nodes run the workloads.',
      'Kubernetes géré par AWS : Amazon fait tourner le plan de contrôle, les nœuds font tourner les applications.',
    ),
  },
  k3d: {
    name: 'k3d',
    kind: 'orchestration',
    logo: 'k3d',
    about: t(
      'A whole Kubernetes cluster in Docker containers, on a laptop: the same platform locally, for free.',
      'Un cluster Kubernetes complet dans des conteneurs Docker, sur un portable : la même plateforme en local, gratuitement.',
    ),
  },
  argo: {
    name: 'Argo CD',
    kind: 'gitops',
    logo: 'argo',
    about: t(
      'Keeps the cluster in line with what git describes: to change the platform, you change the repository, not the cluster.',
      'Maintient le cluster conforme à ce que décrit git : pour changer la plateforme, on change le dépôt, pas le cluster.',
    ),
  },
  envoy: {
    name: 'Envoy Gateway',
    kind: 'traffic',
    logo: 'envoy',
    about: t(
      'The way into the cluster, through the Gateway API: it routes HTTP and HTTPS traffic to the right service.',
      "La porte d'entrée du cluster, avec la Gateway API : elle route le trafic HTTP et HTTPS vers le bon service.",
    ),
  },
  externalsecrets: {
    name: 'External Secrets',
    kind: 'secrets',
    logo: 'externalsecrets',
    about: t(
      'Copies secrets from a store such as Vault or AWS Secrets Manager into Kubernetes, so that none is written in git.',
      "Recopie les secrets d'un coffre comme Vault ou AWS Secrets Manager dans Kubernetes : aucun n'est écrit dans git.",
    ),
  },
  vault: {
    name: 'Vault',
    kind: 'secrets',
    logo: 'vault',
    about: t(
      'The secret store by HashiCorp: passwords, keys and certificates kept encrypted, with every access controlled and logged.',
      'Le coffre à secrets de HashiCorp : mots de passe, clés et certificats gardés chiffrés, chaque accès contrôlé et tracé.',
    ),
  },
  prometheus: {
    name: 'Prometheus',
    kind: 'observability',
    logo: 'prometheus',
    about: t(
      'Collects the metrics of every service over time, and evaluates the alerting rules on them.',
      "Collecte les métriques de chaque service dans le temps, et évalue dessus les règles d'alerte.",
    ),
  },
  grafana: {
    name: 'Grafana',
    kind: 'observability',
    logo: 'grafana',
    about: t(
      'Dashboards over the metrics and the logs: what the platform is doing, at a glance.',
      "Des tableaux de bord sur les métriques et les logs : ce que fait la plateforme, d'un coup d'œil.",
    ),
  },
  sloth: {
    name: 'Sloth',
    kind: 'observability',
    logo: 'sloth',
    about: t(
      'Turns an SLO written in a few lines into the Prometheus rules and burn-rate alerts it needs.',
      'Transforme un SLO écrit en quelques lignes en règles Prometheus et en alertes de burn rate.',
    ),
  },
  githubactions: {
    name: 'GitHub Actions',
    kind: 'ci',
    logo: 'githubactions',
    about: t(
      'The CI of GitHub: on every pull request, it runs the checks, builds and scans what ships, and deploys it.',
      'La CI de GitHub : à chaque pull request, elle lance les vérifications, construit et scanne ce qui part, et le déploie.',
    ),
  },
  astro: {
    name: 'Astro',
    kind: 'web',
    logo: 'astro',
    about: t(
      'A site generator: the pages are built once into static HTML and CSS, with no framework sent to the browser.',
      'Un générateur de site : les pages sont construites une fois en HTML et CSS statiques, sans framework envoyé au navigateur.',
    ),
  },
  typescript: {
    name: 'TypeScript',
    kind: 'language',
    logo: 'typescript',
    about: t(
      'JavaScript with types: a mistake, such as a missing translation, fails the build instead of reaching the page.',
      "Du JavaScript typé : une erreur, comme une traduction manquante, fait échouer le build au lieu d'arriver sur la page.",
    ),
  },
  githubpages: {
    name: 'GitHub Pages',
    kind: 'web',
    logo: 'github',
    about: t(
      'The static hosting of GitHub: this site is published there on every merge, with no server to run.',
      "L'hébergement statique de GitHub : ce site y est publié à chaque merge, sans serveur à faire tourner.",
    ),
  },
  lighthouse: {
    name: 'Lighthouse',
    kind: 'testing',
    logo: 'lighthouse',
    about: t(
      'The page audit by Google: performance, accessibility, best practices and SEO, each scored out of 100.',
      "L'audit de page de Google : performance, accessibilité, bonnes pratiques et référencement, chacun noté sur 100.",
    ),
  },
  python: {
    name: 'Python',
    kind: 'language',
    logo: 'python',
    about: t(
      'The language of the APIs and scripts here, and of most of the AI ecosystem.',
      "Le langage des API et des scripts ici, et de l'essentiel de l'écosystème IA.",
    ),
  },
  fastapi: {
    name: 'FastAPI',
    kind: 'web',
    logo: 'fastapi',
    about: t(
      'A Python framework for HTTP APIs: typed endpoints, with the validation and the documentation generated from the code.',
      'Un framework Python pour les API HTTP : des endpoints typés, avec la validation et la documentation générées depuis le code.',
    ),
  },
  qdrant: {
    name: 'Qdrant',
    kind: 'ai',
    logo: 'qdrant',
    about: t(
      'A vector database: it finds the passages closest in meaning to a question, the retrieval step of RAG.',
      "Une base de données vectorielle : elle retrouve les passages les plus proches du sens d'une question, l'étape de recherche du RAG.",
    ),
  },
  langfuse: {
    name: 'Langfuse',
    kind: 'ai',
    logo: 'langfuse',
    about: t(
      'Observability for LLM applications: each request traced, with its prompts, its latency and its token cost.',
      "L'observabilité des applications LLM : chaque requête tracée, avec ses prompts, sa latence et son coût en tokens.",
    ),
  },
  k6: {
    name: 'k6',
    kind: 'testing',
    logo: 'k6',
    about: t(
      'A load-testing tool: scripted virtual users push a service, to see where it holds and where it breaks.',
      'Un outil de test de charge : des utilisateurs virtuels scriptés poussent un service, pour voir où il tient et où il casse.',
    ),
  },
  // On the Experience page.
  ansible: {
    name: 'Ansible',
    logo: 'ansible',
    kind: 'iac',
    about: t(
      'Configures servers from code: playbooks and roles describe the state wanted, and Ansible brings every machine to it, over SSH.',
      "Configure les serveurs à partir du code : playbooks et rôles décrivent l'état voulu, et Ansible y amène chaque machine, par SSH.",
    ),
  },
  alertmanager: {
    name: 'Alertmanager',
    logo: 'prometheus',
    kind: 'observability',
    about: t(
      'Receives the alerts Prometheus fires, groups them, silences them, and sends them to the right people.',
      'Reçoit les alertes de Prometheus, les regroupe, les met en silence et les envoie aux bonnes personnes.',
    ),
  },
  awscore: {
    name: 'VPC, IAM, S3',
    logo: 'awscloud',
    kind: 'cloud',
    about: t(
      'The basics of AWS: a private network (VPC), identities and permissions (IAM), and object storage (S3).',
      "Les bases d'AWS : un réseau privé (VPC), les identités et les droits (IAM), et le stockage d'objets (S3).",
    ),
  },
  bash: {
    name: 'Bash',
    logo: 'bash',
    kind: 'language',
    about: t(
      'The Unix shell, for the scripts that tie the tools together.',
      'Le shell Unix, pour les scripts qui relient les outils entre eux.',
    ),
  },
  centos: {
    name: 'CentOS',
    logo: 'centos',
    kind: 'os',
    about: t(
      'A Linux distribution of the Red Hat family, common on company servers.',
      "Une distribution Linux de la famille Red Hat, courante sur les serveurs d'entreprise.",
    ),
  },
  certmanager: {
    name: 'cert-manager',
    kind: 'security',
    about: t(
      'Issues TLS certificates inside Kubernetes, and renews them before they expire.',
      "Délivre les certificats TLS dans Kubernetes, et les renouvelle avant qu'ils n'expirent.",
    ),
  },
  datadog: {
    name: 'Datadog',
    logo: 'datadog',
    kind: 'observability',
    about: t(
      'A hosted monitoring service: the metrics, logs, traces and SLOs of every machine, with alerts sent where the team works.',
      "Un service de monitoring hébergé : les métriques, logs, traces et SLO de chaque machine, avec des alertes là où l'équipe travaille.",
    ),
  },
  debian: {
    name: 'Debian',
    logo: 'debian',
    kind: 'os',
    about: t(
      'A Linux distribution known for its stability, under many servers and under Ubuntu.',
      'Une distribution Linux réputée pour sa stabilité, sous de nombreux serveurs et sous Ubuntu.',
    ),
  },
  docker: {
    name: 'Docker',
    logo: 'docker',
    kind: 'containers',
    about: t(
      'Packs an application with all it needs into an image, which runs the same way on any machine.',
      "Emballe une application avec tout ce qu'il lui faut dans une image, qui tourne de la même façon sur n'importe quelle machine.",
    ),
  },
  elk: {
    name: 'ELK',
    logo: 'elastic',
    kind: 'observability',
    about: t(
      'Elasticsearch, Logstash and Kibana: the logs of every server gathered, indexed and searched in one place.',
      'Elasticsearch, Logstash et Kibana : les logs de chaque serveur collectés, indexés et cherchés au même endroit.',
    ),
  },
  gitlab: {
    name: 'GitLab',
    logo: 'gitlab',
    kind: 'ci',
    about: t(
      'A git forge with its own CI: runners build, test and deploy on every push.',
      'Une forge git avec sa propre CI : des runners construisent, testent et déploient à chaque push.',
    ),
  },
  helm: {
    name: 'Helm',
    logo: 'helm',
    kind: 'deployment',
    about: t(
      'The package manager of Kubernetes: a chart turns values into manifests, installed and versioned as one release.',
      'Le gestionnaire de paquets de Kubernetes : un chart transforme des valeurs en manifestes, installés et versionnés comme une release.',
    ),
  },
  jenkins: {
    name: 'Jenkins',
    logo: 'jenkins',
    kind: 'ci',
    about: t(
      'An automation server for CI: pipelines that build, test and deliver the code, configured as code.',
      "Un serveur d'automatisation pour la CI : des pipelines qui construisent, testent et livrent le code, configurés en code.",
    ),
  },
  jira: {
    name: 'Jira',
    logo: 'jira',
    kind: 'tracking',
    about: t(
      'The ticket tracker of the teams: incidents, requests and work, with their priority and their history.',
      'Le suivi de tickets des équipes : incidents, demandes et travaux, avec leur priorité et leur historique.',
    ),
  },
  kibana: {
    name: 'Kibana',
    logo: 'kibana',
    kind: 'observability',
    about: t(
      'The web interface of Elasticsearch: search the logs, build dashboards, follow an incident as it happens.',
      "L'interface web d'Elasticsearch : chercher dans les logs, construire des tableaux de bord, suivre un incident en direct.",
    ),
  },
  kustomize: {
    name: 'Kustomize',
    kind: 'deployment',
    about: t(
      'Builds Kubernetes manifests from a shared base and small patches for each environment, with no templates.',
      "Construit les manifestes Kubernetes à partir d'une base commune et de petits correctifs par environnement, sans templates.",
    ),
  },
  linux: {
    name: 'Linux',
    logo: 'linux',
    kind: 'os',
    about: t(
      'The operating system of almost every server: the ground everything else runs on.',
      "Le système d'exploitation de presque tous les serveurs : le socle sur lequel tout le reste tourne.",
    ),
  },
  logstash: {
    name: 'Logstash',
    logo: 'logstash',
    kind: 'observability',
    about: t(
      'Receives logs, cuts them into fields, and sends them on to be indexed.',
      "Reçoit les logs, les découpe en champs, et les envoie à l'indexation.",
    ),
  },
  longhorn: {
    name: 'Longhorn',
    logo: 'longhorn',
    kind: 'storage',
    about: t(
      'Distributed storage for Kubernetes: volumes copied across the nodes, so that the data outlives the loss of one.',
      "Du stockage distribué pour Kubernetes : des volumes copiés sur plusieurs nœuds, pour que les données survivent à la perte de l'un d'eux.",
    ),
  },
  mcp: {
    name: 'MCP',
    logo: 'mcp',
    kind: 'ai',
    about: t(
      'The Model Context Protocol: a standard way for AI assistants to call tools and to read the data of other systems.',
      "Le Model Context Protocol : une façon standard pour les assistants IA d'appeler des outils et de lire les données d'autres systèmes.",
    ),
  },
  mistral: {
    name: 'Mistral',
    logo: 'mistral',
    kind: 'ai',
    about: t(
      'A French provider of large language models, called through its API.',
      'Un fournisseur français de grands modèles de langage, appelé par son API.',
    ),
  },
  openresty: {
    name: 'OpenResty',
    kind: 'traffic',
    about: t(
      'nginx with Lua inside: a web server and gateway whose behaviour can be programmed.',
      "nginx avec Lua à l'intérieur : un serveur web et une gateway dont on peut programmer le comportement.",
    ),
  },
  opensearch: {
    name: 'OpenSearch',
    logo: 'opensearch',
    kind: 'observability',
    about: t(
      'An open-source search and analytics engine, born from Elasticsearch, with dashboards and alerting.',
      "Un moteur de recherche et d'analyse open source, né d'Elasticsearch, avec tableaux de bord et alertes.",
    ),
  },
  opentelemetry: {
    name: 'OpenTelemetry',
    logo: 'opentelemetry',
    kind: 'observability',
    about: t(
      'The open standard of telemetry: one way to emit traces, metrics and logs, whatever tool reads them.',
      "Le standard ouvert de la télémétrie : une seule façon d'émettre traces, métriques et logs, quel que soit l'outil qui les lit.",
    ),
  },
  ovh: {
    name: 'OVH',
    logo: 'ovh',
    kind: 'cloud',
    about: t(
      'A French cloud and hosting provider.',
      'Un hébergeur et fournisseur de cloud français.',
    ),
  },
  rancher: {
    name: 'Rancher',
    logo: 'rancher',
    kind: 'orchestration',
    about: t(
      'Manages Kubernetes clusters from one place: creates them, upgrades them, and controls who reaches them.',
      'Gère les clusters Kubernetes depuis un seul endroit : les crée, les met à jour et contrôle qui y accède.',
    ),
  },
  rke2: {
    name: 'Kubernetes (RKE2)',
    logo: 'kubernetes',
    kind: 'orchestration',
    about: t(
      'Kubernetes in RKE2, the distribution by Rancher: hardened for security, made for servers on-prem.',
      'Kubernetes dans RKE2, la distribution de Rancher : durcie pour la sécurité, faite pour les serveurs on-prem.',
    ),
  },
  rundeck: {
    name: 'Rundeck',
    logo: 'rundeck',
    kind: 'ci',
    about: t(
      'Runs operations jobs on demand or on a schedule, with access control and a log of every run.',
      "Lance des jobs d'exploitation à la demande ou planifiés, avec un contrôle d'accès et le journal de chaque exécution.",
    ),
  },
  secretsmanager: {
    name: 'Secrets Manager',
    logo: 'secretsmanager',
    kind: 'secrets',
    about: t(
      'The secret store of AWS: secrets kept encrypted, read by the applications through their IAM permissions.',
      "Le coffre à secrets d'AWS : des secrets gardés chiffrés, lus par les applications grâce à leurs droits IAM.",
    ),
  },
  temurin: {
    name: 'Eclipse Temurin',
    logo: 'temurin',
    kind: 'runtime',
    about: t(
      'The Java builds of the Eclipse Adoptium project: free, tested, and kept up to date with security fixes.',
      'Les builds Java du projet Eclipse Adoptium : gratuits, testés et tenus à jour des correctifs de sécurité.',
    ),
  },
  threescale: {
    name: '3scale',
    logo: 'redhat',
    kind: 'traffic',
    about: t(
      'The API management of Red Hat: keys, quotas and statistics in front of an API, with a gateway that enforces them.',
      "La gestion d'API de Red Hat : clés, quotas et statistiques devant une API, avec une gateway qui les fait respecter.",
    ),
  },
  trivy: {
    name: 'Trivy',
    logo: 'trivy',
    kind: 'security',
    about: t(
      'A security scanner: it finds the known vulnerabilities in images, packages and configuration.',
      'Un scanner de sécurité : il trouve les vulnérabilités connues dans les images, les paquets et la configuration.',
    ),
  },
  vcloud: {
    name: 'vCloud Director',
    kind: 'virtualization',
    about: t(
      'The VMware layer for cloud providers: a hosted virtual data centre, with its own networks and machines.',
      'La couche de VMware pour les fournisseurs de cloud : un datacenter virtuel hébergé, avec ses propres réseaux et machines.',
    ),
  },
  vsphere: {
    name: 'vSphere',
    kind: 'virtualization',
    about: t(
      'The virtualization platform of VMware: virtual machines on a cluster of physical servers, managed from vCenter.',
      'La plateforme de virtualisation de VMware : des machines virtuelles sur un cluster de serveurs physiques, gérées depuis vCenter.',
    ),
  },
} satisfies Record<string, Tool>;

export type ToolName = keyof typeof tools;
