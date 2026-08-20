/**
 * The three-leaf about fold — who TryEntitle is, before the page says what it
 * does (design spec §4, PRD §11.3 rule 4).
 *
 * ORDER IS THE ARGUMENT. Identity → method → intent: what we are, how we work,
 * and what we are trying to leave behind. The panels are rendered in array
 * order and the fold's tonal step (blush → cream → white) follows that order,
 * so reordering these changes the section's emphasis, not just its sequence.
 *
 * Voice per §10.2: plain and operational, and every line is a description of
 * what happens to the WORK. Nothing here is a claim about results we cannot
 * point at yet.
 */
export interface AboutPanel {
  id: string
  title: string
  body: string
}

export const ABOUT_PANELS: readonly AboutPanel[] = [
  {
    id: 'about-us',
    title: 'About Us',
    body: 'TryEntitle helps businesses run better. We improve day-to-day operations, reduce unnecessary costs, and help companies build a stronger foundation for growth.',
  },
  {
    id: 'who-we-are',
    title: 'Who We Are',
    body: 'We work with businesses to find where time, money, and resources are being wasted. We look at how work gets done, identify what is slowing the business down, and help put better processes and systems in place.',
  },
  {
    id: 'our-mission',
    title: 'Our Mission',
    body: 'Our mission is simple: help businesses operate better and grow without unnecessary complexity. We believe a growing business should become more efficient, not simply become more expensive to run.',
  },
] as const
