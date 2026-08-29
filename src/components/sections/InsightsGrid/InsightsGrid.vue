<script setup lang="ts">
/**
 * InsightsGrid — card grid + reading dialog for /blog.
 *
 * Cards open an in-page modal (not a route). TryEntitle insights show full body;
 * external insights show a short intro and a link out to the publisher.
 */
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import Icon from '@/components/primitives/Icon'
import Prose from '@/components/primitives/Prose'
import type { Insight } from '@/data/insights'
import { formatDate, isoDate, readingLabel } from '@/lib/format'

const props = defineProps<{
  insights: readonly Insight[]
}>()

const activeId = ref<string | null>(null)
const dialog = ref<HTMLElement | null>(null)
const lastTrigger = ref<HTMLElement | null>(null)

const active = computed(() => props.insights.find((i) => i.id === activeId.value) ?? null)

function sourceLabel(insight: Insight): string {
  return insight.source.kind === 'tryentitle' ? 'TryEntitle' : insight.source.name
}

function open(insight: Insight, event: Event) {
  lastTrigger.value = event.currentTarget as HTMLElement
  activeId.value = insight.id
}

function close() {
  activeId.value = null
}

function focusables(): HTMLElement[] {
  if (!dialog.value) return []
  return Array.from(
    dialog.value.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  )
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.preventDefault()
    close()
    return
  }
  if (e.key !== 'Tab' || !dialog.value) return
  const items = focusables()
  if (items.length === 0) return
  const first = items[0]!
  const last = items[items.length - 1]!
  const focused = document.activeElement as HTMLElement | null
  if (e.shiftKey && focused === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && focused === last) {
    e.preventDefault()
    first.focus()
  }
}

function setBackgroundInert(inert: boolean) {
  const app = document.getElementById('app')
  if (!app) return
  if (inert) app.setAttribute('inert', '')
  else app.removeAttribute('inert')
}

watch(activeId, async (id) => {
  if (typeof document === 'undefined') return
  if (id) {
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeydown)
    setBackgroundInert(true)
    await nextTick()
    focusables()[0]?.focus()
  } else {
    document.body.style.overflow = ''
    document.removeEventListener('keydown', onKeydown)
    setBackgroundInert(false)
    lastTrigger.value?.focus()
  }
})

onBeforeUnmount(() => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = ''
  document.removeEventListener('keydown', onKeydown)
  setBackgroundInert(false)
})

/*
 * Intrinsic size of every cover in /public/images — the set is authored at a
 * uniform 1600×900. Stated on the <img> because Lighthouse CI fails the build on
 * `unsized-images` (lighthouserc.json), and because a browser that knows the
 * ratio reserves the box before the file lands.
 *
 * It is one constant rather than a per-post field: the covers are a single art
 * set, and a cover that arrives at another size wants the whole set re-cut, not
 * a second number in the data.
 */
const COVER = { width: 1600, height: 900 } as const
</script>

<template>
  <div>
    <ul class="grid">
      <li
        v-for="(insight, index) in insights"
        :key="insight.id"
        :class="{ 'grid__item--feature': index === 0 }"
      >
        <button
          type="button"
          class="card"
          :class="{ 'card--feature': index === 0 }"
          @click="open(insight, $event)"
        >
          <!--
            Decorative HERE, described in the reader. The card's accessible name
            is already its title, so announcing a chart description before every
            headline in the grid would make the list slower to scan by ear for no
            added information. `insight.imageAlt` carries that description on the
            same image inside the reader, where it is the only illustration.

            The first card is the LCP element on /blog, so it loads eagerly at
            high priority while the rest stay lazy.
          -->
          <span class="card__media" aria-hidden="true">
            <img
              class="card__img"
              :src="insight.image"
              alt=""
              :width="COVER.width"
              :height="COVER.height"
              :loading="index === 0 ? 'eager' : 'lazy'"
              :fetchpriority="index === 0 ? 'high' : 'auto'"
              decoding="async"
            />
          </span>

          <span class="card__body">
            <p class="card__meta">
              <span class="card__source" :data-kind="insight.source.kind">
                {{ sourceLabel(insight) }}
              </span>
              <span aria-hidden="true">·</span>
              <time :datetime="isoDate(insight.publishedAt)">
                {{ formatDate(insight.publishedAt) }}
              </time>
              <span aria-hidden="true">·</span>
              <span>{{ readingLabel(insight.readingMinutes) }}</span>
            </p>
            <h2 class="card__title">{{ insight.title }}</h2>
            <p class="card__excerpt">{{ insight.description }}</p>
            <span class="card__cta">
              Read insight
              <Icon name="arrow-right" :size="16" />
            </span>
          </span>
        </button>
      </li>
    </ul>

    <Teleport to="body">
      <Transition name="reader">
        <div v-if="active" class="scrim" @click.self="close">
          <div
            ref="dialog"
            class="reader"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="`insight-title-${active.id}`"
          >
            <div class="reader__hero">
              <img
                class="reader__img"
                :src="active.image"
                :alt="active.imageAlt"
                :width="COVER.width"
                :height="COVER.height"
                decoding="async"
              />
              <div class="reader__bar">
                <p class="reader__meta">
                  <span class="card__source" :data-kind="active.source.kind">
                    {{ sourceLabel(active) }}
                  </span>
                  <span aria-hidden="true">·</span>
                  <time :datetime="isoDate(active.publishedAt)">
                    {{ formatDate(active.publishedAt) }}
                  </time>
                  <span aria-hidden="true">·</span>
                  <span>{{ readingLabel(active.readingMinutes) }}</span>
                </p>
                <button
                  type="button"
                  class="reader__close"
                  aria-label="Close article"
                  @click="close"
                >
                  <Icon name="close" :size="24" />
                </button>
              </div>
            </div>

            <div class="reader__scroll">
              <div class="reader__body">
                <h2 :id="`insight-title-${active.id}`" class="reader__title">
                  {{ active.title }}
                </h2>
                <p class="reader__lead">{{ active.description }}</p>
                <Prose :html="active.bodyHtml" />

                <p v-if="active.source.kind === 'external'" class="reader__external">
                  <a
                    class="reader__external-link"
                    :href="active.source.url"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Continue on {{ active.source.name }}
                    <Icon name="arrow-right" :size="16" />
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* One value for both places a cover appears — the grid tile and the reader
   banner — so the art never sits at two different strengths across the click. */
