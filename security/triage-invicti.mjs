// Downloads Invicti's vulnerability index and sorts every entry by whether it can apply to this site.
// Re-run it when the site gains something new (a CMS, analytics, a server function) and update `stack`.
// The download is cached in security/.results/invicti and is not part of the project.
//
// usage: node security/triage-invicti.mjs
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const cache = join(here, '.results', 'invicti');
mkdirSync(join(cache, 'pages'), { recursive: true });
const base = 'https://www.invicti.com/web-application-vulnerabilities/';

// Products that are really in this site. Checked against every package in package-lock.json.
const stack = /^(Vite)\b/;

// Entries that can apply, by how they are handled. Names are Invicti's, and the run fails if one disappears.
const applies = {
  'Script injection in the browser': [
    '(Possible) Cross site scripting', 'Cross site scripting (requiring unencoded quote)', 'Cross site scripting (requiring unencoded tag delimiter)', 'Cross-site Scripting', 'Cross-site Scripting (DOM based)',
    'HTML Injection', 'HTML Injection (requiring unencoded tag delimiter)', 'HTML Attribute Injection', 'User controllable tag parameter', 'User controllable tag parameter (DOM-based)', 'User controllable script source',
    'User controllable charset', 'User-controlled form action', 'URI Fragment-based iframe Source Hijack (DOM-based)', 'Same origin method execution (SOME)', 'Same site scripting', 'Client Side Template Injection',
    'Client-Side Prototype Pollution', 'Prototype pollution', 'HTTP parameter pollution',
  ],
  'Content Security Policy quality': [
    'Content Security Policy (CSP) Not Implemented', 'An Unsafe Content Security Policy (CSP) Directive in Use', 'Content Security Policy Misconfiguration', 'Incorrect Content Security Policy (CSP) Implementation',
    'Multiple Content Security Policy (CSP) Implementation Detected', 'Missing object-src in CSP Declaration', 'default-src Used in Content Security Policy (CSP)', 'data: Used in a Content Security Policy (CSP) Directive',
    'Wildcard Detected in Domain Portion of Content Security Policy (CSP) Directive', 'Wildcard Detected in Port Portion of Content Security Policy (CSP) Directive', 'Wildcard Detected in Scheme Portion of Content Security Policy (CSP) Directive',
    'Scheme URI Detected in Content Security Policy (CSP) Directive', 'Insecure Protocol Detected in Content Security Policy (CSP)', 'Deprecated Header Instruction Used to Implement Content Security Policy (CSP)',
    'Invalid Content Security Policy (CSP) Directive Identified in meta Elements', 'Content Security Policy (CSP) Keywords Not Used Within Single Quotes',
  ],
  'Clickjacking and cross-window attacks': [
    'Clickjacking: CSP frame-ancestors missing', 'Cross frame scripting', 'Insecure Frame (External)', 'Cross-Origin Opener Policy (COOP) Not Implemented', 'Cross-Origin Opener Policy (COOP) Needs Improvements',
    'Cross-Origin Opener Policy (COOP) Syntax Error', 'Cross-Origin-Embedder-Policy (COEP) Not Implemented', 'Cross-Origin-Embedder-Policy (COEP) needs improvements',
  ],
  'Other response headers': [
    'X-Content-Type-Options (XCTO) Not Implemented', 'Insecure Referrer Policy', 'Permissions-Policy header not implemented', 'Missing Content-Type Header', 'Access-Control-Allow-Origin header with wildcard (*) value',
    'Misconfigured Access-Control-Allow-Origin Header', 'Subresource Integrity (SRI) Not Implemented', 'Sensitive pages could be cached', 'Cookies Not Marked as HttpOnly', 'Cookies Not Marked as Secure',
    'Cookies with missing, inconsistent or contradictory properties', 'Possible CSRF (Cross-site request forgery)',
  ],
  'Encryption in transit': [
    'HTTP Strict Transport Security (HSTS) Policy Not Enabled', 'HTTP Strict Transport Security (HSTS) Errors and Warnings', 'SSL/TLS Not Implemented', 'Insecure HTTP Usage', 'Insecure Transportation Security Protocol Supported (SSLv2)',
    'Insecure Transportation Security Protocol Supported (SSLv3)', 'Insecure Transportation Security Protocol Supported (TLS 1.0)', 'Insecure Transportation Security Protocol Supported (TLS 1.1)', 'HTTPS connection uses outdated TLS version',
    'HTTPS connection with weak key length', 'Active Mixed Content over HTTPS', 'Passive Mixed Content over HTTPS', 'Insecure transition from HTTP to HTTPS in form post', 'Insecure transition from HTTPS to HTTP in form post', 'Invalid SSL Certificate',
    'Revoked SSL Certificate', 'SSL Certificate Is About To Expire', 'SSL Certificate Name Hostname Mismatch', 'SSL Untrusted Root Certificate', 'SSL Secure renegotiation is not supported', 'Certificate is Signed Using a Weak Signature Algorithm',
    'TLS/SSL certificate key size too small', 'TLS/SSL Weak Cipher Suites', 'TLS/SSL Sweet32 attack', 'TLS/SSL LOGJAM attack', 'The FREAK attack', 'The POODLE attack (SSLv3 with CBC cipher suites)', 'The DROWN attack (SSLv2 supported)',
    'CRIME SSL/TLS attack', 'ROBOT Attack Detected (Strong Oracle)', 'ROBOT Attack Detected (Weak Oracle)', 'TLS/SSL (EC)DHE Key Reuse',
  ],
  'Host behaviour': [
    'Open Redirection', 'Http redirect security bypass', 'HTML Form found in redirect page', 'CRLF injection/HTTP response splitting (Web Server)', 'HTTP Header Injection', 'Host header attack', 'Web Cache Poisoning', 'Web Cache Poisoning via Host Header',
    'Web Cache Poisoning via Fat GET Request', 'Web Cache Poisoning via POST Request', 'Web Cache Poisoning via semicolon query separator', 'Web Cache Poisoning DoS', 'Web Cache Poisoning DoS (for javascript)', 'Web Cache Deception',
    'HTTP header reflected in cached response', 'Virtual Host locations misconfiguration', 'Request Smuggling', 'Directory traversal', 'Server directory traversal', 'Directory listings', 'TRACE Method enabled', 'TRACK Method enabled', 'WebDAV Enabled',
    'WebDAV directory listing', 'WebDAV Directory Has Write Permissions', 'File creation via HTTP method PUT', 'Method Tampering', 'HTTP verb tampering via POST', 'Reverse Proxy Detected', 'Web Application Firewall Detected', 'Web server default welcome page',
    'Error page web server version disclosure', 'Error page path disclosure', 'Programming Error Messages', 'Possible virtual host found', 'Virtual host directory listing',
    'Web Cache Poisoning DoS through HTTP/2 headers', 'Web Cache Poisoning through HTTP/2 pseudo-headers',
  ],
  'Files that should not be public': [
    'Dotenv .env file', 'GIT Detected exposed', 'SVN Detected', 'CVS Detected', 'Mercurial repository found', 'Bazaar repository found', 'JetBrains .idea project directory', 'Development configuration files', 'Configuration file disclosure',
    'Configuration file source code disclosure', 'Source Code Disclosure', 'Source Code Disclosure (Node.js)', '[Possible] Backup Source Code Detected', '[Possible] Backup Folder', 'Possible database backup', 'Core dump file',
    'npm log file publicly accessible (npm-debug.log)', 'Unprotected JSON file leaking secrets', 'RSA Private Key Detected', 'Documentation files', 'Possible sensitive files', 'Possible sensitive directories', '.htaccess File Detected',
    'Javascript Source map detected', 'Insecure crossdomain.xml policy', 'Open Silverlight Client Access Policy', "Apple's App-Site Association (AASA) file", 'SQLite Database File Found',
  ],
  'Information in what is published': [
    'Potential Sensitive Data Disclosure', 'Sensitive Data Exposure', 'Possible username or password disclosure', 'Password found in server response', '[Possible] Internal Path Disclosure (*nix)', '[Possible] Internal Path Disclosure (Windows)',
    '[Possible] Internal IP Address Disclosure', '[Possible] Database Connection String Detected', 'Possible SQL Statement in comment', 'Generic Email Address Disclosure', 'Broken Link Hijacking', 'Hostile subdomain takeover',
  ],
  'The contact form': [
    'Email Header Injection', 'Email injection', 'Blind XSS',
  ],
  'Harmful content': [
    'Malware Identified', 'Malware Identified (SB)',
  ],
};

