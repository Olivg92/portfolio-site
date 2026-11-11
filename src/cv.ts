// The CV, as a PDF per language: the experience page printed, written into
// the build at /cv/ by scripts/cv-pdf.mjs, in CI and before each deployment.
// The script names the files the same way; a link to a name it did not write
// fails the dead-link check.
import type { Lang } from './i18n';

export const cvFile = (lang: Lang) => `olivier-guandalini-cv-${lang}.pdf`;
export const cvPath = (lang: Lang) => `/cv/${cvFile(lang)}`;
