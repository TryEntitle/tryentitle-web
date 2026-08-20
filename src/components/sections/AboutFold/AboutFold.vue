<script setup lang="ts">
/**
 * AboutFold — who we are, immediately before "what we do" (design spec §4).
 *
 * LAYOUT — one sheet, folded twice. The three panels butt edge to edge inside a
 * single ruled frame rather than sitting as three separate cards, so the row
 * reads as one document opened out, not as a card grid the page already uses
 * twice below (PainPoints, ProofCommitments). The creases are real: each fold
 * carries a hairline plus a narrow shadow gradient on its leading edge, which is
 * what stops three flat panels from reading as a table.
 *
 * COLOUR — the reference this replaces filled the first panel with full-strength
 * orange and stepped down through two greys. Spread across a third of the band
 * that is seal as a GROUND, which §"Accents" in tokens.css reserves for the one
 * payoff panel on the page. The step is kept and the intensity is not: the fold
 * climbs the surface ladder instead — `--seal-wash` → `--cream` → `--bond-raised`
 * — so the eye still moves left to right down a warm-to-white gradient at a
 * fraction of the volume, and the accent stays a mark (the filing tab above each
 * panel, the index rule) rather than a field.
 *
 * Presentational; panels arrive via props (PRD §11.3 rule 3).
 */
import Section from '@/components/primitives/Section'
import Container from '@/components/primitives/Container'
import SectionHeader from '@/components/sections/SectionHeader'
import type { AboutPanel } from '@/data/about'

defineProps<{
  eyebrow: string
  title?: string
  intro?: string
  panels: readonly AboutPanel[]
}>()

/** Record-entry index — "01", not "1" — matching the markers used site-wide. */
function marker(i: number): string {
  return String(i + 1).padStart(2, '0')
}
</script>

<template>
  <Section v-if="panels.length" tone="bond" labelledby="about-title">
    <Container>
      <SectionHeader
        :eyebrow="eyebrow"
        :title="title ?? ''"
        title-id="about-title"
        :intro="intro"
      />

      <ul class="fold">
        <li v-for="(panel, i) in panels" :key="panel.id" class="leaf" data-reveal>
          <span class="leaf__tab" aria-hidden="true"></span>
          <p class="leaf__index mono-label" aria-hidden="true">{{ marker(i) }}</p>
          <h3 class="leaf__title">{{ panel.title }}</h3>
          <p class="leaf__body">{{ panel.body }}</p>
        </li>
      </ul>
    </Container>
  </Section>
</template>

<style scoped>
/*
 * `gap: 0` and one shared frame — the panels are leaves of a single sheet, so
 * the separation between them is a fold line, not a gutter. `overflow: hidden`
 * lets each leaf's own surface run to the frame's rounded corners.
 */
.fold {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
  margin-top: var(--stack-lead);
  list-style: none;
  padding: 0;
  border: 1px solid var(--rule-on-bond);
  border-radius: var(--radius-card);
  overflow: hidden;
}

.leaf {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-6) var(--space-5);
  background-color: var(--leaf-surface, var(--cream));
}

/*
 * The tonal step, warm → white. Custom properties rather than three background
 * rules so the hover lift below can reference the same value.
 */
.leaf:nth-child(1) {
  --leaf-surface: var(--seal-wash);
}

.leaf:nth-child(2) {
  --leaf-surface: var(--cream);
}

.leaf:nth-child(3) {
  --leaf-surface: var(--bond-raised);
}

/* ─── The creases ────────────────────────────────────────────────────── */
/*
 * Horizontal folds while the leaves are stacked. The shadow sits INSIDE the
 * leading edge of each panel, which is how a folded sheet actually catches
 * light — a symmetric divider would read as a border again.
 */
.leaf + .leaf {
  border-top: 1px solid var(--rule-on-bond);
  background-image: linear-gradient(180deg, rgba(19, 26, 34, 0.045), transparent 14px);
}

@media (min-width: 900px) {
  .fold {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .leaf {
    padding: var(--space-7) var(--space-6);
  }

  .leaf + .leaf {
    border-top: 0;
    border-inline-start: 1px solid var(--rule-on-bond);
    background-image: linear-gradient(90deg, rgba(19, 26, 34, 0.045), transparent 14px);
  }
}

/* ─── Filing tab ─────────────────────────────────────────────────────── */
/*
 * A seal mark, pinned to the top edge of its leaf and flush with the copy
 * column below it. It widens on hover — the only motion in the section, and
 * decorative, so nothing is communicated by it that the panel does not already
 * say in words.
 */
.leaf__tab {
  position: absolute;
  inset-block-start: 0;
  inset-inline-start: var(--space-5);
  width: 32px;
  height: 3px;
  background-color: var(--seal);
}

@media (min-width: 900px) {
  .leaf__tab {
    inset-inline-start: var(--space-6);
  }
}

@media (prefers-reduced-motion: no-preference) {
  .leaf__tab {
    transition: width var(--duration-base) var(--ease-standard);
  }

  .leaf:hover .leaf__tab {
    width: 72px;
  }
}

/* ─── Copy ───────────────────────────────────────────────────────────── */
.leaf__index {
  color: var(--text-on-bond-muted);
}

.leaf__title {
  font-family: var(--font-display);
  font-size: var(--text-h3);
  font-weight: 600;
  letter-spacing: var(--tracking-display);
  line-height: var(--leading-heading);
}

.leaf__body {
  color: var(--text-on-bond-muted);
  font-size: var(--text-body-lg);
  line-height: var(--leading-body);
  max-width: 42ch;
}
</style>
