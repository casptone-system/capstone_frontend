const apiBase = process.env.VUE_APP_API_BASE_URL || window.location.origin

export async function joinTeamWithCode(code: string) {
  const endpoint = `${apiBase.replace(/\/$/, '')}/auth/join-team`
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ code })
  })

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({ error: 'Failed to join team' }))
    throw new Error(errorPayload.error || 'Failed to join team')
  }

  return response.json()
}
