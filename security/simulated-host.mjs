// A local stand-in for production: the static host, the form provider and an attacker's site, each
// on its own HTTPS origin. attack-tests.mjs starts it. It is never deployed.
//
// With `naive: true` the host is deliberately careless: it publishes the whole project folder, lists
// directories, trusts paths and echoes requests. That run is the control proving the tests can fail.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync } from 'node:fs';
import http from 'node:http';
import https from 'node:https';
import { dirname, extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

export const sim = {
  connect: '127.0.0.1',
  siteHost: 'site.localhost',
  site: 'https://site.localhost:8443',
  plain: 'http://site.localhost:8080',
  provider: 'https://forms.localhost:8444',
  attacker: 'https://attacker.localhost:8445',
  endpoint: 'https://forms.localhost:8444/f/mist',
};

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpeg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
};

const certificate = () => {
  const dir = join(here, '.cert');
  const key = join(dir, 'key.pem');
  const cert = join(dir, 'cert.pem');
  if (!existsSync(cert)) {
    mkdirSync(dir, { recursive: true });
    const openssl = ['openssl', 'C:\\Program Files\\Git\\usr\\bin\\openssl.exe'];
    const args = ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-days', '30', '-keyout', key, '-out', cert, '-subj', '/CN=site.localhost', '-addext', 'subjectAltName=DNS:site.localhost,DNS:forms.localhost,DNS:attacker.localhost'];
    const ok = openssl.some((command) => {
      try {
        execFileSync(command, args, { stdio: 'ignore' });
        return true;
      } catch {
        return false;
      }
    });
    if (!ok) throw new Error('The simulation needs openssl to make a throwaway certificate. Install Git for Windows or OpenSSL.');
  }
  return { key: readFileSync(key), cert: readFileSync(cert) };
};

// Reads a Netlify-style _headers file. Every rule whose path matches applies.
const readHeaderRules = (root) => {
  const file = join(root, '_headers');
  if (!existsSync(file)) return [];
  const rules = [];
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    if (!/^\s/.test(line)) {
      const pattern = line.trim().replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
      rules.push({ pattern: new RegExp(`^${pattern}$`), headers: [] });
    } else {
      const at = line.indexOf(':');
      rules.at(-1).headers.push([line.slice(0, at).trim(), line.slice(at + 1).trim()]);
    }
  }
  return rules;
};

const carefulHost = (root) => {
  const rules = readHeaderRules(root);
  const applyRules = (res, path) => {
    for (const rule of rules) {
      if (rule.pattern.test(path)) rule.headers.forEach(([name, value]) => res.setHeader(name, value));
    }
  };
  const notFound = (res, method, path) => {
    applyRules(res, path);
    const page = join(root, '404.html');
    const body = existsSync(page) ? readFileSync(page) : 'Not Found';
    res.writeHead(404, { 'Content-Type': existsSync(page) ? types['.html'] : types['.txt'] });
    res.end(method === 'HEAD' ? undefined : body);
  };

  return (req, res) => {
    res.setHeader('Server', 'Netlify');
    const host = (req.headers.host ?? '').split(':')[0];
    if (host !== sim.siteHost) {
      res.writeHead(404, { 'Content-Type': types['.txt'] });
      return res.end('Not Found');
    }
    const [rawPath, ...rest] = req.url.split('?');
    const search = rest.length ? `?${rest.join('?')}` : '';
    let path;
    try {
      path = decodeURIComponent(rawPath);
    } catch {
      res.writeHead(400);
      return res.end('Bad Request');
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      applyRules(res, path);
      res.writeHead(405, { Allow: 'GET, HEAD' });
      return res.end();
    }
    if (path.includes('\0') || path.includes('\\') || path.split('/').includes('..')) return notFound(res, req.method, '/404');
    path = path.replace(/\/{2,}/g, '/');
    if (['/_headers', '/_redirects'].includes(path)) return notFound(res, req.method, path);

    const target = resolve(root, `.${path}`);
    if (!(target === resolve(root) || target.startsWith(resolve(root) + sep))) return notFound(res, req.method, '/404');
    if (!existsSync(target)) return notFound(res, req.method, path);
    let file = target;
    if (statSync(target).isDirectory()) {
      if (!path.endsWith('/')) {
        applyRules(res, path);
        res.writeHead(301, { Location: `${encodeURI(path)}/${search}` });
        return res.end();
      }
      file = join(target, 'index.html');
      if (!existsSync(file)) return notFound(res, req.method, path);
    }
    applyRules(res, path);
    res.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' });
    res.end(req.method === 'HEAD' ? undefined : readFileSync(file));
  };
};

