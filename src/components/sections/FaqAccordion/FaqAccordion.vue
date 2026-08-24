<script setup lang="ts">
/**
 * FaqAccordion — Bond band (design spec §4.13)
 *
 * Clears the last objections before the closing CTA. Single-open accordion with
 * a seal +/× marker. Home passes a short set plus `moreHref` to `/faq`; the FAQ
 * page passes the full list.
 *
 * Accessibility: each question is a real <button> inside an <h3> with
 * `aria-expanded` / `aria-controls`; the panel is `role="region"`.
 */
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import Section from '@/components/primitives/Section'
import Container from '@/components/primitives/Container'
import Icon from '@/components/primitives/Icon'
import SectionHeader from '@/components/sections/SectionHeader'
import type { FaqItem } from '@/data/faq'

defineProps<{
  eyebrow?: string
  title: string
  items: readonly FaqItem[]
  /**
   * Heading level for the section lead. Defaults to h2 for the home band; the
   * /faq page passes 1, where this accordion is the entire page and its lead is
   * therefore the page's h1.
   */
  level?: 1 | 2 | 3
  /** Optional link to the full FAQ page (home short set only). */
  moreHref?: string
  moreLabel?: string
}>()

const openIndex = ref<number | null>(0)

function toggle(index: number) {
  openIndex.value = openIndex.value === index ? null : index
}
</script>

<template>
  <Section tone="bond" labelledby="faq-title">
    <Container>
      <div class="faq-layout">
        <div class="faq-layout__head">
          <SectionHeader
            :eyebrow="eyebrow ?? ''"
            :title="title ?? ''"
            :level="level"
            title-id="faq-title"
            class="faq-layout__title"
          />
          <RouterLink v-if="moreHref" :to="moreHref" class="faq-more">
            {{ moreLabel ?? 'See all questions' }}
            <Icon name="arrow-right" :size="16" />
          </RouterLink>
        </div>

        <div class="faq">
          <div v-for="(item, i) in items" :key="item.question" class="faq__item" data-reveal>
            <h3 class="faq__heading">
              <button
                :id="`faq-q-${i}`"
                type="button"
                class="faq__question"
                :aria-expanded="openIndex === i"
                :aria-controls="`faq-a-${i}`"
                @click="toggle(i)"
              >
                <span>{{ item.question }}</span>
                <Icon
                  :name="openIndex === i ? 'minus' : 'plus'"
                  :size="18"
                  class="faq__marker"
                  aria-hidden="true"
                />
              </button>
            </h3>
            <div
              :id="`faq-a-${i}`"
              class="faq__answer"
              :class="{ 'is-open': openIndex === i }"
              role="region"
              :aria-labelledby="`faq-q-${i}`"
              :inert="openIndex !== i"
            >
              <div class="faq__answer-inner">
                <p>{{ item.answer }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  </Section>
</template>

<style scoped>
/* Stacked, the gap between the head and the questions is the same header → body
   relationship every other section has, so it uses the same token. Side by side
   it becomes a column gutter and the vertical value no longer applies. */
.faq-layout {
  display: grid;
  gap: var(--stack-lead);
}

@media (min-width: 960px) {
  .faq-layout {
    grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
    gap: var(--space-8);
    align-items: start;
  }
}

/*
 * Stacked: the heading first, the link to the full FAQ underneath it.
 *
 * Sharing a row cost the heading its width — held on one flex line it shrank to
 * its longest word and broke "Frequently asked questions" over three lines to
 * leave room for the link. Below the heading the link costs nothing, so the
 * heading keeps the whole column and wraps on its own terms.
 */
.faq-layout__head {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-5);
}

.faq-layout__title {
  max-width: 100%;
  text-wrap: balance;
}

.faq-more {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-mono);
  font-size: var(--text-utility);
  letter-spacing: var(--tracking-utility);
  text-transform: uppercase;
  font-weight: 500;
  color: var(--seal-ink);
}

.faq-more:hover {
  color: var(--text-on-bond);
}

.faq {
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--rule-on-bond);
}

.faq__item {
  border-bottom: 1px solid var(--rule-on-bond);
}

.faq__heading {
  margin: 0;
  font: inherit;
  letter-spacing: normal;
}

.faq__question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  width: 100%;
  padding-block: var(--space-4);
  text-align: start;
  font-family: var(--font-body);
  font-size: var(--text-body-lg);
  font-weight: 600;
  color: var(--text-on-bond);
  line-height: 1.35;
}

.faq__marker {
  flex: none;
  color: var(--seal-ink);
}

.faq__answer {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--duration-slow) var(--ease-standard);
}

.faq__answer.is-open {
  grid-template-rows: 1fr;
}

.faq__answer-inner {
  overflow: hidden;
  min-height: 0;
  color: var(--text-on-bond-muted);
  max-width: var(--measure);
  padding-bottom: 0;
  transition: padding-bottom var(--duration-slow) var(--ease-standard);
  padding-left: var(--space-2);
}

.faq__answer.is-open .faq__answer-inner {
  padding-bottom: var(--space-5);
}

@media (prefers-reduced-motion: reduce) {
  .faq__answer,
  .faq__answer-inner {
    transition: none;
  }
}
</style>
