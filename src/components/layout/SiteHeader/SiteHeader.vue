<script setup lang="ts">
/**
 * SiteHeader
 *
 * Sticky site header (PRD FR1): logo (links home), primary nav, and the booking
 * CTA. It collapses to a compact height after ~40px of scroll, and past
 * HIDE_AFTER it retracts while the visitor reads downward, returning on the
 * first upward frame — so the CTA is always one gesture away, never a scroll
 * back to the top. See the guards in `onScrollFrame` below.
 *
 * The CTA is rendered as a BookingButton, visually distinct from nav links at
 * every breakpoint (PRD §6.1). On mobile the nav collapses into MobileNav; this
 * component owns the open state and returns focus to the toggle on close.
 */
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import Container from '@/components/primitives/Container'
import Icon from '@/components/primitives/Icon'
import Logo from '@/components/layout/Logo'
import MobileNav from '@/components/layout/MobileNav'
import BookingButton from '@/components/marketing/BookingButton'
import { PRIMARY_NAV } from '@/data/navigation'
import { onScrollFrame } from '@/lib/motion'

const compact = ref(false)
const menuOpen = ref(false)
const toggleBtn = ref<HTMLButtonElement | null>(null)
const header = ref<HTMLElement | null>(null)
/** 0–1 scroll position, drives the seal progress line along the bottom edge. */
const progress = ref(0)
/** True while the bar is parked off the top edge. */
const hidden = ref(false)

/** Distance scrolled before the bar may retract, in px. */
const HIDE_AFTER = 320

let stopFrame: (() => void) | null = null

onMounted(() => {
  /*
   * Read from the shared scroll clock rather than a scroll listener of this
   * component's own. The clock already computes position, progress and
   * direction once per frame for the whole page, so the header line is
   * guaranteed to agree with the parallax and pinned panels about where the page
   * is — and there is one listener on the document instead of one per consumer.
   */
  stopFrame = onScrollFrame(({ y, progress: p, direction }) => {
    compact.value = y > 40
    progress.value = p

    /*
     * Retract on the way down, return on the way up — the standard reading
     * gesture: out of the way while reading, back the instant the visitor looks
     * for navigation.
     *
     * Three guards keep it from ever trapping anyone:
     *  - Never retracts within the first HIDE_AFTER px, so the bar is always
     *    there at the top of a page where visitors expect to find it.
     *  - Never retracts while the mobile panel is open — the panel's close
     *    button lives in this bar, and hiding it would strand the visitor.
     *  - Never retracts while focus is inside it, or a keyboard visitor could
     *    tab to a link that has just scrolled itself off screen.
     */
    if (menuOpen.value || y < HIDE_AFTER) {
      hidden.value = false
      return
    }
    if (header.value?.contains(document.activeElement)) {
      hidden.value = false
      return
    }
    hidden.value = direction === 1
  })
})

onBeforeUnmount(() => stopFrame?.())

// Return focus to the trigger when the mobile panel closes (PRD NFR5).
//
// Deferred to the next tick on purpose: MobileNav marks #app `inert` while the
// panel is open, and an inert subtree cannot take focus. Watcher order between
// these two components is not guaranteed, so focusing synchronously can land
// while the attribute is still set and silently do nothing.
watch(menuOpen, async (open, wasOpen) => {
  if (wasOpen && !open) {
    await nextTick()
    toggleBtn.value?.focus()
  }
})
</script>

<template>
  <header
    ref="header"
    class="header"
    :class="{ 'header--compact': compact, 'header--hidden': hidden }"
  >
    <Container>
      <div class="header__bar">
        <RouterLink to="/" class="header__logo" aria-label="TryEntitle — home">
          <Logo tone="light" />
        </RouterLink>

        <nav class="header__nav" aria-label="Primary">
          <RouterLink v-for="link in PRIMARY_NAV" :key="link.to" :to="link.to" class="header__link">
            {{ link.label }}
          </RouterLink>
        </nav>

        <div class="header__cta">
          <BookingButton placement="nav" variant="primary" :with-icon="false" />
        </div>

        <button
          ref="toggleBtn"
          type="button"
          class="header__toggle"
          aria-label="Open menu"
          aria-haspopup="dialog"
          :aria-expanded="menuOpen"
          @click="menuOpen = true"
        >
          <Icon name="menu" :size="24" />
        </button>
      </div>
    </Container>

    <!-- Seal scroll-progress line along the bottom edge (design spec §4.1).
         Decorative: it duplicates information the scrollbar already conveys, so
         it is hidden from assistive tech rather than announced as a progressbar. -->
    <div
      class="header__progress"
      aria-hidden="true"
      :style="{ transform: `scaleX(${progress})` }"
    />

    <MobileNav :open="menuOpen" @close="menuOpen = false" />
  </header>
