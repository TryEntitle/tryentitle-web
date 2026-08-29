<script setup lang="ts">
/**
 * ServicesGrid — Bond band (design spec §4.6, PRD FR9)
 *
 * On desktop this is a PINNED, SCROLL-DRIVEN band: the stage sticks to the
 * viewport while continued scrolling advances the active service 0 → 5, and only
 * after the last one does the page release and carry on to the next section. A
 * Three.js formation behind the panel re-forms for each service.
 *
 * The mechanism is `position: sticky` inside a tall wrapper, with the active index
 * derived from the wrapper's own rect. That means the browser still owns scrolling
 * — no transform hijack, no lost scrollbar, and `Ctrl+F`, keyboard paging, and
 * screen-reader navigation all behave normally.
 *
 * WHERE IT DOES NOT PIN:
 * - Below 960px. A pinned section on a phone hides the fact the page is scrolling
 *   at all, and the rail plus panel cannot both be legible at that width.
 * - Under `prefers-reduced-motion`. The rail stays, click-driven and unpinned.
 * In both cases the content is identical; only the mechanism differs.
 *
 * Accessibility contract:
 * - Real ARIA tabs (`tablist`/`tab`/`tabpanel`) with `aria-selected` and roving
 *   `tabindex`, so the rail is one tab stop.
 * - Arrow keys and Home/End move between tabs. When pinned, selecting a tab also
 *   scrolls the page to that tab's position, so pointer, keyboard, and scroll can
 *   never disagree about which service is showing.
 * - The 3D canvas is decorative and `aria-hidden`; the panel text carries all
 *   meaning, and the small-screen card grid is a complete alternative.
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import Section from '@/components/primitives/Section'
import Container from '@/components/primitives/Container'
import Icon from '@/components/primitives/Icon'
import Button from '@/components/primitives/Button'
import FeatureCard from '@/components/sections/FeatureCard'
import SectionHeader from '@/components/sections/SectionHeader'
import ServiceScene from '@/components/three/ServiceScene.vue'
import type { ServiceSummary } from '@/data/services'

const props = defineProps<{
  eyebrow?: string
  title?: string
  items: ServiceSummary[]
  /**
   * Heading level for the section lead. `/services` passes 1, where this grid is
   * the page and its lead is the page's h1; the home band keeps the default h2.
   *
   * This was previously undeclared, so the page's `:level="1"` fell through to
   * the root element as a stray `level` attribute and never reached
   * SectionHeader — leaving `/services` with no h1 at all.
   */
  level?: 1 | 2 | 3
  intro?: string
}>()

const active = ref(0)
const tabs = ref<HTMLButtonElement[]>([])
const scrolly = ref<HTMLElement | null>(null)
const stage = ref<HTMLElement | null>(null)
/** Whether the pinned mechanism is in play; false → plain sticky rail. */
const pinned = ref(false)
/** 0–1 through the pinned band, for the rail's progress bar. */
const progress = ref(0)

const current = computed(() => props.items[active.value] ?? props.items[0])

function marker(i: number): string {
  return String(i + 1).padStart(2, '0')
}

/* ─── Pinned scroll mapping ─────────────────────────────────────────────── */

let frame = 0

/**
 * Map scroll position to an active index.
 *
 * progress 0 = the wrapper's top has reached the sticky offset;
 * progress 1 = the wrapper's bottom has reached the stage's bottom.
 * Reading the wrapper rect (rather than tracking scrollY) keeps this correct
 * regardless of what sits above the section or how tall it is.
 */
function measure() {
  const wrap = scrolly.value
  const stageEl = stage.value
  if (!wrap || !stageEl || !pinned.value) return

  const rect = wrap.getBoundingClientRect()
  const stickyTop = stageEl.getBoundingClientRect().top
  const range = rect.height - stageEl.offsetHeight
  if (range <= 0) return

  const raw = (stickyTop - rect.top) / range
  const p = Math.min(1, Math.max(0, raw))
  progress.value = p

  // Bias by half a step so an index is active while it is CENTRED in its slice,
  // not from the instant its slice begins — otherwise the first and last
  // services each get only half the dwell time of the ones between them.
  const step = 1 / props.items.length
  const index = Math.min(props.items.length - 1, Math.floor(p / step + 0.0001))
  if (index !== active.value) active.value = index
}

