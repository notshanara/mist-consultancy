# Mist Consultancy website (draft)

Static site built with [Astro](https://astro.build) and [Tailwind CSS](https://tailwindcss.com). It needs no server once built.

```bash
npm install
npm run dev      # preview at http://localhost:4321
npm run build    # production files in dist/
```

## Where things live

| To change | Edit |
| --- | --- |
| Page wording and order of sections | `src/pages/` (one file per page) |
| Header links and the More menu | `headerNav` and `moreNav` in `src/data/site.ts` |
| Services, stages, highlights, process steps, principles, MOAT | `src/data/content.ts` |
| Contact details and navigation | `src/data/site.ts` |
| Colours, type sizes and shared animation | `src/styles/global.css` |
| Scroll behaviour shared by every page | `src/scripts/motion.ts` |
| Domain name | `astro.config.mjs` |
| Security headers and Content Security Policy | `security/policy.mjs` |

Tailwind's default colours are removed, so only the MIST palette, white and two accents are available in class names: `carbon`, `gunmetal`, `iron`, `slate`, `pale`, `white`, `navy` and `blue`.

The palette names run from darkest to lightest. They date from the first, grey palette, and they were kept so a recolour only changes the values in `src/styles/global.css`. Use these text colours on each one:

| Name | Colour | Text on it |
| --- | --- | --- |
| `carbon` | #000000 | White, pale or slate |
| `gunmetal` | #2d3126 | White, pale or slate |
| `iron` | #59614b | White |
| `slate` | #9e9b88 | Carbon |
| `pale` | #e3d5c5 | Carbon, iron or navy |
| `white` | #ffffff | Carbon, iron or navy |

Slate is too light for text on white (2.8:1), so use it there only for lines and large decorative letters.

If you change the palette, also update the browser colour in `src/layouts/Base.astro`, the square in `public/favicon.svg`, and the images `public/og.png` and `public/apple-touch-icon.png`.

The accents are for small touches only, and the palette stays the theme. Their contrast limits where each one can go:

| Accent | Use it for | Only on | Contrast |
| --- | --- | --- | --- |
| `navy` (#0a3c6e) | Text, figures and button fills | White or pale | 11.1:1 on white, 7.7:1 on pale |
| `blue` (#1783c1) | Lines, dots and progress marks, never body text | White or carbon | 4.2:1 on white, 5.1:1 on carbon |

Both are too faint on gunmetal, iron and slate, so keep them off those backgrounds.

They are used in:

- the home page hero: the blue rule and dots, and navy on the button hover
- the header's marker under the current page
- the MOAT figures
- the route lines on Home, About and Our Approach, and the step markers on Our Approach
- buttons on light backgrounds
- text selection

## Fonts

Headings use **Gilroy** and everything else uses **Manrope**. Both are served from the site itself, not from a font service.

- **Manrope** is free (SIL Open Font License) and installed from npm as `@fontsource-variable/manrope`.
- **Gilroy** is a paid font by Radomir Tinkov, so it is not included. Until it is added, headings fall back to Manrope.

To switch Gilroy on:

1. Buy a **web font** licence for **Gilroy SemiBold** from [MyFonts](https://www.myfonts.com/collections/gilroy-font-radomir-tinkov) or [Fontspring](https://www.fontspring.com/fonts/radomir-tinkov/gilroy). That one style covers every heading. The free download is for personal use only.
2. Save the `.woff2` file as `public/fonts/gilroy-semibold.woff2`.
3. Rebuild. The site picks the file up by itself.

If you licence more weights, add an `@font-face` rule for each one in `public/fonts/gilroy.css`. Do not put the font file in a public repository, because that would distribute it to anyone.

## Security

Every protection, what was tested and what is left to do before launch are in [securites.md](securites.md).

The build fails if a page gains an inline script, `<style>` block or `style` attribute, because the Content Security Policy forbids them. For stagger and count values, use the classes `i-0` to `i-9` (sets `--i`) and `n-0` to `n-9` (sets `--n`). Put anything else in the component's styles.

```bash
npm run security:test                  # attacks the site in a local simulation
npm run security:live -- https://...   # read-only checks on a deployed site you own
```

## Animation

Motion is progressive enhancement. All content is in the page, so it reads in full with no JavaScript, and the site honours a visitor's reduced-motion setting by showing a still, unpinned version.

If your device has animation effects switched off (Windows: Settings > Accessibility > Visual effects), you will see that still version. To review the animation anyway, add `?motion=on` to any page address on the development server (`npm run dev`). It lasts for that browser tab and has no effect on a production build.

Markup hooks handled by `motion.ts`:

| Attribute | What it does |
| --- | --- |
| `data-reveal` | Fades and rises into view once. Wrap several in `data-reveal-group` to stagger them. |
| `data-words` | Clears a statement one word at a time as it is scrolled past. |
| `data-count="10"` | Counts up to the number when it comes into view. |
| `data-scrub="pin"`, `"through"` or `"leave"` | Sets `--p` from 0 to 1 with scroll position, for CSS to use. |
| `data-modal="id"` | Opens the `Modal` with that id. On a link, the link still works without JavaScript. |

## Still to connect before launch

- **Contact form:** copy `.env.example` to `.env` and set `PUBLIC_FORM_ENDPOINT` (for example a Formspree URL). Until then the form validates but sends nothing. For spam protection, set `PUBLIC_TURNSTILE_SITE_KEY` and put the secret key in the form provider's settings.
- **Hosting:** the site runs on Cloudflare as the `mist-consultancy` Worker, at mistconsultancy.co.uk and www. Cloudflare rebuilds and deploys it on every push to `main` on GitHub, using `wrangler.jsonc`. Cloudflare reads the generated `_headers` file, and so does Netlify (`netlify.toml`). Other hosts may ignore it, which would leave the site without its security headers, so port them and run `npm run security:live` to confirm. Two protections are dashboard settings on the domain, not files: **Always Use HTTPS** is on, and **Minimum TLS Version** is 1.2 (both under SSL/TLS, Edge Certificates).
- **Domain:** `site` in `astro.config.mjs` is a placeholder until the domain is confirmed.
- **Logo:** `src/components/Logo.astro` holds a vector traced from the supplied JPEG. Replace it with the original artwork.
- **Privacy notice:** `src/pages/privacy.astro` has bracketed items to complete and needs legal review. Remove its draft note afterwards.
- **Founder bio:** the text on `src/pages/about.astro` follows the founder section of the Company Overview v2.1. Check it with Shanan before launch.
- **MOAT:** the Company Overview v2.1 keeps its internal workings confidential. Describe only its broad purpose and capabilities, never its scoring, procedures, calculations or full methodology.
- **Not yet added:** a CMS, analytics (with consent) and photography.
