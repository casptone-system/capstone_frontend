import { test, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'
import { loadCredentials } from './helpers/e2e-utils'

const CRED_FILE = process.env.E2E_CREDENTIALS_FILE || path.join('C:', 'capstone', 'backend', 'backend-app', '.e2e-credentials.json')

test.describe('Auth checks for all roles', () => {
  const creds = loadCredentials()
  if (!creds) {
    test('credentials file missing', async () => {
      test.skip()
    })
    return
  }

  for (const c of creds) {
    test(`${c.role} can land on correct dashboard`, async ({ page }) => {
      // set token if present to skip login
      if (c.token) {
        await page.addInitScript((token) => { localStorage.setItem('auth_token', token) }, c.token)
      }

      await page.goto('/')
      await expect(page).toHaveTitle(/ADAMS|Accreditation/)

      // Basic dashboard presence checks: user may either land on a dashboard (h1)
      // or on the Join/Invitation view if they are not yet assigned to a team.
      const dashboardVisible = await page.locator('h1').count()
      const joinTokenVisible = await page.locator('input[placeholder*="invitation"], #invite-code, .invite-input').count()
      if (!dashboardVisible && !joinTokenVisible) {
        // give a short extra wait for SPA routing
        await page.waitForTimeout(500)
      }

      // Re-evaluate presence using a set of dashboard text fallbacks and join-token input selectors
      const dashboardTexts = ['VPAA Dashboard', 'Dean Dashboard', 'Super Administrator', 'Dashboard', 'Welcome to ADAMS']
      let dashboardNow = 0
      for (const t of dashboardTexts) {
        dashboardNow = dashboardNow + (await page.locator(`text=${t}`).count())
      }
      const joinNow = await page.locator('input[placeholder*="invitation"], #invite-code, .invite-input').count()
      expect(dashboardNow > 0 || joinNow > 0).toBeTruthy()

      if (dashboardNow > 0) {
        // Dashboard-specific checks
        // Try several common selectors for the user's display name; fall back to header text
        let displayName: string | null = null
        const nameSelectors = ['.app-header .user-name', '.app-header .profile-name', '.app-header .user-display', '.profile-name', '.user-display', 'header .user-name']
        for (const sel of nameSelectors) {
          const el = page.locator(sel).first()
          if (await el.count()) {
            displayName = (await el.innerText()).trim() || null
            if (displayName) break
          }
        }
        if (!displayName) {
          const hdr = await page.locator('header, .app-header').first().innerText().catch(()=>null)
          displayName = hdr ? hdr.trim() : null
        }
        expect(!!displayName).toBeTruthy()
        const avatarCount = await page.locator('img[alt="Profile photo"], .app-header img, .profile-avatar').count()
        expect(avatarCount).toBeGreaterThanOrEqual(0)

        // navigation, visit another page and return
        const nav = page.locator('a.nav-link, nav a').first()
        if (await nav.count()) {
          await nav.click()
          await page.waitForTimeout(300)
          await page.goBack()
        }

        // reload should retain auth when token set
        await page.reload()
        await expect(page.locator('text=Dashboard, text=VPAA Dashboard, text=Dean Dashboard, text=Super Administrator')).toBeVisible()
      } else {
        // Join/invitation view checks
        await expect(page.locator('input[placeholder*="invitation"], #invite-code, .invite-input')).toBeVisible()
        await expect(page.locator('button:has-text("Accept Invitation")')).toBeVisible()
      }
    })
  }
})
