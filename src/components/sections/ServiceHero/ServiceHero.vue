<script setup lang="ts">
/**
 * ServiceHero — Bond band opening a service detail page.
 *
 * Type on the page's own paper: breadcrumb, the service name at display size,
 * its outcome line, and the booking pill anchored bottom-right of the band.
 *
 * The band carries the home hero's device — the sheet scene — on its right at
 * desktop widths, and holds the SERVICE's own formation rather than cycling.
 * That is what the scene was built for: it takes an index and gives each
 * service its own arrangement of sheets, so a visitor landing here from search
 * meets the same object as one who came through the front door, stopped on the
 * formation that belongs to this page. Below 960px the scene is dropped rather
 * than stacked — exactly as the home hero does — so the pill stays above the
 * fold on a phone.
 *
 * It previously ran a full-bleed workspace photograph with an inset paper panel
 * floating on it. That borrowed a device from the home hero, but on this page it
 * read as a card pasted onto stock photography — a texture that appears nowhere
 * else on the site — and boxed the service name into a 40rem column while the
 * rest of the width went to the picture. The name now has the whole band.
 *
 * Presentational — all copy arrives via props (PRD §11.3 rule 4).
 */
import { nextTick, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import Section from '@/components/primitives/Section'
import Container from '@/components/primitives/Container'
import Heading from '@/components/primitives/Heading'
import Chip from '@/components/primitives/Chip'
import ServiceScene from '@/components/three/ServiceScene.vue'
import BookingButton from '@/components/marketing/BookingButton'
import { splitLines } from '@/lib/motion/split'

interface Crumb {
  label: string
  to?: string
}

const props = defineProps<{
  breadcrumbs: Crumb[]
  title: string
  /** The outcome, in the customer's terms — the band's supporting line. */
  headline: string
  chips: readonly string[]
  /** This service's position in SERVICES — picks its sheet formation. */
  sceneIndex: number
  /** How many services there are, so the scene can scale to the set. */
  sceneCount: number
}>()

const revealed = ref(false)
const panel = ref<HTMLElement | null>(null)

/**
 * Split the service name into masked lines for the entrance.
 *
 * Deferred until the webfont lands, or the measured line breaks belong to the
 * fallback face.
 */
function splitHeading(): void {
  void (document.fonts?.ready ?? Promise.resolve()).then(() => {
    const heading = panel.value?.querySelector('h1')
    if (heading && splitLines(heading)) {
      requestAnimationFrame(() => heading.classList.add('is-split-in'))
    }
  })
}

onMounted(() => {
  requestAnimationFrame(() => (revealed.value = true))
  splitHeading()
})

/*
 * Re-split when the service changes.
 *
 * `splitLines` replaces the <h1>'s children with its own line spans, so the
 * element Vue thinks holds `{{ title }}` is no longer the element on screen.
 * Moving between two service pages reuses this component (same route record),
 * and the patch for the new title had nothing it recognised to update: the
 * heading kept the PREVIOUS service's name until a reload, while the breadcrumb
 * and the outcome line beside it updated correctly.
 *
 * The `:key` on the Heading is the other half — it hands back a fresh, unsplit
 * element for the new title, which this then splits again.
 */
watch(
  () => props.title,
  () => {
    void nextTick(splitHeading)
  },
)
</script>

<template>
  <Section as="section" tone="bond" class="service-hero" labelledby="service-title">
    <Container class="service-hero__frame">
      <div ref="panel" class="panel" :class="{ 'is-revealed': revealed }">
        <nav class="crumbs panel__step" style="--i: 0" aria-label="Breadcrumb">
          <ol>
            <li v-for="(crumb, i) in breadcrumbs" :key="i">
              <RouterLink v-if="crumb.to" :to="crumb.to">{{ crumb.label }}</RouterLink>
              <span v-else aria-current="page">{{ crumb.label }}</span>
            </li>
          </ol>
        </nav>

        <Heading
          :key="title"
          id="service-title"
          :level="1"
          size="h1"
          class="panel__title panel__step"
          style="--i: 1"
        >
          {{ title }}
        </Heading>

        <div class="panel__visual" aria-hidden="true">
          <ServiceScene :active-index="sceneIndex" :count="sceneCount" />
        </div>

        <div class="panel__foot panel__step" style="--i: 2">
          <p class="panel__headline">{{ headline }}</p>
          <div class="panel__actions">
            <BookingButton placement="service-hero" size="lg" data-magnetic />
          </div>
        </div>

        <ul v-if="chips.length" class="panel__chips panel__step" style="--i: 3">
          <li v-for="chip in chips" :key="chip">
            <Chip tone="seal" marker>{{ chip }}</Chip>
          </li>
        </ul>
      </div>
    </Container>
  </Section>
</template>

<style scoped>
/* `.section.service-hero` — see Hero: outranks Section's own rhythm rule instead
   of tying with it. */
.section.service-hero {
  position: relative;
  isolation: isolate;
  overflow: clip;
  /* The floor for the band, not the section rhythm. Lower than it was: with the
     photograph and the card gone there is nothing in the middle of the band to
     hold, and 72vh left a screen-deep gap between the service name and the rule
     above the booking pill. This still gives the name a full opening screen. */
  min-height: min(56vh, 32rem);
  padding-block: var(--section-rhythm-compact);
  display: flex;
  /* `stretch`, not `center`: the content column has to span the band's height
     for the booking pill to sit on its bottom edge. */
  align-items: stretch;
  background-color: var(--bond);
}

.service-hero__frame {
  position: relative;
  z-index: 1;
  width: 100%;
  display: flex;
}

/* The band's own content column — no card, no ground of its own. It sits
   directly on the bond paper the rest of the page is printed on. */
.panel {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--space-5);
}

