// HTTP checks that only need a URL: used against the simulation by attack-tests.mjs and against the
// real site by check-live.mjs. Paths go out on a raw socket, so nothing normalises the attack first.
import net from 'node:net';
import tls from 'node:tls';

const evil = 'evil.example';

export const request = ({ origin, method = 'GET', path = '/', headers = {}, connect, insecure = false, tlsOptions = {} }) =>
  new Promise((done) => {
    const url = new URL(origin);
    const secure = url.protocol === 'https:';
    const port = Number(url.port || (secure ? 443 : 80));
    const host = connect ?? url.hostname;
    const socket = secure
      ? tls.connect({ host, port, servername: url.hostname, rejectUnauthorized: !insecure, ...tlsOptions })
      : net.connect({ host, port });
    const chunks = [];
    socket.setTimeout(15000, () => socket.destroy(new Error('timed out')));
    socket.on(secure ? 'secureConnect' : 'connect', () => {
      const lines = [`${method} ${path} HTTP/1.1`, `Host: ${url.host}`, 'Connection: close', 'User-Agent: mist-security-check', ...Object.entries(headers).map(([k, v]) => `${k}: ${v}`)];
      socket.write(`${lines.join('\r\n')}\r\n\r\n`);
    });
    socket.on('data', (chunk) => chunks.push(chunk));
    socket.on('error', (error) => done({ status: 0, headers: {}, rawHeaders: '', body: '', error: error.message }));
    socket.on('close', () => {
      const text = Buffer.concat(chunks).toString('latin1');
      const split = text.indexOf('\r\n\r\n');
      const rawHeaders = split < 0 ? text : text.slice(0, split);
      const [statusLine, ...lines] = rawHeaders.split('\r\n');
      const parsed = {};
      for (const line of lines) {
        const at = line.indexOf(':');
        if (at > 0) {
          const name = line.slice(0, at).trim().toLowerCase();
          parsed[name] = parsed[name] ? `${parsed[name]}, ${line.slice(at + 1).trim()}` : line.slice(at + 1).trim();
        }
      }
      done({ status: Number(statusLine?.split(' ')[1] ?? 0), headers: parsed, rawHeaders, body: split < 0 ? '' : text.slice(split + 4) });
    });
  });

export const devFiles = [
  '/.env', '/.env.local', '/.env.production', '/.env.example', '/.git/config', '/.git/HEAD', '/.gitignore', '/.idea/workspace.xml', '/.vscode/settings.json',
  '/.DS_Store', '/.htaccess', '/.htpasswd', '/web.config', '/package.json', '/package-lock.json', '/astro.config.mjs', '/tsconfig.json', '/netlify.toml',
  '/README.md', '/securites.md', '/src/layouts/Base.astro', '/src/data/site.ts', '/security/simulated-host.mjs', '/security/.cert/key.pem', '/node_modules/astro/package.json',
  '/_headers', '/_redirects', '/dist/index.html', '/backup.zip', '/site.zip', '/index.html.bak', '/index.php', '/phpinfo.php', '/wp-login.php', '/wp-admin/', '/admin/', '/server-status',
  '/Dockerfile', '/docker-compose.yml', '/MIST_Consultancy_Website_Brief.txt', '/.svn/entries', '/.hg/requirements', '/.bzr/README', '/CVS/Root', '/npm-debug.log',
  '/core', '/dump.sql', '/database.sqlite', '/backup/', '/crossdomain.xml', '/clientaccesspolicy.xml', '/.well-known/apple-app-site-association', '/elmah.axd', '/trace.axd', '/server-info', '/config.json', '/id_rsa',
];

const redirectProbes = [`//${evil}`, `//${evil}/`, `/%2f%2f${evil}`, `/%5c${evil}`, `/\\${evil}`, `/about//${evil}`, `/about/..//${evil}`, `///${evil}/%2e%2e`, `/.${evil}`, `/about?next=https://${evil}`, `/about?url=//${evil}`, `/contact?redirect=https://${evil}`];
const crlfProbes = ['/%0d%0aSet-Cookie:%20pwn=1', '/about%0d%0aSet-Cookie:%20pwn=1', '/about%0d%0aX-Injected:%201', '/about%E5%98%8D%E5%98%8ASet-Cookie:%20pwn=1', '/?x=%0d%0aSet-Cookie:%20pwn=1', '/about/?q=%0d%0aX-Injected:%201'];
const traversalProbes = ['/../package.json', '/..%2fpackage.json', '/%2e%2e/package.json', '/%2e%2e%2fpackage.json', '/..%5cpackage.json', '/_astro/../../package.json', '/_astro/%2e%2e/%2e%2e/package.json', '/....//....//package.json', '/..%c0%afpackage.json', '/%252e%252e/package.json', '/index.html%00.txt'];

