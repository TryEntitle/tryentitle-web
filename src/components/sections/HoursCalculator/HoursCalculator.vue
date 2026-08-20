<script setup lang="ts">
/**
 * HoursCalculator — Bond band, conversion panel (design spec §4.10)
 *
 * Consulting-landing layout: a large INK panel on the light band, with inputs on
 * the left and live figures + booking CTA on the right. Arithmetic uses the
 * visitor's OWN inputs only — never a benchmark.
 *
 * Accessibility:
 * - Real <input type="range"> with <label>
 * - Live figure announced via aria-live="polite" after settle (not mid-drag)
 */
import { computed, onMounted, ref, watch } from 'vue'
import Section from '@/components/primitives/Section'
import Container from '@/components/primitives/Container'
import Eyebrow from '@/components/primitives/Eyebrow'
import Heading from '@/components/primitives/Heading'
import BookingButton from '@/components/marketing/BookingButton'
import { CONTACT, SITE_NAME, SITE_URL } from '@/lib/constants'

/** One slider's visible label and the noun its value is announced with. */
interface Field {
  label: string
  unit: string
}

interface Capture {
  prompt: string
  emailLabel: string
  pdfLabel: string
  emailSubject: string
  emailIntro: string
  sheetTitle: string
  sheetInputs: string
  sheetResult: string
}

const props = defineProps<{
  eyebrow: string
  title: string
  footnote: string
  fields: { people: Field; hours: Field; cost: Field }
  capture: Capture
}>()

const people = ref(20)
const hoursEach = ref(30)
const hourlyCost = ref(27)

const WEEKS_PER_YEAR = 48

const annualHours = computed(() => people.value * hoursEach.value * WEEKS_PER_YEAR)
const annualCost = computed(() => annualHours.value * hourlyCost.value)

function fill(value: number, min: number, max: number): string {
  return `${((value - min) / (max - min)) * 100}%`
}

const hoursLabel = computed(() => annualHours.value.toLocaleString('en-US'))
const costLabel = computed(() =>
  annualCost.value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }),
)

const prefill = computed(
  () =>
    `Estimated ${hoursLabel.value} hours and ${costLabel.value} a year on manual admin ` +
    `(${people.value} people × ${hoursEach.value} hrs/week × ${WEEKS_PER_YEAR} weeks).`,
)

/** The three inputs as label/value pairs — shared by the email and the sheet. */
const summary = computed(() => [
  { label: props.fields.people.label, value: String(people.value) },
  { label: props.fields.hours.label, value: String(hoursEach.value) },
  { label: props.fields.cost.label, value: `$${hourlyCost.value}` },
])

/**
 * Mid-funnel exit 1 — a prefilled message to the shared inbox.
 *
 * `mailto:` because the site is a static build with no form handler: a form
 * posting nowhere would look like capture and quietly drop every lead. This
 * hands the visitor's own numbers to their mail client, so the lead arrives as a
 * real reply-able email and nothing is stored on our side.
 *
 * Every part is encoded — the body carries newlines and an `&` in the copy would
 * otherwise truncate it into a stray mailto parameter.
 */
const emailHref = computed(() => {
  const body = [
    props.capture.emailIntro,
    '',
    ...summary.value.map((row) => `${row.label}: ${row.value}`),
    '',
    `${hoursLabel.value} hours a year`,
    `${costLabel.value} a year`,
  ].join('\n')

  return (
    `mailto:${CONTACT.general}` +
    `?subject=${encodeURIComponent(props.capture.emailSubject)}` +
    `&body=${encodeURIComponent(body)}`
  )
})

/**
 * Mid-funnel exit 2 — the estimate as a one-page document.
 *
 * The body class is what scopes the print rules (see globals.css) to this
 * action, so an ordinary Ctrl+P still prints the whole page. `afterprint` clears
 * it, with a timeout fallback because that event is unreliable in some browsers
 * and a stuck class would silently reduce every later print to this one sheet.
 */
/** Gates the teleported sheet — it is a client-only concern. */
const mounted = ref(false)
onMounted(() => (mounted.value = true))

function saveEstimate(): void {
  if (typeof window === 'undefined') return

  const PRINTING = 'printing-estimate'
  document.body.classList.add(PRINTING)

  let done = false
  const cleanup = () => {
    if (done) return
    done = true
    document.body.classList.remove(PRINTING)
    window.removeEventListener('afterprint', cleanup)
  }

  window.addEventListener('afterprint', cleanup)
  window.setTimeout(cleanup, 1000)
  window.print()
}

