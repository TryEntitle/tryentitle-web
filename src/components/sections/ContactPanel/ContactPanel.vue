<script setup lang="ts">
/**
 * ContactPanel — the written route in, after the trust commitments.
 *
 * LAYOUT — one panel, two materials. An ink rail states who is being written to
 * and what the alternatives are; a cream sheet beside it carries the form. They
 * sit flush inside a single rounded shell rather than as two cards with a
 * gutter, so the pair reads as one object — the same "one sheet, folded" device
 * the about fold uses, at the scale of a panel.
 *
 * The rail is ruled like a pad (a repeating hairline, masked away at the foot).
 * That is the whole decoration: on a page whose argument is "auditable process",
 * a contact block should look like a form on a desk, not like a hero.
 *
 * WHERE THE MESSAGE GOES. There is no form handler — the site is a static build
 * and the CSP permits `form-action 'self'` only. A form posting nowhere would
 * look like capture and silently drop every lead, so on submit this composes the
 * message in the visitor's own mail client, the same route the calculator's
 * email exit takes, and the button says so underneath. See data/contact.ts.
 *
 * ACCESSIBILITY
 * - Real labels bound to real inputs; no placeholder-as-label.
 * - `novalidate` plus inline messages, because the native bubble cannot be
 *   styled and vanishes on the next keystroke. Errors are wired through
 *   `aria-describedby` and `aria-invalid`, and the first invalid field takes
 *   focus on a failed submit.
 * - Errors clear as the visitor types, so the panel never argues with someone
 *   who is already fixing it.
 */
import { computed, reactive, ref } from 'vue'

import Section from '@/components/primitives/Section'
import Container from '@/components/primitives/Container'
import Eyebrow from '@/components/primitives/Eyebrow'
import Heading from '@/components/primitives/Heading'
import Button from '@/components/primitives/Button'
import Icon from '@/components/primitives/Icon'
import BookingButton from '@/components/marketing/BookingButton'
import { CONTACT } from '@/lib/constants'
import type { ContactCopy } from '@/data/contact'

const props = defineProps<{ copy: ContactCopy }>()

/** The four single-line inputs, in reading order. The message is a textarea. */
const ROWS = [
  { name: 'firstName', type: 'text', autocomplete: 'given-name', required: true },
  { name: 'lastName', type: 'text', autocomplete: 'family-name', required: true },
  { name: 'email', type: 'email', autocomplete: 'email', required: true },
  { name: 'phone', type: 'tel', autocomplete: 'tel', required: false },
] as const

type FieldName = (typeof ROWS)[number]['name']

const values = reactive({ firstName: '', lastName: '', email: '', phone: '', message: '' })
const errors = reactive<Record<FieldName, string>>({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
})
const sent = ref(false)
const inputs = new Map<FieldName, HTMLInputElement>()

/**
 * Deliberately permissive: something, an @, something, a dot, something. The
 * form's job is to catch the typo that makes a reply impossible, not to
 * adjudicate RFC 5322 — every stricter regex on the internet rejects addresses
 * that actually deliver.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const fields = computed(() => ROWS.map((row) => ({ ...row, label: props.copy.labels[row.name] })))

/** Keeps a handle on each input so a failed submit can focus the first bad one. */
function keep(name: FieldName) {
  return (el: unknown) => {
    if (el instanceof HTMLInputElement) inputs.set(name, el)
    else inputs.delete(name)
  }
}

/** Clear a field's error the moment it is being corrected. */
function touch(name: FieldName) {
  errors[name] = ''
  sent.value = false
}

/** Returns the first field that failed, or null when the form is sendable. */
function validate(): FieldName | null {
  for (const row of ROWS) {
    const value = values[row.name].trim()
    if (row.required && !value) errors[row.name] = props.copy.errors.required
    else if (row.name === 'email' && value && !EMAIL.test(value))
      errors[row.name] = props.copy.errors.email
    else errors[row.name] = ''
  }
  return ROWS.find((row) => errors[row.name])?.name ?? null
}

/**
 * The composed draft. Every part is encoded — the body carries newlines, and a
 * bare `&` typed into the message would otherwise truncate it into a stray
 * mailto parameter.
 */
const draft = computed(() => {
  const lines = [
    props.copy.mailIntro,
    '',
    values.message.trim() || '(nothing written yet)',
    '',
    `From: ${values.firstName.trim()} ${values.lastName.trim()}`.trim(),
    `Email: ${values.email.trim()}`,
  ]
  if (values.phone.trim()) lines.push(`Phone: ${values.phone.trim()}`)

  return (
    `mailto:${CONTACT.general}` +
    `?subject=${encodeURIComponent(props.copy.mailSubject)}` +
    `&body=${encodeURIComponent(lines.join('\n'))}`
  )
})

