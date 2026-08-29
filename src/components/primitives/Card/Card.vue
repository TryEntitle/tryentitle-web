<script setup lang="ts">
/**
 * Card
 *
 * The surface primitive every card on the site sits on — service, industry,
 * pain point, insight. It owns the ground, the 4px near-square radius that makes
 * cards read as documents, and the hover choreography.
 *
 * Hover fires three cues as ONE gesture (design spec §2): the card lifts 4px,
 * the border shifts from graphite@18% to seal@40%, and a soft radial glow tracks
 * the cursor inside the card. Arrow nudge is owned by the child CTA.
 *
 * Band-aware: on ink bands the fill is `--ink-raised`; on bond it is the cream
 * stock with a hairline rule. Never mixed within a band.
 *
 * `"use client"` equivalent: the pointer listener is attached only while the
 * pointer is actually over the card, and only when the device has a fine pointer
 * and the user has not asked for reduced motion — so touch and reduced-motion
 * users never pay for it.
 *
 * @example <Card to="/services/systems-integration"><h3>…</h3></Card>
 */
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps<{
  /** Internal route — renders the card as a <RouterLink>. */
  to?: string
  /** External URL — renders the card as an <a>. */
  href?: string
  /** Drop internal padding so media can sit flush to the edges. */
  flush?: boolean
  /** Raise the card above its band (used for the highlighted comparison column). */
  featured?: boolean
  /**
   * `marked` — cream stock with a seal rule across the head.
   * `seal` — full orange brand fill with dark text (featured lead cards).
   */
  surface?: 'default' | 'marked' | 'seal'
}>()

const root = ref<HTMLElement | null>(null)
const glowing = ref(false)

const tag = computed(() => {
  if (props.to) return RouterLink
  if (props.href) return 'a'
  return 'div'
})

const bindings = computed<Record<string, unknown>>(() => {
  if (props.to) return { to: props.to }
  if (props.href) return { href: props.href }
  return {}
})

const interactive = computed(() => Boolean(props.to || props.href))

function supportsGlow(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(pointer: fine)').matches &&
    window.matchMedia('(prefers-reduced-motion: no-preference)').matches
  )
}

function handleEnter() {
  if (supportsGlow()) glowing.value = true
}

function handleLeave() {
  glowing.value = false
}

/**
 * Track the cursor as a percentage of the card box. Percentages avoid a
 * getBoundingClientRect read per frame being turned into layout thrash — the
 * rect is read once per move and only while the pointer is inside one card.
 */
function handleMove(event: PointerEvent) {
  if (!glowing.value || !root.value) return
  const el = root.value as unknown as HTMLElement
  const rect = el.getBoundingClientRect()
  el.style.setProperty('--mx', `${((event.clientX - rect.left) / rect.width) * 100}%`)
  el.style.setProperty('--my', `${((event.clientY - rect.top) / rect.height) * 100}%`)
}
</script>

<template>
  <component
    :is="tag"
    ref="root"
    class="card"
    :class="{
      'card--interactive': interactive,
      'card--flush': flush,
      'card--featured': featured,
      'card--marked': surface === 'marked',
      'card--seal': surface === 'seal',
      'is-glowing': glowing,
    }"
    v-bind="bindings"
    @pointerenter="handleEnter"
    @pointerleave="handleLeave"
    @pointermove="handleMove"
  >
    <span v-if="interactive" class="card__glow" aria-hidden="true" />
    <slot />
  </component>
</template>

<style scoped>
/* Cream, not white: cards are one rung up the ground ladder from the page, the
   same stock as the header and footer. See the ladder note in tokens.css. */
.card {
  position: relative;
  display: block;
  isolation: isolate;
  background-color: var(--cream);
  border: 1px solid var(--rule-on-bond);
  border-radius: var(--radius-card);
  padding: var(--space-6);
  color: inherit;
  text-decoration: none;
  box-shadow: var(--shadow-card);
}

/* A cream band would leave a cream card invisible, so on those the card takes
   the next rung up — white. Always one rung above whatever it sits on. */
.section--bond-raised .card {
  background-color: var(--bond-raised);
}

/* On dark bands the fill is `--ink-raised` — the band's own material one rung
   lighter, never a second hue laid on top of it. */
.on-ink .card {
  background-color: var(--ink-raised);
  border-color: var(--rule-on-ink);
  color: var(--text-on-ink);
  box-shadow: none;
}

.on-ink .card.card--interactive:hover {
  border-color: var(--rule-hover);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.28);
}

/*
 * The marked card: same cream stock, distinguished by a seal rule across its
 * head rather than by a fill. The rule is the mark; the paper stays paper.
 */
.card--marked {
  border-top-color: transparent;
}

.card--marked::before {
  content: '';
  position: absolute;
  inset-inline: -1px;
  top: -1px;
  height: 3px;
  border-radius: var(--radius-card) var(--radius-card) 0 0;
  background-color: var(--seal);
  pointer-events: none;
}

.on-ink .card--marked {
  border-top-color: transparent;
}

/* Orange brand surface — dark text for contrast on seal. */
.card--seal {
  background-color: var(--seal);
  border-color: color-mix(in srgb, var(--ink) 18%, var(--seal));
  color: var(--ink);
  box-shadow: 0 12px 28px color-mix(in srgb, var(--seal) 28%, transparent);
}

.card--seal.card--interactive:hover {
  border-color: var(--ink);
  box-shadow: 0 16px 36px color-mix(in srgb, var(--seal) 40%, transparent);
}

.card--seal .card__glow {
  background: radial-gradient(
    18rem circle at var(--mx, 50%) var(--my, 50%),
    rgba(15, 31, 26, 0.12),
    transparent 60%
  );
}

.card--flush {
  padding: 0;
  overflow: hidden;
}

.card--featured {
  border-color: var(--seal);
}

.card--interactive {
  transition:
    border-color var(--duration-fast) var(--ease-standard),
    box-shadow var(--duration-fast) var(--ease-standard),
    transform var(--duration-fast) var(--ease-standard);
}

.card--interactive:hover {
  border-color: var(--rule-hover);
  box-shadow: var(--shadow-lift);
}

@media (prefers-reduced-motion: no-preference) {
  .card--interactive:hover {
    transform: translateY(-4px);
  }
}

/* Radial glow, positioned from the pointer coordinates set in JS. Sits behind
   content via z-index and is purely decorative. */
.card__glow {
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: inherit;
  pointer-events: none;
  opacity: 0;
  transition: opacity var(--duration-base) var(--ease-standard);
  background: radial-gradient(
    18rem circle at var(--mx, 50%) var(--my, 50%),
    rgba(255, 106, 22, 0.14),
    transparent 60%
  );
}

.card.is-glowing .card__glow {
  opacity: 1;
}
</style>
