# Contexte projet

Ce repo est le site vitrine de mon portfolio public DevOps / SRE / Platform Engineer (phase 2 du plan), destiné à des recruteurs.
Le plan complet et l'avancement sont dans @../PLAN.md (fichier local, hors du repo, commun aux trois projets) : le lire avant toute tâche et cocher les cases terminées.

## Mon profil
- Ingénieur DevOps/SRE, expérience principale : infra Linux on-prem à grande échelle
- Stack maîtrisée : Kubernetes (RKE2/Rancher), Terraform, Ansible, ArgoCD, Vault + External Secrets, Prometheus/Grafana, ELK
- Me parler en français ; code, commentaires, commits et docs du repo en anglais ; le contenu du site en anglais et en français

## Règles non négociables
- **Confidentialité** : ne jamais mentionner mon employeur, ses hosts, IP, URLs ou données. Tout exemple issu de mon expérience doit être anonymisé.
- **Sécurité** : aucun secret, clé ou token dans le repo. Le déploiement passe par le jeton OIDC de GitHub Pages, rien d'autre.
- **Site public** : chaque page existe dans les deux langues, et rien n'est publié qui ne soit prêt à être lu par un recruteur.
- **Léger** : HTML et CSS statiques, du JavaScript seulement là où une page en a besoin, pas de framework côté client. Lighthouse à 90 ou plus partout.

## Choix validés
- Tout le site en sombre, dans le style « salle de contrôle ». Accueil : une grande image isométrique de la plateforme, en version nuit. Page platform-eks-gitops : la visite guidée en 18 étapes.
- Anglais à la racine, français sous `/fr/`.
- Système de design : couleurs, polices, tailles et espacements sont des variables dans `src/styles/tokens.css`. Les composants de `src/components/` y prennent toutes leurs couleurs (une nuance passe par `color-mix()`), jamais de valeur à eux. Polices Geist et Geist Mono servies par le site lui-même.
- Contact : LinkedIn et GitHub (`src/links.ts`), jamais d'adresse mail.
- Visite guidée de platform-eks-gitops : chaque bloc de terminal est la vraie sortie d'une exécution (`src/tour/transcripts/`), jamais inventée ; compte AWS et adresses IP masqués. Le seul JavaScript du site est sur cette page, et elle se lit sans. `scripts/check-tour.mjs` la teste dans Chrome en CI.
- Aperçus de liens (LinkedIn) : images dans `public/og/` (accueil, visite, expérience), redessinées avec `npm run og` sur un build servi dès que le look de l'une de ces pages change.
- Page Expérience (`src/experience.ts`) : mon travail raconté en problèmes résolus, au niveau de détail d'un entretien. Les employeurs sont décrits par leur type, jamais nommés (l'actuel : « un éditeur de logiciels ») ; on y publie ce que je dirais en entretien à quelqu'un d'extérieur : ma façon de travailler et mes choix techniques, jamais ce qui appartient à l'entreprise (hôte, produit, chiffre de l'entreprise comme sa disponibilité, ses utilisateurs ou ses incidents, projet non annoncé, détail de sécurité).
- Outils : chaque techno du site est une chip qui ouvre une carte (ce que c'est, et sur un projet ce qu'elle y fait), sans JavaScript (Popover API, `interestfor` pour le survol dans Chrome et Edge). Le catalogue est `src/tools.ts` ; `scripts/check-cards.mjs` teste les cartes dans Chrome et dans WebKit (moteur de Safari) en CI.
- Les projets et leur stack sont dans `src/projects.ts` ; chaque techno a son logo à côté de son nom quand il existe (`src/logos.ts` : Simple Icons, icônes d'architecture AWS, External Secrets).
- Adresse : https://olivg92.github.io/portfolio-site/ pour l'instant, à remplacer plus tard par un nom de domaine (`site` et `base` dans `astro.config.mjs`).

## Façon de travailler
- Avancer étape par étape selon PLAN.md, une branche + une PR par étape
- Proposer un plan avant les changements importants, puis attendre ma validation
- Petits commits en Conventional Commits
- Après chaque étape : mettre à jour le README si nécessaire et lancer les checks (`pre-commit run -a`)

## Commandes
- `npm run dev` / `npm run build` / `npm run preview` : le site en local (Node 22.12 ou plus, sinon le conteneur du README)
- `npm run check` : les types
- `pre-commit run -a` : lint et secrets
