<script setup lang="ts">
/**
 * IndustriesGrid — Bond band (design spec §4.9, PRD FR10)
 *
 * Two presentations of the same industry list:
 * - `accordion` (home): compact preview — open a row for workflows, link out for more.
 * - `cards` (overview): dossier-style matter cards — featured lead + filed index grid.
 *
 * Both end with the required "not on the list?" invitation (FR10).
 */
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import Section from '@/components/primitives/Section'
import Container from '@/components/primitives/Container'
import Card from '@/components/primitives/Card'
import Icon from '@/components/primitives/Icon'
import Button from '@/components/primitives/Button'
import BookingButton from '@/components/marketing/BookingButton'
import SectionHeader from '@/components/sections/SectionHeader'
import { INDUSTRIES, type IndustrySummary } from '@/data/industries'

const props = withDefaults(
  defineProps<{
    eyebrow: string
    title: string
    intro?: string
    note: string
    noteCta?: string
    items: IndustrySummary[]
    level?: 1 | 2 | 3
    /** Accordion on home; cards on the industries overview. */
    variant?: 'accordion' | 'cards'
    /** Optional link under the list (e.g. home → /industries). */
    moreHref?: string
    moreLabel?: string
  }>(),
  { variant: 'accordion', level: 2 },
)

const openIndex = ref<number | null>(0)

const cardHeadingTag = computed(() => `h${props.level === 1 ? 2 : 3}`)

const defaultAside = computed(() =>
  props.variant === 'cards'
    ? 'Seven fields we know the paperwork of. Pick one for the workflows we redesign — and how a person stays on the exceptions.'
    : 'A sample of the fields we know the paperwork of. Open one for the workflows — or see the full list.',
)

/** Full catalog index so FIELD 01–07 stay stable even when home shows a subset. */
const fieldNumber = computed(() => {
  const map = new Map(INDUSTRIES.map((item, i) => [item.slug, i + 1]))
  return (slug: string) => map.get(slug) ?? 0
})

const featured = computed(() => (props.variant === 'cards' ? props.items[0] : undefined))
const rest = computed(() => (props.variant === 'cards' ? props.items.slice(1) : []))

function toggle(index: number) {
  openIndex.value = openIndex.value === index ? null : index
}

function marker(i: number): string {
  return String(i + 1).padStart(2, '0')
}

function fieldLabel(slug: string): string {
  return marker(fieldNumber.value(slug) - 1)
}
</script>

<template>
  <Section tone="bond" labelledby="industries-title">
    <Container>
      <SectionHeader
        :eyebrow="eyebrow"
        :title="title"
        title-id="industries-title"
        :aside="intro ?? defaultAside"
        :level="level"
      />

      <!-- Accordion (homepage preview) -->
      <ul v-if="variant === 'accordion'" class="industries">
        <li v-for="(industry, i) in items" :key="industry.slug" class="industry" data-reveal>
          <h3 class="industry__heading">
            <button
              :id="`industry-q-${industry.slug}`"
              type="button"
              class="industry__trigger"
              :aria-expanded="openIndex === i"
              :aria-controls="`industry-a-${industry.slug}`"
              @click="toggle(i)"
            >
              <span class="industry__icon" aria-hidden="true">
                <Icon :name="industry.icon" :size="18" />
              </span>
              <span class="industry__name">{{ industry.name }}</span>
              <Icon
                :name="openIndex === i ? 'minus' : 'plus'"
                :size="18"
                class="industry__marker"
                aria-hidden="true"
              />
            </button>
          </h3>

          <div
            :id="`industry-a-${industry.slug}`"
            class="industry__panel"
            :class="{ 'is-open': openIndex === i }"
            role="region"
            :aria-labelledby="`industry-q-${industry.slug}`"
            :inert="openIndex !== i"
          >
            <div class="industry__panel-inner">
              <ol class="workflows">
                <li v-for="(workflow, wi) in industry.workflows" :key="workflow" class="workflow">
                  <span class="workflow__index" aria-hidden="true">{{ marker(wi) }}</span>
                  <span class="workflow__label">{{ workflow }}</span>
                </li>
              </ol>

              <RouterLink :to="`/industries/${industry.slug}`" class="industry__more">
                More about {{ industry.name }}
                <Icon name="arrow-right" :size="16" />
              </RouterLink>
            </div>
          </div>
        </li>
      </ul>

      <!-- Dossier cards (industries overview) -->
      <div v-else class="dossiers">
        <!-- Featured lead matter -->
        <Card
          v-if="featured"
          :to="`/industries/${featured.slug}`"
          flush
          surface="seal"
          class="lead"
          data-reveal
        >
          <div class="lead__mast">
            <div class="lead__head">
              <span class="lead__glyph" aria-hidden="true">
                <Icon :name="featured.icon" :size="36" />
              </span>
              <component :is="cardHeadingTag" class="lead__title">
                {{ featured.name }}
              </component>
            </div>

            <div class="lead__say">
              <p class="lead__deck">
                The document paths this field runs on redesigned end to end, with a person on the
                exceptions.
              </p>
              <span class="lead__cta">
                Learn more
                <Icon name="arrow-right" :size="16" class="lead__arrow" />
              </span>
            </div>
          </div>
        </Card>

        <!-- Remaining filed matters -->
        <ul class="matters">
          <li v-for="industry in rest" :key="industry.slug" data-reveal>
            <Card :to="`/industries/${industry.slug}`" flush class="matter">
              <div class="matter__top">
                <span class="matter__tile" aria-hidden="true">
                  <Icon :name="industry.icon" :size="18" />
                </span>
              </div>

              <component :is="cardHeadingTag" class="matter__title">
                {{ industry.name }}
              </component>

              <p class="matter__outcome">{{ industry.outcome }}</p>

              <span class="matter__cta">
                Learn more
                <Icon name="arrow-right" :size="16" class="matter__arrow" />
              </span>
            </Card>
          </li>
        </ul>
      </div>

      <div v-if="moreHref" class="more">
        <Button :to="moreHref" variant="secondary">
          {{ moreLabel ?? 'View all industries' }}
          <Icon name="arrow-right" :size="16" />
        </Button>
      </div>

      <div class="invite">
        <p class="invite__label">{{ noteCta ?? 'Not on the list?' }}</p>
        <p class="invite__text">{{ note }}</p>
      </div>
    </Container>
  </Section>