/* Phones get the type only — see the component note. */
.panel__visual {
  display: none;
}

@media (min-width: 960px) {
  .panel {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 0.85fr);
    grid-template-areas:
      'crumbs crumbs'
      'title  visual'
      'foot   foot'
      'chips  chips';
    /* The title row takes the slack, so the foot stays on the band's floor. */
    grid-template-rows: auto 1fr auto auto;
    align-items: center;
    column-gap: var(--space-8);
  }

  .panel > .crumbs {
    grid-area: crumbs;
    align-self: start;
  }

  .panel__title {
    grid-area: title;
  }

  .panel__foot {
    grid-area: foot;
  }

  .panel__chips {
    grid-area: chips;
  }

  .panel__visual {
    grid-area: visual;
    display: block;
    position: relative;
    height: min(26rem, 46vh);
  }
}

/* ─── Breadcrumb ─────────────────────────────────────────────────────── */
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
  text-decoration: none;
}

.crumbs a:hover {
  color: var(--seal-ink);
}

/* ─── Band content ───────────────────────────────────────────────────── */
.panel__title {
  color: var(--text-on-bond);
  max-width: 18ch;
}

/*
 * The rule under the service name, and the headline's distance from it.
 *
 * `--stack-block` rather than a raw space step: this is the gap between the
 * page's name and the line that explains it, so it belongs to the rhythm scale
 * like every other block gap on the site, and it grows with the viewport
 * instead of sitting at a flat 16px from 360px to 1440px.
 */
.panel__foot {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-5);
  margin-top: auto;
  padding-top: var(--stack-block);
  border-top: 1px solid var(--rule-on-bond);
}

.panel__headline {
  font-family: var(--font-display);
  font-size: var(--text-h3);
  font-weight: 400;
  letter-spacing: var(--tracking-display);
  line-height: 1.2;
  color: var(--text-on-bond);
  max-width: 24ch;
  text-wrap: balance;
}

.panel__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.panel__chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  list-style: none;
  margin: 0;
  padding: 0;
}

/* The foot goes side-by-side once there is room for the pill beside the line —
   the reference layout's copy-left / action-right row. */
@media (min-width: 720px) {
  /*
   * `align-items: start`, NOT `flex-end`.
   *
   * Bottom-aligning this row made the headline's position a side effect of the
   * booking pill's height. The pill is ~56px; a headline that wraps to one line
   * is ~29px, so it was pushed down 24px to meet the pill's baseline — and a
   * headline that wrapped to two lines was not. The gap under the service name
   * therefore came out at 41px or 66px depending on how that particular name's
   * headline happened to wrap at that particular width: 66px on Workflow Agents
   * and Integrations & Process Intelligence, 41px on Workflow Strategy
   * Assessment, all on the same breakpoint.
   *
   * Aligning to the start pins the headline directly under the rule at every
   * width and on every service. The pill keeps its bottom-right anchor through
   * `align-self`, so the intended copy-left / action-right row survives — the
   * button now follows the text instead of the text following the button.
   */
  .panel__foot {
    flex-direction: row;
    align-items: start;
    justify-content: space-between;
    gap: var(--space-6);
  }

  /*
   * No measure cap on this row. The 20ch limit was a reading measure borrowed
   * from body copy, but this line is a label sitting beside the booking pill —
   * it broke "Know how the operation is performing" across two lines with the
   * rest of the band empty beside it. The row already bounds it: the pill takes
   * what it needs and the line takes the rest.
   */
  .panel__headline {
    flex: 1;
    max-width: none;
  }

  .panel__actions {
    flex: none;
    align-self: flex-end;
  }
}

/* Where the band is wide enough for the longest headline to fit beside the
   pill, hold it on one line. Below this it is allowed to wrap rather than
   overflow. */
@media (min-width: 1000px) {
  .panel__headline {
    white-space: nowrap;
  }
}

/* ─── Entrance ───────────────────────────────────────────────────────── */
@media (prefers-reduced-motion: no-preference) {
  /*
   * TRANSFORM ONLY — no opacity. Same rule the scroll reveals follow, and for
   * the same reason (globals.css): a contrast checker measures the BLENDED
   * colour of a fading element, so while this panel eased in, the booking
   * button measured #53575b on #ff9356 — 3.31:1 — and the a11y gate failed
   * whenever the scan landed inside the transition. It was intermittent, which
   * is worse than a steady failure: the same commit passed or failed on timing.
   */
  .panel__step {
    transform: translateY(12px);
    transition: transform var(--duration-slow) var(--ease-standard);
    transition-delay: calc(var(--i, 0) * 70ms);
  }

  .panel.is-revealed .panel__step {
    transform: translateY(0);
  }

  .service-hero__photo {
    transform: scale(1.04);
    transition: transform 1.2s var(--ease-standard);
  }

  .service-hero:has(.panel.is-revealed) .service-hero__photo {
    transform: scale(1);
  }
}

/* Narrow: the photo becomes a backdrop the panel sits on top of, so the wash
   flips to vertical and the panel takes the full gutter width. */
@media (max-width: 719px) {
  /* Matches the specificity of the base rule above, which it has to override. */
  .section.service-hero {
    min-height: auto;
    align-items: flex-end;
    padding-block: var(--section-rhythm-compact);
  }

  .service-hero__wash {
    background: linear-gradient(
      180deg,
      transparent 14%,
      rgba(244, 243, 241, 0.58) 46%,
      rgba(244, 243, 241, 0.93) 100%
    );
  }

  .panel {
    width: 100%;
    border-radius: 1.25rem;
  }
}
</style>
