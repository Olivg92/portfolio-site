// Every string the pages show, in both languages. A page reads its own
// language's entry, so a missing translation is a type error, not a blank.
export const languages = { en: 'English', fr: 'Français' } as const;
export type Lang = keyof typeof languages;

type Strings = {
  title: string;
  description: string;
  kicker: string;
  lede: string;
  project: string;
  github: string;
  switchTo: string;
};

export const ui: Record<Lang, Strings> = {
  en: {
    title: 'Olivier Guandalini · DevOps, SRE, platform engineer',
    description:
      'Portfolio of Olivier Guandalini, DevOps and SRE engineer. Under construction; the first project, platform-eks-gitops, is on GitHub.',
    kicker: 'DevOps · SRE · Platform engineering',
    lede: 'This site is being built. Until it is ready, the first project is on GitHub:',
    project: 'platform-eks-gitops, a Kubernetes platform built on k3d and validated on AWS EKS',
    github: 'All my repositories on GitHub',
    switchTo: 'Français',
  },
  fr: {
    title: 'Olivier Guandalini · DevOps, SRE, plateforme',
    description:
      "Portfolio d'Olivier Guandalini, ingénieur DevOps et SRE. En construction ; le premier projet, platform-eks-gitops, est sur GitHub.",
    kicker: 'DevOps · SRE · Platform engineering',
    lede: "Ce site est en construction. En attendant, le premier projet est sur GitHub :",
    project: 'platform-eks-gitops, une plateforme Kubernetes développée sur k3d et validée sur AWS EKS',
    github: 'Tous mes dépôts sur GitHub',
    switchTo: 'English',
  },
};