function submit() {
  const firstInvalid = validate()
  if (firstInvalid) {
    inputs.get(firstInvalid)?.focus()
    sent.value = false
    return
  }
  sent.value = true
  window.location.href = draft.value
}
</script>

<template>
  <Section tone="bond" class="contact" labelledby="contact-title">
    <Container>
      <div class="panel">
        <!-- ─── Ink rail ─────────────────────────────────────────────── -->
        <div class="rail on-ink" data-reveal="left">
          <div class="rail__lead">
            <Eyebrow>{{ copy.eyebrow }}</Eyebrow>
            <Heading id="contact-title" :level="2" size="h2" class="rail__title" data-split-lines>
              {{ copy.title }}
            </Heading>
            <p class="rail__body">{{ copy.body }}</p>
          </div>

          <div class="rail__foot">
            <p class="rail__label mono-label">{{ copy.directLabel }}</p>
            <a class="rail__mail" :href="`mailto:${CONTACT.general}`">
              {{ CONTACT.general }}
              <Icon name="arrow-up-right" :size="16" />
            </a>

            <p class="rail__label mono-label rail__label--alt">{{ copy.altPrompt }}</p>
            <!-- <BookingButton placement="contact" variant="secondary" /> -->
          </div>
        </div>

        <!-- ─── Form sheet ───────────────────────────────────────────── -->
        <form class="sheet" novalidate data-reveal="right" @submit.prevent="submit">
          <div class="sheet__head">
            <h3 class="sheet__title">{{ copy.formTitle }}</h3>
            <p class="sheet__legend">
              <span class="req" aria-hidden="true">*</span> {{ copy.requiredNote }}
            </p>
          </div>

          <div class="grid">
            <p v-for="field in fields" :key="field.name" class="field">
              <label class="field__label" :for="`contact-${field.name}`">
                {{ field.label }}
                <span v-if="field.required" class="req" aria-hidden="true">*</span>
              </label>
              <input
                :id="`contact-${field.name}`"
                :ref="keep(field.name)"
                v-model="values[field.name]"
                class="field__input"
                :type="field.type"
                :autocomplete="field.autocomplete"
                :aria-required="field.required || undefined"
                :aria-invalid="errors[field.name] ? 'true' : undefined"
                :aria-describedby="errors[field.name] ? `contact-${field.name}-error` : undefined"
                @input="touch(field.name)"
              />
              <span
                v-if="errors[field.name]"
                :id="`contact-${field.name}-error`"
                class="field__error"
              >
                {{ errors[field.name] }}
              </span>
            </p>

            <p class="field field--wide">
              <label class="field__label" for="contact-message">{{ copy.labels.message }}</label>
              <textarea
                id="contact-message"
                v-model="values.message"
                class="field__input field__input--area"
                rows="4"
              ></textarea>
            </p>
          </div>

          <div class="sheet__foot">
            <Button type="submit" variant="primary" size="lg">
              {{ copy.submit }}
              <Icon name="arrow-right" :size="16" />
            </Button>
            <p class="sheet__note">{{ copy.note }}</p>
          </div>

          <p class="visually-hidden" aria-live="polite">{{ sent ? copy.sent : '' }}</p>
        </form>
      </div>
    </Container>
  </Section>
</template>

<style scoped>
/* The same faint atmosphere the calculator band uses, mirrored to the other
   corner so two panel bands on one page do not glow from the same spot. */
.contact {
  background: radial-gradient(ellipse 70% 60% at 92% 10%, var(--seal-wash), transparent 55%);
}

.panel {
  display: grid;
  grid-template-columns: 1fr;
  border-radius: 1.5rem;
  overflow: hidden;
  box-shadow: var(--shadow-lift);
}

@media (min-width: 900px) {
  .panel {
    grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
  }
}

/* ─── Ink rail ───────────────────────────────────────────────────────── */
.rail {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--space-8);
  padding: clamp(1.75rem, 3vw, 3rem);
  background-color: var(--ink);
  color: var(--text-on-ink);
  isolation: isolate;
}

/*
 * The ruled pad. A repeating hairline at roughly the body line-height, masked
 * away before it reaches either end so the rules read as paper texture rather
 * than as a table someone forgot to fill in.
 */