</template>

<style scoped>
/* ─── Accordion (home) ───────────────────────────────────────────────── */
.industries {
  display: flex;
  flex-direction: column;
  margin-top: var(--stack-lead);
  border-top: 1px solid var(--rule-on-bond);
}

.industry {
  border-bottom: 1px solid var(--rule-on-bond);
  min-width: 0;
}

.industry__heading {
  margin: 0;
  font: inherit;
  letter-spacing: normal;
}

.industry__trigger {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--space-4);
  width: 100%;
  padding-block: var(--space-4);
  text-align: start;
  color: var(--text-on-bond);
}

.industry__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  flex: none;
  border-radius: var(--radius-chip);
  background-color: var(--ink);
  color: var(--seal);
}

.industry__name {
  font-family: var(--font-body);
  font-size: var(--text-body-lg);
  font-weight: 600;
  line-height: 1.3;
}

.industry__marker {
  flex: none;
  color: var(--seal-ink);
}

.industry__panel {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--duration-slow) var(--ease-standard);
}

.industry__panel.is-open {
  grid-template-rows: 1fr;
}

.industry__panel-inner {
  overflow: hidden;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-5);
  padding-inline-start: calc(34px + var(--space-4));
  padding-bottom: 0;
  transition: padding-bottom var(--duration-slow) var(--ease-standard);
}

.industry__panel.is-open .industry__panel-inner {
  padding-bottom: var(--space-6);
}

@media (prefers-reduced-motion: reduce) {
  .industry__panel,
  .industry__panel-inner {
    transition: none;
  }
}

.workflows {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 36rem;
}

.workflow {
  display: grid;
  grid-template-columns: 2.5rem minmax(0, 1fr);
  gap: var(--space-4);
  align-items: baseline;
  padding-block: var(--space-3);
  border-bottom: 1px solid var(--rule-on-bond);
}

.workflow:last-child {
  border-bottom: none;
}

.workflow__index {
  position: relative;
  font-family: var(--font-mono);
  font-size: var(--text-utility);
  letter-spacing: var(--tracking-utility);
  color: var(--text-on-bond-muted);
}

.workflow__index::before {
  content: '';
  position: absolute;
  left: 0.7rem;
  top: 1.35rem;
  bottom: calc(-1 * var(--space-3) - 1px);
  width: 1px;
  background-color: var(--rule-on-bond);
}

.workflow:last-child .workflow__index::before {
  display: none;
}

.workflow__label {
  font-family: var(--font-body);
  font-size: var(--text-body);
  color: var(--text-on-bond);
  line-height: 1.45;
}

.industry__more {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-mono);
  font-size: var(--text-utility);
  letter-spacing: var(--tracking-utility);
  text-transform: uppercase;
  font-weight: 500;
  color: var(--seal-ink);
  text-decoration: none;
}

.industry__more:hover {
  color: var(--text-on-bond);
}

