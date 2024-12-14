export class ContextPool {
  private pool: { question: string; answer: string; category: string; difficulty: string; choices: string[] }[] = []
  private refillPromise: Promise<void> | null = null

  async refillPool() {
    if (this.refillPromise) return this.refillPromise
    this.refillPromise = (async () => {
      console.warn('Refilling context pool...')

      try {
        while (true) {
          const response = await fetch('https://opentdb.com/api.php?amount=50&encode=url3986')
          if (response.status === 429) {
            console.warn('Rate limit exceeded, retrying in 30 seconds...')
            await new Promise((resolve) => setTimeout(resolve, 30000))
          } else {
            const apiResponse = await response.json()
            this.pool = apiResponse.results.map((result: any) => ({
              question: decodeURIComponent(result.question),
              category: decodeURIComponent(result.category),
              difficulty: decodeURIComponent(result.difficulty),
              answer: decodeURIComponent(result.correct_answer),
              choices: result.incorrect_answers?.length
                ? [
                    ...result.incorrect_answers.map((choice: string) => decodeURIComponent(choice)),
                    decodeURIComponent(result.correct_answer),
                  ].sort(() => Math.random() - 0.5)
                : [],
            }))
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
    while (this.pool.length === 0) {
      await this.refillPool()
    }
    return this.pool.pop()
  }
}
export const contextPool = new ContextPool()
