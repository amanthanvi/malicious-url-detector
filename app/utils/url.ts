export function validateURL(url: string): boolean {
  const urlPattern = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+(\/[^\s]*)?$/
  return urlPattern.test(url)
}

export function addHttpScheme(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `http://${url}`
  }
  return url
}

export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(addHttpScheme(url))
    return urlObj.hostname
  } catch {
    return url
  }
}

export function isIPAddress(str: string): boolean {
  const ipPattern = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/
  return ipPattern.test(str)
}

export function formatUrl(url: string): string {
  const normalized = addHttpScheme(url)
  if (normalized.length > 50) {
    return normalized.substring(0, 50) + '...'
  }
  return normalized
}