function onScroll() {
  // One measurement per frame at most; scroll fires far more often than that.
  if (frame) return
  frame = requestAnimationFrame(() => {
    frame = 0
    measure()
  })
}

let mql: MediaQueryList | null = null
let motionMql: MediaQueryList | null = null

function syncMode() {
  pinned.value = Boolean(mql?.matches) && !motionMql?.matches
  if (!pinned.value) progress.value = 0
  measure()
}

onMounted(() => {
  mql = window.matchMedia('(min-width: 960px)')
  motionMql = window.matchMedia('(prefers-reduced-motion: reduce)')
  mql.addEventListener('change', syncMode)
  motionMql.addEventListener('change', syncMode)
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
  syncMode()
})

onBeforeUnmount(() => {
  if (frame) cancelAnimationFrame(frame)
  mql?.removeEventListener('change', syncMode)
  motionMql?.removeEventListener('change', syncMode)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
})

/* ─── Selection ─────────────────────────────────────────────────────────── */

/**
 * Select a service. When pinned, scroll to the position that index occupies so
 * the scroll state and the visible panel stay in agreement — setting `active`
 * alone would be immediately overwritten by the next scroll event.
 */
function select(index: number, viaKeyboard = false) {
  if (viaKeyboard) tabs.value[index]?.focus()

  if (!pinned.value) {
    active.value = index
    return
  }

  const wrap = scrolly.value
  const stageEl = stage.value
  if (!wrap || !stageEl) {
    active.value = index
    return
  }

  const rect = wrap.getBoundingClientRect()
  const range = rect.height - stageEl.offsetHeight
  const step = 1 / props.items.length
  // Aim at the middle of the slice so the index is unambiguous on arrival.
  const targetProgress = index * step + step / 2
  /*
   * Document-space top of the wrapper. NOT `offsetTop`: that is measured from the
   * nearest positioned ancestor, and `Section` is `position: relative`, so
   * `offsetTop` here is an offset within the section — using it sent the scroll
   * thousands of pixels short of the band.
   */
  const wrapTop = rect.top + window.scrollY
  window.scrollTo({ top: wrapTop + range * targetProgress, behavior: 'smooth' })
}

function onKeydown(event: KeyboardEvent, index: number) {
  const last = props.items.length - 1
  const moves: Record<string, number> = {
    ArrowDown: index === last ? 0 : index + 1,
    ArrowRight: index === last ? 0 : index + 1,
    ArrowUp: index === 0 ? last : index - 1,
    ArrowLeft: index === 0 ? last : index - 1,
    Home: 0,
    End: last,
  }
  const next = moves[event.key]
  if (next === undefined) return
  event.preventDefault()
  select(next, true)
}
</script>