// `pages`, `asset` and `missing` are paths on the site being checked.
export const httpChecks = async ({ origin, plain, connect, insecure = false, pages = ['/', '/contact/'], asset, record }) => {
  const get = (options) => request({ origin, connect, insecure, ...options });

  // Transport: Sensitive Data Not Over SSL, Weak Crypto
  if (plain) {
    const first = await request({ origin: plain, connect, path: '/contact/' });
    const target = first.headers.location ?? '';
    record('Transport', 'Plain HTTP redirects straight to HTTPS', first.status >= 301 && first.status <= 308 && target.startsWith(`${new URL(origin).origin}/`), `${first.status} ${target}`, 'host');
  }
  for (const [version, expectOk] of [['TLSv1', false], ['TLSv1.1', false], ['TLSv1.2', true], ['TLSv1.3', true]]) {
    const tlsOptions = { minVersion: version, maxVersion: version, ...(expectOk ? {} : { ciphers: 'DEFAULT@SECLEVEL=0' }) };
    const response = await get({ path: '/', tlsOptions });
    const worked = response.status > 0;
    record('Transport', `${version} is ${expectOk ? 'accepted' : 'refused'}`, worked === expectOk, worked ? `HTTP ${response.status}` : 'refused', 'host');
  }

  // Configuration, XFS: every kind of response needs the headers, not only the home page.
  const missing = await get({ path: '/this-page-does-not-exist' });
  const samples = {};
  for (const page of pages) samples[page] = await get({ path: page });
  if (asset) samples[asset] = await get({ path: asset });
  samples['404'] = missing;

  const all = (test) => {
    const failing = Object.entries(samples).filter(([, response]) => !test(response.headers)).map(([name]) => name);
    return { pass: failing.length === 0, detail: failing.length ? `missing or wrong on ${failing.join(', ')}` : 'every response type' };
  };
  const hsts = all((h) => {
    const age = Number(/max-age=(\d+)/i.exec(h['strict-transport-security'] ?? '')?.[1] ?? 0);
    return age >= 31536000 && /includesubdomains/i.test(h['strict-transport-security']);
  });
  record('Headers', 'HSTS: at least one year, with includeSubDomains', hsts.pass, hsts.detail, 'site');
  const csp = samples[pages[0]].headers['content-security-policy'] ?? '';
  const directive = (name) => new RegExp(`(^|;)\\s*${name}\\s+([^;]+)`).exec(csp)?.[2]?.trim();
  const cspPresent = all((h) => h['content-security-policy']);
  record('Headers', 'Content-Security-Policy is sent', cspPresent.pass, cspPresent.detail, 'site');
  record('Headers', "CSP has no 'unsafe-inline', 'unsafe-eval', wildcard or data:", Boolean(csp) && !/unsafe-inline|unsafe-eval|unsafe-hashes|\*|data:|blob:|http:/.test(csp), csp ? 'clean' : 'no policy', 'site');
  record('Headers', "CSP default-src is 'none'", directive('default-src') === "'none'", directive('default-src') ?? 'absent', 'site');
  record('Headers', "CSP base-uri 'none', object-src 'none', frame-ancestors 'none'", ['base-uri', 'object-src', 'frame-ancestors'].every((name) => directive(name) === "'none'"), ['base-uri', 'object-src', 'frame-ancestors'].map((name) => `${name}=${directive(name) ?? 'absent'}`).join(' '), 'site');
  record('Headers', 'CSP limits form-action and requires Trusted Types', Boolean(directive('form-action')) && directive('require-trusted-types-for') === "'script'", `form-action=${directive('form-action') ?? 'absent'}`, 'site');
  const single = all((h) => !(h['content-security-policy'] ?? '').includes(','));
  record('Headers', 'Exactly one policy per response, with none repeated in a meta tag', single.pass && !/http-equiv=["']?Content-Security-Policy/i.test(samples[pages[0]].body), single.detail, 'site');
  record('Headers', 'CSP keywords are quoted and it has no deprecated header', !/(^|\s)(none|self)(\s|;|$)/.test(csp) && !samples[pages[0]].headers['x-content-security-policy'], 'checked', 'site');
  const headerRules = [
    ['X-Frame-Options: DENY', (h) => /^deny$/i.test(h['x-frame-options'] ?? '')],
    ['X-Content-Type-Options: nosniff', (h) => /^nosniff$/i.test(h['x-content-type-options'] ?? '')],
    ['Referrer-Policy limits what is shared', (h) => /^(no-referrer|same-origin|strict-origin|strict-origin-when-cross-origin)$/i.test(h['referrer-policy'] ?? '')],
    ['Permissions-Policy denies device features', (h) => /camera=\(\)/.test(h['permissions-policy'] ?? '') && /geolocation=\(\)/.test(h['permissions-policy'] ?? '')],
    ['Cross-Origin-Opener-Policy: same-origin', (h) => /^same-origin$/i.test(h['cross-origin-opener-policy'] ?? '')],
    ['Cross-Origin-Embedder-Policy: require-corp', (h) => /^require-corp$/i.test(h['cross-origin-embedder-policy'] ?? '')],
  ];
  for (const [name, test] of headerRules) {
    const result = all(test);
    record('Headers', name, result.pass, result.detail, 'site');
  }
  const cookies = all((h) => !h['set-cookie']);
  record('Headers', 'No cookies are set', cookies.pass, cookies.detail, 'site');
  const versions = all((h) => !h['x-powered-by'] && !/\d/.test(h.server ?? ''));
  record('Information Disclosure', 'No software versions in Server or X-Powered-By', versions.pass, `Server: ${samples[pages[0]].headers.server ?? 'none'}`, 'host');
  const types = all((h) => /^(text\/html|text\/css|image\/|font\/|text\/javascript|text\/plain)/.test(h['content-type'] ?? ''));
  record('Configuration', 'Responses carry an explicit Content-Type', types.pass, types.detail, 'host');
  if (asset) {
    record('Configuration', 'Fingerprinted assets are cached as immutable', /immutable/.test(samples[asset].headers['cache-control'] ?? ''), samples[asset].headers['cache-control'] ?? 'none', 'site');
  }
  const htmlCache = samples[pages[0]].headers['cache-control'] ?? '';
  record('Configuration', 'HTML is not cached long-term', !/immutable/.test(htmlCache), htmlCache || 'host default', 'site');

  // Error Handling: 404s are real, and repeat nothing from the request.
  const marker = 'mistprobe7741';
  const reflected = await get({ path: `/${marker}%3Cscript%3Ealert(1)%3C/script%3E/`, headers: { Referer: `https://${marker}.example/` } });
  record('Error Handling', 'Missing pages return 404', missing.status === 404, `HTTP ${missing.status}`, 'host');
  record('Error Handling', 'The 404 page is the site\'s own, not the host\'s', /mist consultancy/i.test(missing.body), missing.body.slice(0, 40).replace(/\s+/g, ' '), 'site');
  record('XSS', 'The 404 page does not repeat the requested path', !reflected.body.includes(marker) && !reflected.body.includes('<script>alert(1)'), `HTTP ${reflected.status}`, 'host');
  record('Information Disclosure', 'Errors reveal no server paths', !/[A-Za-z]:\\|\/var\/www|\/home\/|\/usr\//.test(reflected.body), 'checked a 404 body', 'host');

  // URL Redirection
  const open = [];
  for (const path of redirectProbes) {
    const response = await get({ path });
    const location = response.headers.location;
    if (location && new URL(location, origin).hostname !== new URL(origin).hostname) open.push(`${path} -> ${location}`);
  }
  record('URL Redirection', `No open redirect across ${redirectProbes.length} payloads`, open.length === 0, open[0] ?? 'none followed off-site', 'host');
  const moved = await get({ path: '/about' });
  record('URL Redirection', 'Redirect responses carry no page or form', moved.status < 300 || !/<form|<html/i.test(moved.body), `HTTP ${moved.status}`, 'host');

  // CRLF Injection, Http Response Splitting
  const split = [];
  for (const path of crlfProbes) {
    const response = await get({ path });
    if (response.headers['x-injected'] || /pwn=1/.test(response.headers['set-cookie'] ?? '')) split.push(path);
  }
  record('CRLF Injection', `No header injection across ${crlfProbes.length} payloads`, split.length === 0, split[0] ?? 'no injected headers', 'host');

  // Directory Traversal
  const escaped = [];
  for (const path of traversalProbes) {
    const response = await get({ path });
    if (response.status === 200 && /"dependencies"|"mist-consultancy"/.test(response.body)) escaped.push(path);
  }
  record('Directory Traversal', `No traversal out of the published folder across ${traversalProbes.length} payloads`, escaped.length === 0, escaped[0] ?? 'nothing escaped', 'host');

  // Dev Files, Test Files, Source Code Disclosure
  const exposed = [];
  for (const path of devFiles) {
    const response = await get({ path });
    if (response.status === 200) exposed.push(path);
  }
  record('Dev Files', `None of ${devFiles.length} development, backup or admin paths are served`, exposed.length === 0, exposed.slice(0, 6).join(' ') || 'all absent', 'site');

  // Directory Listing
  const listed = [];
  for (const path of ['/_astro/', '/.well-known/', '/src/', '/security/']) {
    const listing = await get({ path });
    if (listing.status === 200 && /Index of|\.(js|mjs|astro|css)"/.test(listing.body)) listed.push(path);
  }
  record('Directory Listing', 'Folders cannot be listed', listed.length === 0, listed.join(' ') || 'no listings', 'host');

  // Configuration: HTTP methods
  const allowed = [];
  for (const method of ['PUT', 'DELETE', 'PATCH', 'TRACE', 'TRACK', 'PROPFIND', 'MKCOL']) {
    const response = await get({ method, path: '/contact/', headers: { 'Content-Length': '0' } });
    if (response.status >= 200 && response.status < 300) allowed.push(method);
  }
  record('Configuration', 'Writing and diagnostic HTTP methods are refused', allowed.length === 0, allowed.join(' ') || 'PUT DELETE PATCH TRACE TRACK PROPFIND MKCOL all refused', 'host');

  // Host header injection and cache poisoning
  const forgedHost = await request({ origin: `https://${evil}${new URL(origin).port ? `:${new URL(origin).port}` : ''}`, connect: connect ?? new URL(origin).hostname, insecure: true, path: '/no-such-page/', tlsOptions: { servername: new URL(origin).hostname } });
  const forwarded = await get({ path: '/about', headers: { 'X-Forwarded-Host': evil, 'X-Host': evil, 'X-Original-URL': `/${evil}`, 'X-Rewrite-URL': `/${evil}`, Forwarded: `host=${evil}`, 'X-Forwarded-Scheme': 'http', 'X-Forwarded-Proto': 'http', 'X-HTTP-Method-Override': 'PUT' } });
  const baseline = await get({ path: '/about' });
  record('Configuration', 'Forwarding and override headers do not change the response', forwarded.status === baseline.status, `HTTP ${forwarded.status} against ${baseline.status}`, 'host');
  const fat = await get({ path: '/contact/?x=1;motion=on', headers: { 'Content-Length': '12', 'Content-Type': 'application/x-www-form-urlencoded' } });
  record('Configuration', 'A request with a body or semicolon query cannot change a cached page', fat.status === 0 || !fat.body.includes('motion=on'), `HTTP ${fat.status}`, 'host');
  record('Configuration', 'A forged Host header is not trusted', !`${forgedHost.rawHeaders}${forgedHost.body}`.includes(evil), `HTTP ${forgedHost.status}`, 'host');
  record('Configuration', 'Forwarding headers cannot poison redirects or pages', !`${forwarded.rawHeaders}${forwarded.body}`.includes(evil), `HTTP ${forwarded.status}`, 'host');

  // CORS
  const cors = await get({ path: '/', headers: { Origin: `https://${evil}` } });
  const acao = cors.headers['access-control-allow-origin'];
  record('Configuration', 'CORS does not reflect other origins or allow credentials', acao !== `https://${evil}` && !cors.headers['access-control-allow-credentials'], acao ? `Access-Control-Allow-Origin: ${acao}` : 'no CORS headers', 'host');

  // Published metadata
  const robots = await get({ path: '/robots.txt' });
  record('Information Disclosure', 'robots.txt points at nothing sensitive', robots.status === 200 && !/Disallow:\s*\/\S/.test(robots.body), `HTTP ${robots.status}`, 'site');
  const security = await get({ path: '/.well-known/security.txt' });
  const expires = /^Expires:\s*(.+)$/m.exec(security.body)?.[1];
  record('Configuration', 'security.txt gives a contact and is in date', security.status === 200 && /^Contact:/m.test(security.body) && new Date(expires) > new Date(), expires ? `expires ${expires.trim()}` : `HTTP ${security.status}`, 'site');
};
