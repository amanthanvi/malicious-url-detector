import { LRUCache } from 'lru-cache'
import { AnalysisResult } from '@/app/types'

// Create an LRU cache with 15-minute TTL and 100 item limit
const cache = new LRUCache<string, AnalysisResult>({
  max: 100,
  ttl: 1000 * 60 * 15, // 15 minutes
})

export async function getCache(key: string): Promise<AnalysisResult | undefined> {
  return cache.get(key)
}

export async function setCache(key: string, value: AnalysisResult): Promise<void> {
  cache.set(key, value)
}

export function clearCache(): void {
  cache.clear()
}