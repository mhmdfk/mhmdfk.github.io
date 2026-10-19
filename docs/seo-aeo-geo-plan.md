# SEO / AEO / GEO plan: make the portfolio findable by name and role

Goal: when someone searches Google/Bing, or asks ChatGPT, Perplexity, Gemini or Claude
for any of these, mhmdfk.github.io is the answer:

- "Mohammad Fawzi Asad", "Mohammad Fawzi", "Mohammad Asad"
- "Mohammad Asad software engineer", "Mohammad Fawzi software engineer"
- "software engineer in Dubai", "full-stack engineer Dubai", "software engineer Jordan / Amman"

## Where things stand (checked 2026-10-19 on the live site)

Already good:

- Page is prerendered (`scripts/prerender.mjs`), so all content is in the raw HTML.
- Title, meta description, canonical, Open Graph, Twitter card, OG image all present.
- `robots.txt` allows everything and points at `sitemap.xml`.
- A basic `Person` JSON-LD (name, jobTitle, url, sameAs, email, Dubai address).

Gaps this plan fills:

1. The name **"Mohammad Fawzi Asad" / "Mohammad Fawzi" appears nowhere** on the page
   (only in the LinkedIn URL). Search engines and LLMs can't link those queries to the site.
2. **"Jordan" / "Amman" barely appear** as text tied to the person (only one experience row).
3. JSON-LD is thin: no `alternateName`, `description`, `image`, `knowsAbout`,
   `alumniOf`, `hasOccupation`; no `WebSite` / `ProfilePage` entities.
4. No `/llms.txt` (404) — the plain-text summary AI crawlers and agents look for.
5. `sitemap.xml` has no `<lastmod>`.

Rule for every task: **everything in structured data and llms.txt must also be true and
visible on the page.** No hidden keyword text, no keyword lists, no fake FAQs. Google
ignores or penalises markup that doesn't match visible content.

## Decisions for you before running the agents

- **Full name to display.** Recommended: keep "Mohammad Asad" as the big hero name and add
  "Mohammad Fawzi Asad" once in visible text (About bio + footer). Or switch the display
  name to "Mohammad Fawzi Asad" everywhere — say so in Task 1's prompt.
- **Arabic name.** If you want Arabic searches to match, give the exact spelling you use
  (e.g. on LinkedIn). The agents must not guess it; leave it out otherwise.
- **Jordan wording.** The prompts say "based in Dubai, UAE; previously Amman, Jordan" and
  "graduated from Jordan University of Science and Technology". Change it if you want
  something else, e.g. "open to roles in Dubai and Jordan".

## Run order

Tasks 1 → 2 → 3 touch `src/content/content.ts` and `vite.config.ts`, so run them **one
after another in the same checkout** (or give all three to one agent). Task 4 only adds a
build step and can run in parallel with Task 3. Task 5 is manual for you.

---

## Task 1 — Name and location in visible content and meta

**Prompt for the agent:**

```
In C:\dev\portofilo (Vite + React portfolio, prerendered by scripts/prerender.mjs,
all copy in src/content/content.ts), make the site match searches for my name and role.

My full name is Mohammad Fawzi Asad. People search "Mohammad Fawzi Asad",
"Mohammad Fawzi" and "Mohammad Asad". I'm a full-stack software engineer based in
Dubai, UAE; previously I worked in Amman, Jordan, and graduated from Jordan University
of Science and Technology (JUST).

Do this, editing content.ts only unless a component hard-codes text:
1. Keep profile.name = 'Mohammad Asad' as the display name. Add a profile.fullName =
   'Mohammad Fawzi Asad' field and use it in visible text in two places: the first
   sentence of the About bio ("I'm Mohammad Fawzi Asad, a full-stack software engineer
   based in Dubai...") and the footer.
2. In the bio, spell out "Jordan University of Science and Technology" instead of only
   "JUST", and mention that I worked in Amman, Jordan. Keep the bio's tone and length
   roughly the same.
3. seo.title: "Mohammad Fawzi Asad — Full-Stack Software Engineer in Dubai" (under 65 chars).
4. seo.description (140–160 chars): name, role, Dubai, Jordan, core stack
   (Spring Boot, React/Next.js, AI). Natural sentence, no keyword list.
5. seo.imageAlt: include the full name.

Do not add hidden text, keyword lists or new sections. Don't change styling.
Verify: run `npm run build`, then confirm dist/index.html contains the new <title>,
description, and "Mohammad Fawzi Asad" inside the prerendered <main>/<footer>.
Run `npm run lint`. Report the final title, description and bio text.
```

## Task 2 — Rich JSON-LD entity graph

**Prompt for the agent:**

