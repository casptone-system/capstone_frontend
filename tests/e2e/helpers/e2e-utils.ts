import { APIRequestContext, request } from '@playwright/test'
import fs from 'fs'
import path from 'path'

export function loadCredentials() {
  const CRED_FILE = process.env.E2E_CREDENTIALS_FILE || path.join('C:', 'capstone', 'backend', 'backend-app', '.e2e-credentials.json')
  if (!fs.existsSync(CRED_FILE)) return null
  try { return JSON.parse(fs.readFileSync(CRED_FILE, 'utf8')) } catch { return null }
}

export async function apiRequest(token?: string): Promise<APIRequestContext> {
  return await request.newContext({
    baseURL: process.env.E2E_API_BASE || 'http://127.0.0.1:8000',
    extraHTTPHeaders: token ? { Authorization: `Bearer ${token}` } : {},
  })
}

export async function ensureUserHasRole(token: string, userId: number, role: string) {
  const api = await apiRequest(token)
  await api.post(`/api/admin/users/${userId}/roles`, { data: { role } }).catch(() => {})
}
