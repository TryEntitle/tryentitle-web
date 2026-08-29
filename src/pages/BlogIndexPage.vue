<script setup lang="ts">
/**
 * Insights index (/blog).
 *
 * Card grid of TryEntitle notes and curated external reading. Click opens an
 * in-page reader — no fake posts, no empty-state stall while content exists.
 */
import { useHead } from '@unhead/vue'
import Section from '@/components/primitives/Section'
import Container from '@/components/primitives/Container'
import Eyebrow from '@/components/primitives/Eyebrow'
import Heading from '@/components/primitives/Heading'
import InsightsGrid from '@/components/sections/InsightsGrid'
import { insightsNewestFirst } from '@/data/insights'
import { buildHead } from '@/lib/metadata'

useHead(
  buildHead({
    title: 'Insights',
    description:
      'Notes on operations, document workflows, and where automation helps — plus curated external reading.',
    path: '/blog',
    image: '/og/blog.png',
  }),
)

/*
 * The lead card's cover is the LCP element here, and the grid marks it
 * `fetchpriority="high"` — but the browser only learns that once the page's JS
 * has mounted the grid. Preloading it from the prerendered <head> starts the
 * request in the first round trip instead. Not a meta tag, so it sits outside
 * `buildHead()` (see lib/metadata.ts) rather than growing PageMeta.
 */
const leadCover = insightsNewestFirst[0]?.image
useHead({
  link: leadCover ? [{ rel: 'preload', as: 'image', href: leadCover, fetchpriority: 'high' }] : [],
})
</script>

<template>
  <Section labelledby="insights-title" class="insights">
    <Container>
      <!-- The eyebrow IS the page title here — there is no display heading in
           this layout — so it carries the h1 and the id the Section labels
           itself with. `.mono-label` outranks the bare `h1` rule in globals.css,
           so it still renders as an eyebrow. -->
      <div class="insights__intro">
        <Eyebrow as="h1" id="insights-title">Insights</Eyebrow>
      </div>

      <div class="insights__list">
        <InsightsGrid :insights="insightsNewestFirst" />
      </div>
    </Container>
  </Section>
</template>

<style scoped>
.insights {
  position: relative;
  overflow: clip;
}

.insights::before {
  content: '';
  position: absolute;
  inset: 0 0 auto;
  height: min(28rem, 55vh);
  pointer-events: none;
  background:
    radial-gradient(ellipse 70% 80% at 12% 0%, var(--seal-wash), transparent 60%),
    radial-gradient(ellipse 55% 70% at 88% 10%, var(--verify-wash), transparent 55%);
}

.insights__intro {
  position: relative;
  max-width: 40rem;
}

.insights__list {
  position: relative;
  margin-top: var(--stack-lead);
}
</style>
