export function debounce<T extends (...args: any[]) => void>(fn: T, waitMs = 250): T {
  let timer: ReturnType<typeof setTimeout> | undefined

  const wrapped = ((...args: Parameters<T>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn(...args)
    }, waitMs)
  }) as T

  return wrapped
}