.grid,
.scrim {
  --cover-opacity: 0.85;
}

.grid {
  display: grid;
  gap: var(--space-5);
  grid-template-columns: 1fr;
  list-style: none;
  margin: 0;
  padding: 0;
}

@media (min-width: 720px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .grid__item--feature {
    grid-column: 1 / -1;
  }
}

@media (min-width: 1100px) {
  .grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.card {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  height: 100%;
  padding: 0;
  overflow: hidden;
  text-align: left;
  color: inherit;
  background-color: var(--cream);
  border: 1px solid var(--rule-on-bond);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  cursor: pointer;
  transition:
    border-color var(--duration-fast) var(--ease-standard),
    box-shadow var(--duration-fast) var(--ease-standard),
    transform var(--duration-fast) var(--ease-standard);
}

.card:hover,
.card:focus-visible {
  border-color: var(--rule-hover);
  box-shadow: var(--shadow-lift);
  outline: none;
}

@media (prefers-reduced-motion: no-preference) {
  .card:hover,
  .card:focus-visible {
    transform: translateY(-4px);
  }
}

/*
 * The ink ground under the cover. No overlay sits on top of the art any more —
 * this layer only shows THROUGH it, at the 15% the image's own opacity leaves
 * open (see `.card__img`), which is what keeps the tile in the page's palette
 * and the seal rule below it reading as a bright edge.
 *
 * It is also what the card shows while a lazy cover is still arriving, so the
 * tile never flashes as an empty white box.
 */
.card__media {
  position: relative;
  display: block;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background:
    radial-gradient(ellipse 70% 80% at 50% 45%, rgba(255, 106, 22, 0.14), transparent 62%),
    var(--ink);
}

.card--feature .card__media {
  aspect-ratio: 21 / 9;
}

@media (min-width: 720px) {
  .card--feature {
    display: grid;
    grid-template-columns: 1.15fr 1fr;
    min-height: 20rem;
  }

  .card--feature .card__media {
    aspect-ratio: auto;
    height: 100%;
    min-height: 20rem;
  }
}

/*
 * The cover fills its frame regardless of the crop the card asks for — the grid
 * uses three different aspect ratios (16:10, 21:9, and a full-height feature
 * column) against one 16:9 source, so `cover` is doing real work here rather
 * than guarding against a stray asset.
 *
 */
.card__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  /*
   * All of the darkening happens HERE, on the image itself — there is no scrim
   * over the art. These renders are near-white, and ink laid over white mixes
   * to grey, so a covering layer turned the tiles foggy rather than dark. The
   * brightness cut does the work instead, and the saturation lift keeps the
   * chart's colour (the only saturated thing in the frame) from going with it.
   */
  filter: brightness(0.72) contrast(1.12) saturate(1.22);
  /*
   * Held back off full strength so the ink ground behind it reads through the
   * render rather than being covered by it — the cover sits in the card's
   * palette instead of on top of it. Paired with the filter above: brightness
   * darkens the art, this settles it into the tile.
   */
  opacity: var(--cover-opacity);
  transition: transform var(--duration-slow) var(--ease-standard);
}

.card:hover .card__img,
.card:focus-visible .card__img {
  transform: scale(1.04);
}

.card__body {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-3);
  flex: 1;
  padding: var(--space-5) var(--space-5) var(--space-6);
  border-top: 3px solid var(--seal);
}

.card--feature .card__body {
  justify-content: center;
  padding: var(--space-7) var(--space-6);
}

.card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  font-family: var(--font-mono);
  font-size: var(--text-utility);
  letter-spacing: var(--tracking-utility);
  text-transform: uppercase;
  color: var(--text-on-bond-muted);
}

.card__source[data-kind='tryentitle'] {
  color: var(--seal-ink);
}

