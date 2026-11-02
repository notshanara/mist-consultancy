// Checks the form settings before a build starts, then gates the finished build and writes its headers.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';
import { formOrigin, headersFile } from './policy.mjs';
import { scanBuild } from './scan-build.mjs';

export default function security() {
  let env = {};
  return {
    name: 'mist-security',
    hooks: {
      'astro:config:setup': ({ command }) => {
        env = loadEnv(command === 'build' ? 'production' : 'development', process.cwd(), 'PUBLIC_');
        formOrigin(env.PUBLIC_FORM_ENDPOINT);
      },
      'astro:build:done': ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const problems = scanBuild(root);
        if (problems.length) throw new Error(`Security check failed:\n  ${problems.join('\n  ')}`);
        writeFileSync(
          join(root, '_headers'),
          headersFile({ endpoint: env.PUBLIC_FORM_ENDPOINT, turnstile: Boolean(env.PUBLIC_TURNSTILE_SITE_KEY) }),
        );
        if (!env.PUBLIC_FORM_ENDPOINT) logger.warn('PUBLIC_FORM_ENDPOINT is not set, so the contact form sends nothing.');
        logger.info('Security check passed and _headers written.');
      },
    },
  };
}