const product = /WordPress|Joomla|Drupal|Typo3|Magento|SAP\b|Oracle|JBoss|Tomcat|Struts|Spring|Apache|Laravel|Symfony|Django|Flask|Rails|RoR\b|Ruby|Rack|PHP|phpMy|phpLite|phpMo|ASP\.NET|\.NET|\bIIS\b|Microsoft|SharePoint|FrontPage|Frontpage|ColdFusion|Lucee|Railo|\bJava\b|JSP|JSF|JVM|JAAS|JMX|Jenkins|Jira|JIRA|Atlassian|Gitlab|Kentico|Liferay|Umbraco|vBulletin|Tiki|Express|Node\.js|Next\.js|Nuxt|Yii|CodeIgniter|Pyramid|Tornado|Mojolicious|Web2py|Play framework|BottlePy|Bottle|Grails|GlassFish|WebLogic|WebSphere|IBM|Hadoop|Kafka|Cassandra|Redis|Memcached|Elasticsearch|MongoDB|InfluxDB|CouchDB|RethinkDB|SonarQube|Airflow|Bitrix|Barracuda|BigIP|F5\b|SonicWall|Sangfor|VMware|Zabbix|Zend|Ektron|Akeeba|TCPDF|Minify|TimThumb|Ioncube|Parallels|Plesk|Docker|Consul|Hashicorp|Kong|NGINX|Nginx|Caddy|uWSGI|FastCGI|Haproxy|Envoy|Prometheus|Jupyter|MLflow|TorchServe|WebPageTest|Firebase|Amazon S3|Azure|Odoo|OSGi|Python|Perl|Golang|Go web|Delve|Xdebug|Whoops|Clockwork|Tracy|Webalizer|AWStats|Webmail|Wing FTP|WS_FTP|Sublime|Joe Editor|Bootstrap|AngularJS|Genericons|Adobe|Flex|MediaWiki|Craft CMS|Hasura|Lotus|Devise|CakePHP|CherryPy|GWT|Sinatra|MyFaces|PrimeFaces|Ext JS|Mercurial Client|Solr|Spark|HugeGraph|Jolokia|OpenCms|OData|Axis|NiFi|ZooKeeper|Ampache|AbanteCart|WPEngine|ImageResizer|Chrome Logger|Log4j|Bash code|Shell|Kentico|Trojan|ToolsPack|Cmd hijack|webadmin|Unprotected phpMyAdmin|apc\.php|Global\.asa|Elmah|Trace\.axd|PHPinfo/;
const reasons = [
  ['No AI features', (e) => /LLM|OpenAI|Model Context/.test(e.name) || e.tags.some((t) => t.startsWith('llm'))],
  ['No API', (e) => /GraphQL|GraphiQL|JWT|SAML|BFLA|BOLA|IDOR|Mass Assignment|\bAPI\b/.test(e.name) || e.tags.some((t) => t.startsWith('api-') || t === 'bola') && !/Content|Referrer|Permissions|Access-Control|Content-Type|cached/.test(e.name)],
  ['Named product or framework that is not in this site', (e) => product.test(e.name)],
  ['No server-side code, database or uploads', (e) => e.tags.some((t) => ['sql-injection', 'code-execution', 'rce', 'ssrf', 'xxe', 'file-inclusion', 'insecure-deserialization', 'server-side-template-injection', 'eli-injection', 'ldap-injection', 'xpath-injection', 'file-upload', 'unauthenticated-file-upload', 'arbitrary-file-creation', 'arbitrary-file-read', 'buffer-overflow', 'oob-vulnerabilities'].includes(t)) || /Injection|injection|Upload|Deserialization|File Inclusion|File Creation|File Deletion|Remote File|Reflection|format string|Padding oracle|Smuggling/.test(e.name)],
  ['No login, sessions or cookies', (e) => e.tags.some((t) => ['authentication-bypass', 'session-fixation', 'weak-credentials', 'default-credentials', 'bruteforce-possible', 'privilege-escalation', 'insecure-admin-access'].includes(t)) || /[Ss]ession|[Cc]ookie|[Pp]assword|[Cc]redential|Basic authentication|Authentication|secret key|Admin/.test(e.name)],
  ['Part of a Content Security Policy feature this policy does not use', (e) => /Nonce|Hash|report-uri|Report-Only/.test(e.name)],
  ['Other server software or feature this site does not have', () => true],
];