const announced = ref('')
let settle: ReturnType<typeof setTimeout> | undefined
watch(
  [hoursLabel, costLabel],
  () => {
    clearTimeout(settle)
    settle = setTimeout(() => {
      announced.value = `${hoursLabel.value} hours and ${costLabel.value} a year.`
    }, 500)
  },
  { immediate: true },
)
</script>

<template>
  <Section tone="bond" class="calc" labelledby="calc-title">
    <Container>
      <div class="shell on-ink">
        <header class="shell__head">
          <Eyebrow>{{ eyebrow }}</Eyebrow>
          <Heading id="calc-title" :level="2" size="h2" class="shell__title">{{ title }}</Heading>
        </header>

        <div class="shell__grid">
          <div class="controls">
            <div class="field">
              <div class="field__row">
                <label class="field__label" for="calc-people">{{ fields.people.label }}</label>
                <span class="field__value" aria-hidden="true">{{ people }}</span>
              </div>
              <input
                id="calc-people"
                v-model.number="people"
                class="slider"
                type="range"
                min="1"
                max="40"
                step="1"
                :aria-valuetext="`${people} ${fields.people.unit}`"
                :style="{ '--fill': fill(people, 1, 40) }"
              />
            </div>

            <div class="field">
              <div class="field__row">
                <label class="field__label" for="calc-hours">{{ fields.hours.label }}</label>
                <span class="field__value" aria-hidden="true">{{ hoursEach }}</span>
              </div>
              <input
                id="calc-hours"
                v-model.number="hoursEach"
                class="slider"
                type="range"
                min="1"
                max="30"
                step="1"
                :aria-valuetext="`${hoursEach} ${fields.hours.unit}`"
                :style="{ '--fill': fill(hoursEach, 1, 30) }"
              />
            </div>

            <div class="field">
              <div class="field__row">
                <label class="field__label" for="calc-cost">{{ fields.cost.label }}</label>
                <span class="field__value" aria-hidden="true">${{ hourlyCost }}</span>
              </div>
              <input
                id="calc-cost"
                v-model.number="hourlyCost"
                class="slider"
                type="range"
                min="15"
                max="150"
                step="1"
                :aria-valuetext="`${hourlyCost} ${fields.cost.unit}`"
                :style="{ '--fill': fill(hourlyCost, 15, 150) }"
              />
            </div>
          </div>

          <aside class="result" data-reveal aria-label="Estimated annual cost">
            <div class="result__card">
              <p class="result__stat">
                <span class="result__figure">{{ hoursLabel }}</span>
                <span class="result__caption">hours lost per year</span>
              </p>

              <p class="result__stat result__stat--accent">
                <span class="result__figure">{{ costLabel }}</span>
                <span class="result__caption">before errors and delays</span>
              </p>

              <p class="visually-hidden" aria-live="polite">{{ announced }}</p>

              <p class="result__note">{{ footnote }}</p>

              <div class="result__action">
                <BookingButton placement="calculator" size="lg" :prefill="prefill" />
              </div>

              <!--
                The second choice, for the visitor who has the number but is not
                booking today. Kept as quiet links so it never competes with the
                pill above it.
              -->
              <div class="exits">
                <p class="exits__prompt">{{ capture.prompt }}</p>
                <div class="exits__row">
                  <a class="exits__link" :href="emailHref">{{ capture.emailLabel }}</a>
                  <button type="button" class="exits__link" @click="saveEstimate">
                    {{ capture.pdfLabel }}
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </Container>

    <!--
      The printed document. Hidden on screen and built separately from the panel
      above rather than printed from it — the on-screen result is an orange card
      sized for a viewport, and what belongs on paper is a plain statement of the
      inputs, the totals, and who produced it.

      Teleported to <body> so it is a SIBLING of #app: printing then means hiding
      one element and showing another. Left in place it would sit several levels
      deep inside a section, where hiding the page around it either hides the
      sheet too or leaves the invisible page still occupying the paper.

      Client-only — it exists for a click handler, so there is nothing for the
      static build to render, and this keeps a teleport out of SSR output.

      `aria-hidden`: every figure here is already announced on screen, so to a
      screen reader this is a duplicate reading of the same numbers.
    -->
    <Teleport v-if="mounted" to="body">
      <div data-print-sheet class="sheet" aria-hidden="true">
        <p class="sheet__brand">{{ SITE_NAME }}</p>
        <h2 class="sheet__title">{{ capture.sheetTitle }}</h2>

        <p class="sheet__label">{{ capture.sheetInputs }}</p>
        <table class="sheet__table">
          <tbody>
            <tr v-for="row in summary" :key="row.label">
              <th scope="row">{{ row.label }}</th>
              <td>{{ row.value }}</td>
            </tr>
          </tbody>
        </table>

        <p class="sheet__label">{{ capture.sheetResult }}</p>
        <p class="sheet__figure">{{ hoursLabel }} hours a year</p>
        <p class="sheet__figure">{{ costLabel }} a year</p>

        <p class="sheet__note">{{ footnote }}</p>
        <p class="sheet__foot">{{ SITE_URL }} {{ CONTACT.general }}</p>
      </div>
    </Teleport>
  </Section>
