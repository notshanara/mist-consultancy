# Mist Consultancy website: security protections

Tested 2 November 2026 against the [Invicti vulnerability list](https://www.invicti.com/web-application-vulnerabilities/). This covers the site in a simulated production setup. The site has not been deployed, and this is not a penetration test or an Invicti scan.

## Results

The attacks ran in headless Chrome against three simulated origins on this PC: the host, the form provider and an attacker's site. A log on the attacker's server recorded what actually got out.

| Run | Passed | Failed |
| --- | --- | --- |
| Control: a deliberately careless host, to prove the tests can fail | 8 | 33 |
| The site before this work, on a well-run host | 51 | 54 |
| **The site now** | **109** | **0** |

The site now has 4 more checks than the old one because those checks test its new build safeguards.

**What the old site got right and wrong:** it was not injectable, with 147 XSS attempts finding nothing to exploit. But nothing contained an attack if one ever landed. All 29 follow-up attempts worked, including sending form data to the attacker, and every page could be framed for clickjacking. All 29 are now blocked.

**Other checks on the finished site:**

- Functional tests: 56 of 58 pass. The 2 failures test the `?motion=on` switch, which is now deliberately off in production builds (see item 9).
- Accessibility: axe found 0 violations on 7 pages, at desktop and phone width, with motion on and off.
- Links: all 87 resolve.
- Design: 0 pixels changed across 12 full-page views, compared with reduced motion on and allowing for tiny rendering differences. Animated views were checked by eye. Opening text animations moved by up to 0.02 seconds.

## How the list was filtered

I downloaded all 337 pages and all 64 categories, then matched the site's 306 installed packages against every entry name. The only real match was Vite.

| Outcome | Entries | Why |
| --- | --- | --- |
| Filtered out | 24,473 | Known flaw in a named product the site does not use |
| Filtered out | 400 | Named product or framework the site does not use, without a CVE |
| Filtered out | 75 | The site has no API (includes GraphQL, JWT, SAML) |
| Filtered out | 42 | No server-side code, database or uploads |
| Filtered out | 26 | Other server software or features the site does not have |
| Filtered out | 15 | No login, sessions or cookies |
| Filtered out | 11 | Content Security Policy features this policy does not use (nonces, hashes, reporting) |
| Filtered out | 10 | No AI features |
| **Can apply** | **172** | Listed by area below |
| **Total** | **25,224** | |

The site is static files plus a form that posts to a third party. That is why so little applies, and why adding a CMS, a login or server functions would change this answer.

This filter used names, categories and CVE data. I read through the 774 entries not tagged as product update issues, but did not open all 25,224 detail pages. I did open the pages that affected a decision.

| Can apply | Entries | Handled by |
| --- | --- | --- |
| Encryption in transit | 32 | Item 5, and the host |
| Host behaviour | 38 | The host, checked by `security:live` |
| Files that should not be public | 28 | Item 8 |
| Script injection in the browser | 20 | Items 1, 2, 3 |
| Content Security Policy quality | 16 | Item 1 |
| Other response headers | 12 | Item 6, and accepted risks |
| Information in what is published | 12 | Item 8, and accepted risks |
| Clickjacking and cross-window attacks | 8 | Item 4 |
| The contact form | 3 | Item 7 |
| Harmful content | 2 | Items 11, 13, 14 |
| A product in this stack | 1 | Item 14 |

## Protections in place

### 1. Strict Content Security Policy

Set in the `_headers` file generated from [security/policy.mjs](security/policy.mjs).

- `default-src 'none'`, with only what the site needs allowed back, all from its own origin.
- No `unsafe-inline`, `unsafe-eval`, wildcards or `data:`.
- `object-src 'none'` and `base-uri 'none'`.
- `connect-src` and `form-action` are limited to the form provider, worked out from its address at build time.
- One policy per response. Invicti treats a header plus a meta tag as a finding, so I removed a meta copy I had first added.

**Tested:** 27 attacks after an assumed injection, including inline scripts, `eval`, `javascript:` links, outside scripts, and sending data out by `fetch`, beacon, image, WebSocket, font, frame, CSS and `<base>`. Also 2 attempts to redirect the form to the attacker. All were blocked, while the same attempts all worked on the old site.

### 2. No inline code or styles

- The inline boot script moved to [src/scripts/boot.js](src/scripts/boot.js).
- About 150 inline `style` attributes became classes.
- Stylesheets and small scripts are no longer inlined into pages.

This is what allows item 1 to be strict, and the build now fails if any of it returns.

### 3. Trusted Types

`require-trusted-types-for 'script'` makes the browser refuse HTML written into a page as a plain string, the usual route for DOM XSS. Browsers without support ignore it and still have item 1. The site's scripts needed no changes because they never used those methods.

**Also tested:** query strings and fragments carrying XSS, template injection, prototype pollution and repeated parameters, on every page and the 404.

### 4. Clickjacking and cross-window protection

- `frame-ancestors 'none'` and `X-Frame-Options: DENY`.
- `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp`.
- No frames and no `target="_blank"` links in the build.

**Tested:** an attacker's page failed to frame all 6 pages, and a page that opens the site gets no handle on it. On the old site, all 6 could be framed and the handle worked.

### 5. Encryption in transit

- `Strict-Transport-Security: max-age=31536000; includeSubDomains`.
- `upgrade-insecure-requests` in the policy.
- The build refuses a form endpoint that uses plain HTTP, a script URL or embedded credentials, or is not a URL (all 4 tested).
- The build fails on any insecure URL in the pages or code.

### 6. Other response headers

- `X-Content-Type-Options: nosniff`.
- `Referrer-Policy: strict-origin-when-cross-origin`, so the provider sees only the origin. It may need that to enforce a domain restriction.
- `Permissions-Policy` denying camera, microphone, location, payment, USB and sensors.
- Hashed assets cached as immutable, while HTML stays revalidated.

### 7. Contact form

In [src/components/ContactForm.astro](src/components/ContactForm.astro).

- Length limits on every field (name 120, company 160, email 254, telephone 32, message 5,000).
- Whitespace-only enquiries are refused.
- The honeypot stays, but its explanatory HTML comment no longer reaches the page.
- Repeated clicks send one enquiry.
- The provider's reply is only checked for success and never shown. A hostile reply from the simulated provider did nothing.
- Line breaks cannot enter single-line fields in the browser, which stops email header injection through the page.
- Enquiries go by POST over HTTPS, with no cookies and nothing in the URL.
- Optional Cloudflare Turnstile is switched on by setting `PUBLIC_TURNSTILE_SITE_KEY`. The policy and privacy notice adjust by themselves. Tested with Cloudflare's published test key: the widget loaded, the form sent, and there were no policy violations.

### 8. Nothing private is published

- [wrangler.jsonc](wrangler.jsonc) publishes `dist/` only on Cloudflare, and [netlify.toml](netlify.toml) does the same on Netlify.
- 57 development, backup, repository and admin paths were requested and none is served, including `.env`, `.git`, `.idea`, `src/` and `package.json`.
- The careless control host did serve files like these, so the check can catch them.
- No source maps, HTML comments, generator tags, local paths, internal IPs or secret-shaped strings in the build.
- [.gitignore](.gitignore) now also covers `.idea/`, `.vscode/` and all `.env.*` files except the example. `.idea/` was previously not ignored.

### 9. Review switch off in production

`?motion=on` could override a visitor's reduced-motion setting on the live site. It now works only on the development server, so this no longer needs removing before launch.

### 10. Own error page

[src/pages/404.astro](src/pages/404.astro) is new. It returns a real 404, repeats nothing from the request and reveals nothing about the host. On Cloudflare, `not_found_handling` in [wrangler.jsonc](wrangler.jsonc) serves it; without that setting, missing pages come back blank.

### 11. No cookies, browser storage or third parties

Visiting every page leaves 0 cookies and nothing in browser storage, and no request goes to another site. That includes the fonts, Manrope and Gilroy, which are served from the site rather than a font service. This keeps the privacy notice's cookie statement true and removes the risk of a compromised third-party script. Subresource Integrity is not needed because there are no external scripts (Turnstile excepted, see below).

### 12. A place to report problems

`/.well-known/security.txt` (RFC 9116) gives a contact address, and each build renews its expiry date.

### 13. Build gate

[security/scan-build.mjs](security/scan-build.mjs) runs on every build and **fails it** on:

- inline scripts, styles or event handlers
- third-party scripts or frames
- unsafe DOM methods such as `innerHTML` or `eval`
- source maps, secrets, local paths or internal IPs
- insecure URLs, HTML comments or generator tags
- a second policy in a meta tag

### 14. Dependencies

- `npm audit` reports 0 known vulnerabilities, and the package signature check passed.
- [.npmrc](.npmrc) blocks install scripts, the usual way a compromised package runs code on a build machine. A clean `npm ci` and build works with this on.
- `package-lock.json` pins exact versions, and no front-end libraries reach visitors.
- **Vite file read (CVE-2025-30208, CVE-2025-31125):** the one catalogue entry that matched, and it affects only the development server. Vite is on 8.3.5. I ran the exploit paths against the local dev server and got 403 with no file contents. A forged `Host` header also got 403, and the server listens on this PC only.
- Node runs only at build time and no Node server runs in production, so Invicti's Node.js entries do not apply.

### 15. JSON-LD escaping

`<` is escaped in the structured data block, so a value containing a closing script tag could not break out if a CMS later supplies this content. No hostile content exists to attack this today, so this was reviewed rather than attack-tested.

## Accepted risks

These can apply, or a scanner may report them, and I left them as they are deliberately.

| Finding | Why it stays |
| --- | --- |
| Generic Email Address Disclosure | The brief requires the published addresses and phone number. Expect some spam. |
| Possible CSRF | The form has no token. There is no session to forge, and abuse is handled by Turnstile and the provider. A scanner may still flag it. |
| Sensitive pages could be cached | Every page is public, with no personal data in any response. |
| Reverse Proxy / WAF Detected, `Server: cloudflare` | Inherent to the host. It names no version. |
| default-src Used in CSP | Information only, raised because the directive is present. `'none'` plus specific directives follows Invicti's own advice, but the alert may still appear. |
| HSTS `preload` left out | Invicti recommends it but does not flag its absence. It is hard to undo, so decide once the domain and all its subdomains are known. |
| Client-side form limits can be bypassed | A script can post straight to the provider. Only the provider's settings and Turnstile stop that. |
| A browser can still be sent to another site | A policy cannot block page navigation. It would need script or HTML to be injected first, and items 1 to 3 stop that. |

**If Turnstile is on**, three things change, because of how Cloudflare's script works:

- The policy allows `challenges.cloudflare.com`.
- The COEP header is dropped, because its frame cannot opt in.
- Subresource Integrity is not possible, because Cloudflare updates the script without notice.

I think this is worth it to reduce spam, but it adds one outside script.

## What this does not prove

- **Host behaviour:** 21 of the 109 checks depend on the real host, such as redirects, TLS, traversal and HTTP methods. Here they ran against my simulated host, so they show the tests work, not that Netlify behaves this way. Run `security:live` after deployment.
- **Not tested at all:**
  - request smuggling
  - HTTP/2 cache poisoning
  - cipher-level TLS attacks (POODLE, ROBOT and similar)
  - the real form provider's spam and rate limits, or how its dashboard and emails display submitted text (Blind XSS)
- **Browsers:** Chrome only. Safari, Firefox and real phones are untested.

## Before launch

1. **Host:** deploy to Netlify, which reads `_headers`. Cloudflare Pages uses the same file format, but I have not tested it. Vercel and others ignore that file, so the headers would need porting. On those hosts, **the site would otherwise have no Content Security Policy at all**, and `security:live` would fail.
2. **Check the live site** with `security:live`, then run the domain through [SSL Labs](https://www.ssllabs.com/ssltest/) for the cipher-level findings. Only run `security:live` against a site you own, because it sends attack-shaped requests.
3. **Form provider:** set `PUBLIC_FORM_ENDPOINT`, restrict the form to your domain, turn on spam protection, and check that submissions show as plain text.
4. **Turnstile:** set the site key, put the secret key in the provider's settings, and have the added privacy wording reviewed.
5. **Domain:** confirm every subdomain supports HTTPS before going live, because `includeSubDomains` applies to all of them. Remove any unused DNS records to prevent subdomain takeover, and set up SPF, DKIM and DMARC for the published addresses.
6. **security.txt:** confirm `info@mistconsultancy.co.uk` is the right place for security reports.

## Keeping it current

- Rebuild and redeploy at least once a year, so `security.txt` does not expire.
- Run `npm audit` regularly, and before each release.
- Re-run the filter when the site gains a CMS, analytics or server functions. A CMS login would bring authentication, session and admin categories back into scope.

Run the attack tests. This builds its own copy and leaves `dist/` alone:

```bash
npm run security:test
```

Check the deployed site:

```bash
npm run security:live -- https://www.mistconsultancy.co.uk
```

Re-run the Invicti filter:

```bash
node security/triage-invicti.mjs
```

The tools are in [security/](security/). `puppeteer-core` is a development dependency for the attack tests and never reaches the site.