const decode = (text) => text.replace(/&#0?39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const wait = (ms) => new Promise((done) => setTimeout(done, ms));

// One request at a time, and anything already downloaded is not fetched again.
const get = async (key, url) => {
  const file = join(cache, 'pages', `${key}.html`);
  if (existsSync(file)) return readFileSync(file, 'utf8');
  const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (site security review)' } });
  if (response.status !== 200) throw new Error(`HTTP ${response.status} for ${url}`);
  const html = await response.text();
  writeFileSync(file, html);
  await wait(450);
  return html;
};

const rows = (html) =>
  html.split('<div class="table-row">').slice(1).flatMap((chunk) => {
    const link = chunk.match(/<a href="\/web-application-vulnerabilities\/([^"]+)"[^>]*>\s*([\s\S]*?)\s*<\/a>/);
    if (!link) return [];
    return [{
      slug: link[1],
      name: decode(link[2]),
      cve: [...chunk.matchAll(/>\s*(CVE-\d{4}-\d+)\s*</g)].map((m) => m[1]),
      severity: chunk.match(/severity-icon [a-z]+-icon">([^<]+)</)?.[1] ?? 'Unknown',
    }];
  });
const lastPage = (html) => Math.max(1, ...[...html.matchAll(/[?&]page=(\d+)/g)].map((m) => Number(m[1])));

const entries = new Map();
const first = await get('index-1', base);
for (let page = 1; page <= lastPage(first); page++) {
  rows(await get(`index-${page}`, `${base}?page=${page}`)).forEach((row) => entries.set(row.slug, { ...row, tags: [] }));
}
const tags = [...new Set([...first.matchAll(/web-application-vulnerabilities\/tag\/([a-z0-9-]+)"/g)].map((m) => m[1]))];
const tagCounts = {};
for (const tag of tags) {
  const firstTag = await get(`tag-${tag}-1`, `${base}tag/${tag}`);
  tagCounts[tag] = 0;
  for (let page = 1; page <= lastPage(firstTag); page++) {
    for (const row of rows(await get(`tag-${tag}-${page}`, `${base}tag/${tag}?page=${page}`))) {
      tagCounts[tag]++;
      if (!entries.has(row.slug)) entries.set(row.slug, { ...row, tags: [] });
      entries.get(row.slug).tags.push(tag);
    }
  }
}

const names = new Map(Object.entries(applies).flatMap(([area, list]) => list.map((name) => [name, area])));
const seen = new Set();
const buckets = {};
const add = (key, entry) => (buckets[key] ??= []).push(entry);
for (const entry of entries.values()) {
  if (names.has(entry.name)) {
    seen.add(entry.name);
    add(`applies: ${names.get(entry.name)}`, entry);
  } else if (stack.test(entry.name)) {
    add('applies: A product in this stack', entry);
  } else if (entry.tags.includes('missing-update') || entry.tags.includes('known-vulnerabilities') || entry.cve.length) {
    add('filtered: Known flaw in a named product that is not in this site', entry);
  } else {
    add(`filtered: ${reasons.find(([, test]) => test(entry))[0]}`, entry);
  }
}
const missing = [...names.keys()].filter((name) => !seen.has(name));
if (missing.length) console.log('NOT IN THE CATALOGUE ANY MORE:', missing);

console.log(`${entries.size} entries, ${tags.length} categories\n`);
for (const [key, list] of Object.entries(buckets).sort()) console.log(`${String(list.length).padStart(6)}  ${key}`);
const applying = Object.entries(buckets).filter(([key]) => key.startsWith('applies')).flatMap(([, list]) => list);
console.log(`\n${applying.length} apply, ${entries.size - applying.length} filtered out`);
writeFileSync(join(here, '.results', 'triage.json'), JSON.stringify({ total: entries.size, tagCounts, counts: Object.fromEntries(Object.entries(buckets).map(([key, list]) => [key, list.length])), other: buckets['filtered: Other server software or feature this site does not have']?.map((entry) => entry.name) ?? [] }, null, 2));
process.exit(missing.length ? 1 : 0);
