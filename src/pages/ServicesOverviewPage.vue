<script setup lang="ts">
/**
 * Services overview — the premium design's "Solutions" page: a numbered list of
 * the services, then one service in focus at a time.
 *
 * The focus panel is a carousel across all five services rather than a fixed
 * Operations Assessment block, so the page carries every service's symptoms and
 * deliverables without becoming five screens of stacked copy. Its content is
 * verbatim from the client's correction document (see data/service-focus.ts).
 *
 * It advances on its own so the services rotate without the visitor having to
 * drive them. WCAG 2.2.2 wants moving content to be stoppable, so there is a
 * real pause control, hover and keyboard focus hold the slide while someone is
 * reading it, and `prefers-reduced-motion` opts out of the motion entirely.
 */
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useHead } from '@unhead/vue'
import { RouterLink } from 'vue-router'
import BookingButton from '@/components/marketing/BookingButton'
import { SERVICES } from '@/data/services'
import { SERVICE_FOCUS } from '@/data/service-focus'
import { buildHead, jsonLd } from '@/lib/metadata'
import { breadcrumbSchema } from '@/lib/schema'

useHead({
  ...buildHead({
    title: 'Services',
    description:
      'Workflow redesign and automation across our core services: document, customer, and internal operations, with a human on the exceptions.',
    path: '/services',
    image: '/og/services.png',
  }),
  script: [
    jsonLd(
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Services', path: '/services' },
      ]),
    ),
  ],
})

/* ── Focus carousel ───────────────────────────────────────────────────── */

const active = ref(0)

/** Which way the last change travelled, so the slide animates with the move
 *  rather than always from the same side. */
const dir = ref(1)

/** Wraps, so the arrows never dead-end on the first or last service. */
function go(step: number): void {
  const n = SERVICE_FOCUS.length
  dir.value = step < 0 ? -1 : 1
  active.value = (active.value + step + n) % n
}

/** Long enough to read a slide's panels before it moves. */
const SLIDE_MS = 9000

/** The visitor's own pause, kept separate from the transient hover/focus hold
 *  so moving the pointer away does not undo an explicit pause. */
const paused = ref(false)
/** Pointer or keyboard focus is currently inside the carousel. */
const held = ref(false)
let timer: ReturnType<typeof setInterval> | undefined

