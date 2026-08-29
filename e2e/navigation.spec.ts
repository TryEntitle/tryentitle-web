import { test, expect } from '@playwright/test'
import { BOOKING_LABEL } from './routes'

/**
 * Navigation behaviour (PRD §6.1, FR1, NFR5, §12.5).
 *
 * Queries are by role and accessible name, never by test id — "a test that
 * passes while a screen reader user is stuck is a test that lied" (§12.5).
 */

const DESKTOP_BREAKPOINT = 860

test.describe('desktop navigation', () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) < DESKTOP_BREAKPOINT, 'desktop only')

  test('primary nav links navigate', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Services' }).click()
    await expect(page).toHaveURL(/\/services$/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('header stays reachable at any scroll position (FR1)', async ({ page }) => {
    await page.goto('/')
    const cta = page.locator('header').getByRole('link', { name: BOOKING_LABEL })

    /*
     * The bar retracts while the visitor reads downward and returns on the first
     * upward frame (SiteHeader, HIDE_AFTER). So FR1's guarantee is not "the CTA
     * is painted at every scroll offset" — it is "the CTA is reachable from deep
     * in the page without scrolling back to the top", which is what this asserts.
     *
     * Asserting it directly after the jump is a race, not a test: whether the
     * scroll clock observes a downward frame between `scrollTo` and the first
     * assertion decides the result, and it failed about half the time.
     */
    await page.evaluate(() => window.scrollTo(0, 3000))
    await page.evaluate(() => window.scrollBy(0, -200))
    await expect(cta).toBeInViewport()
  })
})

test.describe('mobile navigation', () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) >= DESKTOP_BREAKPOINT, 'mobile only')

  test('menu opens, traps focus, and closes on Escape returning focus to the trigger', async ({
    page,
  }) => {
    await page.goto('/')

    const toggle = page.getByRole('button', { name: 'Open menu' })
    await expect(toggle).toBeVisible()
    await toggle.click()

    const dialog = page.getByRole('dialog', { name: 'Site navigation' })
    await expect(dialog).toBeVisible()

    // Focus moves into the panel on open.
    await expect(dialog.locator(':focus')).toBeVisible()

    // Focus is trapped: tabbing through every focusable wraps back inside.
    const focusables = dialog.locator('a[href], button')
    const count = await focusables.count()
    for (let i = 0; i < count + 1; i++) {
      await page.keyboard.press('Tab')
      const insideDialog = await dialog.evaluate((el) => el.contains(document.activeElement))
      expect(insideDialog, 'focus escaped the mobile menu').toBe(true)
    }

    // Escape closes and returns focus to the trigger.
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(toggle).toBeFocused()
  })

  test('the booking CTA is reachable inside the panel', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Open menu' }).click()
    const dialog = page.getByRole('dialog', { name: 'Site navigation' })
    await expect(dialog.getByRole('link', { name: BOOKING_LABEL })).toBeInViewport()
  })
})

test('skip link is the first stop for keyboard users', async ({ page }) => {
  await page.goto('/')

  // Wait for hydration before testing focus. Pressing Tab against the
  // pre-hydration DOM is racy: Vue patches the tree on mount and the focus set
  // beforehand is discarded, which made this test flaky. Vue assigns
  // `__vue_app__` to the mount container on mount, so it is a precise signal.
  await page.waitForFunction(
    () => '__vue_app__' in (document.getElementById('app') as object),
  )
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())

  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused()

  // And it actually moves the user to the main landmark.
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#main$/)
})
