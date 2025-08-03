interface NewsArticle {
  title: string
  description: string
  source: { name: string }
  publishedAt: string
  content: string
}

export class ContextPool {
  private pool: NewsArticle[] = []
  private refillPromise: Promise<void> | null = null
  private lastRefillTime: number = 0
  private readonly CACHE_DURATION_MS = 60 * 60 * 1000 // 1 hour in milliseconds

  private isCacheValid(): boolean {
    return Date.now() - this.lastRefillTime < this.CACHE_DURATION_MS
  }

  async refillPool() {
    if (this.refillPromise) return this.refillPromise
    
    // If cache is still valid and we have articles, don't refill
    if (this.isCacheValid() && this.pool.length > 0) {
      return
    }

    this.refillPromise = (async () => {
      console.warn('Refilling context pool...')

      const apiKey = process.env.NEWS_API_KEY
      if (!apiKey) {
        throw new Error('NEWS_API_KEY environment variable is required')
      }

      try {
        while (true) {
          const response = await fetch(`https://newsapi.org/v2/top-headlines?country=us&pageSize=50&apiKey=${apiKey}`)
          if (response.status === 429) {
            console.warn('Rate limit exceeded, retrying in 30 seconds...')
            await new Promise((resolve) => setTimeout(resolve, 30000))
          } else if (response.status === 401) {
            throw new Error('Invalid NEWS_API_KEY')
          } else if (!response.ok) {
            throw new Error(`NewsAPI error: ${response.status} ${response.statusText}`)
          } else {
            const apiResponse = await response.json()
            this.pool = apiResponse.articles.filter((article: any) => 
              article.title && 
              article.description && 
              article.title !== '[Removed]' && 
              article.description !== '[Removed]'
            )
            this.lastRefillTime = Date.now()
            console.warn(`Context pool refilled with ${this.pool.length} articles. Cache valid until ${new Date(this.lastRefillTime + this.CACHE_DURATION_MS).toISOString()}`)
            break
          }
        }
      } finally {
        this.refillPromise = null
      }
    })()
    return this.refillPromise
  }

  async getContext() {
    // Check if we need to refill due to cache expiry or empty pool
    if (!this.isCacheValid() || this.pool.length === 0) {
      await this.refillPool()
    }
    return this.pool.pop()
  }
}
export const contextPool = new ContextPool()