<template>
  <Section tone="bond" labelledby="services-title" class="services">
    <Container>
      <SectionHeader
        :eyebrow="eyebrow ?? ''"
        :title="title ?? ''"
        :intro="intro"
        :level="level"
        title-id="services-title"
      />
    </Container>

    <!-- ─── Desktop: pinned, scroll-driven rail ─────────────────────── -->
    <div
      ref="scrolly"
      class="scrolly"
      :class="{ 'is-pinned': pinned }"
      :style="{ '--steps': items.length }"
    >
      <div ref="stage" class="scrolly__stage">
        <Container class="stage__inner">
          <!-- Decorative 3D formation, behind the content. -->
          <div class="stage__scene" aria-hidden="true">
            <ServiceScene :active-index="active" :count="items.length" />
          </div>

          <div class="rail">
            <div
              class="rail__tabs"
              role="tablist"
              aria-label="Services"
              aria-orientation="vertical"
            >
              <div v-if="pinned" class="rail__progress" aria-hidden="true">
                <span :style="{ transform: `scaleY(${progress})` }" />
              </div>

              <button
                v-for="(service, i) in items"
                :key="service.slug"
                :ref="
                  (el) => {
                    if (el) tabs[i] = el as HTMLButtonElement
                  }
                "
                type="button"
                role="tab"
                class="tab"
                :class="{ 'is-active': active === i }"
                :aria-selected="active === i"
                :aria-controls="`service-panel-${i}`"
                :id="`service-tab-${i}`"
                :tabindex="active === i ? 0 : -1"
                @click="select(i)"
                @keydown="onKeydown($event, i)"
              >
                <span class="tab__index mono-label">{{ marker(i) }}</span>
                <span class="tab__name">{{ service.name }}</span>
              </button>
            </div>

            <div
              v-if="current"
              :id="`service-panel-${active}`"
              class="panel"
              role="tabpanel"
              :aria-labelledby="`service-tab-${active}`"
              tabindex="0"
            >
              <!-- Keyed so each service's panel animates in as its own element. -->
              <div :key="current.slug" class="panel__inner">
                <span class="panel__tile" aria-hidden="true">
                  <Icon :name="current.icon" :size="22" />
                </span>

                <p class="panel__eyebrow mono-label">{{ current.name }}</p>
                <h3 class="panel__headline">{{ current.headline }}</h3>
                <p class="panel__body">{{ current.summary }}</p>

                <div class="panel__action">
                  <Button :to="`/services/${current.slug}`" variant="secondary">
                    See how it works
                    <Icon name="arrow-right" :size="16" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </div>

    <!-- ─── Mobile/tablet: plain card grid ──────────────────────────── -->
    <Container>
      <ul class="cards">
        <li v-for="service in items" :key="service.slug" data-reveal>
          <FeatureCard
            :eyebrow="service.name"
            :title="service.headline"
            :body="service.summary"
            :icon="service.icon"
            cta="See how it works"
            :to="`/services/${service.slug}`"
          />
        </li>
      </ul>
    </Container>
  </Section>
</template>

<style scoped>
/* ─── Header ───────────────────────────────────────────────────────────────
   /services passes a full paragraph of lead copy, and the shared header sets its
   lead column to 34ch — a measure meant for a one-line supporting note, which
   set this as a narrow ribbon down the left of the band. Let it run a real
   measure instead. `:deep` because SectionHeader owns these elements; the home
   band passes no `intro`, so only the eyebrow sits in this column there and the
   wider ceiling changes nothing. */
.services :deep(.section-header__lead) {
  max-width: none;
}

.services :deep(.section-header__intro) {
  max-width: 72ch;
}

/* ─── Scroll wrapper ─────────────────────────────────────────────────────
   The wrapper is only tall when pinning is active. Unpinned it collapses to its
   content height and the stage stops sticking, which is exactly the reduced-motion
   and small-screen behaviour we want — one mechanism, switched off, rather than a
   second layout to maintain. */
.scrolly {
  display: none;
}

.cards {
  display: grid;
  gap: var(--space-4);
  margin-top: var(--stack-lead);
  grid-template-columns: 1fr;
}

@media (min-width: 640px) {
  .cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 960px) {
  .cards {
    display: none;
  }

  .scrolly {
    display: block;
    margin-top: var(--stack-lead);
  }

  /* `--steps` comes from the template so the travel always matches the number of
     services — adding a seventh service lengthens the pin automatically. */
  .scrolly.is-pinned {
    height: calc(100vh + var(--steps, 6) * 55vh);
  }

  .scrolly__stage {
    position: sticky;
    top: calc(var(--header-height) + var(--space-5));
    /* Given real height on purpose: the stage is the frame the 3D formation lives
       in, and at its natural content height (~460px) the formation had nowhere to
       be. Bounded so it always fits between the sticky header and the fold. */
    min-height: min(44vh, 680px);
    max-height: calc(100vh - var(--header-height) - var(--space-8));
    display: flex;
    align-items: center;
  }

  .scrolly__stage > * {
    width: 100%;
  }
}

