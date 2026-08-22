<script setup lang="ts">
/**
 * SiteFooter
 *
 * Site chrome present on every page (PRD §6.1). INK stock — the footer PRD §10.3
 * originally asked for. The header stays light, so the page is bracketed by two
 * different grounds rather than by one sheet: the chrome above is paper, the
 * chrome below is the page closing out.
 *
 * It carries the same entrance the ink page bands use — a seal hairline along
 * the top edge (see Section.vue) — so crossing into the dark ground is stated in
 * the site's existing language rather than happening as a bare colour change.
 *
 * The closing CTA above it is still cream. That join is now a hard edge, which
 * is fine — a seam is two surfaces that ALMOST match, and these do not pretend
 * to. What must not happen is the two drifting to near-identical values: repaint
 * one toward the other and the boundary starts reading as a mistake.
 *
 * `.on-ink` is set on the element itself, so everything nested here — the
 * wordmark, the booking pill, links — resolves through the site's one
 * band-colour hook instead of through footer-local dark overrides.
 *
 * Link groups — Solutions, Industries, Company, Legal — are derived from the
 * canonical data model, so the footer can never drift from the source of truth.
 *
 * The newsletter strip used to open this footer. It is now its own cream band
 * directly above (NewsletterBand.vue): against a pure-black ground a form and a
 * sitemap on one unbroken field stopped reading as two separate asks.
 *
 * Owns its own chrome spacing; it is not a page `Section` (PRD §12.4 concerns
 * page content bands, not header/footer chrome).
 */
import { RouterLink } from 'vue-router'
import Container from '@/components/primitives/Container'
import Logo from '@/components/layout/Logo'
import BookingButton from '@/components/marketing/BookingButton'
import { FOOTER_GROUPS } from '@/data/navigation'
import { SITE_TAGLINE } from '@/lib/constants'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer on-ink">
    <Container>
      <div class="footer__top">
        <div class="footer__brand">
          <RouterLink to="/" class="footer__logo" aria-label="TryEntitle — home">
            <Logo tone="inverse" />
          </RouterLink>
          <p class="footer__tagline">{{ SITE_TAGLINE }}</p>
          <BookingButton placement="footer" variant="primary" />
        </div>

        <nav class="footer__nav" aria-label="Footer">
          <div v-for="group in FOOTER_GROUPS" :key="group.heading" class="footer__group">
            <h2 class="footer__heading">{{ group.heading }}</h2>
            <ul class="footer__links">
              <li v-for="link in group.links" :key="link.to">
                <a v-if="link.external" :href="link.to" class="footer__link">{{ link.label }}</a>
                <RouterLink v-else :to="link.to" class="footer__link">{{ link.label }}</RouterLink>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      <div class="footer__bottom">
        <p>© {{ year }} <span class="footer__name">TryEntitle</span>. All rights reserved.</p>
      </div>
    </Container>
  </footer>
</template>

<style scoped>
.footer {
  position: relative;
  /*
   * Pure black, one rung below `--ink`. The footer is chrome, not a band: it
   * sits under every page and closes the document, so it goes darker than the
   * darkest ink band rather than matching it. A raw hex on purpose — this is
   * not a fifth ground on the surface ladder in tokens.css and nothing else
   * should reach for it.
   *
   * Everything inside is transparent-backed and coloured from the `.on-ink`
   * tokens, so each of them only gains contrast against this: `--text-on-ink`
   * goes 16:1 → 18.4:1, and `--seal` 6.4:1 → 7.4:1.
   */
  background-color: #000;
  color: var(--text-on-ink);
  /* The footer is not a Section, so it states its rhythm — but from the same
     scale, at the compact step, so it never lands between two of the steps. */
  padding-block: var(--section-rhythm-compact);
}

/* The same seal hairline `.section--ink` draws when the ground goes dark, so the
   footer enters the same way every other ink band does. */
.footer::before {
  content: '';
  position: absolute;
  inset-inline: 0;
  top: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--seal) 18%, var(--seal) 82%, transparent);
  pointer-events: none;
}

.footer__top {
  display: grid;
  gap: var(--stack-lead);
}

@media (min-width: 900px) {
  .footer__top {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.6fr);
  }
}

.footer__brand {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-4);
  max-width: 30ch;
}

/* The wordmark is not running text — the global link underline does not
   belong on it. */
.footer__logo {
  display: inline-flex;
  text-decoration: none;
}

.footer__tagline {
  color: var(--text-on-ink-muted);
  font-size: var(--text-body-sm);
  line-height: 1.5;
}

.footer__nav {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-6);
}

@media (min-width: 640px) {
  .footer__nav {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.footer__heading {
  font-family: var(--font-mono);
  font-weight: 500;
  font-size: var(--text-utility);
  letter-spacing: var(--tracking-utility);
  text-transform: uppercase;
  color: var(--text-on-ink-muted);
  margin-bottom: var(--space-3);
}

.footer__links {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.footer__link {
  color: var(--text-on-ink);
  font-size: var(--text-body-sm);
  text-decoration: none;
}

/*
 * Raw `--seal`, which is 6.4:1 on ink. `--seal-ink` is the darkened variant for
 * paper and would drop to ~2.2:1 here — the pair is not interchangeable, and
 * which one is correct follows the ground, not the component.
 */
.footer__link:hover {
  color: var(--seal);
  text-decoration: underline;
  text-underline-offset: 0.2em;
}

.footer__bottom {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--space-2);
  margin-top: var(--stack-block);
  padding-top: var(--space-5);
  border-top: 1px solid var(--rule-on-ink);
  color: var(--text-on-ink-muted);
  font-size: var(--text-body-sm);
}

/* Body-size accent text on ink — same 6.4:1 seal as the link hover above. */
.footer__name {
  color: var(--seal);
  font-weight: 600;
}
</style>
