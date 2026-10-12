<script setup lang="ts">
/**
 * Blog post (PRD FR17). Renders the document body — headings, lists, links,
 * code, images, blockquotes — with auto-generated heading anchors (added at
 * build time by markdown-it-anchor), reading time, and Article JSON-LD.
 */
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '@unhead/vue'
import ArticleLayout from '@/components/sections/ArticleLayout'
import ClosingCta from '@/components/sections/ClosingCta'
import NotFoundPage from '@/pages/NotFoundPage.vue'
import { getBlogPost } from '@/lib/content'
import { CLOSING } from '@/data/pages'
import { buildHead, jsonLd } from '@/lib/metadata'
import { articleSchema } from '@/lib/schema'
import { formatDate, isoDate, readingLabel } from '@/lib/format'

const route = useRoute()
const post = computed(() => getBlogPost(String(route.params.slug)))

const head = computed(() => {
  const p = post.value
  if (!p) {
    return buildHead({
      title: 'Post not found',
      description: 'That post could not be found.',
      path: route.path,
      noindex: true,
    })
  }
  const path = `/blog/${p.slug}`
  return {
    ...buildHead({
      title: p.frontmatter.title,
      description: p.frontmatter.description,
      path,
      type: 'article',
      image: '/og/blog.png',
    }),
    script: [
      jsonLd(
        articleSchema({
          title: p.frontmatter.title,
          description: p.frontmatter.description,
          path,
          datePublished: p.frontmatter.publishedAt,
          dateModified: p.frontmatter.updatedAt,
        }),
      ),
    ],
  }
})
useHead(head)
</script>

<template>
  <template v-if="post">
    <ArticleLayout
      :breadcrumbs="[{ label: 'Blog', to: '/blog' }, { label: post.frontmatter.title }]"
      uppercase-title
      :title="post.frontmatter.title"
      :html="post.html"
      :toc="post.toc"
    >
      <template #meta>
        <p class="post-meta">
          <time :datetime="isoDate(post.frontmatter.publishedAt)">
            {{ formatDate(post.frontmatter.publishedAt) }}
          </time>
          <span aria-hidden="true">·</span>
          <span>{{ readingLabel(post.readingMinutes) }}</span>
        </p>
      </template>
    </ArticleLayout>
    <ClosingCta :title="CLOSING.title" :body="CLOSING.body" placement="blog-post" />
  </template>
  <NotFoundPage v-else />
</template>

<style scoped>
.post-meta {
  display: flex;
  gap: var(--space-2);
  font-family: var(--font-mono);
  font-size: var(--text-utility);
  letter-spacing: var(--tracking-utility);
  text-transform: uppercase;
  color: var(--text-on-bond-muted);
}
</style>
