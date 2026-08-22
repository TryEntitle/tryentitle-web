<script setup lang="ts">
/**
 * Hero — Bond band (PRD FR7)
 *
 * Two-up split: a paper panel on the left carrying the headline, the supporting
 * line, and the orange booking pill, with a full-bleed workspace photograph
 * holding the right half. The copy aligns to the page container's left edge, so
 * the headline starts on the same vertical as every section below it while the
 * photo runs out to the viewport edge.
 *
 * Presentational — all copy arrives via props (PRD §11.3 rule 4). CTA stays
 * above the fold at 360×640 (FR7).
 */
import { onMounted, ref } from 'vue'
import Section from '@/components/primitives/Section'
import Heading from '@/components/primitives/Heading'
import BookingButton from '@/components/marketing/BookingButton'
import { HERO_CTA_LABEL } from '@/lib/constants'
import { splitLines } from '@/lib/motion/split'

defineProps<{
  eyebrow: string
  title: string
  subhead: string
  /** Micro-trust row — short mono claims under the CTAs. */
  meta?: readonly string[]
  secondaryLabel?: string
}>()

const revealed = ref(false)
const copy = ref<HTMLElement | null>(null)

onMounted(() => {
  requestAnimationFrame(() => (revealed.value = true))

  void (document.fonts?.ready ?? Promise.resolve()).then(() => {
    const heading = copy.value?.querySelector('h1')
    if (heading && splitLines(heading)) {
      requestAnimationFrame(() => heading.classList.add('is-split-in'))
    }
  })
})
</script>

<template>
  <Section as="section" tone="bond" class="hero" labelledby="hero-title">
    <div ref="copy" class="hero__panel" :class="{ 'is-revealed': revealed }">
      <div class="hero__copy">
        <div class="hero__head hero__step" style="--i: 1">
          <Heading id="hero-title" :level="1" size="h1" class="hero__title">
            {{ title }}
          </Heading>
          <p class="hero__subhead">{{ subhead }}</p>
        </div>

        <div class="hero__actions hero__step" style="--i: 2">
          <BookingButton placement="hero" size="lg" :label="HERO_CTA_LABEL" data-magnetic />
        </div>
      </div>
    </div>

    <div class="hero__media" aria-hidden="true">
      <img
        class="hero__photo"
        src="/images/hero-tech.jpg"
        alt=""
        width="2400"
        height="1598"
        decoding="async"
        fetchpriority="high"
      />
    </div>
  </Section>
</template>

<style scoped>
/* `.section.hero`, not `.hero`: this is the one place a component overrides the
   rhythm Section owns, and at equal specificity the winner would depend on which
   scoped stylesheet the bundler emitted last. */
.section.hero {
  position: relative;
  isolation: isolate;
  overflow: clip;
  /* The band is a split, not a stack: the panel and the photo are the two grid
     cells and each owns its own padding, so the section contributes none. */
  padding-block: 0;
  background-color: var(--bond);
  display: grid;
  grid-template-columns: 1fr;
}

.hero__panel {
  display: flex;
  align-items: center;
  /* Left edge of the copy lines up with the page container, so the headline
     starts on the same vertical as every section below the fold. `max()` hands
     the gutter back once the viewport is narrower than the content measure. */
  padding-inline-start: max(var(--gutter), calc((100vw - var(--content-max)) / 2 + var(--gutter)));
  padding-inline-end: var(--gutter);
  padding-block: var(--section-rhythm-compact);
}

.hero__copy {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  width: 100%;
  max-width: 34rem;
}

.hero__head {
  display: grid;
  gap: var(--space-5);
}

.hero__title {
  max-width: 12ch;
  color: var(--text-on-bond);
}

.hero__subhead {
  color: var(--text-on-bond-muted);
  font-size: var(--text-body);
  max-width: 36ch;
  line-height: var(--leading-body);
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.hero__media {
  position: relative;
  overflow: clip;
}

.hero__photo {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

@media (min-width: 900px) {
  .section.hero {
    grid-template-columns: 51fr 49fr;
    align-items: stretch;
    min-height: min(88vh, 46rem);
  }

  .hero__panel {
    /* Same container alignment, with a floor: once the viewport is only a little
       wider than the content measure, the container gutter alone leaves the
       headline hugging the band edge. */
    padding-inline-start: max(
      var(--space-8),
      calc((100vw - var(--content-max)) / 2 + var(--gutter))
    );
    padding-inline-end: var(--space-8);
  }
}

@media (prefers-reduced-motion: no-preference) {
  /* TRANSFORM ONLY — no opacity. See the note in ServiceHero and the reveal
     block in globals.css: a fade makes every contrast check inside the
     transition window measure a blended colour and fail intermittently. */
  .hero__step {
    transform: translateY(12px);
    transition: transform var(--duration-slow) var(--ease-standard);
    transition-delay: calc(var(--i, 0) * 70ms);
  }

  .hero__panel.is-revealed .hero__step {
    transform: translateY(0);
  }

  .hero__photo {
    transform: scale(1.04);
    transition: transform 1.2s var(--ease-standard);
  }

  .hero:has(.hero__panel.is-revealed) .hero__photo {
    transform: scale(1);
  }
}

@media (max-width: 899px) {
  /* Stacked: copy first, then the photo as a band beneath it. */
  .hero__media {
    aspect-ratio: 3 / 2;
  }
}
</style>
