<script setup lang="ts">
/**
 * NewsletterSignup — the one-field ask, sized to live inside other furniture.
 *
 * It is a marketing component rather than a section on purpose: it owns no
 * band, no rhythm and no ground of its own, so it can sit in the footer strip
 * (where it does) or at the end of the blog index later without either place
 * having to undo a layout decision made here.
 *
 * BAND-AGNOSTIC. Every colour resolves from the `.on-ink` context the host sets,
 * the way SectionHeader does, so the same component is correct on paper and on
 * ink without a dark variant of its own.
 *
 * THE ORANGE CARD IT REPLACES. The reference for this block is a full seal
 * field with a black pill in it. Seal is an accent, not a surface — tokens.css
 * reserves the page's one full-strength seal ground for the calculator result —
 * so the palette is inverted instead: the seal goes on the button, where the
 * action is, and the block itself is a hairline-ruled strip. That keeps a
 * newsletter ask from outshouting the booking CTA three lines above it.
 *
 * ACCESSIBILITY
 * - A real label and a real checkbox; the consent box is keyboard-operable and
 *   styled through `:checked`/`:focus-visible` rather than replaced by a div.
 * - `novalidate` plus inline messages wired through `aria-describedby` and
 *   `aria-invalid`; the failing control takes focus on submit.
 * - Consent is required and unticked by default — a pre-ticked box is not
 *   consent, and the address only ever leaves in a message the visitor sends.
 */
import { computed, ref } from 'vue'

import Button from '@/components/primitives/Button'
import Icon from '@/components/primitives/Icon'
import { CONTACT } from '@/lib/constants'
import type { NewsletterCopy } from '@/data/newsletter'

const props = defineProps<{ copy: NewsletterCopy }>()

const email = ref('')
const consent = ref(false)
const emailError = ref('')
const consentError = ref('')
const sent = ref(false)
const emailInput = ref<HTMLInputElement | null>(null)
const consentInput = ref<HTMLInputElement | null>(null)

/** Same permissive shape the contact panel uses — catches the typo, not the RFC. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const draft = computed(
  () =>
    `mailto:${CONTACT.general}` +
    `?subject=${encodeURIComponent(props.copy.mailSubject)}` +
    `&body=${encodeURIComponent(`${props.copy.mailBody}\n\n${email.value.trim()}`)}`,
)

function clear() {
  emailError.value = ''
  consentError.value = ''
  sent.value = false
}

function submit() {
  emailError.value = EMAIL.test(email.value.trim()) ? '' : props.copy.errors.email
  consentError.value = consent.value ? '' : props.copy.errors.consent

  if (emailError.value) {
    emailInput.value?.focus()
    return
  }
  if (consentError.value) {
    consentInput.value?.focus()
    return
  }

  sent.value = true
  window.location.href = draft.value
}
</script>

<template>
  <form class="signup" novalidate @submit.prevent="submit">
    <div class="signup__lead">
      <h2 class="signup__title">{{ copy.title }}</h2>
      <!-- Guarded like `note` below: an empty copy string would still cost a
           line box and open a gap under the title. -->
      <p v-if="copy.body" class="signup__body">{{ copy.body }}</p>
    </div>

    <div class="signup__controls">
      <p class="field">
        <label class="field__label" for="signup-email">
          {{ copy.emailLabel }}
          <span class="req" aria-hidden="true">*</span>
        </label>

        <span class="field__row">
          <input
            id="signup-email"
            ref="emailInput"
            v-model="email"
            class="field__input"
            type="email"
            autocomplete="email"
            :placeholder="copy.emailPlaceholder"
            aria-required="true"
            :aria-invalid="emailError ? 'true' : undefined"
            :aria-describedby="emailError ? 'signup-email-error' : undefined"
            @input="clear"
          />
          <Button type="submit" variant="primary" class="field__submit">
            {{ copy.submit }}
            <Icon name="arrow-right" :size="16" />
          </Button>
        </span>

        <span v-if="emailError" id="signup-email-error" class="note note--error">
          <Icon name="alert" :size="15" />
          {{ emailError }}
        </span>
      </p>

      <p class="consent">
        <input
          id="signup-consent"
          ref="consentInput"
          v-model="consent"
          class="consent__box"
          type="checkbox"
          aria-required="true"
          :aria-invalid="consentError ? 'true' : undefined"
          :aria-describedby="consentError ? 'signup-consent-error' : undefined"
          @change="clear"
        />
        <label class="consent__label" for="signup-consent">
          {{ copy.consentLabel }}
          <span class="req" aria-hidden="true">*</span>
        </label>
      </p>

      <span v-if="consentError" id="signup-consent-error" class="note note--error">
        <Icon name="alert" :size="15" />
        {{ consentError }}
      </span>

      <p v-if="copy.note" class="note">{{ copy.note }}</p>
      <p class="visually-hidden" aria-live="polite">{{ sent ? copy.sent : '' }}</p>
    </div>
  </form>
</template>

<style scoped>
/*
 * Two columns from 900px: the ask on the left, the controls on the right. Below
 * that they stack, and the input drops the button onto its own line rather than
 * squeezing a pill and a field into 320px.
 */
.signup {
  display: grid;
  gap: var(--space-5);
  align-items: start;
}