function reducedMotion(): boolean {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/** (Re)starts the dwell, so a slide always gets its full SLIDE_MS on screen. */
function start(): void {
  clearInterval(timer)
  timer = setInterval(() => {
    if (!paused.value && !held.value && !document.hidden) go(1)
  }, SLIDE_MS)
}

onMounted(() => {
  if (reducedMotion()) {
    paused.value = true
    return
  }
  start()
})

/* ── Panel column height ──────────────────────────────────────────────
 * All five slides sit in one grid cell so they can cross-fade, which would
 * otherwise hold the column at the tallest service's height and leave the
 * shorter ones trailing dead space. Instead the column is given the active
 * slide's measured height and animates between them, so it settles into each
 * service rather than jumping — and the page below never leaps mid-fade.
 */
const copyEl = ref<HTMLElement | null>(null)
const panelsEl = ref<HTMLElement | null>(null)
const copyHeight = ref<number>()
const panelsHeight = ref<number>()

function activeHeight(wrap: HTMLElement | null): number | undefined {
  return wrap?.querySelector<HTMLElement>('.swap__item.is-active')?.offsetHeight
}

function measure(): void {
  copyHeight.value = activeHeight(copyEl.value) ?? copyHeight.value
  panelsHeight.value = activeHeight(panelsEl.value) ?? panelsHeight.value
}

watch(active, () => void nextTick(measure))

onMounted(() => {
  measure()
  // Re-measure on resize: the panels rewrap, so every slide's height changes.
  window.addEventListener('resize', measure, { passive: true })
  // Webfonts land after first paint and change the wrap; measure again once
  // they have, so the column does not open at a stale height.
  void document.fonts?.ready.then(measure)
})

onBeforeUnmount(() => {
  clearInterval(timer)
  window.removeEventListener('resize', measure)
})

/** A manual jump restarts the dwell on the slide just chosen, so a click never
 *  lands on a slide that is about to move on. */
function select(index: number): void {
  if (index === active.value) return
  dir.value = index > active.value ? 1 : -1
  active.value = index
  if (timer) start()
}
</script>

<template>
  <section class="intro">
    <h1 class="eyebrow">Solutions</h1>
  </section>

  <section class="rule-top">
    <div class="wrap list">
      <RouterLink
        v-for="(svc, i) in SERVICES"
        :key="svc.slug"
        :to="`/services/${svc.slug}`"
        class="row"
      >
        <span class="row__num">{{ String(i + 1).padStart(2, '0') }}</span>
        <h2 class="row__name">{{ svc.name }}</h2>
        <span class="row__view">View</span>
      </RouterLink>
    </div>
  </section>

  <section class="rule-bottom">
    <!-- The slides are a single live region swapped in place: an arrow or dot
         replaces the panel's content rather than moving focus, so the heading
         order on the page stays stable for assistive tech. -->
    <div
      class="wrap focus"
      :style="{ '--swap-x': dir > 0 ? '28px' : '-28px' }"
      @mouseenter="held = true"
      @mouseleave="held = false"
      @focusin="held = true"
      @focusout="held = false"
    >
      <div class="focus__lead">
        <p class="eyebrow">Service · in focus</p>

        <!-- Same stacked treatment as the panels (see below): the slides cross
             over each other in place, and the controls underneath hold still
             instead of being nudged by a longer service name. -->
        <div
          ref="copyEl"
          class="swap"
          :style="copyHeight ? { height: `${copyHeight}px` } : undefined"
        >
          <div
            v-for="(svc, i) in SERVICE_FOCUS"
            :key="svc.slug"
            class="swap__item"
            :class="{ 'is-active': i === active }"
            :aria-hidden="i === active ? undefined : 'true'"
          >
            <h2 class="focus__title">{{ svc.name }}</h2>
            <p class="focus__body focus__body--first">{{ svc.description }}</p>
            <BookingButton
              placement="services-focus"
              :label="svc.cta"
              :with-icon="false"
              pill
              class="focus__cta"
            />
          </div>
        </div>

        <div class="nav">
          <button
            type="button"
            class="nav__arrow"
            aria-label="Previous service"
            @click="select((active - 1 + SERVICE_FOCUS.length) % SERVICE_FOCUS.length)"
          >
            <span aria-hidden="true">←</span>
          </button>
          <button
            type="button"
            class="nav__arrow"
            aria-label="Next service"
            @click="select((active + 1) % SERVICE_FOCUS.length)"
          >
            <span aria-hidden="true">→</span>
          </button>
          <button
            type="button"
            class="nav__arrow"
            :aria-label="paused ? 'Play the service carousel' : 'Pause the service carousel'"
            :aria-pressed="paused"
            @click="paused = !paused"
          >
            <span aria-hidden="true">{{ paused ? '▶' : '❙❙' }}</span>
          </button>

          <div class="nav__dots">
            <button
              v-for="(svc, i) in SERVICE_FOCUS"
              :key="svc.slug"
              type="button"
              class="nav__dot"
              :class="{ 'is-active': i === active }"
              :aria-label="svc.name"
              :aria-current="i === active ? 'true' : undefined"
              @click="select(i)"
            />
          </div>

          <p class="nav__count" aria-hidden="true">
            {{ String(active + 1).padStart(2, '0') }} /
            {{ String(SERVICE_FOCUS.length).padStart(2, '0') }}
          </p>
        </div>
      </div>

      <!-- Every slide's panels stay in the grid cell, so the column is always as
           tall as the longest service and the page below it never jumps while
           the carousel advances on its own. Only the active one is visible, and
           `visibility: hidden` keeps the rest out of the accessibility tree. -->
      <div
        ref="panelsEl"
        class="swap swap--panels"
        :style="panelsHeight ? { height: `${panelsHeight}px` } : undefined"
        aria-live="polite"
      >
        <div
          v-for="(svc, i) in SERVICE_FOCUS"
          :key="svc.slug"
          class="swap__item panels"
          :class="{ 'is-active': i === active }"
          :aria-hidden="i === active ? undefined : 'true'"
        >
          <div class="panel">
            <h3 class="panel__title">The symptoms</h3>
            <ul class="panel__list">
              <li v-for="item in svc.symptoms" :key="item">{{ item }}</li>
            </ul>
          </div>
          <div class="panel">
            <h3 class="panel__title">What you receive</h3>
            <ul class="panel__list">
              <li v-for="item in svc.receive" :key="item">{{ item }}</li>
            </ul>
          </div>
          <div class="panel panel--ink">
            <h3 class="panel__title panel__title--ink">Your team stays in control</h3>
            <p class="panel__ink-body">{{ svc.control }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.wrap {
  max-width: 1240px;
  margin: 0 auto;
}

.rule-top {
  border-top: 1px solid var(--stone-200);
}

.rule-bottom {
  border-bottom: 1px solid var(--stone-200);
}

h1,
h2,
h3 {
  font-variation-settings: normal;
  line-height: normal;
  text-wrap: pretty;
}

.intro {
  max-width: 1240px;
  margin: 0 auto;
  padding: 96px 32px 64px;
}

.eyebrow {
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--stone-600);
}

.list {
  padding: 0 32px;
}

.row {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) auto;
  gap: 28px;
  align-items: center;
  padding: 34px 8px;
  border-bottom: 1px solid var(--stone-200);
  color: var(--charcoal);
  text-decoration: none;
}

.row:hover {
  background: var(--stone-50);
}

.row__num {
  font-size: 12px;
  /* --stone-600, not the design's #94918B: that measured 3.1:1 and fails AA. */
  color: var(--stone-600);
}

.row__name {
  font-family: var(--font-display);
  font-size: clamp(26px, 2.8vw, 38px);
  font-weight: 400;
  letter-spacing: -0.025em;
}

.row__view {
  font-size: 13px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--orange-text);
  text-align: right;
}

