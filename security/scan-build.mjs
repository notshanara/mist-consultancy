// Reads a finished build for anything that would weaken its security. The build fails if this finds
// a problem (see astro-integration.mjs), so the protections cannot quietly lapse as the site changes.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

// Third-party script hosts the policy allows. Anything else in a page is a mistake or a compromise.
const allowedScriptHosts = ['https://challenges.cloudflare.com/'];
const namespaces = /https?:\/\/(www\.w3\.org|www\.sitemaps\.org|schema\.org)\S*/g;

export const scanBuild = (dir) => {
  const problems = [];
  const report = (file, issue) => problems.push(`${relative(dir, file)}: ${issue}`);

  for (const file of walk(dir)) {
    const type = extname(file);
    const name = file.slice(dir.length);
    if (type === '.map') report(file, 'source map published');
    if (/[\\/]\.(env|git|idea|vscode|DS_Store)/.test(name)) report(file, 'development file published');
    if (!['.html', '.css', '.js', '.svg', '.txt', '.xml'].includes(type) && !name.endsWith('_headers')) continue;

    const text = readFileSync(file, 'utf8');
    // Shape data in SVG paths can look like an IP address, so it is left out of the content checks.
    const content = text.replace(/\sd="[^"]*"/g, '').replace(/\ssrc="[^"]*"/g, '');

    if (/sourceMappingURL=/.test(text)) report(file, 'links to a source map');
    if (/-----BEGIN [A-Z ]*PRIVATE KEY|AKIA[0-9A-Z]{16}|\bsk_(live|test)_[0-9a-zA-Z]{10,}|\bghp_[0-9a-zA-Z]{20,}/.test(text)) report(file, 'looks like a secret');
    if (/[A-Za-z]:\\Users\\|\/Users\/[a-z]|\/home\/[a-z]/.test(content)) report(file, 'contains a local file path');
    if (/\b(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})\b/.test(content)) report(file, 'contains an internal IP address');

    if (type === '.html' || type === '.js' || type === '.css') {
      const insecure = content.replace(namespaces, '').match(/http:\/\/(?!localhost)[a-z0-9.-]+/i);
      if (insecure) report(file, `insecure URL ${insecure[0]}`);
    }
    if (type === '.js' && /\.innerHTML\s*=|\.outerHTML\s*=|insertAdjacentHTML|document\.write|\beval\(|new Function\(/.test(text)) report(file, 'uses an unsafe DOM or code sink');
    if (type !== '.html') continue;

    for (const [tag, attributes] of text.matchAll(/<script\b([^>]*)>/g)) {
      const src = /\ssrc="([^"]*)"/.exec(attributes)?.[1];
      if (!src && !/application\/ld\+json/.test(attributes)) report(file, `inline script ${tag.slice(0, 60)}`);
      if (src && /^(https?:)?\/\//.test(src) && !allowedScriptHosts.some((host) => src.startsWith(host))) report(file, `third-party script ${src}`);
    }
    if (/<style\b/.test(text)) report(file, 'inline style block');
    if (/<[a-z][^>]*\sstyle=/i.test(text)) report(file, 'inline style attribute');
    if (/<[a-z][^>]*\son[a-z]+\s*=/i.test(text)) report(file, 'inline event handler');
    if (/(href|src|action)=["']?\s*(javascript|data|vbscript):/i.test(text)) report(file, 'script URL');
    if (/target=["']?_blank/i.test(text) && !/<a\b[^>]*target=["']?_blank[^>]*rel=["'][^"']*noopener/i.test(text)) report(file, 'target=_blank without rel=noopener');
    if (/<!--/.test(text)) report(file, 'HTML comment published');
    if (/<meta[^>]*name=["']generator/i.test(text)) report(file, 'generator tag names the software');
    if (/http-equiv=["']?Content-Security-Policy/i.test(text)) report(file, 'second policy in a meta tag: keep one, in the header');
    if (/<iframe\b/i.test(text)) report(file, 'frame in the page');
  }
  return problems;
};

/** Links to other sites can go stale and be taken over, so they are counted even though they are allowed. */
export const externalLinks = (dir) =>
  walk(dir)
    .filter((file) => extname(file) === '.html')
    .flatMap((file) => [...readFileSync(file, 'utf8').matchAll(/<a\b[^>]*href="(https?:\/\/[^"]+)"/g)].map((match) => match[1]));