</template>

<style scoped>
.calc {
  /* Soft atmosphere behind the paper shell — consulting-landing air, not a tinted box. */
  background:
    radial-gradient(ellipse 80% 70% at 12% 0%, var(--seal-wash), transparent 55%),
    radial-gradient(
      ellipse 60% 50% at 100% 80%,
      color-mix(in srgb, var(--seal) 8%, transparent),
      transparent 50%
    );
}

/*
 * THE ONE DARK PANEL ON A LIGHT BAND.
 *
 * The band around it stays bond — the shell itself carries the ink ground, and
 * with it the `.on-ink` class, so the eyebrow, heading, labels and rules inside
 * resolve to their band-correct variants through the site's existing hook
 * rather than through a set of dark overrides local to this file.
 *
 * The seal result card is unchanged and is the reason this works: orange on
 * near-black is the strongest pairing the palette has, so the figure the whole
 * section exists to produce now sits on the highest contrast on the page.
 *
 * The shadow is deeper and cooler than the paper version it replaces — a light
 * panel needs a hint of lift, a dark one dropped onto warm paper needs to look
 * like it is actually sitting above the page.
 */
.shell {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  padding: clamp(1.5rem, 3vw, 3rem);
  background-color: var(--ink);
  border: 1px solid var(--rule-on-ink);
  border-radius: 1.5rem;
  box-shadow: var(--shadow-lift);
}

.shell__head {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  max-width: 28ch;
}

.shell__title {
  color: var(--text-on-ink);
}

.shell__grid {
  display: grid;
  gap: var(--space-8);
  align-items: stretch;
}

@media (min-width: 900px) {
  .shell {
    gap: var(--space-9);
    padding: var(--space-9);
  }

  .shell__grid {
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
    gap: var(--space-9);
    align-items: center;
  }
}

.controls {
  display: flex;
  flex-direction: column;
  gap: var(--space-7);
}

.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding-bottom: var(--space-6);
  border-bottom: 1px solid var(--rule-on-ink);
}

.field:last-child {
  padding-bottom: 0;
  border-bottom: none;
}

.field__row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-4);
}

.field__label {
  font-family: var(--font-body);
  font-size: var(--text-body);
  font-weight: 600;
  color: var(--text-on-ink);
}

.field__value {
  flex: none;
  font-family: var(--font-display);
  font-size: var(--text-h3);
  font-weight: 600;
  letter-spacing: var(--tracking-display);
  font-variant-numeric: tabular-nums;
  /* Full-strength seal, not `--seal-ink`: the darkened variant exists for light
     bands and drops to ~2.2:1 here, while raw seal on ink measures 6.1:1. */
  color: var(--seal);
}

.slider {
  width: 100%;
  appearance: none;
  height: 6px;
  border-radius: var(--radius-pill);
  background: linear-gradient(
    to right,
    var(--seal) 0%,
    var(--seal) var(--fill, 50%),
    color-mix(in srgb, var(--bond) 22%, transparent) var(--fill, 50%)
  );
  cursor: pointer;
}

.slider::-webkit-slider-thumb {
  appearance: none;
  width: 22px;
  height: 22px;
  border-radius: var(--radius-pill);
  background-color: var(--seal);
  border: 3px solid var(--ink);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--seal) 35%, transparent);
  cursor: grab;
}

.slider::-moz-range-thumb {
  width: 22px;
  height: 22px;
  border-radius: var(--radius-pill);
  background-color: var(--seal);
  border: 3px solid var(--ink);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--seal) 35%, transparent);
  cursor: grab;
}

.slider:focus-visible {
  outline: 2px solid var(--seal);
  outline-offset: 4px;
}