.stage__inner {
  position: relative;
  /* Clips the 3D layer's vertical bleed. Safe on `position: sticky`: overflow on
     the sticky element's own DESCENDANT does not disable stickiness — only
     overflow on an ANCESTOR of the sticky element would. */
  overflow: hidden;
}

/* ─── 3D layer ───────────────────────────────────────────────────────────
   Sits behind the rail, inset from the tabs so the formation reads in the panel
   half of the stage where there is room for it.

   The inline insets are 0, not negative: a negative `right` pushed the layer past
   the container and put the whole page into horizontal scroll at 1024px and
   1280px (NFR1). Vertical bleed is kept and clipped by `.stage__inner`. */
.stage__scene {
  position: absolute;
  /* Full stage width, behind everything. Boxing it into the strip between the
     tabs and the panel left it with almost nowhere to render — and what little
     showed sat behind an opaque panel. Vertical bleed is clipped by
     `.stage__inner`; horizontal insets stay at 0 so the page never gains a
     sideways scrollbar (NFR1). */
  inset: -12% 0;
  z-index: 0;
  pointer-events: none;
  /* Weighted right and fading out, so the formation dissolves into the band
     rather than ending on a hard rectangle, and stays clear of the tab labels. */
  mask-image: radial-gradient(85% 105% at 72% 50%, black 30%, transparent 76%);
}

.rail {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
  gap: var(--space-8);
  align-items: start;
}

/* ─── Tabs ───────────────────────────────────────────────────────────── */
.rail__tabs {
  position: relative;
  display: flex;
  flex-direction: column;
  border-inline-start: 1px solid var(--rule-on-bond);
}

/* Scroll-progress bar down the rail's own edge: the section pins, so the page
   scrollbar no longer tells the visitor how far through the band they are. */
.rail__progress {
  position: absolute;
  inset-block: 0;
  inset-inline-start: -1px;
  width: 2px;
  overflow: hidden;
}

.rail__progress span {
  display: block;
  height: 100%;
  background-color: var(--seal);
  transform-origin: top center;
}

.tab {
  display: flex;
  align-items: baseline;
  gap: var(--space-3);
  padding: var(--space-4);
  text-align: start;
  font-family: var(--font-body);
  font-size: var(--text-body-lg);
  font-weight: 500;
  color: var(--text-on-bond-muted);
  transition:
    color var(--duration-fast) var(--ease-standard),
    background-color var(--duration-fast) var(--ease-standard),
    opacity var(--duration-fast) var(--ease-standard);
}

.tab:hover {
  color: var(--text-on-bond);
}

.tab.is-active {
  color: var(--text-on-bond);
  font-weight: 600;
  background-color: var(--cream);
}

/* Inactive tabs recede while pinned so the current one is unmistakable. */
.is-pinned .tab:not(.is-active) {
  opacity: 0.55;
}

.tab__index {
  color: var(--seal-ink);
  flex: none;
}

/* ─── Panel ──────────────────────────────────────────────────────────── */
.panel {
  background-color: color-mix(in srgb, var(--bond-raised) 82%, transparent);
  backdrop-filter: blur(7px);
  border: 1px solid var(--rule-on-bond);
  border-radius: var(--radius-card);
  padding: var(--space-7);
}

.panel__inner {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

/* Crossfade + 8px slide on every service change. The `:key` on `.panel__inner`
   makes Vue replace the element, which restarts the animation. */
@media (prefers-reduced-motion: no-preference) {
  .panel__inner {
    animation: panel-in var(--duration-base) var(--ease-standard);
  }
}

@keyframes panel-in {
  from {
    opacity: 0;
    transform: translateX(8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.panel__tile {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-card);
  background-color: var(--seal);
  color: var(--ink);
  margin-bottom: var(--space-2);
}

.panel__eyebrow {
  color: var(--seal-ink);
}

.panel__headline {
  font-size: var(--text-h3);
  font-weight: 600;
}

.panel__body {
  color: var(--text-on-bond-muted);
  font-size: var(--text-body-lg);
  max-width: 52ch;
}

.panel__action {
  margin-top: var(--space-4);
  padding-top: var(--space-5);
  border-top: 1px solid var(--rule-on-bond);
}
</style>
