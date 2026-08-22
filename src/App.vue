<script setup lang="ts">
/**
 * App shell — the chrome present on every page (PRD §11.2 root layout):
 * skip link, sticky header, the routed <main> landmark, the newsletter band,
 * and the footer.
 *
 * `<main id="main" tabindex="-1">` is the skip-link target and the element that
 * receives focus on route change (wired in main.ts) so keyboard and
 * screen-reader users land in the new page's content, not back at the top.
 */
import { RouterView } from 'vue-router'
import SkipToContent from '@/components/layout/SkipToContent'
import SiteHeader from '@/components/layout/SiteHeader'
import NewsletterBand from '@/components/layout/NewsletterBand'
import SiteFooter from '@/components/layout/SiteFooter'
</script>

<template>
  <SkipToContent />
  <SiteHeader />
  <!--
    Route transition: the incoming page rises into place. Driven by a class that
    main.ts toggles on this element (`.route-entering` in motion.css), NOT by
    Vue's <Transition>.

    That is deliberate and load-bearing. <Transition> requires its child to have
    exactly ONE root element, and every page here is a fragment of sibling
    <Section> bands by design — HomePage alone returns fourteen. Wrapping a
    fragment in <Transition> silently renders nothing, and wrapping each page in
    a div to satisfy it would insert a box between <main> and the bands that the
    layout does not account for. Animating the landmark itself sidesteps both.

    Enter-only and transform-only: holding the outgoing page on screen delays the
    new one for nothing gained, and fading text is what this site does not do.
  -->
  <main id="main" tabindex="-1">
    <RouterView />
  </main>
  <NewsletterBand />
  <SiteFooter />
</template>

<style scoped>
main:focus {
  outline: none;
}
</style>
