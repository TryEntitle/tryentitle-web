import { readFileSync } from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'
import MarkdownIt from 'markdown-it'
import anchor from 'markdown-it-anchor'
import matter from 'gray-matter'
import readingTime from 'reading-time'
import { z } from 'zod'
import {
  blogFrontmatterSchema,
  industryFrontmatterSchema,
  legalFrontmatterSchema,
  serviceFrontmatterSchema,
  type TocEntry,
} from '../src/types/content'

/**
 * md-content — compiles `src/content/**​/*.md` to typed data modules AT BUILD
 * TIME (PRD §11.5). Frontmatter is Zod-validated per collection, so a content
 * mistake is a build failure, not a production bug. The markdown parser runs
 * only here in Node — the client receives rendered HTML strings, never the
 * parser (protecting the per-route JS budget, NFR2).
 */

const SCHEMAS: Record<string, z.ZodTypeAny> = {
  services: serviceFrontmatterSchema,
  industries: industryFrontmatterSchema,
  blog: blogFrontmatterSchema,
  legal: legalFrontmatterSchema,
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
}

function createRenderer(): MarkdownIt {
  /*
   * TYPOGRAPHER OFF. Legal text has to survive the renderer character for
   * character, and both halves of this feature rewrote it:
   *
   *   - `replacements` turned "(c)" into "©", which corrupted the GDPR citation
   *     "Art. 6(1)(c)".
   *   - `smartquotes` turned every straight " and ' into curly ones, so a
   *     policy supplied with straight quotes — ("TryEntitle," "we," "us") —
   *     published as ("TryEntitle," "we," "us"), not the document that was
   *     signed off.
   *
   * The content files carry the punctuation they mean, em dashes included.
   */
  const md = new MarkdownIt({ html: false, linkify: true, typographer: false })
  md.use(anchor, {
    slugify,
    permalink: anchor.permalink.linkInsideHeader({
      symbol: '#',
      class: 'header-anchor',
      placement: 'after',
      // Decorative for assistive tech, so it must also be removed from the tab
      // order — an aria-hidden element that is still focusable is a WCAG
      // failure (axe: aria-hidden-focus). The heading text carries the meaning.
      ariaHidden: true,
      renderAttrs: () => ({ tabindex: '-1' }),
    }),
  })
  return md
}

const md = createRenderer()

/** Which collection a file belongs to, from its path under content/. */
function collectionOf(id: string): string | null {
  const norm = id.replace(/\\/g, '/')
  const match = norm.match(/\/content\/([^/]+)\//)
  return match ? match[1]! : null
}

function extractToc(tokens: ReturnType<MarkdownIt['parse']>): TocEntry[] {
  const toc: TocEntry[] = []
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]!
    if (t.type !== 'heading_open') continue
    const depth = Number(t.tag.slice(1))
    if (depth !== 2 && depth !== 3) continue
    const inline = tokens[i + 1]
    const text = inline?.content ?? ''
    const id = t.attrGet('id') ?? slugify(text)
    toc.push({ depth, text, id })
  }
  return toc
}

function firstParagraph(tokens: ReturnType<MarkdownIt['parse']>): string {
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i]!.type === 'paragraph_open') {
      return tokens[i + 1]?.content ?? ''
    }
  }
  return ''
}

function compile(id: string): string {
  const collection = collectionOf(id)
  if (!collection) throw new Error(`md-content: cannot determine collection for ${id}`)

  const schema = SCHEMAS[collection]
  const raw = readFileSync(id, 'utf-8')
  const { data, content } = matter(raw)

  const slug = path.basename(id, '.md')

  if (schema) {
    const result = schema.safeParse(data)
    if (!result.success) {
      const issues = result.error.issues
        .map((iss) => `  - ${iss.path.join('.') || '(root)'}: ${iss.message}`)
        .join('\n')
      throw new Error(`md-content: invalid frontmatter in ${collection}/${slug}.md\n${issues}`)
    }
  }

  const tokens = md.parse(content, {})
  const html = md.renderer.render(tokens, md.options, {})
  const toc = extractToc(tokens)
  const excerpt = firstParagraph(tokens)
  const readingMinutes = Math.max(1, Math.ceil(readingTime(content).minutes))

  const doc = {
    slug,
    frontmatter: schema ? schema.parse(data) : data,
    html,
    toc,
    readingMinutes,
    excerpt,
  }

  return `export default ${JSON.stringify(doc)}`
}

export function mdContent(): Plugin {
  return {
    name: 'tryentitle:md-content',
    enforce: 'pre',
    load(id) {
      const clean = id.split('?')[0]!
      if (!clean.endsWith('.md')) return null
      if (!clean.replace(/\\/g, '/').includes('/content/')) return null
      return compile(clean)
    },
  }
}