/* ─── Dossier system (overview) ──────────────────────────────────────── */
.dossiers {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  margin-top: var(--stack-lead);
}

/*
 * Featured lead — full orange seal fill, edge to edge.
 */
.lead {
  overflow: hidden;
}

.lead__mast {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-5);
  padding: var(--space-6);
}

@media (min-width: 900px) {
  .lead__mast {
    gap: var(--space-6);
    padding: var(--space-8) var(--space-7);
  }
}

.lead__head {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-4);
}

.lead__say {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-4);
}

.lead__glyph {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  border: 1px solid color-mix(in srgb, var(--ink) 22%, transparent);
  border-radius: var(--radius-card);
  color: var(--seal);
  background: var(--ink);
}

.lead__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(2rem, 1.4rem + 2.2vw, 3rem);
  font-weight: 400;
  letter-spacing: var(--tracking-display);
  line-height: 1.05;
  text-wrap: balance;
  color: var(--ink);
}

.lead__deck {
  margin: 0;
  /* The deck is ~93 characters, so a 28ch column set it as four short lines down
     the left of a very wide seal panel. Half the string plus a little slack puts
     it on two, and `balance` keeps those two lines even rather than leaving a
     three-word orphan on the second. */
  max-width: 50ch;
  text-wrap: balance;
  font-size: var(--text-body);
  line-height: 1.5;
  /*
   * 85% is the FLOOR on a seal fill, not a preference. Seal is a bright ground:
   * 75% ink blends to #4e2e1f and measures 4.22:1, which fails AA for body size
   * and fails the a11y gate. 85% measures 5.03:1 and is visually all but
   * identical. Do not mix this further toward transparent.
   */
  color: color-mix(in srgb, var(--ink) 85%, transparent);
}

.lead__cta {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-2);
  font-family: var(--font-mono);
  font-size: var(--text-utility);
  font-weight: 500;
  letter-spacing: var(--tracking-utility);
  text-transform: uppercase;
  color: var(--ink);
}

.lead__arrow,
.matter__arrow {
  transition: transform var(--duration-fast) var(--ease-standard);
}

@media (prefers-reduced-motion: no-preference) {
  .lead:hover .lead__arrow,
  .matter:hover .matter__arrow {
    transform: translateX(4px);
  }
}

/* Filed matters grid */
.matters {
  display: grid;
  gap: var(--space-4);
  margin: 0;
  padding: 0;
  list-style: none;
  grid-template-columns: 1fr;
}

@media (min-width: 720px) {
  .matters {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1100px) {
  .matters {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.matter {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  height: 100%;
  padding: var(--space-5);
  background-color: var(--cream);
  overflow: hidden;
}

/* Seal filing tab */
.matter::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background-color: var(--seal);
  transform: scaleY(0.22);
  transform-origin: top;
  transition: transform var(--duration-base) var(--ease-standard);
}

@media (prefers-reduced-motion: no-preference) {
  .matter:hover::before {
    transform: scaleY(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .matter::before {
    transform: none;
    height: 3px;
    width: 100%;
  }
}

.matter__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
}

.matter__tile {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  flex: none;
  border-radius: var(--radius-card);
  background-color: var(--seal);
  color: var(--ink);
}

.matter__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--text-h3);
  font-weight: 400;
  letter-spacing: var(--tracking-display);
  line-height: 1.15;
  color: var(--text-on-bond);
}

/* Takes the slack the numbered rail used to, so the CTA stays on the bottom
   edge across cards whose copy runs to different lengths. */
.matter__outcome {
  flex: 1;
  margin: 0;
  padding-top: var(--space-4);
  border-top: 1px solid var(--rule-on-bond);
  font-size: var(--text-body-sm);
  line-height: 1.45;
  color: var(--text-on-bond-muted);
  text-wrap: pretty;
}

.matter__cta {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: auto;
  padding-top: var(--space-3);
  border-top: 1px solid var(--rule-on-bond);
  font-family: var(--font-mono);
  font-size: var(--text-utility);
  font-weight: 500;
  letter-spacing: var(--tracking-utility);
  text-transform: uppercase;
  color: var(--seal-ink);
}

.more {
  margin-top: var(--stack-block);
}

.invite {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-3);
  margin-top: var(--stack-block);
  padding-top: var(--stack-block);
  border-top: 1px solid var(--rule-on-bond);
}

.invite__label {
  font-family: var(--font-mono);
  font-size: var(--text-utility);
  letter-spacing: var(--tracking-utility);
  text-transform: uppercase;
  font-weight: 500;
  color: var(--seal-ink);
}

.invite__text {
  color: var(--text-on-bond-muted);
  font-size: var(--text-body);
  max-width: 48ch;
}
</style>
