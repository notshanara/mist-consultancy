// The site's security policy in one place. astro-integration.mjs writes it to the host's _headers file.
const TURNSTILE = 'https://challenges.cloudflare.com';

/** The origin enquiries go to. Throws unless the endpoint is plain HTTPS, so a bad value stops the build. */
export const formOrigin = (endpoint) => {
  if (!endpoint) return null;
  let url;
  try {
    url = new URL(endpoint);
  } catch {
    throw new Error(`PUBLIC_FORM_ENDPOINT is not a valid URL: ${endpoint}`);
  }
  if (url.protocol !== 'https:') throw new Error('PUBLIC_FORM_ENDPOINT must use https:// so enquiries are encrypted in transit.');
  if (url.username || url.password) throw new Error('PUBLIC_FORM_ENDPOINT must not contain a username or password. It is visible to every visitor.');
  return url.origin;
};

export const contentSecurityPolicy = ({ endpoint, turnstile = false }) => {
  const origin = formOrigin(endpoint);
  const challenge = turnstile ? [TURNSTILE] : [];
  const connect = [...(origin ? [origin] : []), ...challenge];
  const directives = [
    ['default-src', ["'none'"]],
    ['script-src', ["'self'", ...challenge]],
    ['style-src', ["'self'"]],
    ['img-src', ["'self'"]],
    ['font-src', ["'self'"]],
    ...(connect.length ? [['connect-src', connect]] : []),
    ...(challenge.length ? [['frame-src', challenge]] : []),
    ['object-src', ["'none'"]],
    ['base-uri', ["'none'"]],
    ['form-action', [origin ?? "'self'"]],
    ['frame-ancestors', ["'none'"]],
    ['require-trusted-types-for', ["'script'"]],
    ['trusted-types', ["'none'"]],
    ['upgrade-insecure-requests', []],
  ];
  return directives.map(([name, values]) => [name, ...values].join(' ')).join('; ');
};

// Turnstile's frame cannot opt in to the embedder policy, so that one header gives way when it is switched on.
export const headersFile = ({ endpoint, turnstile }) => `/*
  Content-Security-Policy: ${contentSecurityPolicy({ endpoint, turnstile })}
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: accelerometer=(), browsing-topics=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()
  Cross-Origin-Opener-Policy: same-origin
${turnstile ? '' : '  Cross-Origin-Embedder-Policy: require-corp\n'}
/_astro/*
  Cache-Control: public, max-age=31536000, immutable
`;