.focus {
  padding: 96px 32px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(340px, 100%), 1fr));
  gap: 72px;
}

.focus__title {
  font-weight: 300;
  font-size: clamp(32px, 3.6vw, 50px);
  line-height: 1.05;
  letter-spacing: -0.028em;
}

.focus__body {
  font-size: 16.5px;
  line-height: 1.62;
  color: var(--stone-800);
  margin-top: 16px;
}

.focus__body--first {
  margin-top: 26px;
}

.focus__cta {
  margin-top: 34px;
}

/* ── Carousel controls ───────────────────────────────────────────────── */
.nav {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 48px;
}

.nav__arrow {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border: 1px solid var(--stone-300, var(--stone-200));
  border-radius: 50%;
  background: none;
  color: var(--charcoal);
  font-size: 16px;
  cursor: pointer;
  transition:
    background-color 0.2s,
    border-color 0.2s;
}

.nav__arrow:hover {
  background: var(--charcoal);
  border-color: var(--charcoal);
  color: var(--paper);
}

.nav__dots {
  display: flex;
  align-items: center;
  /* No gap: each dot already carries its own 24px of target around the mark,
     so a gap here would only push them apart visually. */
  margin-left: 0;
}

/*
 * The button is a 24px square — WCAG 2.2 target size (2.5.8), which axe enforces
 * as a serious violation. Only the ::before mark is painted, so the dots still
 * read as 9px full stops while the thing you actually have to hit is finger
 * sized. Sizing the button itself to 9px failed the a11y gate on /services.
 */
.nav__dot {
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  background: none;
  display: grid;
  place-items: center;
  cursor: pointer;
}

.nav__dot::before {
  content: '';
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--stone-300, var(--stone-200));
  transition:
    background-color 0.2s,
    transform 0.2s;
}

.nav__dot.is-active::before {
  background: var(--orange);
  transform: scale(1.35);
}

.nav__count {
  margin-left: auto;
  font-size: 12px;
  letter-spacing: 0.1em;
  color: var(--stone-600);
}

/* ── Slide transition ────────────────────────────────────────────────── */
/* One cell, both slides: the leaver sits on top of the arriver for the length
   of the cross-fade, so neither the copy column nor the panel column jumps to
   an intermediate height mid-change. */
.swap {
  display: grid;
}

/* Keeps the gap the title used to carry itself. */
.focus__lead .swap {
  margin-top: 22px;
}

/* Both columns hold all five slides at once, so each change is a cross-fade in
   place rather than a swap that empties the column first. The height is set
   from script (see measure()) and animates with the fade; `clip` keeps a taller
   outgoing slide out of the section below while it leaves. */
.swap {
  position: relative;
  overflow: clip;
  transition: height 420ms var(--ease-standard, cubic-bezier(0.2, 0.7, 0.3, 1));
}

/* Only the active slide is in flow; the rest are lifted out of it. The column
   therefore stands at the active slide's own height before any script runs — no
   tall-then-collapse shift on the prerendered page — and the measured height
   only has to animate between those states. `visibility: hidden` keeps the
   waiting slides out of the accessibility tree and off the tab order, so their
   booking buttons cannot be reached. */
.swap__item {
  position: absolute;
  inset: 0 0 auto;
  opacity: 0;
  visibility: hidden;
  transform: translateX(var(--swap-x));
  transition:
    opacity 420ms var(--ease-standard, cubic-bezier(0.2, 0.7, 0.3, 1)),
    transform 420ms var(--ease-standard, cubic-bezier(0.2, 0.7, 0.3, 1)),
    visibility 420ms;
}

.swap__item.is-active {
  position: relative;
  opacity: 1;
  visibility: visible;
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  .swap,
  .swap__item {
    transition-duration: 1ms;
  }
  .swap__item {
    transform: none;
  }
}

.panels {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.panel {
  background: var(--stone-50);
  border: 1px solid var(--stone-200);
  padding: 30px 32px;
}

.panel--ink {
  background: var(--charcoal);
  border-color: var(--charcoal);
  color: var(--paper);
}

.panel__title {
  font-family: var(--font-body);
  font-size: 13px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--orange-text-strong);
  font-weight: 600;
}

.panel__title--ink {
  color: var(--peach);
}

.panel__list {
  margin: 18px 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.panel__list li {
  font-size: 16px;
  line-height: 1.55;
  color: var(--stone-800);
}

.panel__ink-body {
  font-size: 16px;
  line-height: 1.6;
  color: var(--stone-100);
  margin-top: 16px;
}

@media (max-width: 640px) {
  .intro {
    padding: 64px 20px 40px;
  }
  .list {
    padding: 0 20px;
  }
  .row {
    grid-template-columns: 28px minmax(0, 1fr) auto;
    gap: 14px;
    padding: 26px 0;
  }
  .focus {
    padding: 72px 20px;
    gap: 48px;
  }
  .panel {
    padding: 24px 22px;
  }
  .nav {
    margin-top: 36px;
    gap: 10px;
  }
  .nav__arrow {
    width: 40px;
    height: 40px;
  }
}
</style>
