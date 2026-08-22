<script setup lang="ts">
/**
 * AboutFold — who we are, immediately before "what we do" (design spec §4).
 *
 * LAYOUT — one full-bleed band of three equal panels, butted edge to edge and
 * running to both viewport edges with no frame, no gutters, and no radius. It
 * meets the hero directly, so the page opens with two full-width bands rather
 * than a banner followed by a card grid.
 *
 * COLOUR — the panels step down a single ladder: full-strength seal, then two
 * warm greys mixed from ink into bond. This is a DELIBERATE exception to the
 * "one seal field per page" rule in tokens.css §Accents — the about band is now
 * that one field, and the calculator that previously held it is not rendered on
 * the home page. If the calculator comes back, this band and that panel have to
 * be reconciled rather than both being allowed to stand.
 *
 * The greys are `color-mix` of ink into bond, not new hexes: they stay on the
 * warm neutral the rest of the site uses, and a rebrand of either ground
 * carries them. Body copy darkens on the grey panels because `--graphite`
 * measures only 3.8:1 on the mid grey — under AA.
 *
 * Presentational; panels arrive via props (PRD §11.3 rule 3).
 */
import Section from '@/components/primitives/Section'
import type { AboutPanel } from '@/data/about'

defineProps<{
  eyebrow: string
  title?: string
  panels: readonly AboutPanel[]
}>()
</script>

<template>
  <Section v-if="panels.length" tone="bond" class="about" labelledby="about-title">
    <!--
      The band carries no visible heading — the three panel titles are its copy.
      This keeps the landmark named for assistive tech without printing a fourth
      heading that says what the panels already say.
    -->
    <h2 id="about-title" class="visually-hidden">{{ title || eyebrow }}</h2>

    <ul class="fold">
      <li v-for="panel in panels" :key="panel.id" class="leaf" data-reveal>
        <h3 class="leaf__title">{{ panel.title }}</h3>
        <p class="leaf__body">{{ panel.body }}</p>
      </li>
    </ul>
  </Section>
</template>

<style scoped>
/* `.section.about`, not `.about`: Section owns the rhythm everywhere else, and
   at equal specificity the winner would depend on stylesheet order. The band is
   the panels themselves, so the section contributes no padding of its own. */
.section.about {
  padding-block: 0;
}

.fold {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
  list-style: none;
  margin: 0;
  padding: 0;
}

.leaf {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-7) var(--space-6) var(--space-8);
  background-color: var(--leaf-surface);
  color: var(--leaf-body, var(--text-on-bond-muted));
}

/*
 * The tonal step: seal, then two rungs of warm grey. Custom properties rather
 * than three background rules so the copy colours below can key off the same
 * per-panel declaration.
 */
.leaf:nth-child(1) {
  --leaf-surface: var(--seal);
  /* Ink on seal is 6.05:1. `--graphite` on seal is 2.3:1, so the muted body
     colour used on the grey panels is not available here. */
  --leaf-body: var(--ink);
}

.leaf:nth-child(2) {
  --leaf-surface: color-mix(in srgb, var(--ink) 14%, var(--bond));
  --leaf-body: color-mix(in srgb, var(--graphite) 70%, var(--ink));
}

.leaf:nth-child(3) {
  --leaf-surface: color-mix(in srgb, var(--ink) 5%, var(--bond));
  --leaf-body: color-mix(in srgb, var(--graphite) 70%, var(--ink));
}

.leaf__title {
  font-family: var(--font-display);
  font-size: var(--text-h3);
  font-weight: 500;
  letter-spacing: var(--tracking-display);
  line-height: var(--leading-heading);
  color: var(--text-on-bond);
}

.leaf__body {
  color: inherit;
  font-size: var(--text-body);
  line-height: var(--leading-body);
  /* The column itself sets the measure — a third of the page is already close
     to a comfortable line. This is only the ceiling for very wide viewports. */
  max-width: 68ch;
}

@media (min-width: 900px) {
  .fold {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .leaf {
    padding: var(--space-7) var(--space-7) var(--space-8);
  }
}
</style>