```
In C:\dev\portofilo, the JSON-LD is built from `seo.person` in src/content/content.ts
and injected by the 'portfolio-metadata' plugin in vite.config.ts (placeholder
__PERSON_JSON_LD__ in index.html). Replace it with a schema.org @graph so search
engines and AI answer engines treat me as one clear entity.

Build the graph from existing data in content.ts (profile, experiences, education,
skills, projects) — don't duplicate strings. Entities, linked by @id:
- Person (@id "https://mhmdfk.github.io/#person"): name "Mohammad Asad",
  alternateName ["Mohammad Fawzi Asad", "Mohammad Fawzi"], givenName "Mohammad",
  familyName "Asad", jobTitle, description (same as seo.description), url,
  image "https://mhmdfk.github.io/og-image.png", email, sameAs (GitHub, LinkedIn),
  homeLocation Place Dubai, AE, address (keep), alumniOf CollegeOrUniversity
  "Jordan University of Science and Technology" (addressCountry JO),
  hasOccupation Occupation {name "Full-Stack Software Engineer",
  occupationLocation [City Dubai, Country Jordan], skills: from skills groups},
  knowsAbout: the skills list flattened (Java, Spring Boot, React, ...).
  Don't add worksFor: the Gauge Solutions role has ended (Aug 2026).
- WebSite (@id "https://mhmdfk.github.io/#website"): url, name, inLanguage "en",
  publisher/about -> person.
- ProfilePage (@id "https://mhmdfk.github.io/#profile"): url, name = seo.title,
  isPartOf website, mainEntity person, dateModified = build date (ISO, set in
  vite.config.ts at build time).

Keep the existing '<' -> '\u003c' escaping. Only include facts already visible on the
page (Task 1 added the full name to the visible bio — check it's there; if not, stop
and tell me).
Verify: `npm run build`; extract the ld+json from dist/index.html with a small node
one-liner and JSON.parse it; print it. Run `npm run lint`. Tell me to paste the URL
into https://search.google.com/test/rich-results and https://validator.schema.org
after deploying.
```

## Task 3 — /llms.txt generated at build

**Prompt for the agent:**

```
In C:\dev\portofilo, add an /llms.txt (llmstxt.org format) so AI crawlers and agents
get a clean plain-text summary of me. Generate it at build time from
src/content/content.ts so it never drifts from the site — add an emitted asset in
the existing 'portfolio-metadata' Vite plugin in vite.config.ts (generateBundle +
this.emitFile, fileName 'llms.txt'). Don't hand-write a copy in public/.

Format:
# Mohammad Fawzi Asad (Mohammad Asad)
> one-line summary: full-stack software engineer based in Dubai, UAE; previously
  Amman, Jordan. (Use seo.description.)

Then short sections built from content.ts: About (bio), Experience (company, role,
location, dates, bullets), Projects (name, tagline, live/repo URL, highlights),
Skills, Education, Contact (site URL, email, GitHub, LinkedIn, CV URL
https://mhmdfk.github.io/Mohammad_Asad_CV.pdf).

Plain markdown, no HTML, under ~6 KB. Also add `<link rel="alternate"
type="text/markdown" href="/llms.txt" />` to index.html head.
Verify: `npm run build`, print dist/llms.txt, confirm every fact in it also appears
in dist/index.html. Run `npm run lint`.
```

## Task 4 — Sitemap lastmod

**Prompt for the agent:**

```
In C:\dev\portofilo, public/sitemap.xml is static with no <lastmod>. Make the build
write dist/sitemap.xml with <lastmod> = build date (YYYY-MM-DD) for
https://mhmdfk.github.io/ — simplest option is to do it at the end of
scripts/prerender.mjs and delete public/sitemap.xml. Keep robots.txt as is.
Verify: `npm run build` and print dist/sitemap.xml; it must be valid XML with
one <url> having <loc> and <lastmod>.
```

## Task 5 — Off-site steps (you do these; no agent)

These matter as much as the code for name searches — engines and LLMs trust an entity
when several profiles agree.

1. **Google Search Console**: add `https://mhmdfk.github.io/` (HTML-tag verification
   goes in index.html head — an agent can add the tag you're given), submit
   `sitemap.xml`, then "Request indexing" on the homepage.
2. **Bing Webmaster Tools**: import from Search Console and submit the sitemap. Bing's
   index feeds ChatGPT search and Copilot, so this is the main GEO lever.
3. **LinkedIn**: set name to "Mohammad Fawzi Asad", headline "Full-Stack Software
   Engineer · Dubai", location Dubai, and add the site under Contact info → Website.
4. **GitHub (mhmdfk)**: set name "Mohammad Fawzi Asad", location Dubai, website
   `https://mhmdfk.github.io`; add a profile README with the same one-line summary.
5. **CV PDF**: make sure its first line uses the same full name and links the site.
6. Use the exact same name + title + location everywhere you appear.

## How to check it worked (2–6 weeks after deploy)

- Search Console → Performance: queries containing "fawzi", "asad", "dubai".
- Google `site:mhmdfk.github.io` shows the new title and description.
- Ask ChatGPT (search on), Perplexity and Gemini: "Who is Mohammad Fawzi Asad, software
  engineer?" and "full-stack software engineers in Dubai with Spring Boot" — note
  whether they cite the site.