.card__source[data-kind='external'] {
  color: var(--text-on-bond);
}

.card__title {
  font-family: var(--font-display);
  font-size: var(--text-h3);
  font-weight: 400;
  letter-spacing: var(--tracking-display);
  color: var(--text-on-bond);
  text-wrap: balance;
}

.card--feature .card__title {
  font-size: var(--text-h2);
}

.card__excerpt {
  flex: 1;
  color: var(--text-on-bond-muted);
  max-width: 38rem;
}

.card__cta {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-2);
  padding: var(--space-2) 0;
  font-family: var(--font-mono);
  font-size: var(--text-utility);
  letter-spacing: var(--tracking-utility);
  text-transform: uppercase;
  color: var(--seal-ink);
}

.card:hover .card__cta,
.card:focus-visible .card__cta {
  color: var(--text-on-bond);
}

.scrim {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  background-color: var(--scrim);
}

.reader {
  display: flex;
  flex-direction: column;
  width: min(48rem, 100%);
  max-height: min(92vh, 56rem);
  background-color: var(--bond);
  border: 1px solid var(--rule-on-bond);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-overlay);
  overflow: hidden;
}

/*
 * Same ink ground as the grid tiles, and here it is doing a second job: the meta
 * chip and the close button sit ON this banner, and against a pale render their
 * own translucent backing was the only thing holding them up. Over an inked
 * cover they have a ground again.
 */
.reader__hero {
  position: relative;
  flex-shrink: 0;
  height: clamp(6.5rem, 14vh, 8.5rem);
  background:
    radial-gradient(ellipse 70% 90% at 50% 50%, rgba(255, 106, 22, 0.16), transparent 65%),
    var(--ink);
}

/* Anchored to the top of the frame: these covers carry their chart in the upper
   two thirds, and a centred crop cut the labels off at this height. Same
   darkening as the grid tiles — see `.card__img` for why it is a filter on the
   art rather than a layer over it. */
.reader__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 30%;
  filter: brightness(0.72) contrast(1.12) saturate(1.22);
  opacity: var(--cover-opacity);
  pointer-events: none;
}

/* Above the cover — it is chrome on the banner, not part of the picture. */
.reader__bar {
  position: absolute;
  z-index: 1;
  inset: 0 0 auto;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-5);
}

.reader__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  font-family: var(--font-mono);
  font-size: var(--text-utility);
  letter-spacing: var(--tracking-utility);
  text-transform: uppercase;
  color: var(--text-on-ink);
  background: rgba(15, 31, 26, 0.55);
  border: 1px solid rgba(242, 243, 240, 0.18);
  border-radius: var(--radius-chip);
}

.reader__meta .card__source[data-kind='tryentitle'],
.reader__meta .card__source[data-kind='external'] {
  color: var(--seal);
}

.reader__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  color: var(--text-on-ink);
  background: rgba(15, 31, 26, 0.55);
  border: 1px solid rgba(242, 243, 240, 0.18);
  border-radius: var(--radius-chip);
  cursor: pointer;
}

.reader__close:hover,
.reader__close:focus-visible {
  border-color: var(--seal);
  outline: none;
}

.reader__scroll {
  overflow: auto;
  flex: 1;
  min-height: 0;
}

.reader__body {
  padding: var(--space-6) var(--space-5) var(--space-8);
}

@media (min-width: 720px) {
  .reader__body {
    padding: var(--space-7) var(--space-7) var(--space-9);
  }
}

.reader__title {
  font-family: var(--font-display);
  font-size: var(--text-h2);
  font-weight: 400;
  letter-spacing: var(--tracking-display);
  color: var(--text-on-bond);
  text-wrap: balance;
}

.reader__lead {
  margin-top: var(--space-3);
  margin-bottom: var(--space-6);
  padding-bottom: var(--space-5);
  border-bottom: 1px solid var(--rule-on-bond);
  font-size: var(--text-body-lg);
  color: var(--text-on-bond-muted);
}

.reader__external {
  margin-top: var(--stack-block);
  padding-top: var(--space-5);
  border-top: 1px solid var(--rule-on-bond);
}

.reader__external-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-mono);
  font-size: var(--text-utility);
  letter-spacing: var(--tracking-utility);
  text-transform: uppercase;
  color: var(--seal-ink);
  text-decoration: none;
}

.reader__external-link:hover,
.reader__external-link:focus-visible {
  text-decoration: underline;
  outline: none;
}

.reader-enter-active,
.reader-leave-active {
  transition: opacity var(--duration-base) var(--ease-standard);
}

.reader-enter-active .reader,
.reader-leave-active .reader {
  transition: transform var(--duration-base) var(--ease-standard);
}

.reader-enter-from,
.reader-leave-to {
  opacity: 0;
}

.reader-enter-from .reader,
.reader-leave-to .reader {
  transform: translateY(0.75rem) scale(0.98);
}

@media (prefers-reduced-motion: reduce) {
  .reader-enter-active,
  .reader-leave-active,
  .reader-enter-active .reader,
  .reader-leave-active .reader,
  .card__img {
    transition: none;
  }
}
</style>
