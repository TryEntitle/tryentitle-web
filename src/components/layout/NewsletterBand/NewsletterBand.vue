<script setup lang="ts">
/**
 * NewsletterBand — the signup as a band of its own, between the page and the
 * footer.
 *
 * It used to open the footer, above the nav columns. Once the footer went pure
 * black the two stopped reading as separate things — a form and a sitemap on one
 * unbroken dark field — so the ask now gets its own ground and its own rhythm.
 *
 * SEAL. The brand orange, full strength, which is the treatment NewsletterSignup
 * was originally drawn against — see its own header: "a full seal field with a
 * black pill in it". The pill is the primary Button with `--action` flipped to
 * ink inside `.on-seal`, so the component's one action colour still comes from a
 * token rather than a second button variant.
 *
 * `tone="bond"` gives the band ink text and the standard rhythm; the ground is
 * painted here because Section's tones are the four surfaces on the ladder and
 * seal is not one of them. `.section.newsletter`, not `.newsletter`: Section
 * declares `--bond` at equal specificity and the winner would otherwise depend
 * on which scoped stylesheet the bundler emitted last.
 *
 * A NOTE ON THE SEAL RULE. tokens.css §Accents allows one full-strength seal
 * field per page and this band is on every page, alongside the about fold's
 * first panel on the home page. That is two, deliberately — recorded here so the
 * next person reads it as a decision rather than as drift.
 *
 * Shell chrome, not a page section: it is composed by App.vue and appears on
 * every route, so it lives beside SiteHeader and SiteFooter rather than in
 * `components/sections/`, which is for bands a page composes.
 *
 * The section is NAMED through the signup's own heading. Outside `<main>` an
 * unlabelled `<section>` is not a landmark at all, and moving this out of the
 * footer would otherwise have left the form in no landmark whatsoever.
 */
import Section from '@/components/primitives/Section'
import Container from '@/components/primitives/Container'
import NewsletterSignup from '@/components/marketing/NewsletterSignup'
import { NEWSLETTER_COPY } from '@/data/newsletter'
</script>

<template>
  <Section tone="bond" density="compact" labelledby="newsletter-title" class="newsletter">
    <Container>
      <NewsletterSignup :copy="NEWSLETTER_COPY" title-id="newsletter-title" class="on-seal" />
    </Container>
  </Section>
</template>

<style scoped>
.section.newsletter {
  background-color: var(--seal);
}
</style>
