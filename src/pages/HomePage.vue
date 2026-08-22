<script setup lang="ts">
/**
 * Home — composes sections only; no markup logic (PRD §11.2).
 *
 * Section order and band alternation follow design spec §3. The bands are the
 * argument: the visitor scrolls from INK (the problem — manual chaos, hidden
 * cost) into BOND (the solution — clean process, clear deliverables), and back to
 * ink for the ask. Reordering these changes the argument, not just the layout.
 *
 *   1  Hero                         bond   comprehension in five seconds
 *   2  Systems marquee              ink    credibility + stack qualification
 *   3  About fold                   bond   who is asking, before what they do
 *   4  Services rail                bond   scope clarity — the first three only
 *   5  Cost of manual work          ink    agitate the pain, name the leaks
 *   6  Positioning contrast         bond   kill the "generic AI tool" objection
 *   7  How an engagement runs       bond   de-risk the commitment
 *   8  Human oversight layer        ink    the differentiator
 *   9  Industries marquee           bond   self-identification (all fields)
 *  10  Hours calculator             bond   convert intent into a number
 *  11  Proof commitments            bond   credibility substitute
 *  12  Contact panel                bond   the written route in, for non-bookers
 *  13  Testimonials                 bond   renders nothing until real (FR12)
 *  14  Field notes                  bond   renders nothing until posts exist
 *  15  FAQ                          bond   clear final objections
 *  16  Closing CTA                  ink    book the call
 *
 * Data is resolved here and passed down as props so every section stays
 * presentational and testable from a fixture (PRD §11.3 rule 3).
 */
import { useHead } from '@unhead/vue'

import Hero from '@/components/sections/Hero'
import AboutFold from '@/components/sections/AboutFold'
import ServicesGrid from '@/components/sections/ServicesGrid'
import PainPoints from '@/components/sections/PainPoints'
import OversightLayer from '@/components/sections/OversightLayer'
import IndustriesMarquee from '@/components/sections/IndustriesMarquee'
import HoursCalculator from '@/components/sections/HoursCalculator'
import ProofCommitments from '@/components/sections/ProofCommitments'
import ContactPanel from '@/components/sections/ContactPanel'
import ProofStrip from '@/components/sections/ProofStrip'
import FaqAccordion from '@/components/sections/FaqAccordion'
import ClosingCta from '@/components/sections/ClosingCta'

import { HOME_COPY } from '@/data/home'
import { ABOUT_PANELS } from '@/data/about'
import { SERVICES } from '@/data/services'
import { PAIN_POINTS } from '@/data/pain-points'
import { PROOF_COMMITMENTS } from '@/data/proof'
import { CONTACT_COPY } from '@/data/contact'
import { HOME_FAQ } from '@/data/faq'
import { TESTIMONIALS } from '@/lib/proof'

import { buildHead, jsonLd } from '@/lib/metadata'
import { faqSchema, organizationSchema } from '@/lib/schema'
import { SITE_TAGLINE } from '@/lib/constants'

/**
 * The home band teases the first three services; `/services` carries all six.
 * Sliced here rather than in the component so the section stays presentational
 * and the page keeps deciding what it shows (PRD §11.3 rule 3).
 */
const HOME_SERVICES = SERVICES.slice(0, 3)

/** Concrete exception examples revealed from the oversight bar's gold segment. */
const EXCEPTION_EXAMPLES = [
  'A claim with a diagnosis code the payer has never accepted before.',
  'A client who replies to an intake form with three questions and no answers.',
  'An invoice total that does not match the purchase order, by $40.',
]

useHead({
  ...buildHead({
    title: 'Workflow Automation for Document-Heavy Businesses',
    description: SITE_TAGLINE,
    path: '/',
    image: '/og/home.png',
  }),
  script: [jsonLd(organizationSchema()), jsonLd(faqSchema(HOME_FAQ))],
})
</script>

<template>
  <Hero
    :eyebrow="HOME_COPY.hero.eyebrow"
    :title="HOME_COPY.hero.title"
    :subhead="HOME_COPY.hero.subhead"
    :meta="HOME_COPY.hero.meta"
  />

  <!-- <SystemsMarquee :label="HOME_COPY.systems.label" /> -->

  <AboutFold
    :eyebrow="HOME_COPY.about.eyebrow"
    :title="HOME_COPY.about.title"
    :panels="ABOUT_PANELS"
  />

  <ServicesGrid :eyebrow="HOME_COPY.services.eyebrow" :items="HOME_SERVICES" />

  <!-- <PainPoints
    :eyebrow="HOME_COPY.painPoints.eyebrow"
    :title="HOME_COPY.painPoints.title"
    :intro="HOME_COPY.painPoints.intro"
    :items="PAIN_POINTS"
  /> -->

  <!-- <ProcessRail
    :eyebrow="HOME_COPY.process.eyebrow"
    :title="HOME_COPY.process.title"
    :steps="PROCESS_STEPS"
  /> -->

  <OversightLayer
    :eyebrow="HOME_COPY.oversight.eyebrow"
    :title="HOME_COPY.oversight.title"
    :body="HOME_COPY.oversight.body"
    :automated-label="HOME_COPY.oversight.automatedLabel"
    :human-label="HOME_COPY.oversight.humanLabel"
    :examples="EXCEPTION_EXAMPLES"
  />

  <IndustriesMarquee :eyebrow="HOME_COPY.industries.eyebrow" :title="HOME_COPY.industries.title" />

  <HoursCalculator
    :eyebrow="HOME_COPY.calculator.eyebrow"
    :title="HOME_COPY.calculator.title"
    :footnote="HOME_COPY.calculator.footnote"
    :fields="HOME_COPY.calculator.fields"
    :capture="HOME_COPY.calculator.capture"
  />

  <!-- <ProofCommitments
    :eyebrow="HOME_COPY.proof.eyebrow"
    :title="HOME_COPY.proof.title"
    :items="PROOF_COMMITMENTS"
  /> -->

  <ContactPanel :copy="CONTACT_COPY" />

  <ProofStrip :items="TESTIMONIALS" />

  <FaqAccordion
    :title="HOME_COPY.faq.title"
    :items="HOME_FAQ"
    more-href="/faq"
    more-label="See all questions"
  />
</template>
