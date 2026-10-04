// The scene of the guided tour: one drawing of the whole platform, on both
// grounds (the machine, then AWS), in which every element knows the steps it
// shows in. The page sets data-step on the drawing, and the rules generated
// here show what that step needs, fading the rest out. Drawn at build time,
// in the page's language, as plain SVG.
import { logos, type LogoName } from '../logos';
import type { Lang } from '../i18n';
import { steps } from './steps';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

// The steps an element shows in: single steps or inclusive ranges.
type Steps = (number | [number, number])[];
const LOCAL: [number, number] = [3, 10];
const LOCAL_PLATFORM: [number, number] = [7, 10];
const AWS: [number, number] = [12, 16];
const AWS_PLATFORM: [number, number] = [15, 16];

// What the camera frames on a narrow screen, step by step: the part of the
// drawing the step is about, so that its labels stay readable on a phone.
export const focus: Record<number, [number, number, number, number]> = {
  1: [200, 6, 290, 116],
  2: [28, 170, 410, 250],
  3: [20, 146, 330, 104],
  4: [30, 496, 312, 92],
  5: [236, 180, 212, 84],
  6: [228, 100, 262, 160],
  7: [30, 254, 572, 246],
  8: [30, 254, 572, 246],
  9: [30, 590, 620, 62],
  10: [30, 494, 620, 198],
  11: [150, 312, 380, 120],
  12: [104, 270, 472, 176],
  13: [104, 240, 472, 202],
  14: [104, 240, 472, 202],
  15: [24, 150, 632, 450],
  16: [24, 150, 632, 500],
  17: [150, 312, 380, 120],
  18: [52, 162, 576, 346],
};

export const SCENE_WIDTH = 680;
export const SCENE_HEIGHT = 716;

