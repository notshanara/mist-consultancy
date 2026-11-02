import type { APIRoute } from 'astro';
import { site } from '../../data/site';

// Tells anyone who finds a security problem where to report it. Each build renews the expiry date (RFC 9116).
export const GET: APIRoute = ({ site: domain }) => {
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  return new Response(
    `Contact: mailto:${site.email.general}\nExpires: ${expires}\nPreferred-Languages: en\nCanonical: ${new URL('.well-known/security.txt', domain)}\n`,
  );
};
