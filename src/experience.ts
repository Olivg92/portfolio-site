// The words of the Experience page, in both languages: what I solved at work,
// told as I would tell it in an interview. The employers are described by
// their kind, never named, and the page says how I work, never what belongs
// to the company: no host, address or product, no figure of the company, no
// plan not yet announced, no detail of its security. A missing translation is a
// type error.
import type { Lang } from './i18n';
import type { LogoName } from './logos';

type Text = Record<Lang, string>;
export type Tool = { name: string; logo?: LogoName };

export type Problem = {
  /** The anchor of the card, the same in both languages. */
  id: string;
  title: Text;
  problem: Text;
  did: Text;
  result: Text;
  stack: Tool[];
};

// A number keeps its unit on the same line, in both languages. French also
// puts a no-break space before a colon or a semicolon; written with plain
// spaces here, for legibility.
const NBSP = String.fromCharCode(0xa0);
const units = (text: string) => text.replace(/(\d) (?=(?:%|Ko|KB|min)(?![a-z]))/g, `$1${NBSP}`);
const t = (en: string, fr: string): Text => ({ en: units(en), fr: units(fr).replace(/ ([:;?!])/g, `${NBSP}$1`) });

const tool = {
  ansible: { name: 'Ansible', logo: 'ansible' },
  argo: { name: 'Argo CD', logo: 'argo' },
  bash: { name: 'Bash', logo: 'bash' },
  centos: { name: 'CentOS', logo: 'centos' },
  datadog: { name: 'Datadog', logo: 'datadog' },
  debian: { name: 'Debian', logo: 'debian' },
  docker: { name: 'Docker', logo: 'docker' },
  elk: { name: 'ELK', logo: 'elastic' },
  envoy: { name: 'Envoy Gateway', logo: 'envoy' },
  externalsecrets: { name: 'External Secrets', logo: 'externalsecrets' },
  gitlab: { name: 'GitLab', logo: 'gitlab' },
  grafana: { name: 'Grafana', logo: 'grafana' },
  helm: { name: 'Helm', logo: 'helm' },
  jenkins: { name: 'Jenkins', logo: 'jenkins' },
  jira: { name: 'Jira', logo: 'jira' },
  kibana: { name: 'Kibana', logo: 'kibana' },
  kubernetes: { name: 'Kubernetes', logo: 'kubernetes' },
  langfuse: { name: 'Langfuse', logo: 'langfuse' },
  linux: { name: 'Linux', logo: 'linux' },
  logstash: { name: 'Logstash', logo: 'logstash' },
  longhorn: { name: 'Longhorn', logo: 'longhorn' },
  mcp: { name: 'MCP', logo: 'mcp' },
  mistral: { name: 'Mistral', logo: 'mistral' },
  opensearch: { name: 'OpenSearch', logo: 'opensearch' },
  opentelemetry: { name: 'OpenTelemetry', logo: 'opentelemetry' },
  ovh: { name: 'OVH', logo: 'ovh' },
  prometheus: { name: 'Prometheus', logo: 'prometheus' },
  python: { name: 'Python', logo: 'python' },
  qdrant: { name: 'Qdrant', logo: 'qdrant' },
  rancher: { name: 'Rancher', logo: 'rancher' },
  rundeck: { name: 'Rundeck', logo: 'rundeck' },
  temurin: { name: 'Eclipse Temurin', logo: 'temurin' },
  terraform: { name: 'Terraform', logo: 'terraform' },
  threescale: { name: '3scale', logo: 'redhat' },
  vault: { name: 'Vault', logo: 'vault' },
  vsphere: { name: 'vSphere' },
} satisfies Record<string, Tool>;

type Experience = {
  lede: Text;
  metrics: { value: Text; label: Text }[];
  problems: Problem[];
  /** The rest of the work, in a line each; `ongoing` marks what is under way. */
  also: { ongoing: boolean; text: Text }[];
  stack: { work: Tool[]; projects: Tool[] };
  path: { when: Text; role: Text; where: Text }[];
  education: { when: Text; degree: Text; note: Text }[];
  languages: Text;
};

