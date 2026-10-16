export type Profile = {
  name: string
  title: string
  pitch: string
  bio: string
  location: string
  email: string
  links: {
    github: string
    linkedin: string
  }
  cvUrl: string
}

export type Experience = {
  id: string
  company: string
  role: string
  location: string
  start: string
  end: string
  bullets: string[]
  stack: string[]
}

export type Project = {
  id: 'tiraz' | 'huntrix' | 'matjari'
  name: string
  tagline: string
  liveUrl?: string
  repoUrl?: string
  screenshot?: { src: string; alt: string }
  role: string
  stack: string[]
  highlights: string[]
  caseStudy: {
    problem: string
    approach: string
    outcome: string
  }
}

export type SkillGroup = {
  label: string
  items: string[]
}

export type Education = {
  degree: string
  school: string
  start: string
  end: string
  note: string
}

export const profile: Profile = {
  name: 'Mohammad Asad',
  title: 'Full-Stack Software Engineer',
  pitch:
    'I build and ship production web apps end to end — Spring Boot and React/Next.js, data pipelines, and AI features — from API design to AWS.',
  bio: "I'm a full-stack engineer who likes owning a feature from the database to the deploy. At Gauge Solutions I worked on a production ERP, from Kafka integrations to faster PostgreSQL queries, and on Tiraz I built the data pipeline and design flow behind a live AI product. I care about clean APIs, reliable systems and shipping things people actually use. I graduated in Software Engineering from JUST with a 3.99 GPA.",
  location: 'Dubai, UAE',
  email: 'mfaaak@hotmail.com',
  links: {
    github: 'https://github.com/mhmdfk',
    linkedin: 'https://www.linkedin.com/in/mohammad-fawzi-asad-/',
  },
  cvUrl: '/Mohammad_Asad_CV.pdf',
}

export const seo = {
  title: `${profile.name} — ${profile.title}`,
  description:
    'Mohammad Asad is a full-stack engineer building production web apps with Spring Boot, React and AI features.',
  url: 'https://mhmdfk.github.io/',
  imageAlt: 'Mohammad Asad — Full-Stack Software Engineer portfolio',
  person: {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.title,
    url: 'https://mhmdfk.github.io/',
    sameAs: [profile.links.github, profile.links.linkedin],
    email: profile.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Dubai',
      addressCountry: 'AE',
    },
  },
}

export const experiences: Experience[] = [
  {
    id: 'gauge-solutions',
    company: 'Gauge Solutions',
    role: 'Junior Software Engineer',
    location: 'Amman',
    start: 'Feb 2025',
    end: 'Aug 2026',
    bullets: [
      'Built and enhanced full-stack modules for a production ERP platform: inventory, user management, reporting, POS and e-commerce (React, Next.js, Spring Boot).',
      'Integrated the ERP with a separate invoicing service through event-driven messaging with Kafka for reliable asynchronous data flow.',
      'Designed RESTful APIs and optimised PostgreSQL queries, cutting response times by 25%.',
      'Integrated an AI chatbot and Google Cloud Vision OCR to automate document processing inside business workflows.',
      'Containerised services with Docker and automated CI/CD with Jenkins, cutting deployment time by 30%.',
    ],
    stack: [
      'Spring Boot',
      'React',
      'Next.js',
      'PostgreSQL',
      'Kafka',
      'Docker',
      'Jenkins',
    ],
  },
  {
    id: 'correlation-one',
    company: 'Correlation One',
    role: 'Advanced Data Analytics Training Program',
    location: 'Remote',
    start: 'Oct 2024',
    end: 'Mar 2025',
    bullets: [
      'Built regression models and statistical analyses with SQL and Python, driving up to 20% growth in customer acquisition.',
      'Automated data workflows with Pandas and Excel, reducing preparation time by 40%.',
    ],
    stack: ['Python', 'SQL', 'Pandas'],
  },
]