.rail::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background-image: repeating-linear-gradient(
    180deg,
    var(--rule-on-ink) 0 1px,
    transparent 1px 2.25rem
  );
  opacity: 0.5;
  -webkit-mask-image: linear-gradient(180deg, transparent, #000 12%, #000 62%, transparent 92%);
  mask-image: linear-gradient(180deg, transparent, #000 12%, #000 62%, transparent 92%);
  pointer-events: none;
}

.rail__lead {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.rail__title {
  color: var(--text-on-ink);
}

.rail__body {
  color: var(--text-on-ink-muted);
  font-size: var(--text-body-lg);
  line-height: var(--leading-body);
  max-width: 38ch;
}

.rail__foot {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-2);
  padding-top: var(--space-5);
  border-top: 1px solid var(--rule-on-ink);
}

.rail__label {
  color: var(--text-on-ink-muted);
}

.rail__label--alt {
  margin-top: var(--space-5);
}

.rail__mail {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--seal);
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 0.25em;
  text-decoration-color: color-mix(in srgb, var(--seal) 45%, transparent);
}

.rail__mail:hover {
  text-decoration-color: var(--seal);
}

/* ─── Form sheet ─────────────────────────────────────────────────────── */
.sheet {
  display: flex;
  flex-direction: column;
  gap: var(--stack-block);
  padding: clamp(1.75rem, 3vw, 3rem);
  background-color: var(--cream);
}

.sheet__head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-3);
}

.sheet__title {
  font-family: var(--font-display);
  font-size: var(--text-h3);
  font-weight: 600;
  letter-spacing: var(--tracking-display);
}

.sheet__legend {
  color: var(--text-on-bond-muted);
  font-size: var(--text-body-sm);
}

.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-5) var(--space-6);
}

@media (min-width: 560px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .field--wide {
    grid-column: 1 / -1;
  }
}

/*
 * `--field-error` is declared on the field rather than at the panel so the rule
 * under an invalid input and the message beneath it can never drift apart.
 *
 * Raw `--redline` measures 4.0:1 on cream — under AA at this size. Mixing it
 * toward ink keeps red meaning "this is wrong" while landing at ~6.4:1.
 */
.field {
  --field-error: color-mix(in srgb, var(--redline) 70%, var(--ink));

  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.field__label {
  font-size: var(--text-body-sm);
  font-weight: 600;
  color: var(--text-on-bond);
}

/* `--seal-ink`, not `--seal`: this is body-size text on a light ground, where
   full-strength seal measures ~2.6:1. */
.req {
  color: var(--seal-ink);
}

/*
 * A ruled line, not a boxed input — the reference's underline, kept because it
 * matches the pad the rail is drawing beside it. The rule is the element's own
 * bottom border so it stays put under autofill, and it thickens to seal on
 * focus rather than moving anything.
 */
.field__input {
  width: 100%;
  padding: var(--space-2) 0;
  font-family: var(--font-body);
  font-size: var(--text-body-lg);
  color: var(--text-on-bond);
  background-color: transparent;
  border: 0;
  border-bottom: 1px solid var(--rule-on-bond);
  border-radius: 0;
  appearance: none;
}

.field__input--area {
  resize: vertical;
  min-height: 7.5rem;
  line-height: var(--leading-body);
}

.field__input:hover {
  border-bottom-color: color-mix(in srgb, var(--graphite) 45%, transparent);
}

/*
 * The focus ring is the rule itself. A 2px seal underline plus the browser's own
 * outline would double-mark the same field, so the outline is replaced rather
 * than removed — and it is a colour AND a weight change, so focus is never
 * carried by hue alone.
 */
.field__input:focus-visible {
  outline: none;
  border-bottom-color: var(--seal);
  box-shadow: 0 1px 0 0 var(--seal);
}

.field__input[aria-invalid='true'] {
  border-bottom-color: var(--field-error);
  box-shadow: 0 1px 0 0 var(--field-error);
}

.field__error {
  color: var(--field-error);
  font-size: var(--text-body-sm);
}

.sheet__foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3) var(--space-5);
  margin-top: var(--space-2);
}

.sheet__note {
  flex: 1 1 20ch;
  color: var(--text-on-bond-muted);
  font-size: var(--text-body-sm);
  line-height: var(--leading-body);
  max-width: 42ch;
}

@media (prefers-reduced-motion: no-preference) {
  .field__input,
  .rail__mail {
    transition:
      border-color var(--duration-fast) var(--ease-standard),
      box-shadow var(--duration-fast) var(--ease-standard),
      text-decoration-color var(--duration-fast) var(--ease-standard);
  }
}
</style>
