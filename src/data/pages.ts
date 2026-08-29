/**
 * Copy for the overview pages and the shared closing CTA (PRD §8.1). Kept out of
 * components so wording changes never touch a section (PRD §11.3 rule 4).
 */
export const SERVICES_PAGE = {
  eyebrow: 'Services',
  title: '',
  intro:
    "TryEntitle helps businesses find the parts of their operation that are costing them time and money, then improve the way that work gets done. We work across processes, systems, administrative work, and day-to-day operations to reduce unnecessary work, improve efficiency, and help businesses handle more without constantly adding people or overhead. We don't come in with a one-size-fits-all solution. We look at what is happening inside the business and focus on the areas where we can make a real difference.",
} as const

export const INDUSTRIES_PAGE = {
  eyebrow: 'Industries',
  title: '',
  intro: '',
  note: '',
  noteCta: '',
} as const

/**
 * Copy for the bands that fill out an industry detail page (PRD FR15).
 *
 * The headings are shared across all seven industries — the question reads the
 * same whichever field you are in. What changes per industry is the structured
 * content in data/industry-detail.ts.
 */
export const INDUSTRY_DETAIL_COPY = {
  useCases: {
    eyebrow: 'Use cases',
    title: 'Where are your best people doing the most manual work?',
    intro:
      'The workflows below are the ones we see holding up a week in this field. Each names what happens today, what we put in place instead, and what changes as a result.',
    problemLabel: 'Today',
    buildLabel: 'What we build',
    impactsLabel: 'What changes',
  },
  exception: {
    eyebrow: 'How it runs',
    title: 'Automated to the exception, then handed to a person.',
    systemsLabel: 'Systems this work moves between',
    humanLabel: 'Where a person stays in it',
    note: 'System categories, not integrations we are claiming — we work with whatever you already run.',
  },
  services: {
    eyebrow: 'Services',
    title: 'How the work gets delivered.',
    intro: 'The services that usually carry this work. Every engagement is scoped to your process.',
  },
} as const

/**
 * Copy for the "in practice" band on a service detail page (PRD FR14). The
 * service's Markdown body carries the narrative; this band carries the concrete
 * situations from data/service-detail.ts.
 */
export const SERVICE_DETAIL_COPY = {
  useCases: {
    eyebrow: 'In practice',
    title: '',
    intro: '',
    problemLabel: 'Today',
    buildLabel: 'What we build',
    impactsLabel: 'What changes',
  },
  industries: {
    eyebrow: 'Industries',
    title: 'Where this service does the most work.',
    intro: '',
  },
} as const

/** The closing CTA copy reused across detail and overview pages. */
export const CLOSING = {
  title: '',
  body: '',
} as const