export const projects: Project[] = [
  {
    id: 'tiraz',
    name: 'Tiraz',
    tagline: 'AI interior design platform',
    liveUrl: 'https://tiraz.sa',
    screenshot: {
      src: '/projects/tiraz.webp',
      alt: 'Tiraz’s Arabic homepage showing a living room with AI design overlays.',
    },
    role: 'Full-stack engineer',
    stack: [
      'Spring Boot',
      'React',
      'TypeScript',
      'Python',
      'FastAPI',
      'PostgreSQL',
      'Docker',
      'AWS',
    ],
    highlights: [
      'Product data pipeline in Python that ingests, normalises and classifies 40,000+ products from five major Saudi furniture retailers, with retries, circuit breakers and automated failure reports.',
      "Room-size-aware furniture selection that fits products to a room's floor area, style and colour, powering the AI room designs.",
      'React/TypeScript design flow (photo upload, room measurement, redesign) and an admin panel for credits and design analytics on a Spring Boot backend.',
      'Payments with reliable credit grants; Docker on AWS with GitHub Actions CI/CD.',
    ],
    caseStudy: {
      problem:
        "Homeowners can't easily picture real, purchasable furniture in their own room.",
      approach:
        'A photo and room measurements guide an AI redesign using a catalogue of real retail products filtered to fit the room.',
      outcome: 'Live product at tiraz.sa.',
    },
  },
  {
    id: 'huntrix',
    name: 'Huntrix',
    tagline: 'AI recruitment assistant',
    liveUrl: 'https://huntrixai.com',
    screenshot: {
      src: '/projects/huntrix.webp',
      alt: 'Huntrix’s recruitment interface showing a ranked candidate shortlist.',
    },
    role: 'Full-stack engineer',
    stack: [
      'Next.js',
      'TypeScript',
      'FastAPI',
      'Python',
      'PostgreSQL',
      'Docker',
    ],
    highlights: [
      'AI-assisted candidate search that turns a hiring brief into a shortlist.',
      'Executive search with contact enrichment from external data providers.',
      'Subscription plans with usage-based quotas.',
    ],
    caseStudy: {
      problem: 'Sourcing candidates is slow and manual.',
      approach:
        'An AI agent searches, ranks and enriches candidates from a short brief.',
      outcome: 'Live product at huntrixai.com.',
    },
  },
  {
    id: 'matjari',
    name: 'Matjari',
    tagline: 'E-commerce marketplace',
    repoUrl: 'https://github.com/mhmdfk/matjari',
    role: 'Full-stack developer',
    stack: ['React', 'Next.js', 'Node.js', 'PostgreSQL', 'Azure Vision API'],
    highlights: [
      'Secure backend services for listings, authentication and orders (Node.js, PostgreSQL).',
      'AI image-based product search with the Azure Vision API.',
      'Real-time chat between buyers and sellers.',
    ],
    caseStudy: {
      problem: "Shoppers can't search for what they can see but can't name.",
      approach: 'Search by photo plus direct buyer–seller chat.',
      outcome: 'Working full-stack marketplace (source on GitHub).',
    },
  },
]

export const skillGroups: SkillGroup[] = [
  {
    label: 'Languages',
    items: ['Java', 'Python', 'JavaScript', 'TypeScript'],
  },
  {
    label: 'Web',
    items: [
      'Spring Boot',
      'React',
      'Next.js',
      'Node.js',
      'FastAPI',
      'HTML',
      'CSS',
      'PostgreSQL',
      'Oracle',
    ],
  },
  {
    label: 'DevOps & Tools',
    items: [
      'Git',
      'Jenkins',
      'GitHub Actions',
      'AWS',
      'Docker',
      'Kafka',
      'Microservices',
      'REST APIs',
      'Postman',
      'Testing',
    ],
  },
]

export const education: Education = {
  degree: 'B.Sc. Software Engineering',
  school: 'Jordan University of Science and Technology',
  start: 'Oct 2021',
  end: 'Jun 2025',
  note: 'GPA 3.99 / 4.0',
}

