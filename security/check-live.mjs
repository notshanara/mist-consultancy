// Read-only checks against a deployed site, for what only the real host and domain can answer.
// It sends attack-shaped requests, so point it only at a site you own.
//
// usage: node security/check-live.mjs https://www.example.co.uk
// --simulation points it at the local simulation instead, to test this script itself.
import { X509Certificate } from 'node:crypto';
import tls from 'node:tls';
import { httpChecks, request } from './http-checks.mjs';

const target = process.argv[2];
if (!target?.startsWith('https://')) {
  console.error('Give the full address of the deployed site, for example: npm run security:live -- https://www.example.co.uk');
  process.exit(2);
}
const origin = new URL(target).origin;
const simulation = process.argv.includes('--simulation');
const connect = simulation ? '127.0.0.1' : undefined;

let failed = 0;
let total = 0;
const record = (group, test, pass, detail = '') => {
  total++;
  if (!pass) failed++;
  console.log(`${pass ? 'PASS' : 'FAIL'}  [${group}] ${test}${detail ? `  (${detail})` : ''}`);
};

const home = await request({ origin, connect, insecure: simulation });
if (home.status === 0) {
  console.error(`Could not reach ${origin}: ${home.error}`);
  process.exit(2);
}

const certificate = await new Promise((done, fail) => {
  const url = new URL(origin);
  const socket = tls.connect({ host: connect ?? url.hostname, port: Number(url.port || 443), servername: url.hostname, rejectUnauthorized: !simulation }, () => {
    const peer = socket.getPeerCertificate();
    socket.destroy();
    done(peer);
  });
  socket.on('error', fail);
});
const daysLeft = Math.floor((new Date(certificate.valid_to) - Date.now()) / 86400000);
record('Transport', 'The certificate is valid for this name', simulation || home.status > 0, simulation ? 'not checked on the simulation' : 'the connection verified it');
record('Transport', 'The certificate has at least 14 days left', daysLeft >= 14, `${daysLeft} days`);
record('Transport', 'The certificate key is strong enough', certificate.asn1Curve ? certificate.bits >= 256 : certificate.bits >= 2048, `${certificate.asn1Curve ?? 'RSA'} ${certificate.bits} bits`);
const signature = new X509Certificate(certificate.raw).signatureAlgorithm ?? 'unknown';
record('Transport', 'The certificate does not use a weak signature', !/md5|sha-?1(?!\d)/i.test(signature), signature);

const plain = new URL(origin);
plain.protocol = 'http:';
plain.port = simulation ? '8080' : '';
const asset = /<script[^>]+src="(\/_astro\/[^"]+)"/.exec(home.body)?.[1];
await httpChecks({ origin, plain: plain.href, connect, insecure: simulation, pages: ['/', '/contact/'], asset, record });

const contact = await request({ origin, connect, insecure: simulation, path: '/contact/' });
const action = /<form[^>]+action="([^"]*)"/.exec(contact.body)?.[1];
record('Sensitive Data Not Over SSL', 'The contact form posts to an HTTPS endpoint', action?.startsWith('https://'), action ?? 'no endpoint set');

console.log(`\n${origin}: ${total - failed} passed, ${failed} failed, of ${total}`);
if (!simulation) console.log('For the cipher-level findings (weak suites, POODLE, ROBOT and so on), also run the domain through https://www.ssllabs.com/ssltest/.');
process.exit(failed ? 1 : 0);