export function tourScene(lang: Lang) {
  const L = (en: string, fr: string) => (lang === 'en' ? en : fr);
  const used = new Set<LogoName>();
  const out: string[] = [];

  const S = (...specs: Steps) =>
    specs
      .flatMap((spec) => (Array.isArray(spec) ? range(spec[0], spec[1]) : [spec]))
      .map((n) => `s${n}`)
      .join(' ');
  const R = (x: number, y: number, w: number, h: number, cls = 'box', rx = 10) =>
    `<rect class="${cls}" x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/>`;
  const T = (x: number, y: number, text: string, cls = 'lbl', anchor: 'start' | 'middle' | 'end' = 'start') =>
    `<text class="${cls}" x="${x}" y="${y}"${anchor === 'start' ? '' : ` text-anchor="${anchor}"`}>${esc(text)}</text>`;
  const g = (cls: string, ...parts: string[]) => out.push(`<g class="el ${cls}">${parts.join('')}</g>`);
  const logo = (name: LogoName, x: number, y: number, w: number, h = w) => {
    used.add(name);
    return `<use href="#tl-${name}" x="${x}" y="${y}" width="${w}" height="${h}"/>`;
  };
  // A generic padlock for cert-manager, which has no simple logo.
  const lock = (x: number, y: number, size: number) => `<use class="glyph" href="#tl-lock" x="${x}" y="${y}" width="${size}" height="${size}"/>`;

  // A chip: a logo and a word in a rounded box, on one row of the drawing. It
  // returns where the next one starts, and remembers its corner for a tick.
  // A wide logo, such as k3d's wordmark, is drawn lower and takes its width.
  const corners = new Map<string, [number, number]>();
  const CHAR = 7.6;
  const chip = (x: number, y: number, label: string, mark: LogoName | 'lock' | null, cls: string, key = label) => {
    const aspect = mark && mark !== 'lock' ? ((logos[mark] as { aspect?: number }).aspect ?? 1) : 1;
    const [mw, mh] = aspect > 1.5 ? [Math.round(14 * aspect), 14] : [22, 22];
    const textX = mark ? x + 10 + mw + 8 : x + 14;
    const w = Math.round(textX - x + label.length * CHAR + 14);
    const parts = [R(x, y, w, 38, 'chip-r', 9)];
    if (mark === 'lock') parts.push(lock(x + 10, y + 8, 22));
    else if (mark) parts.push(logo(mark, x + 10, y + (38 - mh) / 2, mw, mh));
    parts.push(T(textX, y + 24, label, 'chip-t'));
    g(`chip ${cls}`, ...parts);
    corners.set(key, [x + w - 6, y + 2]);
    return x + w + 10;
  };
  // A flow: a line that draws itself, then packets running along it.
  const arrow = (d: string, cls: string, kind: 'gitops' | 'traffic' | 'secret', seconds = 1.8, count = 3) => {
    const packets = range(0, count - 1)
      .map((i) => `<circle r="3.4"><animateMotion dur="${seconds}s" repeatCount="indefinite" begin="${((-i * seconds) / count).toFixed(2)}s" path="${d}"/></circle>`)
      .join('');
    out.push(`<g class="el arrow a-${kind} ${cls}"><path d="${d}" pathLength="1"/><g class="pk">${packets}</g></g>`);
  };
  // A green tick: what an end-to-end check just verified.
  const tick = (x: number, y: number, cls: string) =>
    out.push(`<g class="el tick ${cls}"><circle cx="${x}" cy="${y}" r="10"/><path d="M${x - 5},${y} l3.5,3.5 l6.5,-7"/></g>`);
  const tickOn = (key: string, cls: string) => {
    const corner = corners.get(key);
    if (corner) tick(corner[0], corner[1], cls);
  };

  // The grounds: the machine, then the AWS account.
  g(`${S(LOCAL)} t8`, R(24, 150, 632, 548, 'frame-local', 16), logo('k3d', 40, 166, 50, 19), T(104, 182, L('ON THE MACHINE, IN DOCKER', 'SUR LA MACHINE, DANS DOCKER'), 'tag'));
  g(`${S(LOCAL)} t8 h3`, R(40, 200, 196, 30, 'mini-r', 7), T(52, 220, L('a kubeconfig of its own', 'un kubeconfig à part'), 'mini-t'));
  g(`${S(AWS)} g12 g13 t8`, R(24, 150, 632, 548, 'frame-aws', 16), logo('awscloud', 40, 162, 28));
  g('s12', T(80, 182, L('AWS ACCOUNT · EU-NORTH-1', 'COMPTE AWS · EU-NORTH-1'), 'tag'));
  g('s13', T(80, 182, L('TO CREATE · VPC 10.20.0.0/16 · EKS 1.36', 'À CRÉER · VPC 10.20.0.0/16 · EKS 1.36'), 'tag'));
  g(`${S([14, 16])} t8`, T(80, 182, 'EU-NORTH-1 · VPC 10.20.0.0/16', 'tag'), logo('eks', 536, 161, 26), T(640, 182, 'EKS 1.36', 'tag', 'end'));

  // The top band: the state bucket, the repository, and the number of each step.
  g(`${S([12, 18])} h12 hok17`, R(24, 16, 172, 96), logo('s3', 36, 30, 34), T(80, 54, L('State bucket', "Bucket d'état"), 'ttl'), T(80, 76, L('native locking', 'verrou natif'), 'small opt'));
  g(`${S([1, 18])} d10 h1 h18`, R(210, 16, 270, 96), logo('github', 222, 28, 26), T(258, 48, 'platform-eks-gitops', 'ttl'),
    R(222, 64, 110, 28, 'mini-r', 6), logo('terraform', 230, 70, 16), T(252, 83, 'terraform/', 'mini-t'),
    R(340, 64, 70, 28, 'mini-r', 6), T(375, 83, 'gitops/', 'mini-t', 'middle'),
    R(418, 64, 54, 28, 'mini-r', 6), T(445, 83, 'apps/', 'mini-t', 'middle'));
  g(S([1, 18]), R(494, 16, 162, 96), T(520, 38, L('IN NUMBERS', 'EN CHIFFRES'), 'tag'), '<circle class="live" cx="510" cy="34" r="3.5"/>');
  steps.forEach((step, i) => {
    const n = i + 1;
    // The box holds ten characters of number and 21 of caption, in Geist Mono.
    if (step.metric.value[lang].length > 10 || step.metric.caption[lang].length > 21) {
      throw new Error(`tour step ${n} (${lang}): its number or caption is too long for the box`);
    }
    const cls = ['metric', n === 10 ? 'metric-alert' : '', n === 11 || n === 17 ? 'metric-ok' : ''].filter(Boolean).join(' ');
    g(`s${n}${n === 17 ? ' late17' : ''}`, T(508, 72, step.metric.value[lang], cls), T(508, 98, step.metric.caption[lang], 'small'));
  });

  // Step 2: what make check-tools looks for.
  g('s2', T(40, 190, L('WHAT MAKE CHECK-TOOLS LOOKS FOR', 'CE QUE MAKE CHECK-TOOLS CHERCHE'), 'tag'));
  let x = 40;
  for (const [label, mark] of [['docker', 'docker'], ['k3d', 'k3d'], ['kubectl', 'kubernetes'], ['helm', 'helm']] as const) x = chip(x, 214, label, mark, 's2');
  x = 40;
  for (const [label, mark] of [['python3', 'python'], ['curl', 'curl']] as const) x = chip(x, 270, label, mark, 's2');
  g('s2', T(40, 346, L('AND FOR AWS', 'ET POUR AWS'), 'tag'));
  x = 40;
  for (const [label, mark] of [['terraform', 'terraform'], ['aws', 'awscloud']] as const) x = chip(x, 360, label, mark, 's2 dim2');

  // Argo CD, installed by Helm, then pointed at the repository.
  arrow('M340,196 V115', `${S([6, 10], AWS_PLATFORM)} d10 t7`, 'gitops', 1.6);
  g(`${S([6, 10])} d10 t7`, T(350, 140, L('root-local reads the repo', 'root-local lit le dépôt'), 'small'));
  g(`${S(AWS_PLATFORM)} t7`, T(350, 140, L('root-aws reads the repo', 'root-aws lit le dépôt'), 'small'));
  g(`${S([5, 10], AWS_PLATFORM)} d10 t7 h5 h9`, R(250, 196, 180, 54, 'box box-strong'), '<circle class="ring" cx="278" cy="223" r="19"/>', logo('argo', 262, 207, 32), T(304, 222, 'Argo CD', 'ttl'), T(304, 241, 'app-of-apps', 'small opt'));
  g('s5 s15', logo('helm', 400, 204, 22));

  // The applications, wave by wave, as their sync-wave annotations order them.
  const platform = `${S(LOCAL_PLATFORM, AWS_PLATFORM)} d10`;
  g(`${platform} w1 t6`, T(40, 266, L('WAVES', 'VAGUES'), 'tag'));
  const rows: [number, string, string, [string, LogoName | 'lock' | null, string, string?][]][] = [
    [272, '-2', 'w1 t6', [['cert-manager', 'lock', ''], ['Envoy Gateway', 'envoy', ''], ['External Secrets', 'externalsecrets', '']]],
    [330, '-1', 'w2 t5', [[L('Platform CA', 'CA plateforme'), 'lock', ''], ['SecretStore', 'externalsecrets', '', 'secretstore']]],
    [388, '0', 'w3 t4', [['gateway', 'envoy', ''], ['Prometheus', 'prometheus', 'h9'], ['Grafana', 'grafana', 'h9'], ['Sloth', 'sloth', '']]],
  ];
  for (const [y, wave, timing, chips] of rows) {
    g(`${platform} ${timing}`, R(40, y + 4, 44, 30, 'wave-r', 6), T(62, y + 24, wave, 'wave-t', 'middle'));
    x = 96;
    for (const [label, mark, extra, key] of chips) x = chip(x, y, label, mark, `${platform} ${timing} ${extra}`, key ?? label);
    if (wave === '-1') chip(x, y, 'Vault', 'vault', `${S(LOCAL_PLATFORM)} d10 w2 t5`);
  }
  g(`${S(LOCAL_PLATFORM, AWS_PLATFORM)} w4 t3`, R(40, 450, 44, 30, 'wave-r', 6), T(62, 470, '1', 'wave-t', 'middle'));
  x = chip(96, 446, 'demo-api × 2', 'fastapi', `${S(LOCAL_PLATFORM, AWS_PLATFORM)} w4 t3 h10`, 'demo-api');
  g('s10', R(x, 446, 200, 38, 'chaos-r', 9), T(x + 100, 470, L('/chaos: 3 in 10 fail', '/chaos : 3 sur 10 échouent'), 'chaos-t', 'middle'));
  chip(x + 210, 446, L('Grafana route', 'route Grafana'), 'grafana', `${S(LOCAL_PLATFORM, AWS_PLATFORM)} d10 w4 t3`);

  // The end-to-end checks tick what they verified, one after the other.
  tickOn('gateway', 's8 s16 c1');
  tickOn('Prometheus', 's8 s16 c2');
  tickOn('Grafana', 's8 s16 c3');
  tickOn('Sloth', 's8 s16 c4');
  tickOn('secretstore', 's8 s16 c5');
  tickOn('demo-api', 's8 s16 c6');
  tickOn('Vault', 's8 c6');

  // Step 9: each interface through a port-forward of its own.
  for (const [px, label] of [[40, ':8081 · Argo CD'], [247, ':3000 · Grafana'], [454, ':9090 · Prometheus']] as const) {
    g('s9', R(px, 604, 196, 34, 'port-r', 17), T(px + 98, 626, label, 'port-t', 'middle'));
  }

  // Steps 4 to 6: the image, built here and imported into the cluster.
  g('s4 s5 s6 h4', R(40, 508, 290, 66), T(54, 528, 'IMAGE', 'tag'), logo('docker', 54, 538, 22), T(86, 557, L('demo-api, imported into k3d', 'demo-api, importée dans k3d'), 'lbl'));

  // Where traffic comes in and where secrets come from: what changes between the two grounds.
  arrow('M169,508 V487', `${S([7, 9], AWS_PLATFORM)} t2`, 'traffic', 0.9, 2);
  arrow('M592,291 H646 V541 H643', `${S([7, 9], AWS_PLATFORM)} t2`, 'secret', 2.6);
  g(`${S([7, 9], AWS_PLATFORM)} t2`, R(40, 508, 290, 66), T(54, 528, L('WAY IN', 'ENTRÉE'), 'tag'));
  g(S([7, 9]), T(54, 558, 'localhost:8443', 'lbl'));
  g(`${S(AWS_PLATFORM)} t2`, logo('nlb', 54, 536, 26), T(88, 557, L('public NLB · 80 and 443', 'NLB public · 80 et 443'), 'lbl'));
  g(`${S([7, 9], AWS_PLATFORM)} t2`, R(350, 508, 290, 66), T(364, 528, 'SECRETS', 'tag'));
  g(S([7, 9]), logo('vault', 364, 538, 20), T(392, 557, L('Vault in dev mode', 'Vault en mode dev'), 'lbl'));
  g(`${S(AWS_PLATFORM)} t2`, logo('secretsmanager', 364, 536, 26), T(398, 557, 'Secrets Manager · Pod Identity', 'lbl'));
  tick(320, 512, 's16 c3');
  tick(630, 512, 's16 c4');

  // Step 10: the error budget drains, then the alert fires.
  g('s10', R(40, 508, 600, 176, 'box slo-box'), T(56, 532, L('SLO · AVAILABILITY', 'SLO · DISPONIBILITÉ'), 'tag'),
    T(56, 562, L('99.5% of requests without an error', '99,5 % des requêtes sans erreur'), 'ttl-l'),
    R(56, 578, 568, 16, 'budget-bg', 8), R(56, 578, 568, 16, 'budget-fill', 8),
    T(56, 618, L('error budget', "budget d'erreur"), 'small'), T(624, 618, L('burning 60 times too fast', 'fond 60 fois trop vite'), 'small small-alert', 'end'));
  g('s10 late10', R(56, 632, 330, 36, 'alert-r', 18), logo('prometheus', 66, 640, 20), T(94, 655, L('burn-rate alert firing', 'alerte de burn rate déclenchée'), 'alert-t'), T(400, 655, L('→ its runbook', '→ son runbook'), 'small'));

  // The Spot nodes: planned, then real.
  g(`${S([13, 16])} g13 t1`, R(40, 596, 290, 44, 'node-r', 22), logo('spot', 54, 605, 26), T(90, 624, L('Spot node t3.medium · 1a', 'nœud Spot t3.medium · 1a'), 'lbl'));
  g(`${S([13, 16])} g13 t1`, R(350, 596, 290, 44, 'node-r', 22), logo('spot', 364, 605, 26), T(400, 624, L('Spot node t3.medium · 1b', 'nœud Spot t3.medium · 1b'), 'lbl'));
  tick(320, 600, 's16 c5');
  tick(630, 600, 's16 c6');

  // Cards, for the steps where the platform is not on screen.
  const card = (cls: string, cx: number, cy: number, w: number, h: number, title: string, lines: string[], checks = false, box = 'box') => {
    const parts = [R(cx, cy, w, h, box, 12), T(cx + 24, cy + 36, title, 'ttl-l')];
    lines.forEach((line, i) => {
      const ly = cy + 66 + i * 26;
      if (checks) parts.push(`<path class="mini-check" d="M${cx + 24},${ly - 5} l4,4 l8,-9"/>`);
      parts.push(T(cx + (checks ? 44 : 24), ly, line, 'lbl'));
    });
    g(cls, ...parts);
  };
  const created = [
    L('the VPC and two public subnets', 'le VPC et deux sous-réseaux publics'),
    L('the internet gateway, no NAT', 'la passerelle internet, sans NAT'),
    L('the EKS cluster and two Spot nodes', 'le cluster EKS et deux nœuds Spot'),
    L('IAM roles, Pod Identity, 2 secrets', 'les rôles IAM, Pod Identity, 2 secrets'),
  ];
  g('s11', R(170, 330, 340, 84, 'box ok-box', 12), '<path class="check" d="M194,372 l10,10 l20,-22"/>',
    T(240, 366, L('Local cluster deleted', 'Cluster local supprimé'), 'ttl-l big-ok'), T(240, 390, L('the repo stays, nothing else', "le dépôt reste, rien d'autre"), 'small'));
  card('s12', 120, 280, 440, 156, L('Found by make aws-setup', 'Trouvé par make aws-setup'), [
    L('the profile, and an open session', 'le profil, et une session ouverte'),
    L('the region eu-north-1 and two zones', 'la région eu-north-1 et deux zones'),
    L('the state bucket, or its creation', "le bucket d'état, ou sa création"),
  ], true);
  card('s13', 120, 250, 440, 182, L('28 resources to create', '28 ressources à créer'), created, false, 'box ghost-box');
  card('s14', 120, 250, 440, 182, L('Created by Terraform', 'Créé par Terraform'), created, true);
  g('s17 late17', R(170, 330, 340, 84, 'box ok-box', 12), '<path class="check" d="M194,372 l10,10 l20,-22"/>',
    T(240, 366, L('Everything is gone', 'Tout est détruit'), 'ttl-l big-ok'), T(240, 390, L('the state bucket alone remains', "seul le bucket d'état reste"), 'small'));
  g('s18', R(60, 170, 560, 330, 'box', 14), logo('githubactions', 84, 192, 28), T(124, 214, L('GitHub Actions, on every push', 'GitHub Actions, à chaque push'), 'ttl-l'),
    T(84, 262, 'PRE-COMMIT', 'tag'), T(84, 284, 'fmt, validate, tflint, checkov, gitleaks', 'lbl'),
    T(84, 326, L('MANIFESTS', 'MANIFESTES'), 'tag'), T(84, 348, L('kustomize render and kubeconform', 'rendu kustomize et kubeconform'), 'lbl'),
    T(84, 390, 'IMAGE', 'tag'), T(84, 412, L('built, tested, scanned by Trivy, pushed to GHCR', 'construite, testée, scannée par Trivy, publiée sur GHCR'), 'lbl'),
    T(84, 454, L('EVERY WEEK', 'CHAQUE SEMAINE'), 'tag'), T(84, 476, L('base image age, a new scan', 'âge des images de base, nouveau scan'), 'lbl'));

  // The rules that show each step: generated, since every step has its own.
  const all = range(1, steps.length);
  const css = [
    `${all.map((n) => `#tour-scene[data-step="${n}"] .s${n}`).join(', ')} { opacity: 1; transform: none; }`,
    `${all.map((n) => `#tour-scene[data-step="${n}"] .arrow.s${n} path`).join(', ')} { stroke-dashoffset: 0; }`,
    `${all.map((n) => `#tour-scene[data-step="${n}"] .arrow.s${n} .pk`).join(', ')} { opacity: 1; }`,
    '#tour-scene[data-step="10"] .d10 { opacity: 0.2; }',
    '#tour-scene[data-step="2"] .dim2 { opacity: 0.55; }',
    ...[1, 3, 4, 5, 9, 10, 12, 18].map((n) => `#tour-scene[data-step="${n}"] .h${n} > rect:first-child { stroke: var(--amber); stroke-opacity: 1; stroke-width: 1.8; filter: url(#tour-glow); }`),
    '#tour-scene[data-step="10"] .h10 .chip-r { fill: color-mix(in srgb, var(--amber) 14%, var(--night)); }',
    '#tour-scene[data-step="10"] .h10 .chip-t { fill: var(--amber); font-weight: 700; }',
    '#tour-scene[data-step="17"] .hok17 > rect:first-child { stroke: var(--green); stroke-opacity: 1; stroke-width: 1.8; filter: url(#tour-glow); }',
    '#tour-scene[data-step="12"] .g12 > rect:first-child, #tour-scene[data-step="13"] .g13 > rect:first-child { fill: none; stroke-dasharray: 7 5; }',
    '#tour-scene[data-step="13"] .g13 text { fill: var(--muted); }',
    '#tour-scene[data-step="13"] .g13 use { opacity: 0.45; }',
    '#tour-scene[data-step="10"] .late10 { transition-delay: 1.9s; }',
    '#tour-scene[data-step="17"] .late17 { transition-delay: 1.3s; }',
    ...[0.15, 0.45, 0.75, 1.05].map((d, i) => `#tour-scene[data-step="7"] .w${i + 1}, #tour-scene[data-step="15"] .w${i + 1} { transition-delay: ${d}s; }`),
    ...[0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1.05].map((d, i) => `#tour-scene[data-step="11"] .t${i + 1}, #tour-scene[data-step="17"] .t${i + 1} { transition-delay: ${d}s; }`),
    ...range(1, 6).map((i) => `#tour-scene[data-step="8"] .c${i}, #tour-scene[data-step="16"] .c${i} { transition-delay: ${(0.2 + i * 0.18).toFixed(2)}s; }`),
  ].join('\n');

  const symbols =
    [...used].map((name) => `<symbol id="tl-${name}" viewBox="${logos[name].viewBox}">${logos[name].body}</symbol>`).join('') +
    '<symbol id="tl-lock" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M7 11V8a5 5 0 0 1 10 0v3"/><rect x="5" y="11" width="14" height="10" rx="2"/></g></symbol>';
  const defs =
    '<filter id="tour-glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="2.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
    '<linearGradient id="tour-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="fill-top"/><stop offset="1" class="fill-bottom"/></linearGradient>' +
    symbols;

  return { defs, body: out.join(''), css };
}
