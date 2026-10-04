// Every string the pages show, in both languages. A page reads its own
// language's entry, so a missing translation is a type error, not a blank.
// French puts a no-break space, written \u00a0, before a colon or a
// semicolon, so neither ever starts a line on its own.
export const languages = { en: 'English', fr: 'Français' } as const;
export type Lang = keyof typeof languages;

type Strings = {
  title: string;
  description: string;
  skip: string;
  language: string;
  projects: string;
  contact: string;
  kicker: string;
  positioning: string;
  seeProjects: string;
  sceneLabel: string;
  stateBucket: string;
  flows: { gitops: string; traffic: string; secrets: string };
  projectsTitle: string;
  projectsLede: string;
  status: { finished: string; building: string; next: string };
  stack: string;
  readCode: string;
  measured: string;
  contactText: string;
  source: string;
  builtWith: string;
};

export const ui: Record<Lang, Strings> = {
  en: {
    title: 'Olivier Guandalini · DevOps, SRE, platform engineer',
    description:
      'Olivier Guandalini, DevOps and SRE engineer: critical infrastructure at scale, and platforms built end to end, from Terraform to GitOps, SLOs and runbooks.',
    skip: 'Skip to content',
    language: 'Language',
    projects: 'Projects',
    contact: 'Contact',
    kicker: 'DevOps · SRE · Platform engineering',
    positioning:
      'DevOps and SRE engineer, I run critical infrastructure at scale: more than 400 Linux servers on-prem and Kubernetes clusters. On this site, the platforms I build on my own time, end to end: from Terraform to GitOps, SLOs and runbooks.',
    seeProjects: 'See the projects',
    sceneLabel:
      'platform-eks-gitops on AWS, in isometric view: in a VPC, two Spot nodes run the pods Argo CD installs from GitHub; a load balancer brings the traffic in from the internet; secrets come from AWS Secrets Manager; the cluster is managed by EKS, its Terraform state kept in S3.',
    stateBucket: 'State bucket',
    flows: { gitops: 'GitOps, from git', traffic: 'Traffic', secrets: 'Secrets' },
    projectsTitle: 'Three projects, each one finished before the next',
    projectsLede: 'Every repository can be cloned and run: a README to start in minutes, the decisions written down, the checks run on every change.',
    status: { finished: 'Finished', building: 'In progress', next: 'Next' },
    stack: 'Built with',
    readCode: 'Read the code on GitHub',
    measured: 'Measured from a fresh clone: 4 minutes 33 seconds until this check is all green.',
    contactText: 'Write to me on LinkedIn. My code is on GitHub.',
    source: 'Source of this site',
    builtWith: 'Built with Astro, hosted on GitHub Pages',
  },
  fr: {
    title: 'Olivier Guandalini · DevOps, SRE, plateforme',
    description:
      "Olivier Guandalini, ingénieur DevOps et SRE\u00a0: de l'infrastructure critique à grande échelle, et des plateformes construites de bout en bout, de Terraform au GitOps, aux SLO et aux runbooks.",
    skip: 'Aller au contenu',
    language: 'Langue',
    projects: 'Projets',
    contact: 'Contact',
    kicker: 'DevOps · SRE · Platform engineering',
    positioning:
      "Ingénieur DevOps et SRE, je fais tourner une infrastructure critique à grande échelle\u00a0: plus de 400 serveurs Linux on-prem et des clusters Kubernetes. Sur ce site, les plateformes que je construis sur mon temps libre, de bout en bout\u00a0: de Terraform au GitOps, aux SLO et aux runbooks.",
    seeProjects: 'Voir les projets',
    sceneLabel:
      "platform-eks-gitops sur AWS, en vue isométrique\u00a0: dans un VPC, deux nœuds Spot font tourner les pods qu'Argo CD installe depuis GitHub\u00a0; un load balancer fait entrer le trafic d'internet\u00a0; les secrets viennent d'AWS Secrets Manager\u00a0; le cluster est géré par EKS, et son état Terraform est gardé dans S3.",
    stateBucket: "Bucket d'état",
    flows: { gitops: 'GitOps, depuis git', traffic: 'Trafic', secrets: 'Secrets' },
    projectsTitle: 'Trois projets, chacun terminé avant le suivant',
    projectsLede: "Chaque dépôt se clone et se lance\u00a0: un README pour démarrer en quelques minutes, les décisions écrites, les vérifications rejouées à chaque changement.",
    status: { finished: 'Terminé', building: 'En cours', next: 'À venir' },
    stack: 'Construit avec',
    readCode: 'Lire le code sur GitHub',
    measured: "Mesuré depuis un clone neuf\u00a0: 4 minutes 33 secondes jusqu'à ce contrôle tout au vert.",
    contactText: 'Écrivez-moi sur LinkedIn. Mon code est sur GitHub.',
    source: 'Code source de ce site',
    builtWith: 'Construit avec Astro, hébergé sur GitHub Pages',
  },
};
