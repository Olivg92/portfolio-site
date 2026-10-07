// The scene of the guided tour: one drawing of the whole platform, on both
// grounds (the machine, then AWS), in which every element knows the steps it
// shows in. The page sets data-step on the drawing, and the rules generated
// here show what that step needs, fading the rest out. Drawn at build time,
// in the page's language, as plain SVG, in two layouts: one for a wide
// screen, and one for a phone, the same elements tightened for the small
// frame a phone pins at the top of the screen.
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

// On a phone, the tour's script frames what each step shows. Three classes
// tell it what not to count: `band`, the row at the top that every step
// shows, `frame`, the labels of the grounds, and `ground`, the grounds
// themselves. A step that shows nothing else is framed on those.

export const SCENE_WIDTH = 680;
export const SCENE_HEIGHT = 716;
// The phone's drawing.
export const PHONE_WIDTH = 464;
export const PHONE_HEIGHT = 566;

// An application of the platform: its name, its logo, its classes, and the
// key a tick finds it by when the name will not do.
type App = [string, LogoName | 'lock' | null, string, string?];

export function tourScene(lang: Lang) {
  const L = (en: string, fr: string) => (lang === 'en' ? en : fr);
  const used = new Set<LogoName>();
  let out: string[] = [];

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
  const markSize = (mark: LogoName | 'lock' | null) => {
    const aspect = mark && mark !== 'lock' ? ((logos[mark] as { aspect?: number }).aspect ?? 1) : 1;
    return aspect > 1.5 ? [Math.round(14 * aspect), 14] : [22, 22];
  };
  const chipWidth = (label: string, mark: LogoName | 'lock' | null) => Math.round((mark ? 10 + markSize(mark)[0] + 8 : 14) + label.length * CHAR + 14);
  const chip = (x: number, y: number, label: string, mark: LogoName | 'lock' | null, cls: string, key = label) => {
    const [mw, mh] = markSize(mark);
    const textX = mark ? x + 10 + mw + 8 : x + 14;
    const w = chipWidth(label, mark);
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
  // The end-to-end checks tick what they verified, one after the other.
  const checks = () => {
    tickOn('gateway', 's8 s16 c1');
    tickOn('Prometheus', 's8 s16 c2');
    tickOn('Grafana', 's8 s16 c3');
    tickOn('Sloth', 's8 s16 c4');
    tickOn('secretstore', 's8 s16 c5');
    tickOn('demo-api', 's8 s16 c6');
    tickOn('Vault', 's8 c6');
  };
  // Cards, for the steps where the platform is not on screen.
  const card = (cls: string, cx: number, cy: number, w: number, h: number, title: string, lines: string[], checked = false, box = 'box') => {
    const parts = [R(cx, cy, w, h, box, 12), T(cx + 24, cy + 36, title, 'ttl-l')];
    lines.forEach((line, i) => {
      const ly = cy + 66 + i * 26;
      if (checked) parts.push(`<path class="mini-check" d="M${cx + 24},${ly - 5} l4,4 l8,-9"/>`);
      parts.push(T(cx + (checked ? 44 : 24), ly, line, 'lbl'));
    });
    g(cls, ...parts);
  };
  // A green card: what is gone, and what stays.
  const gone = (cls: string, x: number, y: number, title: string, line: string, w = 340) =>
    g(cls, R(x, y, w, 84, 'box ok-box', 12), `<path class="check" d="M${x + 24},${y + 42} l10,10 l20,-22"/>`, T(x + 70, y + 36, title, 'ttl-l big-ok'), T(x + 70, y + 60, line, 'small'));

  // The words of the drawing, the same in both layouts.
  const W = {
    machine: L('ON THE MACHINE, IN DOCKER', 'SUR LA MACHINE, DANS DOCKER'),
    kubeconfig: L('a kubeconfig of its own', 'un kubeconfig à part'),
    account: L('AWS ACCOUNT · EU-NORTH-1', 'COMPTE AWS · EU-NORTH-1'),
    toCreate: L('TO CREATE · VPC 10.20.0.0/16 · EKS 1.36', 'À CRÉER · VPC 10.20.0.0/16 · EKS 1.36'),
    region: 'EU-NORTH-1 · VPC 10.20.0.0/16',
    eks: 'EKS 1.36',
    bucket: L('State bucket', "Bucket d'état"),
    forLocal: L('FOR THE LOCAL PLATFORM', 'POUR LA PLATEFORME LOCALE'),
    forAws: L('AND FOR AWS', 'ET POUR AWS'),
    readsRepo: L('reads the repo', 'lit le dépôt'),
    waves: L('WAVES', 'VAGUES'),
    chaos: L('/chaos: 3 in 10 fail', '/chaos : 3 sur 10 échouent'),
    grafanaRoute: L('Grafana route', 'route Grafana'),
    image: L('demo-api, imported into k3d', 'demo-api, importée dans k3d'),
    wayIn: L('WAY IN', 'ENTRÉE'),
    nlb: L('public NLB · 80 and 443', 'NLB public · 80 et 443'),
    vaultDev: L('Vault in dev mode', 'Vault en mode dev'),
    secretsManager: 'Secrets Manager · Pod Identity',
    slo: L('SLO · AVAILABILITY', 'SLO · DISPONIBILITÉ'),
    objective: L('99.5% of requests without an error', '99,5 % des requêtes sans erreur'),
    budget: L('error budget', "budget d'erreur"),
    burning: L('burning 60 times too fast', 'fond 60 fois trop vite'),
    alert: L('burn-rate alert firing', 'alerte de burn rate déclenchée'),
    runbook: L('→ its runbook', '→ son runbook'),
    node: (zone: string) => L(`Spot node t3.medium · ${zone}`, `nœud Spot t3.medium · ${zone}`),
    localGone: L('Local cluster deleted', 'Cluster local supprimé'),
    repoStays: L('the repo stays as it was', 'le dépôt reste tel quel'),
    setUp: L('Set up by make aws-setup', 'Préparé par make aws-setup'),
    setUpLines: [
      L('the profile, and an open session', 'le profil, et une session ouverte'),
      L('the region eu-north-1 and two zones', 'la région eu-north-1 et deux zones'),
      L('the state bucket, or its creation', "le bucket d'état, ou sa création"),
    ],
    resources: L('28 resources to create', '28 ressources à créer'),
    created: L('Created by Terraform', 'Créé par Terraform'),
    allGone: L('Everything is gone', 'Tout est détruit'),
    bucketStays: L('the state bucket alone remains', "seul le bucket d'état reste"),
    ci: L('GitHub Actions, on every pull request', 'GitHub Actions, à chaque pull request'),
  };
  const created = [
    L('the VPC and two public subnets', 'le VPC et deux sous-réseaux publics'),
    L('the internet gateway, no NAT', 'la passerelle internet, sans NAT'),
    L('the EKS cluster and two Spot nodes', 'le cluster EKS et deux nœuds Spot'),
    L('IAM roles, Pod Identity, 2 secrets', 'les rôles IAM, Pod Identity, 2 secrets'),
  ];
  // What the CI runs, part by part. A line a phone has no room for is cut
  // into the parts a wide screen joins.
  const ci: [string, string[]][] = [
    ['PRE-COMMIT', ['fmt, validate, tflint, checkov, gitleaks']],
    [L('MANIFESTS', 'MANIFESTES'), [L('kustomize render and kubeconform', 'rendu kustomize et kubeconform')]],
    [
      L('IMAGE, WHEN THE API CHANGES', "IMAGE, QUAND L'API CHANGE"),
      [L('built, tested, scanned by Trivy,', 'construite, testée, scannée par Trivy,'), L('pushed to GHCR from main', 'publiée sur GHCR depuis main')],
    ],
    [L('EVERY WEEK', 'CHAQUE SEMAINE'), [L('base image age, a new scan', 'âge des images de base, nouveau scan')]],
  ];
  // What make check-tools looks for.
  const localTools = [['docker', 'docker'], ['k3d', 'k3d'], ['kubectl', 'kubernetes'], ['helm', 'helm'], ['python3', 'python'], ['curl', 'curl']] as const;
  const awsTools = [['terraform', 'terraform'], ['aws', 'awscloud']] as const;
  // The applications, wave by wave, as their sync-wave annotations order them.
  const platform = `${S(LOCAL_PLATFORM, AWS_PLATFORM)} d10`;
  const waves: [string, string, App[]][] = [
    ['-2', 'w1 t6', [['cert-manager', 'lock', ''], ['Envoy Gateway', 'envoy', ''], ['External Secrets', 'externalsecrets', '']]],
    ['-1', 'w2 t5', [[L('Platform CA', 'CA plateforme'), 'lock', ''], ['SecretStore', 'externalsecrets', '', 'secretstore']]],
    ['0', 'w3 t4', [['gateway', 'envoy', ''], ['Prometheus', 'prometheus', 'h9'], ['Grafana', 'grafana', 'h9'], ['Sloth', 'sloth', '']]],
  ];
  const vault: App = ['Vault', 'vault', `${S(LOCAL_PLATFORM)} d10 w2 t5`];
  const ports = [':8081 · Argo CD', ':3000 · Grafana', ':9090 · Prometheus'];

  // ---- On a wide screen ----

  // The grounds: the machine, then the AWS account.
  g(`${S(LOCAL)} t8 frame`, R(24, 150, 632, 548, 'frame-local', 16), logo('k3d', 40, 166, 50, 19), T(104, 182, W.machine, 'tag'));
  g(`${S(LOCAL)} t8 h3 frame`, R(40, 200, 196, 30, 'mini-r', 7), T(52, 220, W.kubeconfig, 'mini-t'));
  g(`${S(AWS)} g12 g13 t8 frame`, R(24, 150, 632, 548, 'frame-aws', 16), logo('awscloud', 40, 162, 28));
  g('s12 frame', T(80, 182, W.account, 'tag'));
  g('s13 frame', T(80, 182, W.toCreate, 'tag'));
  g(`${S([14, 16])} t8 frame`, T(80, 182, W.region, 'tag'), logo('eks', 536, 161, 26), T(640, 182, W.eks, 'tag', 'end'));

  // The top band: the state bucket, the repository, and the number of each step.
  g(`${S([12, 18])} h12 hok17 band`, R(24, 16, 172, 96), logo('s3', 36, 30, 34), T(80, 54, W.bucket, 'ttl'), T(80, 76, L('native locking', 'verrou natif'), 'small opt'));
  g(`${S([1, 18])} d10 h1 h18 band`, R(210, 16, 270, 96), logo('github', 222, 28, 26), T(258, 48, 'platform-eks-gitops', 'ttl'),
    R(222, 64, 110, 28, 'mini-r', 6), logo('terraform', 230, 70, 16), T(252, 83, 'terraform/', 'mini-t'),
    R(340, 64, 70, 28, 'mini-r', 6), T(375, 83, 'gitops/', 'mini-t', 'middle'),
    R(418, 64, 54, 28, 'mini-r', 6), T(445, 83, 'apps/', 'mini-t', 'middle'));
  g(`${S([1, 18])} band`, R(494, 16, 162, 96), T(520, 38, L('IN NUMBERS', 'EN CHIFFRES'), 'tag'), '<circle class="live" cx="510" cy="34" r="3.5"/>');
  steps.forEach((step, i) => {
    const n = i + 1;
    // The box holds ten characters of number and 21 of caption, in Geist Mono.
    if (step.metric.value[lang].length > 10 || step.metric.caption[lang].length > 21) {
      throw new Error(`tour step ${n} (${lang}): its number or caption is too long for the box`);
    }
    const cls = ['metric', n === 10 ? 'metric-alert' : '', n === 11 || n === 17 ? 'metric-ok' : ''].filter(Boolean).join(' ');
    g(`s${n} band${n === 17 ? ' late17' : ''}`, T(508, 72, step.metric.value[lang], cls), T(508, 98, step.metric.caption[lang], 'small'));
  });

  // Step 2: what make check-tools looks for, for the local platform and for AWS.
  g('s2', T(40, 190, W.forLocal, 'tag'));
  let x = 40;
  for (const [label, mark] of localTools.slice(0, 4)) x = chip(x, 214, label, mark, 's2');
  x = 40;
  for (const [label, mark] of localTools.slice(4)) x = chip(x, 270, label, mark, 's2');
  g('s2', T(40, 346, W.forAws, 'tag'));
  x = 40;
  for (const [label, mark] of awsTools) x = chip(x, 360, label, mark, 's2');

  // Argo CD, installed by Helm, then pointed at the repository.
  arrow('M340,196 V115', `${S([6, 10], AWS_PLATFORM)} d10 t7`, 'gitops', 1.6);
  g(`${S([6, 10])} d10 t7`, T(350, 140, `root-local ${W.readsRepo}`, 'small'));
  g(`${S(AWS_PLATFORM)} t7`, T(350, 140, `root-aws ${W.readsRepo}`, 'small'));
  g(`${S([5, 10], AWS_PLATFORM)} d10 t7 h5 h9`, R(250, 196, 180, 54, 'box box-strong'), '<circle class="ring" cx="278" cy="223" r="19"/>', logo('argo', 262, 207, 32), T(304, 222, 'Argo CD', 'ttl'), T(304, 241, 'app-of-apps', 'small opt'));
  g('s5 s15', logo('helm', 400, 204, 22));

  // The applications, wave by wave, one row each.
  g(`${platform} w1 t6`, T(40, 266, W.waves, 'tag'));
  waves.forEach(([wave, timing, apps], i) => {
    const y = 272 + 58 * i;
    g(`${platform} ${timing}`, R(40, y + 4, 44, 30, 'wave-r', 6), T(62, y + 24, wave, 'wave-t', 'middle'));
    x = 96;
    for (const [label, mark, extra, key] of apps) x = chip(x, y, label, mark, `${platform} ${timing} ${extra}`, key ?? label);
    if (wave === '-1') chip(x, y, vault[0], vault[1], vault[2]);
  });
  g(`${S(LOCAL_PLATFORM, AWS_PLATFORM)} w4 t3`, R(40, 450, 44, 30, 'wave-r', 6), T(62, 470, '1', 'wave-t', 'middle'));
  x = chip(96, 446, 'demo-api × 2', 'fastapi', `${S(LOCAL_PLATFORM, AWS_PLATFORM)} w4 t3 h10`, 'demo-api');
  g('s10', R(x, 446, 200, 38, 'chaos-r', 9), T(x + 100, 470, W.chaos, 'chaos-t', 'middle'));
  chip(x + 210, 446, W.grafanaRoute, 'grafana', `${S(LOCAL_PLATFORM, AWS_PLATFORM)} d10 w4 t3`);
  checks();

  // Step 9: each interface through a port-forward of its own.
  ports.forEach((label, i) => g('s9', R(40 + 207 * i, 604, 196, 34, 'port-r', 17), T(138 + 207 * i, 626, label, 'port-t', 'middle')));

  // Steps 4 to 6: the image, built here and imported into the cluster.
  g('s4 s5 s6 h4', R(40, 508, 290, 66), T(54, 528, 'IMAGE', 'tag'), logo('docker', 54, 538, 22), T(86, 557, W.image, 'lbl'));

  // Where traffic comes in and where secrets come from: what changes between the two grounds.
  arrow('M169,508 V487', `${S([7, 9], AWS_PLATFORM)} t2`, 'traffic', 0.9, 2);
  arrow('M592,291 H646 V541 H643', `${S([7, 9], AWS_PLATFORM)} t2`, 'secret', 2.6);
  g(`${S([7, 9], AWS_PLATFORM)} t2`, R(40, 508, 290, 66), T(54, 528, W.wayIn, 'tag'));
  g(S([7, 9]), T(54, 558, 'localhost:8443', 'lbl'));
  g(`${S(AWS_PLATFORM)} t2`, logo('nlb', 54, 536, 26), T(88, 557, W.nlb, 'lbl'));
  g(`${S([7, 9], AWS_PLATFORM)} t2`, R(350, 508, 290, 66), T(364, 528, 'SECRETS', 'tag'));
  g(S([7, 9]), logo('vault', 364, 538, 20), T(392, 557, W.vaultDev, 'lbl'));
  g(`${S(AWS_PLATFORM)} t2`, logo('secretsmanager', 364, 536, 26), T(398, 557, W.secretsManager, 'lbl'));
  tick(320, 512, 's16 c3');
  tick(630, 512, 's16 c4');

  // Step 10: the error budget drains, then the alert fires.
  g('s10', R(40, 508, 600, 176, 'box slo-box'), T(56, 532, W.slo, 'tag'),
    T(56, 562, W.objective, 'ttl-l'),
    R(56, 578, 568, 16, 'budget-bg', 8), R(56, 578, 568, 16, 'budget-fill', 8),
    T(56, 618, W.budget, 'small'), T(624, 618, W.burning, 'small small-alert', 'end'));
  g('s10 late10', R(56, 632, 330, 36, 'alert-r', 18), logo('prometheus', 66, 640, 20), T(94, 655, W.alert, 'alert-t'), T(400, 655, W.runbook, 'small'));

  // The Spot nodes: planned, then real.
  g(`${S([13, 16])} g13 t1`, R(40, 596, 290, 44, 'node-r', 22), logo('spot', 54, 605, 26), T(90, 624, W.node('1a'), 'lbl'));
  g(`${S([13, 16])} g13 t1`, R(350, 596, 290, 44, 'node-r', 22), logo('spot', 364, 605, 26), T(400, 624, W.node('1b'), 'lbl'));
  tick(320, 600, 's16 c5');
  tick(630, 600, 's16 c6');

  // The cards.
  gone('s11', 170, 330, W.localGone, W.repoStays);
  card('s12', 120, 280, 440, 156, W.setUp, W.setUpLines, true);
  card('s13', 120, 250, 440, 182, W.resources, created, false, 'box ghost-box');
  card('s14', 120, 250, 440, 182, W.created, created, true);
  gone('s17 late17', 170, 330, W.allGone, W.bucketStays);
  g('s18', R(60, 170, 560, 330, 'box', 14), logo('githubactions', 84, 192, 28), T(124, 214, W.ci, 'ttl-l'),
    ...ci.flatMap(([tag, lines], i) => [T(84, 262 + 64 * i, tag, 'tag'), T(84, 284 + 64 * i, lines.join(' '), 'lbl')]));

  const wide = out.join('');

  // ---- On a phone ----
  // The same drawing, tightened for the small frame a phone pins at the top
  // of the screen: smaller chips, the applications of a wave on one or two
  // rows, the way in and the secrets right under them, the labels of the
  // grounds beside Argo CD. The tour's script frames each step in it whole,
  // as on a wide screen. The number of each step reads in its words on a
  // phone, not in the drawing.
  out = [];
  corners.clear();
  const END = PHONE_WIDTH - 12;
  // A chip for a phone: a smaller logo, and less room around it.
  const pmark = (mark: LogoName | 'lock' | null) => {
    const aspect = mark && mark !== 'lock' ? ((logos[mark] as { aspect?: number }).aspect ?? 1) : 1;
    return aspect > 1.5 ? [Math.round(11 * aspect), 11] : [16, 16];
  };
  const pwidth = (label: string, mark: LogoName | 'lock' | null) => Math.round((mark ? 7 + pmark(mark)[0] + 4 : 9) + label.length * CHAR + 7);
  const pchip = (x: number, y: number, label: string, mark: LogoName | 'lock' | null, cls: string, key = label) => {
    const [mw, mh] = pmark(mark);
    const w = pwidth(label, mark);
    const parts = [R(x, y, w, 30, 'chip-r', 8)];
    if (mark === 'lock') parts.push(lock(x + 7, y + 7, 16));
    else if (mark) parts.push(logo(mark, x + 7, y + (30 - mh) / 2, mw, mh));
    parts.push(T(mark ? x + 7 + mw + 4 : x + 9, y + 20, label, 'chip-t'));
    g(`chip ${cls}`, ...parts);
    corners.set(key, [x + w - 5, y + 2]);
    return x + w + 5;
  };
  // Chips from left to right, onto a new row where the next would pass the
  // end of the line. Returns the top of the last row.
  const pflow = (apps: readonly App[], x0: number, y0: number, start = x0) => {
    let [cx, cy] = [start, y0];
    for (const [label, mark, cls, key] of apps) {
      if (cx > start && cx + pwidth(label, mark) > END) [cx, cy] = [x0, cy + 36];
      cx = pchip(cx, cy, label, mark, cls, key ?? label);
    }
    return cy;
  };
  const pcard = (cls: string, cx: number, cy: number, w: number, h: number, title: string, lines: string[], checked = false, box = 'box') => {
    const parts = [R(cx, cy, w, h, box, 12), T(cx + 20, cy + 32, title, 'ttl-l')];
    lines.forEach((line, i) => {
      const ly = cy + 58 + i * 24;
      if (checked) parts.push(`<path class="mini-check" d="M${cx + 20},${ly - 5} l4,4 l8,-9"/>`);
      parts.push(T(cx + (checked ? 40 : 20), ly, line, 'lbl'));
    });
    g(cls, ...parts);
  };

  // The top band: the state bucket on AWS, and the repository, right above
  // Argo CD as on a wide screen. The bucket is what steps 12 and 17 are
  // about: there it is framed, not band.
  const bucket = W.bucket.split(' ');
  const bucketBox = () => [R(4, 4, 142, 60), logo('s3', 14, 18, 26), T(48, 30, bucket[0], 'ttl'), T(48, 50, bucket[1], 'ttl')];
  g('s12 s17 h12 hok17', ...bucketBox());
  g(`${S([13, 16])} s18 band`, ...bucketBox());
  g(`${S([1, 18])} d10 h1 h18 band`, R(154, 4, 306, 60), logo('github', 166, 14, 20), T(194, 30, 'platform-eks-gitops', 'ttl'),
    R(166, 36, 98, 22, 'mini-r', 6), logo('terraform', 172, 40, 14), T(190, 51, 'terraform/', 'mini-t'),
    R(270, 36, 66, 22, 'mini-r', 6), T(303, 51, 'gitops/', 'mini-t', 'middle'),
    R(342, 36, 54, 22, 'mini-r', 6), T(369, 51, 'apps/', 'mini-t', 'middle'));

  // Step 2: the tools.
  g('s2', T(12, 100, W.forLocal, 'tag'));
  const toolsEnd = pflow(localTools.map(([label, mark]) => [label, mark, 's2'] as App), 12, 108);
  g('s2', T(12, toolsEnd + 56, W.forAws, 'tag'));
  pflow(awsTools.map(([label, mark]) => [label, mark, 's2'] as App), 12, toolsEnd + 64);

  // The grounds, their labels in their top left corner as on a wide
  // screen, and apart: a step that shows nothing else is framed on its
  // labels rather than on the whole ground.
  const groundHeight = PHONE_HEIGHT - 88;
  g(`${S(LOCAL)} t8 ground`, R(2, 84, PHONE_WIDTH - 4, groundHeight, 'frame-local', 14));
  g(`${S(LOCAL)} t8 frame`, logo('k3d', 12, 95, 40, 15), T(58, 106, W.machine, 'tag'));
  g(`${S(LOCAL)} t8 h3 frame`, R(12, 127, 190, 26, 'mini-r', 7), T(22, 144, W.kubeconfig, 'mini-t'));
  g(`${S(AWS)} g12 g13 t8 ground`, R(2, 84, PHONE_WIDTH - 4, groundHeight, 'frame-aws', 14));
  g(`${S(AWS)} g12 g13 t8 frame`, logo('awscloud', 12, 92, 22));
  g('s12 frame', T(44, 106, W.account, 'tag'));
  g('s13 frame', T(44, 106, W.toCreate, 'tag'));
  g(`${S([14, 16])} t8 frame`, T(44, 106, W.region, 'tag'), logo('eks', 362, 93, 18), T(452, 106, W.eks, 'tag', 'end'));

  // Argo CD right under the repository it reads, the line between the
  // middles of the two.
  arrow('M307,120 V67', `${S([6, 10], AWS_PLATFORM)} d10 t7`, 'gitops', 1.6);
  g(`${S([6, 10])} d10 t7`, T(299, 79, `root-local ${W.readsRepo}`, 'small', 'end'));
  g(`${S(AWS_PLATFORM)} t7`, T(299, 79, `root-aws ${W.readsRepo}`, 'small', 'end'));
  g(`${S([5, 10], AWS_PLATFORM)} d10 t7 h5 h9`, R(231, 120, 152, 40, 'box box-strong'), '<circle class="ring" cx="253" cy="140" r="14"/>', logo('argo', 241, 128, 24), T(273, 146, 'Argo CD', 'ttl'));
  g('s5 s15', logo('helm', 353, 130, 20));

  // Steps 4 to 6: the image, where the waves will come.
  g('s4 s5 s6 h4', R(12, 174, 440, 34), T(24, 196, 'IMAGE', 'tag'), logo('docker', 84, 182, 18), T(108, 196, W.image, 'lbl'));

  // The waves: the number, then the applications from beside it.
  g(`${platform} w1 t6`, T(12, 182, W.waves, 'tag'));
  let wy = 190;
  for (const [wave, timing, apps] of waves) {
    g(`${platform} ${timing}`, R(12, wy + 3, 28, 24, 'wave-r', 6), T(26, wy + 20, wave, 'wave-t', 'middle'));
    const all: App[] = apps.map(([label, mark, extra, key]) => [label, mark, `${platform} ${timing} ${extra}`, key]);
    wy = pflow(wave === '-1' ? [...all, vault] : all, 46, wy, 46) + 36;
  }
  g(`${S(LOCAL_PLATFORM, AWS_PLATFORM)} w4 t3`, R(12, wy + 3, 28, 24, 'wave-r', 6), T(26, wy + 20, '1', 'wave-t', 'middle'));
  const api = pflow(
    [
      ['demo-api × 2', 'fastapi', `${S(LOCAL_PLATFORM, AWS_PLATFORM)} w4 t3 h10`, 'demo-api'],
      [W.grafanaRoute, 'grafana', `${S(LOCAL_PLATFORM, AWS_PLATFORM)} d10 w4 t3`],
    ],
    46,
    wy,
    46,
  );
  checks();

  // Under the waves: the way in and the secrets, or on step 10 the failures,
  // the budget and the alert. The line from External Secrets runs down the
  // right edge.
  const ry = api + 44;
  g('s10', R(12, ry, 200, 30, 'chaos-r', 8), T(112, ry + 20, W.chaos, 'chaos-t', 'middle'));
  const [esX, esY] = corners.get('External Secrets') ?? [END - 5, 222];
  arrow(`M108,${ry} V${api + 33}`, `${S([7, 9], AWS_PLATFORM)} t2`, 'traffic', 0.9, 2);
  arrow(`M${esX + 5},${esY + 13} H449 V${ry + 51} H446`, `${S([7, 9], AWS_PLATFORM)} t2`, 'secret', 2.6);
  g(`${S([7, 9], AWS_PLATFORM)} t2`, R(12, ry, 434, 30), T(22, ry + 20, W.wayIn, 'tag'));
  g(S([7, 9]), T(96, ry + 20, 'localhost:8443', 'lbl'));
  g(`${S(AWS_PLATFORM)} t2`, logo('nlb', 96, ry + 6, 18), T(120, ry + 20, W.nlb, 'lbl'));
  g(`${S([7, 9], AWS_PLATFORM)} t2`, R(12, ry + 36, 434, 30), T(22, ry + 56, 'SECRETS', 'tag'));
  g(S([7, 9]), logo('vault', 96, ry + 43, 16), T(118, ry + 56, W.vaultDev, 'lbl'));
  g(`${S(AWS_PLATFORM)} t2`, logo('secretsmanager', 96, ry + 42, 18), T(120, ry + 56, W.secretsManager, 'lbl'));
  tick(436, ry + 2, 's16 c3');
  tick(436, ry + 38, 's16 c4');
  const sy = ry + 36;
  g('s10', R(12, sy, 434, 140, 'box slo-box'), T(24, sy + 20, W.slo, 'tag'),
    T(24, sy + 46, W.objective, 'ttl-l'),
    R(24, sy + 58, 410, 12, 'budget-bg', 6), R(24, sy + 58, 410, 12, 'budget-fill', 6),
    T(24, sy + 88, W.budget, 'small'), T(434, sy + 88, W.burning, 'small small-alert', 'end'));
  g('s10 late10', R(24, sy + 98, 410, 30, 'alert-r', 15), logo('prometheus', 32, sy + 103, 20), T(58, sy + 118, W.alert, 'alert-t'), T(434, sy + 118, W.runbook, 'small', 'end'));

  // Below them: the port-forwards on the machine, the Spot nodes on AWS.
  const py = ry + 78;
  let px = 12;
  for (const label of ports) {
    const w = Math.round(label.length * 7.2 + 20);
    g('s9', R(px, py, w, 28, 'port-r', 14), T(px + w / 2, py + 19, label, 'port-t', 'middle'));
    px += w + 6;
  }
  const pnode = (cls: string, x: number, y: number, zone: string) => g(cls, R(x, y, 218, 32, 'node-r', 16), logo('spot', x + 8, y + 6, 20), T(x + 34, y + 21, W.node(zone), 'lbl'));
  pnode(`${S(AWS_PLATFORM)} t1`, 12, py, '1a');
  pnode(`${S(AWS_PLATFORM)} t1`, 234, py, '1b');
  tick(220, py + 4, 's16 c5');
  tick(442, py + 4, 's16 c6');

  // The cards, under the labels, and the nodes Terraform plans under its card.
  gone('s11', 12, 84, W.localGone, W.repoStays, 440);
  pcard('s12', 12, 120, 440, 134, W.setUp, W.setUpLines, true);
  pcard('s13', 12, 120, 440, 158, W.resources, created, false, 'box ghost-box');
  pcard('s14', 12, 120, 440, 158, W.created, created, true);
  pnode('s13 s14 g13 t1', 12, 290, '1a');
  pnode('s13 s14 g13 t1', 234, 290, '1b');
  gone('s17 late17', 12, 84, W.allGone, W.bucketStays, 440);
  let cy = 190;
  const ciParts = ci.flatMap(([tag, lines]) => {
    const parts = [T(48, cy, tag, 'tag'), ...lines.map((line, i) => T(48, cy + 19 + 19 * i, line, 'lbl'))];
    cy += 29 + 19 * lines.length;
    return parts;
  });
  g('s18', R(32, 124, 400, cy - 131, 'box', 14), logo('githubactions', 48, 140, 24), T(82, 158, W.ci, 'ttl'), ...ciParts);

  // Nothing may pass the end of the drawing.
  if (Math.max(sy + 140, py + 32) > PHONE_HEIGHT - 8) throw new Error(`tour scene (${lang}): the phone's drawing is too short for what it holds`);
  const phone = out.join('');

  // The rules that show each step: generated, since every step has its own.
  const all = range(1, steps.length);
  const css = [
    `${all.map((n) => `#tour-scene[data-step="${n}"] .s${n}`).join(', ')} { opacity: 1; transform: none; }`,
    `${all.map((n) => `#tour-scene[data-step="${n}"] .arrow.s${n} path`).join(', ')} { stroke-dashoffset: 0; }`,
    `${all.map((n) => `#tour-scene[data-step="${n}"] .arrow.s${n} .pk`).join(', ')} { opacity: 1; }`,
    '#tour-scene[data-step="10"] .d10 { opacity: 0.2; }',
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
  // The glow of a flow's line spans a fixed region of the drawing: one
  // measured on the line, which a vertical line gives no width, would hide it.
  const defs =
    '<filter id="tour-glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="2.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
    '<filter id="tour-glow-line" filterUnits="userSpaceOnUse" x="-100" y="-100" width="1000" height="1300"><feGaussianBlur stdDeviation="2.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
    '<linearGradient id="tour-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="fill-top"/><stop offset="1" class="fill-bottom"/></linearGradient>' +
    symbols;

  return { defs, wide, phone, css };
}
