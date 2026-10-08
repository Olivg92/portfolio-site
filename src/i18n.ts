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
  pages: string;
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
  here: string;
  toolsHint: string;
  readCode: string;
  measured: string;
  contactText: string;
  source: string;
  builtWith: string;
  takeTour: string;
  previewAlt: { home: string; tour: string; experience: string };
  experience: {
    nav: string;
    mine: string;
    title: string;
    description: string;
    eyebrow: string;
    heading: string;
    numbers: string;
    solvedEyebrow: string;
    solvedTitle: string;
    solvedLede: string;
    toolsHint: string;
    problem: string;
    did: string;
    result: string;
    showDetails: string;
    hideDetails: string;
    alsoTitle: string;
    ongoing: string;
    stackTitle: string;
    atWork: string;
    inProjects: string;
    pathTitle: string;
    educationTitle: string;
    languages: string;
    nextTitle: string;
    nextText: string;
  };
  tour: {
    title: string;
    description: string;
    eyebrow: string;
    heading: string;
    lede: string;
    start: string;
    label: string;
    chapters: string;
    step: string;
    of: string;
    overview: string;
    scroll: string;
    previous: string;
    next: string;
    target: string;
    outroTitle: string;
    outroText: string;
    allProjects: string;
  };
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
    pages: 'Site pages',
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
    here: 'Here',
    toolsHint: 'Hover or tap a tool to see what it is, and what it does here.',
    readCode: 'Read the code on GitHub',
    measured: 'Measured from a fresh clone: 4 minutes 33 seconds until this check is all green.',
    contactText: 'Write to me on LinkedIn. My code is on GitHub.',
    source: 'Source of this site',
    builtWith: 'Built with Astro, hosted on GitHub Pages',
    takeTour: 'Take the guided tour',
    previewAlt: {
      home: 'Olivier Guandalini, DevOps and SRE engineer, beside platform-eks-gitops drawn in isometric view',
      tour: 'A step of the guided tour of platform-eks-gitops: the drawing of the platform beside what make local-up printed',
      experience: 'What Olivier Guandalini runs in production, in numbers: 400+ on-prem Linux servers, a Kubernetes cluster in about 15 minutes',
    },
    experience: {
      nav: 'Experience',
      mine: 'My experience',
      title: 'Experience · Olivier Guandalini',
      description:
        'Olivier Guandalini, DevOps and SRE engineer: 400+ on-prem Linux servers, Kubernetes clusters created as code, monitoring as code, an AI assistant taken to production. What I solved at work, case by case.',
      eyebrow: 'Experience · 4 years in production',
      heading: 'What I run in production',
      numbers: 'In numbers',
      solvedEyebrow: 'At work',
      solvedTitle: 'Problems solved',
      solvedLede: 'Each time: the problem, what I did, and what it changed.',
      toolsHint: 'Hover or tap a tool to see what it is.',
      problem: 'The problem',
      did: 'What I did',
      result: 'The result',
      showDetails: 'Show the details',
      hideDetails: 'Hide the details',
      alsoTitle: 'Also',
      ongoing: 'In progress',
      stackTitle: 'The tools, and where I use them',
      atWork: 'At work, in production',
      inProjects: 'In my projects, on my own time',
      pathTitle: 'Path',
      educationTitle: 'Education',
      languages: 'Languages',
      nextTitle: 'And on my own time',
      nextText:
        'The public projects on this site take the same subjects end to end, on AWS and on a laptop: cloned in minutes, documented, checked on every change.',
    },
    tour: {
      title: 'platform-eks-gitops, command by command · Olivier Guandalini',
      description:
        'A guided tour of platform-eks-gitops in 18 steps, from git clone to make down: what each command does and what it printed in a real run, on k3d, then on AWS EKS.',
      eyebrow: 'Guided tour · 18 steps',
      heading: 'platform-eks-gitops, command by command',
      lede: 'Eighteen steps, from `git clone` to `make down`. As you scroll, the drawing builds itself, and each command says what it does and shows what it printed in a real run.',
      start: 'Start the tour',
      label: 'Guided tour',
      chapters: 'Chapters',
      step: 'Step',
      of: 'of',
      overview: 'Overview: the platform on AWS, every check passed',
      scroll: 'Scroll, and the platform builds itself',
      previous: 'Previous',
      next: 'Next',
      target: 'Target it runs:',
      outroTitle: 'What the tour does not show',
      outroText: 'The reasons behind each choice are written down in the repository: twelve architecture decision records, a runbook for each alert, and what would change in production.',
      allProjects: 'All the projects',
    },
  },
  fr: {
    title: 'Olivier Guandalini · DevOps, SRE, plateforme',
    description:
      "Olivier Guandalini, ingénieur DevOps et SRE\u00a0: de l'infrastructure critique à grande échelle, et des plateformes construites de bout en bout, de Terraform au GitOps, aux SLO et aux runbooks.",
    skip: 'Aller au contenu',
    language: 'Langue',
    projects: 'Projets',
    contact: 'Contact',
    pages: 'Pages du site',
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
    here: 'Ici',
    toolsHint: "Survolez ou touchez un outil pour voir ce que c'est, et ce qu'il fait ici.",
    readCode: 'Lire le code sur GitHub',
    measured: "Mesuré depuis un clone neuf\u00a0: 4 minutes 33 secondes jusqu'à ce contrôle tout au vert.",
    contactText: 'Écrivez-moi sur LinkedIn. Mon code est sur GitHub.',
    source: 'Code source de ce site',
    builtWith: 'Construit avec Astro, hébergé sur GitHub Pages',
    takeTour: 'Faire la visite guidée',
    previewAlt: {
      home: 'Olivier Guandalini, ingénieur DevOps et SRE, à côté de platform-eks-gitops en vue isométrique',
      tour: "Une étape de la visite guidée de platform-eks-gitops\u00a0: le schéma de la plateforme à côté de ce qu'a affiché make local-up",
      experience: "Ce qu'Olivier Guandalini fait tourner en production, en chiffres\u00a0: 400+ serveurs Linux on-prem, un cluster Kubernetes en 15 minutes environ",
    },
    experience: {
      nav: 'Expérience',
      mine: 'Mon expérience',
      title: 'Expérience · Olivier Guandalini',
      description:
        "Olivier Guandalini, ingénieur DevOps et SRE\u00a0: 400+ serveurs Linux on-prem, des clusters Kubernetes créés en code, le monitoring en code, un assistant IA mis en production. Ce que j'ai résolu au travail, cas par cas.",
      eyebrow: 'Expérience · 4 ans en production',
      heading: 'Ce que je fais tourner en production',
      numbers: 'En chiffres',
      solvedEyebrow: 'Au travail',
      solvedTitle: 'Problèmes résolus',
      solvedLede: "Chaque fois\u00a0: le problème, ce que j'ai fait, et ce que ça a changé.",
      toolsHint: "Survolez ou touchez un outil pour voir ce que c'est.",
      problem: 'Le problème',
      did: "Ce que j'ai fait",
      result: 'Le résultat',
      showDetails: 'Voir le détail',
      hideDetails: 'Masquer le détail',
      alsoTitle: 'Aussi',
      ongoing: 'En cours',
      stackTitle: 'Les outils, et où je les utilise',
      atWork: 'Au travail, en production',
      inProjects: 'Dans mes projets, sur mon temps libre',
      pathTitle: 'Parcours',
      educationTitle: 'Formation',
      languages: 'Langues',
      nextTitle: 'Et sur mon temps libre',
      nextText:
        "Les projets publics de ce site reprennent ces sujets de bout en bout, sur AWS et sur un portable\u00a0: clonés en quelques minutes, documentés, vérifiés à chaque changement.",
    },
    tour: {
      title: 'platform-eks-gitops, commande par commande · Olivier Guandalini',
      description:
        "Une visite guidée de platform-eks-gitops en 18 étapes, du git clone au make down\u00a0: ce que fait chaque commande et ce qu'elle a affiché lors d'une vraie exécution, sur k3d, puis sur AWS EKS.",
      eyebrow: 'Visite guidée · 18 étapes',
      heading: 'platform-eks-gitops, commande par commande',
      lede: "Dix-huit étapes, du `git clone` au `make down`. Au fil du défilement, le schéma se construit, et chaque commande dit ce qu'elle fait et montre ce qu'elle a affiché lors d'une vraie exécution.",
      start: 'Commencer la visite',
      label: 'Visite guidée',
      chapters: 'Chapitres',
      step: 'Étape',
      of: 'sur',
      overview: "Vue d'ensemble\u00a0: la plateforme sur AWS, tous les contrôles réussis",
      scroll: 'Faites défiler, la plateforme se construit',
      previous: 'Précédent',
      next: 'Suivant',
      target: 'Cible appelée\u00a0:',
      outroTitle: 'Ce que la visite ne montre pas',
      outroText: "Les raisons de chaque choix sont écrites dans le dépôt\u00a0: douze ADR, un runbook par alerte, et ce qui changerait en production.",
      allProjects: 'Tous les projets',
    },
  },
};
