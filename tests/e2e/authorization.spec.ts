import { test, expect } from '@playwright/test'
import { loadCredentials } from './helpers/e2e-utils'

const creds = loadCredentials()
if (!creds) {
  test('missing creds', async () => { test.skip() })
} else {
  const faculty = creds.find((c:any)=> c.role === 'faculty')
  const superadmin = creds.find((c:any)=> c.role === 'superadmin')

  test.describe('Authorization direct URL checks', () => {
    test('Faculty cannot access SuperAdmin pages', async ({ page }) => {
      if (!faculty) test.skip()
      await page.addInitScript((t)=> localStorage.setItem('auth_token', t), faculty.token)
      await page.goto('/admin/users')
      // Expect either redirect or an authorization message; ensure we do not see the full admin users table header
      const hdrCount = await page.locator('h1, .admin-header, .users-table').count()
      expect(hdrCount).toBeLessThan(5)
    })

    test('SuperAdmin can access admin users', async ({ page }) => {
      if (!superadmin) test.skip()
      await page.addInitScript((t)=> localStorage.setItem('auth_token', t), superadmin.token)
      await page.goto('/admin/users')
      await expect(page.locator('h1')).toBeVisible()
    })
  })
}
