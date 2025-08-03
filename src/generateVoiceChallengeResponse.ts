import { contextPool } from './ContextPool'
import { generateVoiceChallenge } from './prompt'

export async function generateVoiceChallengeResponse() {
  const contextData = await contextPool.getContext()
  const context = contextData 
    ? `Recent News: "${contextData.title}" - ${contextData.description} (Source: ${contextData.source.name})`
    : 'No current news context available.'
    
  const userResponse = await generateVoiceChallenge(context)
  if (!userResponse) {
    return 'Failed to generate voice challenge.'
  }

  return `
### Voice Challenge: ${userResponse.title}
\`\`\`
${userResponse.challenge}
\`\`\`
Bonus points if your voice has a **${userResponse.bonus.toLowerCase().replace(/\.$/, '')}.**
          `.trim()
}