const carelessHost = (root) => (req, res) => {
  const raw = (lines, body = '') => {
    res.socket.write(`HTTP/1.1 ${lines.join('\r\n')}\r\nConnection: close\r\n\r\n${body}`);
    res.socket.destroy();
  };
  const common = ['Server: Apache/2.4.49 (Win64) PHP/8.1.0', 'X-Powered-By: PHP/8.1.0', 'Set-Cookie: PHPSESSID=abc123', `Access-Control-Allow-Origin: ${req.headers.origin ?? '*'}`];
  if (req.method === 'TRACE') return raw(['200 OK', ...common, 'Content-Type: message/http'], `TRACE ${req.url}\r\n${JSON.stringify(req.headers)}`);
  if (req.method !== 'GET' && req.method !== 'HEAD') return raw(['200 OK', ...common], 'stored');

  const [rawPath] = req.url.split('?');
  let path = rawPath;
  try {
    path = decodeURIComponent(rawPath);
  } catch {}
  const target = join(root, normalize(path.replaceAll('\\', '/')));
  const exists = existsSync(target);
  if (!exists && !path.endsWith('/')) {
    return raw(['301 Moved', ...common, `Location: ${req.headers['x-forwarded-host'] ? `https://${req.headers['x-forwarded-host']}` : ''}${path}/`]);
  }
  if (!exists) return raw(['404 Not Found', ...common, 'Content-Type: text/html'], `<h1>Not found: ${path}</h1><p>at C:\\inetpub\\wwwroot on ${req.headers.host}</p>`);
  if (statSync(target).isDirectory()) {
    const index = join(target, 'index.html');
    if (existsSync(index)) return raw(['200 OK', ...common, 'Content-Type: text/html'], readFileSync(index, 'utf8'));
    return raw(['200 OK', ...common, 'Content-Type: text/html'], `<h1>Index of ${path}</h1>${readdirSync(target).map((name) => `<a href="${name}">${name}</a>`).join('')}`);
  }
  return raw(['200 OK', ...common, `Content-Type: ${types[extname(target)] ?? 'text/plain'}`], readFileSync(target).toString('latin1'));
};

const body = (req) =>
  new Promise((done) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => done(Buffer.concat(chunks).toString()));
  });

// Behaves like a hosted form service, except that it answers with a hostile body: the page must never render it.
const providerHandler = (log) => async (req, res) => {
  const text = await body(req);
  log.push({ method: req.method, url: req.url, origin: req.headers.origin, referer: req.headers.referer, cookie: req.headers.cookie, type: req.headers['content-type'], body: text });
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': sim.site,
  });
  res.end(JSON.stringify({ ok: true, next: '<img src=x onerror="window.__providerXss=1"><script>window.__providerXss=1</script>' }));
};

// Records everything that reaches it. An entry in this log means data left the site.
const attackerHandler = (log) => async (req, res) => {
  const url = new URL(req.url, sim.attacker);
  const text = await body(req);
  log.push({ method: req.method, path: url.pathname, query: url.search, body: text });
  const send = (type, content) => {
    res.writeHead(200, { 'Content-Type': type, 'Access-Control-Allow-Origin': '*' });
    res.end(content);
  };
  const src = (url.searchParams.get('src') ?? '').replaceAll('"', '&quot;');
  if (url.pathname === '/frame') return send(types['.html'], `<!doctype html><title>Win a prize</title><iframe src="${src}" width="800" height="600"></iframe>`);
  if (url.pathname === '/opener') return send(types['.html'], '<!doctype html><title>Opener</title>');
  if (url.pathname.startsWith('/evil.js')) return send(types['.js'], `window['__ran_${url.searchParams.get('tag')}'] = 1;`);
  if (url.pathname.startsWith('/evil.css')) return send(types['.css'], 'html { outline: 1px solid; }');
  send(types['.txt'], 'noted');
};

export const startSimulation = async ({ root, naive = false }) => {
  const tls = certificate();
  const logs = { provider: [], attacker: [] };
  const hostHandler = naive ? carelessHost(resolve(root)) : carefulHost(resolve(root));
  const tlsOptions = naive ? { ...tls, minVersion: 'TLSv1', ciphers: 'DEFAULT@SECLEVEL=0' } : { ...tls, minVersion: 'TLSv1.2' };

  const servers = [
    [https.createServer(tlsOptions, hostHandler), 8443],
    [
      http.createServer((req, res) => {
        res.writeHead(301, {
          Server: naive ? 'Apache/2.4.49' : 'Netlify',
          Location: naive && req.headers.host ? `http://${req.headers.host}${req.url}` : `${sim.site}${req.url}`,
        });
        res.end();
      }),
      8080,
    ],
    [https.createServer(tls, providerHandler(logs.provider)), 8444],
    [https.createServer(tls, attackerHandler(logs.attacker)), 8445],
  ];
  // A hostile page may try a WebSocket. Getting this far counts as reaching the attacker.
  servers[3][0].on('upgrade', (req, socket) => {
    logs.attacker.push({ method: 'UPGRADE', path: req.url, query: '', body: '' });
    socket.destroy();
  });
  await Promise.all(servers.map(([server, port]) => new Promise((done) => server.listen(port, sim.connect, done))));
  return {
    logs,
    stop: () => Promise.all(servers.map(([server]) => new Promise((done) => {
      server.closeAllConnections?.();
      server.close(done);
    }))),
  };
};
