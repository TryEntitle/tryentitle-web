import { test, expect } from '@playwright/test'
import { HERO_CTA_LABEL, ROUTES } from './routes'

/**
 * NFR1 — responsive from 360px through 1920px with no horizontal scroll at any
 * width. The widths below are the manual-check list from the PRD, asserted
 * automatically so a regression cannot reach the release candidate unnoticed.
 */

const WIDTHS = [360, 390, 768, 1024, 1280, 1440, 1920]

test.describe('no horizontal overflow', () => {
  // Viewport is driven explicitly here, so run it once rather than per device.
  test.skip(({ viewport }) => (viewport?.width ?? 0) < 860, 'runs once, on the desktop project')

  for (const width of WIDTHS) {
    test(`at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })

      for (const route of ROUTES) {
        await page.goto(route)
        const overflows = await page.evaluate(
          () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
        )
        expect(overflows, `${route} scrolls horizontally`).toBe(false)
      }
    })
  }
})

test.describe('hero above the fold', () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) < 860, 'runs once, on the desktop project')

  test('the hero CTA is reachable without scrolling at 360×640 (FR7)', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 })
    await page.goto('/')
    await expect(
      page.locator('main').getByRole('link', { name: HERO_CTA_LABEL }).first(),
    ).toBeInViewport()
  })
})