</template>

<style scoped>
/*
 * The header is ALWAYS white paper — a bond band, so its children take the
 * `-on-bond` side of every token pair.
 *
 * The spec asks for "transparent over hero, solidifies on scroll" (§4.1). White
 * gets that for free on every route: the hero and the top of every inner page are
 * both light, so the bar merges into the page and only the rule appears on
 * scroll. Literal transparency is still wrong — the hero photograph runs under
 * the bar and dark nav text over it would be unreadable in the frames where the
 * image goes dark.
 */
.header {
  position: sticky;
  top: 0;
  z-index: 50;
  --nav-stock: var(--bond-raised);
  background-color: var(--nav-stock);
  color: var(--text-on-bond);
  border-bottom: 1px solid transparent;
  transition:
    border-color var(--duration-base) var(--ease-standard),
    transform var(--duration-base) var(--ease-standard);
}

/*
 * Retracted: parked just past its own top edge.
 *
 * `translateY(-100%)` rather than a height collapse or `display: none` — the bar
 * stays in the layout and stays focusable-adjacent, so returning it is a single
 * cheap compositor move with no reflow, and the scroll position underneath never
 * shifts. The component's guards (see the script) mean this class is never
 * applied while the mobile panel is open or while focus is inside the bar.
 */
.header--hidden {
  transform: translateY(-100%);
}

/* Retracting is a scroll flourish, not a layout requirement — under reduced
   motion the bar simply stays put, which is also the more predictable
   behaviour for anyone who finds movement disorienting. */
@media (prefers-reduced-motion: reduce) {
  .header--hidden {
    transform: none;
  }
}

.header--compact {
  /* 94%, not the lower value a glassy bar invites: the hero photograph runs
     under this and its dark frames were showing through enough to pull the
     graphite nav labels toward the AA floor. */
  background-color: color-mix(in srgb, var(--nav-stock) 94%, transparent);
  backdrop-filter: saturate(1.1) blur(10px);
  border-bottom-color: var(--rule-on-bond);
}

/* The tall bar is a desktop affordance only — on a 640px-high viewport those
   extra 24px come straight out of the hero's fold budget (FR7). */
.header__bar {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  height: var(--header-height);
  transition: height var(--duration-base) var(--ease-standard);
}

@media (min-width: 860px) {
  .header__bar {
    height: var(--header-height-tall);
  }
}

.header--compact .header__bar {
  height: var(--header-height);
}

.header__progress {
  position: absolute;
  inset-inline: 0;
  bottom: -1px;
  height: 2px;
  background-color: var(--seal);
  transform-origin: left center;
  /* No transition: this tracks scroll directly, and easing it would make the
     line lag the page. */
}

/* The wordmark is not running text — the global link underline does not
   belong on it. */
.header__logo {
  display: inline-flex;
  text-decoration: none;
  margin-inline-end: auto;
}

.header__nav {
  display: none;
  gap: var(--space-5);
}

.header__link {
  color: var(--text-on-bond-muted);
  font-weight: 500;
  font-size: var(--text-body-sm);
  text-decoration: none;
  padding-block: var(--space-1);
  border-bottom: 1px solid transparent;
  transition:
    color var(--duration-fast) var(--ease-standard),
    border-color var(--duration-fast) var(--ease-standard);
}

.header__link:hover {
  color: var(--text-on-bond);
}

/* Current page is marked with the seal rule. The rule is a fill, not text, so
   raw seal is correct here — the label itself goes to ink. */
.header__link.router-link-active {
  color: var(--text-on-bond);
  border-bottom-color: var(--seal);
}

.header__cta {
  display: none;
}

.header__toggle {
  display: inline-flex;
  padding: var(--space-2);
  color: var(--text-on-bond);
}

@media (min-width: 860px) {
  .header__nav,
  .header__cta {
    display: flex;
    align-items: center;
  }
  .header__toggle {
    display: none;
  }
}
</style>
