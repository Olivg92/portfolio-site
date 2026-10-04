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
  contact: string;
  status: string;
  kicker: string;
  lede: string;
  seeProject: string;
  projectStatus: string;
  projectSummary: string;
  projectStack: string;
  projectCode: string;
  projectMeasured: string;
  contactText: string;
  source: string;
  builtWith: string;
};

export const ui: Record<Lang, Strings> = {
  en: {
    title: 'Olivier Guandalini · DevOps, SRE, platform engineer',
    description:
      'Portfolio of Olivier Guandalini, DevOps and SRE engineer. Under construction; the first project, platform-eks-gitops, is on GitHub.',
    skip: 'Skip to content',
    language: 'Language',
    contact: 'Contact',
    status: 'Site under construction',
    kicker: 'DevOps · SRE · Platform engineering',
    lede: 'This site is being built. Until it is ready, here is the first finished project.',
    seeProject: 'See the project',
    projectStatus: 'Finished',
    projectSummary:
      'A Kubernetes platform developed on a laptop with k3d, then validated on AWS EKS. Argo CD installs every component from git, no secret lives in the repository, the demo API has SLOs with burn-rate alerts, and one command tears the AWS side down.',
    projectStack: 'Built with',
    projectCode: 'Read the code on GitHub',
    projectMeasured: 'Measured from a fresh clone: 4 minutes 33 seconds until this check is all green.',
    contactText: 'Write to me on LinkedIn. My code is on GitHub.',
    source: 'Source of this site',
    builtWith: 'Built with Astro, hosted on GitHub Pages',
  },
  fr: {
    title: 'Olivier Guandalini · DevOps, SRE, plateforme',
    description:
      "Portfolio d'Olivier Guandalini, ingénieur DevOps et SRE. En construction\u00a0; le premier projet, platform-eks-gitops, est sur GitHub.",
    skip: 'Aller au contenu',
    language: 'Langue',
    contact: 'Contact',
    status: 'Site en construction',
    kicker: 'DevOps · SRE · Platform engineering',
    lede: 'Ce site est en construction. En attendant, voici le premier projet terminé.',
    seeProject: 'Voir le projet',
    projectStatus: 'Terminé',
    projectSummary:
      "Une plateforme Kubernetes développée sur un portable avec k3d, puis validée sur AWS EKS. Argo CD installe chaque composant depuis git, aucun secret n'est dans le dépôt, l'API de démo a ses SLO et ses alertes de burn rate, et une seule commande détruit la partie AWS.",
    projectStack: 'Construit avec',
    projectCode: 'Lire le code sur GitHub',
    projectMeasured: "Mesuré depuis un clone neuf\u00a0: 4 minutes 33 secondes jusqu'à ce contrôle tout au vert.",
    contactText: 'Écrivez-moi sur LinkedIn. Mon code est sur GitHub.',
    source: 'Code source de ce site',
    builtWith: 'Construit avec Astro, hébergé sur GitHub Pages',
  },
};