.result__card {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  height: 100%;
  padding: clamp(1.5rem, 3vw, 2.25rem);
  background-color: var(--seal);
  color: var(--ink);
  border-radius: 1.25rem;
  box-shadow: 0 16px 40px color-mix(in srgb, var(--seal) 32%, transparent);
}

.result__stat {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding-bottom: var(--space-5);
  border-bottom: 1px solid color-mix(in srgb, var(--ink) 18%, transparent);
}

.result__stat:last-of-type {
  border-bottom: none;
  padding-bottom: 0;
}

.result__figure {
  font-family: var(--font-display);
  font-size: clamp(2rem, 1.6rem + 1.6vw, 2.75rem);
  font-weight: 600;
  line-height: 1.05;
  letter-spacing: var(--tracking-display);
  font-variation-settings: 'wdth' 95;
  font-variant-numeric: tabular-nums;
  color: var(--ink);
}

.result__stat--accent .result__figure {
  color: var(--ink);
}

/*
 * 85%, not 72%. Muted text has to stay muted RELATIVE to the figure above it,
 * but seal is a bright ground: at 72% ink the blend lands on 4.0:1, under AA for
 * body size. 85% measures 5.03:1 and still reads a clear step below the full-ink
 * figure (6.1:1). Any further mixing toward transparent on this panel fails —
 * this is the floor, not a preference.
 */
.result__caption {
  font-size: var(--text-body);
  color: color-mix(in srgb, var(--ink) 85%, transparent);
}

.result__note {
  margin-top: auto;
  color: color-mix(in srgb, var(--ink) 85%, transparent);
  font-size: var(--text-body-sm);
  max-width: 36ch;
  line-height: var(--leading-body);
}

.result__action {
  margin-top: var(--space-2);
}

.result__action :deep(.btn) {
  width: 100%;
}

/* ─── Mid-funnel exits ───────────────────────────────────────────────── */
.exits {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding-top: var(--space-4);
  border-top: 1px solid color-mix(in srgb, var(--ink) 18%, transparent);
}

.exits__prompt {
  font-family: var(--font-mono);
  font-size: var(--text-utility);
  letter-spacing: var(--tracking-utility);
  text-transform: uppercase;
  color: color-mix(in srgb, var(--ink) 85%, transparent);
}

.exits__row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-5);
}

/*
 * A link and a button side by side, so both are reset to the same object. The
 * button stays a <button> because it runs script rather than navigating.
 */
.exits__link {
  font-family: var(--font-body);
  font-size: var(--text-body-sm);
  font-weight: 600;
  color: var(--ink);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  text-align: start;
  text-decoration: underline;
  text-underline-offset: 0.25em;
  text-decoration-color: color-mix(in srgb, var(--ink) 40%, transparent);
  transition: text-decoration-color var(--duration-fast) var(--ease-standard);
}

.exits__link:hover {
  text-decoration-color: var(--ink);
}

.exits__link:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 3px;
}

/* ─── The printed sheet ──────────────────────────────────────────────── */
/* Never rendered on screen; globals.css reveals it for the print action only. */
.sheet {
  display: none;
  color: #000;
  font-family: var(--font-body);
}

.sheet__brand {
  font-family: var(--font-mono);
  font-size: 10pt;
  letter-spacing: var(--tracking-utility);
  text-transform: uppercase;
}

.sheet__title {
  margin: 8pt 0 20pt;
  font-family: var(--font-display);
  font-size: 22pt;
  font-weight: 600;
  letter-spacing: var(--tracking-display);
}

.sheet__label {
  margin-top: 18pt;
  font-family: var(--font-mono);
  font-size: 9pt;
  letter-spacing: var(--tracking-utility);
  text-transform: uppercase;
}

.sheet__table {
  width: 100%;
  max-width: 380pt;
  margin-top: 6pt;
  border-collapse: collapse;
  font-size: 11pt;
}

.sheet__table th,
.sheet__table td {
  padding: 6pt 0;
  border-bottom: 0.5pt solid #999;
  text-align: left;
  font-weight: 400;
}

.sheet__table td {
  text-align: right;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.sheet__figure {
  margin-top: 6pt;
  font-family: var(--font-display);
  font-size: 18pt;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.sheet__note {
  margin-top: 20pt;
  max-width: 400pt;
  font-size: 10pt;
  line-height: 1.5;
}

.sheet__foot {
  margin-top: 24pt;
  padding-top: 8pt;
  border-top: 0.5pt solid #999;
  font-family: var(--font-mono);
  font-size: 9pt;
}
</style>
