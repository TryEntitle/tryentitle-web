<script setup lang="ts">
/**
 * ClosingCta — Cream band (design spec §4.14, PRD FR13)
 *
 * Cream stock. This used to match the footer directly beneath it so the two read
 * as one continuous sheet; the footer is ink again, so the band now ends the
 * PAPER part of the page and hands off to dark chrome at a stated edge (the
 * footer draws the site's seal hairline across that join).
 *
 * Keep the two apart: a seam is two surfaces that almost match. Repainting this
 * band toward the footer's ink — or the footer back toward cream — is what would
 * make the boundary read as a mistake.
 *
 * The final ask. Oversized centred display headline, one sub-paragraph, the seal
 * pill, and an email alternative for the visitor who will not book a slot but
 * will send a message.
 *
 * Distinct copy from the hero, same single booking destination (FR2).
 *
 * The spec calls for an inline Calendly widget here, lazy-loaded on scroll-in.
 * That is deliberately NOT built: PRD NFR8 requires third-party scripts to load
 * on interaction rather than on view, and D1 (the real Calendly URL) is still
 * open. The plain link is the crawlable, no-JS-safe default the PRD specifies as
 * the baseline; swapping in an on-click embed later touches only this component.
 */
import Section from '@/components/primitives/Section'
import Container from '@/components/primitives/Container'
import Heading from '@/components/primitives/Heading'
import BookingButton from '@/components/marketing/BookingButton'
import { CONTACT } from '@/lib/constants'

withDefaults(
  defineProps<{
    title: string
    body: string
    placement?: string
  }>(),
  { placement: 'closing' },
)
</script>

<template>
  <Section tone="bond" class="closing-band" labelledby="closing-title">
    <!--
      The parallax backdrop is gone with the ink ground.

      It was a dark circuit photograph under an 88% ink scrim. On cream every
      pixel of it subtracts contrast instead of adding depth, and the scrim had to
      go so near-opaque to keep the band flush with the footer that the only thing
      left of the image was a faint mottling — which is exactly what broke the
      blend. An image nobody can see is a lazy-loaded download and a parallax
      subscription for nothing, so it is removed rather than hidden. Restoring a
      backdrop here means choosing a light-ground photograph, not re-tuning this
      one's scrim.
    -->
    <Container>
      <div class="closing" data-reveal>
        <Heading id="closing-title" :level="2" size="h1" class="closing__title" data-split-lines>
          {{ title }}
        </Heading>
        <p class="closing__body">{{ body }}</p>

        <div class="closing__action">
          <BookingButton :placement="placement" size="lg" data-magnetic />
        </div>

        <p class="closing__alt">
          Or email us:
          <a :href="`mailto:${CONTACT.general}`">{{ CONTACT.general }}</a>
        </p>
      </div>
    </Container>
  </Section>
</template>

<style scoped>
.closing-band {
  /* Not the `bond` tone's own ground: one rung up the ladder, so the final ask
     sits on a raised sheet rather than on the page itself. */
  background-color: var(--cream);
}

.closing {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-4);
}

.closing__title {
  max-width: 22ch;
}

.closing__body {
  color: var(--text-on-bond-muted);
  font-size: var(--text-body-lg);
  max-width: 58ch;
}

.closing__action {
  margin-top: var(--space-3);
}

.closing__alt {
  color: var(--text-on-bond-muted);
  font-size: var(--text-body);
}

/* The address is body-size text, so it takes the darkened accent rather than raw
   seal (2.6:1 on paper) — same rule as the footer links. */
.closing__alt a {
  color: var(--seal-ink);
}
</style>
