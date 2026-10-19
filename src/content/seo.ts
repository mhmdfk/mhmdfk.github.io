import {
  education,
  experiences,
  profile,
  projects,
  seo,
  skillGroups,
} from './content.ts'

// Build-time SEO artifacts (JSON-LD, llms.txt, sitemap) derived from content.ts.
// `date` is an ISO timestamp of the last content change.

export function buildStructuredData(date: string) {
  const personId = `${seo.url}#person`
  const websiteId = `${seo.url}#website`
  const address = {
    '@type': 'PostalAddress',
    addressLocality: seo.city,
    addressCountry: seo.countryCode,
  }
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': personId,
        name: profile.name,
        alternateName: seo.alternateNames,
        givenName: seo.givenName,
        familyName: seo.familyName,
        jobTitle: profile.title,
        description: seo.description,
        url: seo.url,
        image: new URL('og-image.png', seo.url).href,
        email: profile.email,
        sameAs: [profile.links.github, profile.links.linkedin],
        homeLocation: { '@type': 'Place', name: profile.location, address },
        address,
        alumniOf: {
          '@type': 'CollegeOrUniversity',
          name: education.school,
          address: {
            '@type': 'PostalAddress',
            addressCountry: education.countryCode,
          },
        },
        hasOccupation: {
          '@type': 'Occupation',
          name: profile.title,
          occupationLocation: seo.workLocations,
        },
        knowsAbout: skillGroups.flatMap((group) => group.items),
      },
      {
        '@type': 'WebSite',
        '@id': websiteId,
        url: seo.url,
        name: profile.name,
        inLanguage: 'en',
        publisher: { '@id': personId },
        about: { '@id': personId },
      },
      {
        '@type': 'ProfilePage',
        '@id': `${seo.url}#profile`,
        url: seo.url,
        name: seo.title,
        isPartOf: { '@id': websiteId },
        mainEntity: { '@id': personId },
        dateModified: date,
      },
    ],
  }
}

export function buildLlmsTxt() {
  return (
    [
      `# ${profile.fullName} (${profile.name})`,
      `> ${seo.description}`,
      '## About',
      profile.bio,
      '## Experience',
      experiences
        .map((experience) =>
          [
            `### ${experience.company} — ${experience.role}`,
            `${experience.location} | ${experience.start} — ${experience.end}`,
            ...experience.bullets.map((bullet) => `- ${bullet}`),
          ].join('\n'),
        )
        .join('\n\n'),
      '## Projects',
      projects
        .map((project) =>
          [
            `### ${project.name} — ${project.tagline}`,
            ...(project.liveUrl ? [`- [Live site](${project.liveUrl})`] : []),
            ...(project.repoUrl ? [`- [Repository](${project.repoUrl})`] : []),
            ...project.highlights.map((highlight) => `- ${highlight}`),
          ].join('\n'),
        )
        .join('\n\n'),
      '## Skills',
      skillGroups
        .map((group) => `- ${group.label}: ${group.items.join(', ')}`)
        .join('\n'),
      '## Education',
      `${education.degree} — ${education.school}`,
      `${education.start} — ${education.end} | ${education.note}`,
      '## Contact',
      [
        `- [Website](${seo.url})`,
        `- [Email](mailto:${profile.email})`,
        `- [GitHub](${profile.links.github})`,
        `- [LinkedIn](${profile.links.linkedin})`,
        `- [CV](${new URL(profile.cvUrl, seo.url).href})`,
      ].join('\n'),
    ].join('\n\n') + '\n'
  )
}

export function buildSitemap(date: string) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${seo.url}</loc>
    <lastmod>${date.slice(0, 10)}</lastmod>
  </url>
</urlset>
`
}
