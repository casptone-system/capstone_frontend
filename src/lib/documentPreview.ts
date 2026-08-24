export type PreviewKind = 'pdf' | 'image' | 'video' | 'audio'

const mimeFromName = (name: string): string => {
  const ext = name.split('.').pop()?.toLowerCase() || ''
  if (ext === 'pdf') return 'application/pdf'
  if (['png'].includes(ext)) return 'image/png'
  if (['jpg', 'jpeg'].includes(ext)) return 'image/jpeg'
  if (ext === 'gif') return 'image/gif'
  if (ext === 'webp') return 'image/webp'
  if (ext === 'mp4') return 'video/mp4'
  if (ext === 'webm') return 'video/webm'
  if (ext === 'mp3') return 'audio/mpeg'
  if (ext === 'wav') return 'audio/wav'
  if (ext === 'm4a') return 'audio/mp4'
  return ''
}

export const previewKindFromMeta = (mime?: string | null, name?: string | null): PreviewKind | null => {
  const type = String(mime || '').toLowerCase()
  const filename = String(name || '')
  const ext = filename.split('.').pop()?.toLowerCase() || ''

  if (type.includes('pdf') || ext === 'pdf') return 'pdf'
  if (type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) return 'image'
  if (type.startsWith('video/') || ['mp4', 'webm', 'mov'].includes(ext)) return 'video'
  if (type.startsWith('audio/') || ['mp3', 'wav', 'm4a'].includes(ext)) return 'audio'
  return null
}

export const typedPreviewBlob = (blob: Blob, name?: string | null, mime?: string | null): Blob => {
  const nextType = mime || blob.type || mimeFromName(String(name || ''))
  if (!nextType || blob.type === nextType) {
    return blob
  }

  return new Blob([blob], { type: nextType })
}

export const openBlobInNewTab = (blob: Blob, name?: string | null, mime?: string | null): void => {
  const typed = typedPreviewBlob(blob, name, mime)
  const url = URL.createObjectURL(typed)
  const opened = window.open(url, '_blank', 'noopener')

  if (!opened) {
    URL.revokeObjectURL(url)
    throw new Error('Pop-up blocked. Allow pop-ups to preview this file.')
  }

  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

export const isJsonBlob = (blob: Blob): boolean =>
  String(blob.type || '').includes('json') || String(blob.type || '').includes('text/html')