export const ui = {
  splash: {
    announcement: 'Loading',
    loading: 'Loading the studio…',
    building: 'Arranging the room…',
    skip: 'Skip',
  },
  commandPalette: {
    title: 'Command palette',
    open: 'Open command palette',
    hint: '⌘K',
    search: 'Search commands',
    close: 'Close',
    help: '↑ ↓ to select · Enter to run · Esc to close',
    empty: 'No commands found.',
    groups: {
      sections: 'Go to section',
      projects: 'Open case study',
      actions: 'Actions',
    },
    sections: [
      { id: 'top', label: 'Go to Top', keywords: 'home start hero' },
      {
        id: 'experience',
        label: 'Go to Experience',
        keywords: 'career employment jobs',
      },
      { id: 'work', label: 'Go to Work', keywords: 'projects portfolio' },
      { id: 'about', label: 'Go to About', keywords: 'bio education' },
      {
        id: 'skills',
        label: 'Go to Skills',
        keywords: 'tools technologies toolkit',
      },
      { id: 'contact', label: 'Go to Contact', keywords: 'email social' },
    ],
    projects: [
      {
        id: 'tiraz',
        label: 'Open Tiraz case study',
        keywords: 'interior design furniture',
      },
      {
        id: 'huntrix',
        label: 'Open Huntrix case study',
        keywords: 'recruitment hiring candidates',
      },
      {
        id: 'matjari',
        label: 'Open Matjari case study',
        keywords: 'marketplace commerce shopping',
      },
    ] satisfies { id: Project['id']; label: string; keywords: string }[],
    copy: { label: 'Copy email', keywords: 'contact clipboard address' },
    cv: { label: 'Download CV', keywords: 'resume curriculum vitae pdf' },
    github: { label: 'Open GitHub', keywords: 'code repositories profile' },
    linkedin: {
      label: 'Open LinkedIn',
      keywords: 'professional social profile',
    },
    scene: {
      enable: 'Enable 3D scene (automatic quality)',
      disable: 'Disable 3D scene',
      keywords: 'toggle room graphics motion performance',
    },
  },
  scene: {
    desk: 'Experience',
    sofa: 'Tiraz',
    corkboard: 'Huntrix',
    shelf: 'Matjari',
    diploma: 'About',
    window: 'Contact',
  },
  skip: 'Skip to content',
  navigation: 'Main navigation',
  menu: 'Menu',
  home: 'Back to top',
  nav: [
    { id: 'experience', label: 'Experience' },
    { id: 'work', label: 'Work' },
    { id: 'about', label: 'About' },
    { id: 'skills', label: 'Skills' },
    { id: 'contact', label: 'Contact' },
  ],
  hero: {
    eyebrow: 'Engineering · Web · AI',
    download: 'Download CV',
    contact: 'Contact',
  },
  experience: { label: '01 / Experience', heading: 'Built in practice.' },
  work: {
    label: '02 / Selected work',
    heading: 'From idea to production.',
    caseStudy: 'Read case study',
    live: 'Visit live site',
    repo: 'View repository',
  },
  caseStudy: {
    close: 'Close',
    problem: 'Problem',
    role: 'My role',
    approach: 'Approach',
    highlights: 'Highlights',
    stack: 'Stack',
    outcome: 'Outcome',
    diagram: 'How it works',
    screenshot: 'Product screenshot',
    diagrams: {
      tiraz: {
        title:
          'Tiraz flow from retailer catalogues to an AI room redesign for the user',
        steps: [
          'Retailer catalogues',
          'Data pipeline',
          'Product database',
          'Room-fit selection',
          'AI redesign',
          'User',
        ],
      },
      huntrix: {
        title:
          'Huntrix flow from hiring brief to a ranked shortlist for the recruiter',
        steps: [
          'Hiring brief',
          'AI search agent',
          'Candidate data providers',
          'Ranked shortlist',
          'Recruiter',
        ],
      },
      matjari: {
        title:
          'Matjari buyer flow through the web app and API to the database, with image search and real-time chat',
        steps: ['Buyer', 'Web app', 'Node.js API', 'PostgreSQL'],
        imageSearch: ['Image search', '(Azure Vision)'],
        chat: ['Real-time chat'],
      },
    },
  },
  about: {
    label: '03 / About',
    heading: 'End to end, with intent.',
    education: 'Education',
  },
  skills: { label: '04 / Toolkit', heading: 'The tools behind the work.' },
  contact: {
    label: '05 / Contact',
    heading: 'Let’s build something.',
    copy: 'Copy',
    copied: 'Copied',
    copyFailed: 'Couldn’t copy. Select the email to copy it.',
    github: 'GitHub',
    linkedin: 'LinkedIn',
  },
  footer: 'Back to top',
}
