/**
 * Contact panel copy (design spec §4, PRD §11.3 rule 4).
 *
 * Every string the panel renders lives here — labels, validation messages, and
 * the wording of the email the form composes — so changing what the form SAYS
 * never means editing the component that draws it.
 *
 * THE PROMISE THE FORM MAKES. The site is a static build with no form handler
 * and the CSP allows `form-action 'self'` only, so a posting form would either
 * be blocked outright or, worse, appear to send and quietly drop the lead. The
 * panel therefore composes a message in the visitor's own mail client — the same
 * route the calculator's "email me this estimate" exit already takes — and says
 * so under the button. Nothing is collected or stored on our side.
 *
 * [DECISION NEEDED] If a real inbox endpoint is chosen later, it replaces the
 * `mailto:` build in ContactPanel.vue and `form-action` in vercel.json; nothing
 * in this file changes except `note`.
 */
export interface ContactCopy {
  /** Mono label above the rail heading. */
  eyebrow: string
  /** Rail heading — the section's h2. */
  title: string
  /** Rail paragraph under the heading. */
  body: string
  /** Heading over the form itself. */
  formTitle: string
  labels: {
    firstName: string
    lastName: string
    email: string
    phone: string
    message: string
  }
  /** Legend for the seal asterisk, so the mark is explained once in words. */
  requiredNote: string
  submit: string
  /** What pressing the button actually does. */
  note: string
  /** Announced after the draft is handed to the mail client. */
  sent: string
  errors: {
    required: string
    email: string
  }
  /** Rail footer — the two ways to reach us that are not this form. */
  directLabel: string
  altPrompt: string
  /** Subject line and opening line of the composed email. */
  mailSubject: string
  mailIntro: string
}

export const CONTACT_COPY: ContactCopy = {
  eyebrow: 'Contact',
  title: 'Contact Us',
  body: 'Tell us which process is costing you the most time and we will tell you whether it is worth automating. No obligation, and no pitch if the answer is no.',
  formTitle: 'Get in Touch with Us Today',
  labels: {
    firstName: 'First name',
    lastName: 'Last name',
    email: 'Email',
    phone: 'Phone',
    message: 'Write a message',
  },
  requiredNote: 'Required',
  submit: 'Send message',
  note: '',
  sent: 'Your email app should be opening with the message ready to send.',
  errors: {
    required: 'This one is needed to reply to you.',
    email: 'That address looks incomplete.',
  },
  directLabel: 'Or write to us directly',
  altPrompt: '',
  mailSubject: 'Enquiry from the TryEntitle site',
  mailIntro: 'Here is the process that is costing us the most time:',
}
