// Every string the pages show, in both languages. A page reads its own
// language's entry, so a missing translation is a type error, not a blank.
// French puts a no-break space, written \u00a0, before a colon or a
// semicolon, so neither ever starts a line on its own.
export const languages = { en: 'English', fr: 'Français' } as const;
export type Lang = keyof typeof languages;

/** The four strengths of the home page, in the order it shows them. */
export type StrengthId = 'reliability' | 'automation' | 'platforms' | 'mentoring';
/** The figures of the home page's first screen. */
export type NumberId = 'servers' | 'cluster' | 'mentor' | 'clone';

type Strings = {
  title: string;
  description: string;
  skip: string;
  language: string;
  projects: string;
  contact: string;
  pages: string;
  seeProjects: string;
  projectsTitle: string;
  projectsLede: string;
  status: { finished: string; building: string };
  stack: string;
  here: string;
  toolsHint: string;
  readCode: string;
  contactText: string;
  /** The large words of the contact section. */
  talk: string;
  source: string;
  /** Read by screen readers after a link to another site. */
  newTab: string;
  builtWith: string;
  takeTour: string;
  /** The CV as a PDF: the button on the experience page, in the footer, and
   *  the shorter call of the home page (`cta`), which fits beside LinkedIn. */
  cv: { download: string; short: string; cta: string };
  /** The job title search engines read in the structured data of the home page. */
  jobTitle: string;
  previewAlt: { home: string; tour: string; experience: string };
  home: {
    /** The plain sentence under the name. */
    pitch: string;
    linkedin: string;
    facts: { label: string; open: string; years: string; place: string; languages: string };
    /** Each figure's label, what a screen reader says instead of the figure,
     *  and the words under it. The figures themselves come from
     *  experience.ts (and the demo's from Home.astro): change both together. */
    numbers: Record<NumberId, { cap: string; spoken: string; caption: string }>;
    flagship: string;
    stack: string;
    /** The CV tile: the file's language, and the link to the other one. */
    cvFormat: string;
    cvOther: string;
    strengths: { eyebrow: string; title: string; items: Record<StrengthId, { title: string; text: string }> };
    /** `more` is told how many problems the experience page solves, so the
     *  number never goes stale. */
    career: { eyebrow: string; title: string; more: (count: number) => string };
  };
  experience: {
    nav: string;
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
    seeProjects: 'See the projects',
    projectsTitle: 'Two projects, built end to end on my own time',
    projectsLede: 'Each one finished before the next: anyone can run it in minutes, the decisions are written down, and every change is checked.',
    status: { finished: 'Finished', building: 'In progress' },
    stack: 'Built with',
    here: 'Here',
    toolsHint: 'Hover or tap a tool to see what it is, and what it does here.',
    readCode: 'Read the code on GitHub',
    contactText: 'Write to me on LinkedIn. My code is on GitHub.',
    talk: 'Let’s talk.',
    source: 'Source of this site',
    newTab: '(opens in a new tab)',
    builtWith: 'Built with Astro, hosted on GitHub Pages',
    takeTour: 'Take the guided tour',
    cv: { download: 'Download my CV (PDF)', short: 'My CV (PDF)', cta: 'Download my CV' },
    jobTitle: 'DevOps and SRE engineer',
    previewAlt: {
      home: 'Olivier Guandalini, DevOps and SRE engineer, beside platform-eks-gitops drawn in isometric view',
      tour: 'A step of the guided tour of platform-eks-gitops: the drawing of the platform beside what make local-up printed',
      experience: 'What Olivier Guandalini runs in production, in numbers: 400+ on-prem Linux servers, a Kubernetes cluster in about 15 minutes',
    },
    home: {
      pitch: 'I keep critical services running, and turn the infrastructure behind them into code.',
      linkedin: 'Message me on LinkedIn',
      facts: {
        label: 'At a glance',
        open: 'Open to a conversation',
        years: '4 years of experience',
        place: 'Paris area',
        languages: 'French · professional English',
      },
      numbers: {
        servers: { cap: 'Production', spoken: 'More than 400', caption: 'Linux servers I keep running' },
        cluster: { cap: 'Automation', spoken: 'About 15 minutes', caption: 'to create a Kubernetes cluster, as code' },
        mentor: { cap: 'Mentoring', spoken: '2', caption: 'apprentices trained up to full autonomy' },
        clone: { cap: 'Demo', spoken: '4 minutes 33 seconds', caption: 'to start my demo platform from scratch, every check green' },
      },
      flagship: 'Flagship project',
      stack: 'Tech stack',
      cvFormat: 'PDF · English',
      cvOther: 'My CV in French',
      strengths: {
        eyebrow: 'Strengths',
        title: 'What I bring to a team',
        items: {
          reliability: {
            title: 'Reliability',
            text: 'Production stays up: monitoring written as code, alerts that warn before users do, incidents handled from the first minute to the post-mortem.',
          },
          automation: {
            title: 'Automation',
            text: 'What repeats becomes code: servers configured by Ansible, infrastructure described in Terraform, deployments through GitOps.',
          },
          platforms: {
            title: 'Kubernetes and cloud',
            text: 'Modern platforms, on-prem and in the cloud: Kubernetes with Rancher at work, AWS EKS in my own projects.',
          },
          mentoring: {
            title: 'Passing it on',
            text: 'I write the docs and train people: two apprentices brought to full autonomy, tutorials and runbooks for the team.',
          },
        },
      },
      career: {
        eyebrow: 'Career',
        title: 'Four years in production',
        more: (count) => `The full story: ${count} problems I solved at work`,
      },
    },
    experience: {
      nav: 'Experience',
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
      outroText: 'The reasons behind each choice are written down in the repository: thirteen architecture decision records, a runbook for each alert, and what would change in production.',
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
    seeProjects: 'Voir les projets',
    projectsTitle: 'Deux projets, construits de bout en bout sur mon temps libre',
    projectsLede: "Chacun terminé avant le suivant\u00a0: n'importe qui peut le lancer en quelques minutes, les décisions sont écrites, et chaque changement est vérifié.",
    status: { finished: 'Terminé', building: 'En cours' },
    stack: 'Construit avec',
    here: 'Ici',
    toolsHint: "Survolez ou touchez un outil pour voir ce que c'est, et ce qu'il fait ici.",
    readCode: 'Lire le code sur GitHub',
    contactText: 'Écrivez-moi sur LinkedIn. Mon code est sur GitHub.',
    talk: 'Parlons-en.',
    source: 'Code source de ce site',
    newTab: "(s'ouvre dans un nouvel onglet)",
    builtWith: 'Construit avec Astro, hébergé sur GitHub Pages',
    takeTour: 'Faire la visite guidée',
    cv: { download: 'Télécharger mon CV (PDF)', short: 'Mon CV (PDF)', cta: 'Télécharger mon CV' },
    jobTitle: 'Ingénieur DevOps et SRE',
    previewAlt: {
      home: 'Olivier Guandalini, ingénieur DevOps et SRE, à côté de platform-eks-gitops en vue isométrique',
      tour: "Une étape de la visite guidée de platform-eks-gitops\u00a0: le schéma de la plateforme à côté de ce qu'a affiché make local-up",
      experience: "Ce qu'Olivier Guandalini fait tourner en production, en chiffres\u00a0: 400+ serveurs Linux on-prem, un cluster Kubernetes en 15 minutes environ",
    },
    home: {
      pitch: "Je garde des services critiques en marche, et je transforme l'infrastructure qui les porte en code.",
      linkedin: "M'écrire sur LinkedIn",
      facts: {
        label: 'En bref',
        open: 'Ouvert à la discussion',
        years: "4 ans d'expérience",
        place: 'Région parisienne',
        languages: 'Français · anglais professionnel',
      },
      numbers: {
        servers: { cap: 'Production', spoken: 'Plus de 400', caption: 'serveurs Linux que je fais tourner' },
        cluster: { cap: 'Automatisation', spoken: 'Environ 15 minutes', caption: 'pour créer un cluster Kubernetes, en code' },
        mentor: { cap: 'Transmission', spoken: '2', caption: "alternants formés jusqu'à l'autonomie" },
        clone: { cap: 'Démo', spoken: '4 minutes 33 secondes', caption: 'pour lancer ma plateforme de démo depuis zéro, tout au vert' },
      },
      flagship: 'Projet phare',
      stack: 'Stack technique',
      cvFormat: 'PDF · français',
      cvOther: 'Mon CV en anglais',
      strengths: {
        eyebrow: 'Points forts',
        title: "Ce que j'apporte à une équipe",
        items: {
          reliability: {
            title: 'Fiabilité',
            text: 'La production tient\u00a0: une supervision écrite en code, des alertes qui préviennent avant les utilisateurs, des incidents gérés de la première minute au post-mortem.',
          },
          automation: {
            title: 'Automatisation',
            text: 'Ce qui se répète devient du code\u00a0: des serveurs configurés par Ansible, une infrastructure décrite en Terraform, des déploiements en GitOps.',
          },
          platforms: {
            title: 'Kubernetes et cloud',
            text: 'Des plateformes modernes, sur site et dans le cloud\u00a0: Kubernetes avec Rancher au travail, AWS EKS dans mes projets.',
          },
          mentoring: {
            title: 'Transmission',
            text: "J'écris la doc et je forme\u00a0: deux alternants menés jusqu'à l'autonomie, des tutoriels et des runbooks pour l'équipe.",
          },
        },
      },
      career: {
        eyebrow: 'Parcours',
        title: 'Quatre ans en production',
        more: (count) => `Le détail\u00a0: les ${count} problèmes que j'ai résolus au travail`,
      },
    },
    experience: {
      nav: 'Expérience',
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
      outroText: "Les raisons de chaque choix sont écrites dans le dépôt\u00a0: treize ADR, un runbook par alerte, et ce qui changerait en production.",
      allProjects: 'Tous les projets',
    },
  },
};
