<script setup lang="ts">
/**
 * Industry detail (PRD FR15). Each page names 3–5 concrete, document-heavy
 * workflows real to that industry (the credibility gate, §17) plus a CTA.
 * Content is resolved by slug and passed to the presentational ArticleLayout.
 */
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '@unhead/vue'
import ArticleLayout from '@/components/sections/ArticleLayout'
import ClosingCta from '@/components/sections/ClosingCta'
import NotFoundPage from '@/pages/NotFoundPage.vue'
import { getIndustryContent } from '@/lib/content'
import { CLOSING } from '@/data/pages'
import { buildHead, jsonLd } from '@/lib/metadata'
import { breadcrumbSchema } from '@/lib/schema'

const route = useRoute()
const doc = computed(() => getIndustryContent(String(route.params.slug)))

const head = computed(() => {
  const d = doc.value
  if (!d) {
    return buildHead({
      title: 'Industry not found',
      description: 'That industry could not be found.',
      path: route.path,
      noindex: true,
    })
  }
  const path = `/industries/${d.slug}`
  return {
    ...buildHead({
      title: d.frontmatter.title,
      description: d.frontmatter.description,
      path,
      image: '/og/industries.png',
    }),
    script: [
      jsonLd(
        breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Industries', path: '/industries' },
          { name: d.frontmatter.title, path },
        ]),
      ),
    ],
  }
})
useHead(head)
</script>

<template>
  <template v-if="doc">
    <ArticleLayout
      :breadcrumbs="[{ label: 'Industries', to: '/industries' }, { label: doc.frontmatter.title }]"
      :title="doc.frontmatter.title"
      uppercase-title
      :html="doc.html"
    />
    <ClosingCta :title="CLOSING.title" :body="CLOSING.body" placement="industry-detail" />
  </template>
  <NotFoundPage v-else />
</template>
