export type Profile = {
  name: string
  title: string
  pitch: string
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
  location: 'Dubai, UAE',
  email: 'mfaaak@hotmail.com',
  links: {
    github: 'https://github.com/mhmdfk',
    linkedin: 'TODO',
  },
  cvUrl: '/Mohammad_Asad_CV.pdf',
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
    role: 'TODO',
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
