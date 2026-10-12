<script setup lang="ts">
/**
 * ArticleLayout
 *
 * Shared reading layout for every long-form detail page — services, industries,
 * blog posts, and legal documents. Renders a breadcrumb, a page header, an
 * optional table of contents, and the rendered document in Prose.
 *
 * The header carries the title and nothing else. It used to repeat the
 * document's `description` as a standing line underneath — the same sentence
 * already serving as the page's meta description — which pushed the document's
 * own opening paragraph below the fold and said it twice.
 *
 * Presentational: all content arrives via props (PRD §11.3 rule 3). The `meta`
 * slot carries page-specific chrome (e.g. a blog date/reading-time line).
 *
 * A table of contents renders only when `toc` has more than two entries — short
 * documents do not need one (PRD §13 threshold).
 */
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import Section from '@/components/primitives/Section'
import Container from '@/components/primitives/Container'
import Eyebrow from '@/components/primitives/Eyebrow'
import Heading from '@/components/primitives/Heading'
import Prose from '@/components/primitives/Prose'
import type { TocEntry } from '@/types/content'

interface Crumb {
  label: string
  to?: string
}

const props = withDefaults(
  defineProps<{
    breadcrumbs: Crumb[]
    /** Omit to run the title straight under the breadcrumb (industry pages). */
    eyebrow?: string
    title: string
    /** Sets the title in caps — the industry pages' treatment. */
    uppercaseTitle?: boolean
    html: string
    toc?: TocEntry[]
  }>(),
  { toc: () => [], uppercaseTitle: false },
)

const showToc = computed(() => props.toc.length > 2)
</script>

<template>
  <Section labelledby="article-title">
    <Container>
      <div class="article-top">
        <nav class="crumbs" aria-label="Breadcrumb">
          <ol>
            <li v-for="(crumb, i) in breadcrumbs" :key="i">
              <RouterLink v-if="crumb.to" :to="crumb.to">{{ crumb.label }}</RouterLink>
              <span v-else aria-current="page">{{ crumb.label }}</span>
            </li>
          </ol>
        </nav>

        <header class="article-head">
          <Eyebrow v-if="eyebrow">{{ eyebrow }}</Eyebrow>
          <Heading
            id="article-title"
            :level="1"
            size="h2"
            :class="{ 'article-head__title--upper': uppercaseTitle }"
            >{{ title }}</Heading
          >
          <div class="article-head__meta">
            <slot name="meta" />
          </div>
        </header>
      </div>

      <div class="article-body" :class="{ 'article-body--toc': showToc }">
        <aside v-if="showToc" class="toc" aria-label="On this page">
          <p class="toc__label">On this page</p>
          <ul>
            <li v-for="entry in toc" :key="entry.id" :class="`toc__d${entry.depth}`">
              <a :href="`#${entry.id}`">{{ entry.text }}</a>
            </li>
          </ul>
        </aside>

        <Prose :html="html" />
      </div>
    </Container>
  </Section>
</template>

<style scoped>
.article-top {
  position: relative;
  isolation: isolate;
}

.article-top > .crumbs,
.article-top > .article-head {
  position: relative;
  z-index: 1;
}

.crumbs ol {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  font-family: var(--font-mono);
  font-size: var(--text-utility);
  letter-spacing: var(--tracking-utility);
  text-transform: uppercase;
  color: var(--text-on-bond-muted);
}

.crumbs li:not(:last-child)::after {
  content: '/';
  margin-inline-start: var(--space-2);
  /* The rule colour is a hairline tint — at this size the separator all but
     disappeared, so the trail read as two unrelated words. It takes the same
     muted text colour as the crumbs themselves. */
  color: var(--text-on-bond-muted);
}

.crumbs a {
  color: var(--text-on-bond-muted);
}

.crumbs a:hover {
  color: var(--text-on-bond);
}

.article-head {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  max-width: var(--measure);
  margin-top: var(--stack-block);
}

.article-head__title--upper {
  text-transform: uppercase;
}

.article-head__meta:empty {
  display: none;
}

.article-body {
  margin-top: var(--stack-lead);
}

/*
 * Below 960px there is no sidebar column — the contents list is just a block
 * above the article. It was sticky at every width, so on a phone it pinned
 * itself to the top of the viewport and the body text scrolled underneath it.
 * It only sticks where it has a column of its own to stick in, which is the
 * same rule the service pages already follow.
 */
.toc {
  position: static;
  margin-bottom: var(--stack-block);
}

@media (min-width: 960px) {
  .article-body--toc {
    display: grid;
    grid-template-columns: 200px minmax(0, 1fr);
    gap: var(--space-8);
    align-items: start;
  }

  .toc {
    position: sticky;
    top: calc(var(--header-height) + var(--space-4));
    margin-bottom: 0;
  }
}

.toc__label {
  font-family: var(--font-mono);
  font-size: var(--text-utility);
  letter-spacing: var(--tracking-utility);
  text-transform: uppercase;
  color: var(--text-on-bond-muted);
  margin-bottom: var(--space-3);
}

.toc ul {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  border-inline-start: 1px solid var(--rule-on-bond);
}

.toc li {
  padding-inline-start: var(--space-3);
}

.toc__d3 {
  padding-inline-start: var(--space-5);
}

/* Block + 24px line box keeps every entry at the WCAG 2.2 minimum target size. */
.toc a {
  display: inline-block;
  line-height: 24px;
  color: var(--text-on-bond-muted);
  font-size: var(--text-body-sm);
}

.toc a:hover {
  color: var(--text-on-bond);
}
</style>
