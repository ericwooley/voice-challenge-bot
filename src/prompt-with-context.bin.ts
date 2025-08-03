import { ContextPool } from './ContextPool'
import { generateVoiceChallenge } from './prompt'

async function main() {
  const contextPool = new ContextPool()
  for (let i = 0; i < 15; i++) {
    const contextData = await contextPool.getContext()
    if (!contextData) {
      console.error('Failed to get context.')
      process.exit(1)
    }
    const context = `Recent News: "${contextData.title}" - ${contextData.description} (Source: ${contextData.source.name})`
    console.warn('Context:', context)
    console.warn('Generating voice challenge...')
    const response = await generateVoiceChallenge(context)
    if (!response) {
      console.error('Failed to generate voice challenge.')
      process.exit(1)
    }
    console.log(response)
  }
}

main()