export const experience: Experience = {
  lede: t(
    "DevOps and SRE engineer at a software publisher, in the in-house infrastructure team. I run more than 400 on-prem Linux servers, and since 2026 I have been contributing to the company's Kubernetes platform: creating its clusters on vSphere, as code, and deploying their components through GitOps.",
    "Ingénieur DevOps et SRE chez un éditeur de logiciels, dans l'équipe infrastructure interne. Je fais tourner plus de 400 serveurs Linux on-prem, et je contribue depuis 2026 à la plateforme Kubernetes de l'entreprise : la création de ses clusters sur vSphere, en code, et le déploiement de leurs composants en GitOps.",
  ),

  metrics: [
    { value: t('400+', '400+'), label: t('on-prem Linux servers, configured by Ansible', 'serveurs Linux on-prem, configurés par Ansible') },
    { value: t('~15 min', '~15 min'), label: t('to create a Kubernetes cluster', 'pour créer un cluster Kubernetes') },
    { value: t('16', '16'), label: t('projects on one Ansible role for Java', 'projets sur un même rôle Ansible pour Java') },
    { value: t('2', '2'), label: t('apprentices trained up to full autonomy', "alternants formés jusqu'à l'autonomie") },
  ],

  problems: [
    {
      id: 'clusters',
      title: t('Kubernetes clusters in 15 minutes', 'Des clusters Kubernetes en 15 minutes'),
      problem: t(
        'On vSphere, a cluster went through servers prepared on their own, then registered one by one in Rancher.',
        'Sur vSphere, un cluster passait par des serveurs préparés à part, puis inscrits un à un dans Rancher.',
      ),
      did: t(
        "I added a native method to the team's Terraform project. Rancher drives vCenter: it clones the VM templates, creates the node pools (roles, labels, taints, storage nodes) and runs the rolling updates. A cluster's whole topology fits in one variables file. That is how I created the cluster of the software factory, and I deploy the components of every cluster through GitOps: Envoy Gateway, External Secrets wired to Vault, kube-prometheus-stack, Longhorn, Datadog.",
        "J'ai ajouté au projet Terraform de l'équipe une méthode native. Rancher pilote vCenter : il clone les modèles de VM, crée les pools de nœuds (rôles, labels, taints, nœuds de stockage) et gère les mises à jour progressives. Toute la topologie d'un cluster tient dans un fichier de variables. C'est ainsi que j'ai créé le cluster de l'usine logicielle, et je déploie en GitOps les composants de chaque cluster : Envoy Gateway, External Secrets branché sur Vault, kube-prometheus-stack, Longhorn, Datadog.",
      ),
      result: t(
        'A new cluster in 10 to 15 minutes with `make apply`, documented for the team: the architecture, how it works, and a step-by-step tutorial.',
        "Un nouveau cluster en 10 à 15 minutes avec `make apply`, documenté pour l'équipe : l'architecture, le fonctionnement et un tutoriel pas à pas.",
      ),
      stack: [tool.terraform, tool.rancher, tool.vsphere, tool.kubernetes, tool.argo],
    },
    {
      id: 'java',
      title: t('A Java repository about to shut down', 'Un dépôt Java sur le point de fermer'),
      problem: t(
        'The daily package update failed across the fleet: the JDK repository had been abandoned, 8 security updates behind, and its shutdown was scheduled. At the same time, the developers wanted to move to Java 21.',
        'La mise à jour quotidienne des paquets échouait sur le parc : le dépôt des JDK était abandonné, avec 8 mises à jour de sécurité de retard, et sa fermeture était programmée. Les développeurs voulaient en même temps passer en Java 21.',
      ),
      did: t(
        'My first Ansible role: it installs Eclipse Temurin in the version a project asks for, JDK or JRE, on Debian and CentOS. Then the projects moved over, and the back-office applications went to Java 21.',
        'Mon premier rôle Ansible : il installe Eclipse Temurin dans la version demandée, en JDK ou en JRE, sur Debian et CentOS. Puis la migration des projets, avec les applications back-office passées en Java 21.',
      ),
      result: t('One role, used today by 16 projects, from Java 8 to Java 25.', "Un seul rôle, utilisé aujourd'hui par 16 projets, de Java 8 à Java 25."),
      stack: [tool.ansible, tool.temurin, tool.debian, tool.centos],
    },
    {
      id: 'monitoring',
      title: t('Knowing before the users do', 'Savoir avant les utilisateurs'),
      problem: t(
        'Across more than 400 servers, an incident has to show before anyone reports it.',
        "Sur plus de 400 serveurs, un incident doit se voir avant d'être signalé.",
      ),
      did: t(
        'Monitoring as code: Prometheus and Alertmanager jobs and alerting rules, exporters rolled out to the whole fleet by Ansible, Grafana dashboards for the teams. SLOs and SLAs in Datadog, which alert in Slack and in Jira.',
        "Le monitoring en code : les jobs et règles d'alerte Prometheus et Alertmanager, les exporters déployés sur tout le parc par Ansible, des tableaux de bord Grafana pour les équipes. Des SLO et SLA dans Datadog, qui alertent sur Slack et dans Jira.",
      ),
      result: t('Incidents are caught earlier, from the alert rather than from a report.', "Les incidents sont détectés plus tôt, par l'alerte plutôt que par un signalement."),
      stack: [tool.prometheus, tool.grafana, tool.datadog, tool.ansible, tool.jira],
    },
    {
      id: 'secrets',
      title: t('Secrets out of the code', 'Des secrets hors du code'),
      problem: t(
        'API gateway and database credentials, to keep out of the repositories, on the servers as in Kubernetes.',
        "Des identifiants de gateway d'API et de bases de données, à garder hors des dépôts, sur les serveurs comme dans Kubernetes.",
      ),
      did: t(
        'I set up HashiCorp Vault to keep them in one place, and External Secrets to hand them to the applications on Kubernetes. On the servers, the secrets of the Ansible projects are encrypted with Ansible Vault.',
        "J'ai mis en place HashiCorp Vault pour les centraliser, et External Secrets pour les livrer aux applications sur Kubernetes. Sur les serveurs, les secrets des projets Ansible sont chiffrés avec Ansible Vault.",
      ),
      result: t('Two mechanisms for one rule: no secret in clear text in a repository.', 'Deux mécanismes pour une seule règle : aucun secret en clair dans un dépôt.'),
      stack: [tool.vault, tool.externalsecrets, tool.kubernetes, tool.ansible],
    },
    {
      id: 'logs',
      title: t('Logs the developers read on their own', 'Des logs que les développeurs lisent seuls'),
      problem: t(
        'The developers have no access to the servers, yet they have to debug what runs there.',
        "Les développeurs n'ont pas accès aux serveurs, et doivent pourtant déboguer ce qui y tourne.",
      ),
      did: t(
        'The application logs, gathered with ELK: Filebeat on the servers, a Logstash pipeline and an index mapping for each log format, Kibana to search them.',
        'Les logs applicatifs centralisés avec ELK : Filebeat sur les serveurs, un pipeline Logstash et un mapping par format de log, Kibana pour les chercher.',
      ),
      result: t('The developers debug on their own, without asking for access.', "Les développeurs déboguent en autonomie, sans demander d'accès."),
      stack: [tool.elk, tool.logstash, tool.kibana],
    },
    {
      id: 'ai',
      title: t('An AI assistant to take to production', 'Un assistant IA à mettre en production'),
      problem: t(
        'A conversational assistant to take from code to production, with new needs: several LLM providers, a vector database, long-lived WebSocket connections.',
        'Un assistant conversationnel à faire passer du code à la production, avec des besoins nouveaux : plusieurs fournisseurs de LLM, une base vectorielle, des connexions WebSocket longues.',
      ),
      did: t(
        'Since 2025, its deployment: a Python API, several LLM providers (Mistral, Cohere), the Qdrant vector database and Langfuse to follow every request, all deployed by a two-phase Ansible pipeline with its secrets encrypted by Vault; an OpenResty gateway for the WebSockets (TLS, long-lived connections, CORS); an MCP server that opens data services to AI agents; and since September, traces and logs with OpenTelemetry, Tempo and Loki.',
        "Depuis 2025, son déploiement : une API Python, plusieurs fournisseurs de LLM (Mistral, Cohere), la base vectorielle Qdrant et Langfuse pour suivre chaque requête, le tout déployé par un pipeline Ansible en deux phases, avec les secrets chiffrés par Vault ; une gateway OpenResty pour les WebSockets (TLS, connexions longues, CORS) ; un serveur MCP qui ouvre des services de données aux agents IA ; et depuis septembre, les traces et les logs avec OpenTelemetry, Tempo et Loki.",
      ),
      result: t('A beta in production.', 'Une bêta en production.'),
      stack: [tool.python, tool.mistral, tool.qdrant, tool.langfuse, tool.mcp, tool.opentelemetry],
    },
    {
      id: 'mentoring',
      title: t('Training the next ones', 'Former les suivants'),
      problem: t(
        'Two DevOps apprentices to bring up to speed, on a critical production.',
        'Deux alternants DevOps à faire monter en compétence, sur une production critique.',
      ),
      did: t(
        'Mentoring them for two years: Ansible, Prometheus, the ELK stack and running a critical production.',
        'Leur tutorat pendant deux ans : Ansible, Prometheus, la suite ELK et la gestion de la production critique.',
      ),
      result: t('Both became autonomous.', 'Tous deux sont devenus autonomes.'),
      stack: [tool.ansible, tool.prometheus, tool.elk],
    },
  ],

  also: [
    {
      ongoing: true,
      text: t(
        'Moving a critical API from its servers to Kubernetes, behind a 3scale and OpenResty gateway.',
        "La migration d'une API critique de ses serveurs vers Kubernetes, derrière une gateway 3scale et OpenResty.",
      ),
    },
    {
      ongoing: false,
      text: t(
        "Jenkins on the software factory's cluster (Helm, Configuration as Code), on nodes of its own so that builds never slow the other workloads; the legacy pipelines kept running with Rundeck and Ansible.",
        "Jenkins sur le cluster de l'usine logicielle (Helm, Configuration as Code), sur des nœuds réservés pour que les builds ne ralentissent pas les autres charges ; les pipelines historiques maintenus avec Rundeck et Ansible.",
      ),
    },
    {
      ongoing: false,
      text: t(
        'Incidents from start to finish: the live response, post-mortems, communication with the people affected, architecture documents and runbooks.',
        "Les incidents de bout en bout : la réponse à chaud, les post-mortems, la communication aux parties prenantes, les documents d'architecture et les runbooks.",
      ),
    },
    {
      ongoing: false,
      text: t(
        'vSphere, internal and in a DMZ: Debian VMs, routing, firewalls, and a PHP application put in production on isolated servers.',
        'vSphere, en interne et en DMZ : VM Debian, routage, pare-feux, et une application PHP mise en production sur des serveurs isolés.',
      ),
    },
  ],

  stack: {
    work: [
      tool.linux,
      tool.debian,
      tool.centos,
      tool.vsphere,
      { name: 'vCloud Director' },
      tool.ansible,
      tool.terraform,
      { name: 'Kubernetes (RKE2)', logo: 'kubernetes' },
      tool.rancher,
      tool.argo,
      tool.helm,
      { name: 'Kustomize' },
      tool.docker,
      tool.jenkins,
      tool.rundeck,
      tool.gitlab,
      tool.vault,
      tool.externalsecrets,
      tool.envoy,
      tool.longhorn,
      tool.prometheus,
      { name: 'Alertmanager', logo: 'prometheus' },
      tool.grafana,
      tool.datadog,
      tool.elk,
      tool.opensearch,
      tool.opentelemetry,
      { name: 'OpenResty' },
      tool.threescale,
      tool.qdrant,
      tool.langfuse,
      tool.ovh,
      tool.bash,
      tool.python,
    ],
    projects: [
      { name: 'AWS EKS', logo: 'eks' },
      { name: 'VPC, IAM, S3', logo: 'awscloud' },
      { name: 'Secrets Manager', logo: 'secretsmanager' },
      { name: 'k3d', logo: 'k3d' },
      { name: 'cert-manager' },
      { name: 'Sloth', logo: 'sloth' },
      { name: 'GitHub Actions', logo: 'githubactions' },
      { name: 'Trivy', logo: 'trivy' },
    ],
  },

  path: [
    {
      when: t('Since 2023', 'Depuis 2023'),
      role: t('DevOps and SRE engineer', 'Ingénieur DevOps et SRE'),
      where: t(
        'A software publisher, in-house infrastructure team. An apprentice first, permanent since October 2024.',
        "Un éditeur de logiciels, équipe infrastructure interne. D'abord en alternance, en CDI depuis octobre 2024.",
      ),
    },
    {
      when: t('2022 to 2023', '2022 à 2023'),
      role: t('DevOps engineer, apprentice', 'Ingénieur DevOps en alternance'),
      where: t(
        'An adtech SME: applications moved to Docker and Kubernetes, a first Prometheus and Grafana monitoring.',
        "Une PME de l'adtech : des applications passées sur Docker et Kubernetes, un premier monitoring Prometheus et Grafana.",
      ),
    },
    {
      when: t('2021 to 2022', '2021 à 2022'),
      role: t('Automation engineer, apprentice', 'Automaticien en alternance'),
      where: t(
        "The energy branch of a large construction group: the electrical distribution of a metro line's structures.",
        "La branche énergie d'un grand groupe du BTP : la distribution électrique des ouvrages d'une ligne de métro.",
      ),
    },
  ],

  education: [
    {
      when: t('2022 to 2024', '2022 à 2024'),
      degree: t('MSc-level degree in DevOps and Cloud, Sup de Vinci', 'Mastère DevOps & Cloud, Sup de Vinci'),
      note: t(
        'Thesis: monitoring and diagnosing problems in real time, to resolve incidents fast.',
        'Mémoire : surveiller et diagnostiquer les problèmes en temps réel, pour résoudre vite les incidents.',
      ),
    },
    {
      when: t('2021 to 2022', '2021 à 2022'),
      degree: t("Professional bachelor's degree in industrial IT, IUT de Ville-d'Avray", "Licence professionnelle I2AP, IUT de Ville-d'Avray"),
      note: t('Industrial computing, automation and production.', 'Informatique industrielle, automatisme et productique.'),
    },
    {
      when: t('2019 to 2021', '2019 à 2021'),
      degree: t("Two-year degree in electrical engineering and industrial IT, IUT de Ville-d'Avray", "DUT GEII, IUT de Ville-d'Avray"),
      note: t('A French technical degree, the DUT GEII.', 'Génie électrique et informatique industrielle.'),
    },
  ],

  languages: t('French, native. English, professional and technical.', 'Français, langue maternelle. Anglais, professionnel et technique.'),
};
