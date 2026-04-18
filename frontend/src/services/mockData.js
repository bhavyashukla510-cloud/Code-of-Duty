// ── Mock Data for Resume Tailor ──
// Used when backend is unavailable or for demo/development

export const MOCK_RESUME_TEXT = `AYUSH KUMAR
Senior Frontend Developer
ayush.kumar@email.com | +91 9876543210 | LinkedIn: linkedin.com/in/ayushkumar | GitHub: github.com/ayushk

PROFESSIONAL SUMMARY
Results-driven Frontend Developer with 4+ years of experience building scalable web applications using React, TypeScript, and modern JavaScript frameworks. Proven track record of improving application performance by 40% and delivering pixel-perfect UIs. Passionate about clean architecture, accessibility, and user experience.

TECHNICAL SKILLS
Languages: JavaScript, TypeScript, Python, HTML5, CSS3
Frameworks: React.js, Next.js, Vue.js, Express.js, Node.js
Libraries: Redux, Zustand, React Query, Tailwind CSS, Material UI, Styled Components
Tools: Git, Docker, Webpack, Vite, Jest, Cypress, Figma
Cloud: AWS (S3, Lambda, CloudFront), Vercel, Netlify
Databases: MongoDB, PostgreSQL, Firebase Firestore

WORK EXPERIENCE

Senior Frontend Developer | TechCorp Solutions | Jan 2023 – Present
• Led development of a customer-facing dashboard serving 50,000+ daily active users
• Implemented micro-frontend architecture reducing deployment time by 60%
• Built reusable component library with 40+ components using Storybook
• Mentored 3 junior developers and conducted code reviews
• Optimized Lighthouse score from 62 to 95 through performance tuning

Frontend Developer | StartupXYZ | Jun 2021 – Dec 2022
• Developed responsive e-commerce platform using React and Redux
• Integrated Stripe payment gateway and implemented cart functionality
• Reduced bundle size by 35% through code splitting and lazy loading
• Wrote 200+ unit tests achieving 85% code coverage with Jest

Junior Developer | WebAgency Inc | Aug 2020 – May 2021
• Built marketing landing pages and WordPress themes for 15+ clients
• Converted Figma designs to pixel-perfect responsive layouts
• Implemented SEO best practices improving organic traffic by 25%

EDUCATION
B.Tech in Computer Science | IIT Delhi | 2016 – 2020 | GPA: 8.7/10

CERTIFICATIONS
• AWS Certified Cloud Practitioner (2023)
• Meta Frontend Developer Professional Certificate (2022)

PROJECTS
ResumeAI — AI-powered resume builder using OpenAI GPT-4 and React
TaskFlow — Kanban board app with real-time sync using Firebase and React DnD`;

export const MOCK_TAILORED_TEXT = `AYUSH KUMAR
Senior Frontend Developer
ayush.kumar@email.com | +91 9876543210 | LinkedIn: linkedin.com/in/ayushkumar | GitHub: github.com/ayushk

PROFESSIONAL SUMMARY
Results-driven Senior Frontend Developer with 4+ years of experience building high-performance, scalable web applications using React, TypeScript, and Next.js. Expert in modern JavaScript ecosystems with a proven track record of improving application performance by 40% and delivering accessible, pixel-perfect user interfaces. Strong experience with cloud services (AWS), CI/CD pipelines, and agile development methodologies.

TECHNICAL SKILLS
Languages: JavaScript (ES6+), TypeScript, Python, HTML5, CSS3, SQL
Frameworks: React.js, Next.js, Node.js, Express.js, Vue.js
State Management: Redux, Zustand, React Query, Context API
Styling: Tailwind CSS, Material UI, Styled Components, CSS Modules
Testing: Jest, React Testing Library, Cypress, Playwright
DevOps & Tools: Git, Docker, Webpack, Vite, CI/CD (GitHub Actions), Figma
Cloud & Infrastructure: AWS (S3, Lambda, CloudFront, EC2), Vercel, Netlify
Databases: PostgreSQL, MongoDB, Firebase Firestore, Redis

WORK EXPERIENCE

Senior Frontend Developer | TechCorp Solutions | Jan 2023 – Present
• Led development of a customer-facing React dashboard serving 50,000+ daily active users with 99.9% uptime
• Architected micro-frontend architecture using Module Federation, reducing deployment time by 60%
• Built and maintained a comprehensive component library with 40+ reusable React components using Storybook and TypeScript
• Implemented performance optimizations achieving Lighthouse score improvement from 62 to 95
• Spearheaded adoption of TypeScript across the frontend codebase, reducing production bugs by 30%
• Mentored 3 junior developers through structured code reviews and pair programming sessions
• Collaborated with UX designers and backend engineers in agile sprints to deliver features on schedule

Frontend Developer | StartupXYZ | Jun 2021 – Dec 2022
• Developed a responsive, high-converting e-commerce platform using React, Redux, and TypeScript
• Integrated Stripe payment gateway with PCI-compliant checkout flow and implemented shopping cart functionality
• Achieved 35% reduction in bundle size through strategic code splitting, lazy loading, and tree shaking
• Authored 200+ unit and integration tests achieving 85% code coverage using Jest and React Testing Library
• Implemented accessibility standards (WCAG 2.1 AA) across all customer-facing pages

Junior Developer | WebAgency Inc | Aug 2020 – May 2021
• Built responsive marketing landing pages and custom WordPress themes for 15+ enterprise clients
• Converted complex Figma designs to pixel-perfect, cross-browser compatible responsive layouts
• Implemented technical SEO optimizations improving organic traffic by 25% and Core Web Vitals scores

EDUCATION
B.Tech in Computer Science | IIT Delhi | 2016 – 2020 | GPA: 8.7/10

CERTIFICATIONS
• AWS Certified Cloud Practitioner (2023)
• Meta Frontend Developer Professional Certificate (2022)

PROJECTS
ResumeAI — AI-powered resume builder leveraging OpenAI GPT-4 API, React, and Next.js for intelligent content generation
TaskFlow — Real-time Kanban board application with collaborative features using Firebase, React DnD, and TypeScript`;

export const MOCK_JD_KEYWORDS = [
  'React',
  'TypeScript',
  'Next.js',
  'Node.js',
  'AWS',
  'Redux',
  'Tailwind CSS',
  'CI/CD',
  'Jest',
  'agile',
  'REST API',
  'PostgreSQL',
  'Docker',
  'Git',
  'responsive',
  'component library',
  'performance',
  'accessibility',
  'Figma',
  'code reviews',
];

export const MOCK_SCORE_DATA = {
  before_score: 42,
  after_score: 78,
  improvement: 36,
  jd_keywords: MOCK_JD_KEYWORDS,
};

export const MOCK_TAILOR_RESPONSE = {
  tailored_text: MOCK_TAILORED_TEXT,
  before_score: 42,
  after_score: 78,
  improvement: 36,
  jd_keywords: MOCK_JD_KEYWORDS,
};

/**
 * Simulate network delay
 */
export function mockDelay(minMs = 800, maxMs = 2000) {
  const ms = Math.floor(Math.random() * (maxMs - minMs)) + minMs;
  return new Promise((resolve) => setTimeout(resolve, ms));
}