@media (min-width: 900px) {
  .signup {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
    gap: var(--space-8);
    align-items: center;
  }
}

.signup__lead {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.signup__title {
  font-family: var(--font-display);
  font-size: var(--text-h3);
  font-weight: 600;
  letter-spacing: var(--tracking-display);
  color: var(--text-on-bond);
}

.signup__body {
  color: var(--text-on-bond-muted);
  font-size: var(--text-body-sm);
  line-height: var(--leading-body);
  max-width: 46ch;
}

.signup__controls {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

/* ─── Email row ──────────────────────────────────────────────────────── */
.field {
  --field-error: color-mix(in srgb, var(--redline) 70%, var(--ink));

  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.field__label {
  font-size: var(--text-body-sm);
  font-weight: 600;
  color: var(--text-on-bond);
}

.req {
  color: var(--seal-ink);
}

.field__row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: var(--space-3);
}

/*
 * The same ruled field the contact panel uses, so the site has ONE input
 * treatment rather than one per form. It grows to fill the row; the pill beside
 * it keeps its intrinsic width.
 */
.field__input {
  flex: 1 1 16rem;
  min-width: 0;
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

.field__input::placeholder {
  color: var(--text-on-bond-muted);
}

.field__input:hover {
  border-bottom-color: color-mix(in srgb, var(--graphite) 45%, transparent);
}

/* The rule IS the focus ring — colour and weight together, never hue alone. */
.field__input:focus-visible {
  outline: none;
  border-bottom-color: var(--seal);
  box-shadow: 0 1px 0 0 var(--seal);
}

.field__input[aria-invalid='true'] {
  border-bottom-color: var(--field-error);
  box-shadow: 0 1px 0 0 var(--field-error);
}

.field__submit {
  flex: none;
}

/* ─── Consent ────────────────────────────────────────────────────────── */
.consent {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
}

/*
 * A real checkbox, restyled rather than replaced: `appearance: none` keeps the
 * element (and therefore the label association, the keyboard behaviour and the
 * checked state announcement) and only takes over the drawing. Near-square, like
 * every other non-button shape on the site.
 */
.consent__box {
  flex: none;
  width: 1.15rem;
  height: 1.15rem;
  margin: 0.1rem 0 0;
  appearance: none;
  background-color: transparent;
  border: 1px solid var(--rule-on-bond);
  border-radius: var(--radius-chip);
  cursor: pointer;
  display: grid;
  place-content: center;
}

/* The tick is drawn with a clip-path rather than a glyph so it needs no font and
   scales with the box. */
.consent__box::before {
  content: '';
  width: 0.7rem;
  height: 0.7rem;
  transform: scale(0);
  background-color: var(--on-action);
  clip-path: polygon(14% 44%, 0 60%, 40% 100%, 100% 22%, 84% 8%, 38% 68%);
}

.consent__box:checked {
  background-color: var(--seal);
  border-color: var(--seal);
}

.consent__box:checked::before {
  transform: scale(1);
}

.consent__box:focus-visible {
  outline: 2px solid var(--seal);
  outline-offset: 2px;
}

.consent__box[aria-invalid='true'] {
  border-color: var(--field-error);
}

.consent__label {
  font-size: var(--text-body-sm);
  line-height: 1.5;
  color: var(--text-on-bond);
  cursor: pointer;
}

/* ─── Notes ──────────────────────────────────────────────────────────── */
.note {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--text-on-bond-muted);
  font-size: var(--text-body-sm);
  line-height: var(--leading-body);
}

/* Raw `--redline` is 4.0:1 on paper — under AA at this size. Mixed toward ink it
   keeps meaning "this is wrong" and lands around 6.4:1. */
.note--error {
  color: color-mix(in srgb, var(--redline) 70%, var(--ink));
}

/* ─── On ink ─────────────────────────────────────────────────────────── */
.on-ink .signup__title,
.on-ink .field__label,
.on-ink .consent__label {
  color: var(--text-on-ink);
}

.on-ink .signup__body,
.on-ink .field__input,
.on-ink .field__input::placeholder,
.on-ink .note {
  color: var(--text-on-ink-muted);
}

.on-ink .field__input {
  color: var(--text-on-ink);
  border-bottom-color: var(--rule-on-ink);
}

.on-ink .field__input:hover {
  border-bottom-color: color-mix(in srgb, var(--bond) 40%, transparent);
}

.on-ink .consent__box {
  border-color: var(--rule-on-ink);
}

/* `--seal-ink` is the paper variant and measures ~2.2:1 here; on a dark ground
   the mark is raw seal (6.1:1). */
.on-ink .req {
  color: var(--seal);
}

/* `--redline-text`, not the ink-mixed value above: on a dark ground the error
   colour has to go LIGHTER to stay legible (6.6:1), not darker. */
.on-ink .note--error {
  color: var(--redline-text);
}

.on-ink .field {
  --field-error: var(--redline-text);
}

@media (prefers-reduced-motion: no-preference) {
  .field__input,
  .consent__box,
  .consent__box::before {
    transition:
      border-color var(--duration-fast) var(--ease-standard),
      background-color var(--duration-fast) var(--ease-standard),
      box-shadow var(--duration-fast) var(--ease-standard),
      transform var(--duration-fast) var(--ease-standard);
  }
}
</style>
