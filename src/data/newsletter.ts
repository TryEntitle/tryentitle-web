/**
 * Newsletter signup copy (PRD §11.3 rule 4).
 *
 * WHAT HAPPENS TO THE ADDRESS. There is no list provider wired up and no form
 * handler — the site is a static build and the CSP allows `form-action 'self'`
 * only. So, exactly as the contact panel does, submitting composes a one-line
 * subscribe request in the visitor's own mail client. Nothing is collected here,
 * which is also why the consent line is a real, required checkbox rather than
 * implied by the act of typing: the address is being handed over deliberately.
 *
 * [DECISION NEEDED] When a list provider is chosen, `NewsletterSignup.vue`
 * swaps the `mailto:` build for its endpoint and `vercel.json` gains that origin
 * in `form-action`. Only `note` in this file changes.
 */
export interface NewsletterCopy {
  title: string
  /** One line under the title saying what actually arrives. */
  body: string
  emailLabel: string
  emailPlaceholder: string
  consentLabel: string
  submit: string
  /** What pressing the button does, given there is no list provider yet. */
  note: string
  /** Announced once the draft has been handed to the mail client. */
  sent: string
  errors: {
    email: string
    consent: string
  }
  mailSubject: string
  mailBody: string
}

export const NEWSLETTER_COPY: NewsletterCopy = {
  title: 'Connect with Us',
  body: '',
  emailLabel: 'Email',
  emailPlaceholder: 'you@company.com',
  consentLabel: 'Yes, subscribe me to your newsletter.',
  submit: 'Submit',
  note: '',
  sent: 'Your email app should be opening with the request ready to send.',
  errors: {
    email: 'Enter an email address like example@mysite.com.',
    consent: 'Tick this and the address is yours to send.',
  },
  mailSubject: 'Subscribe me to the TryEntitle newsletter',
  mailBody: 'Please add this address to the newsletter list.',
}
