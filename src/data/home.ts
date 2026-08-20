/**
 * Home page copy (design spec §4). Kept out of components so a copy change never
 * touches a section (PRD §11.3 rule 4).
 *
 * Voice: plain, concrete, operational. Describes what happens to the WORK, not
 * what technology is used. No "leverage", "seamless", or "revolutionize".
 */
export const HOME_COPY = {
  hero: {
    eyebrow: '',
    title: 'Innovative Operations Solutions',
    subhead: 'We are passionate about creating innovative operation solutions that drive results.',
    /**
     * Micro-trust row along the base of the hero panel.
     *
     * Every line is an existing PROOF_COMMITMENTS promise in short form — nothing
     * here is a new claim. That matters: §4.11 allows only what is true today, so
     * the hero restates commitments the page already makes further down rather
     * than inventing hero-sized ones of its own.
     */
    meta: ['', ''] as const,
  },

  systems: {
    label: 'We plug into what you already run',
  },

  about: {
    /* Eyebrow-only band: the three panel headings are the section's copy, so a
       display heading above them would say the same thing a fourth time. */
    eyebrow: 'About TryEntitle',
    title: '',
  },

  painPoints: {
    eyebrow: 'What we do',
    title: '',
    intro: '',
  },

  positioning: {
    eyebrow: "What this isn't",
    title: 'Not software you have to learn. Not a fixed package you have to fit into.',
  },

  services: {
    eyebrow: 'Services',
    title: 'Six ways we take work off your team.',
    intro: 'Most engagements start with one. They rarely stay there.',
  },

  process: {
    eyebrow: 'The engagement',
    title: "You'll know what you're committing to before you commit to it.",
  },

  oversight: {
    eyebrow: 'How we differ',
    title: 'Full automation is a promise nobody keeps. We don’t make it.',
    body: '',
    automatedLabel: 'Automated',
    humanLabel: 'Human review',
  },

  industries: {
    eyebrow: 'Who this is for',
    title: '',
    note: '',
    noteCta: 'Tell us what your week looks like',
  },

  calculator: {
    eyebrow: 'Cost calculator',
    title: '',
    footnote: 'Based on your numbers',
    /**
     * Slider labels. These were hardcoded in HoursCalculator, which put copy
     * inside a component against §11.3 rule 4 — they live here so relabelling an
     * input never means editing markup.
     *
     * `unit` is what the value reads as to a screen reader ("20 people"), so it
     * stays a plain noun and does not repeat the label.
     */
    fields: {
      people: { label: 'Team Size', unit: 'people' },
      hours: { label: 'Hours Spent on Admin / Week', unit: 'hours each per week' },
      cost: { label: 'Average Hourly Cost', unit: 'dollars per hour' },
    },
    /**
     * Mid-funnel exits for the visitor who has run the numbers but will not book
     * a call today. Both are deliberately quieter than the booking pill: this is
     * the second choice, not a competing one.
     *
     * The wording promises only what is actually delivered — the visitor's own
     * estimate. It is not a "strategy audit", because no such document exists;
     * naming one would be the invented-deliverable failure §10.2 bans.
     */
    capture: {
      prompt: '',
      emailLabel: 'Email me this estimate',
      pdfLabel: 'Save as PDF',
      emailSubject: 'My workflow cost estimate',
      emailIntro:
        "Here's the estimate I put together on your site. I'd like to know what you'd do with it.",
      sheetTitle: 'Your workflow cost estimate',
      sheetInputs: 'What you entered',
      sheetResult: 'What that adds up to',
    },
  },

  proof: {
    eyebrow: 'Why trust us',
    title: '',
  },

  fieldNotes: {
    eyebrow: 'Field notes',
    title: 'What we’re learning inside real operations.',
  },

  faq: {
    title: 'Frequently asked questions',
  },
} as const
