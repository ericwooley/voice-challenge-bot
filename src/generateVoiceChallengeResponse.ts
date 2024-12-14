import { contextPool } from './ContextPool'
import { generateVoiceChallenge } from './prompt'

export async function generateVoiceChallengeResponse() {
  const contextData = await contextPool.getContext()
  const context = `
          *${contextData?.question}*
          ${contextData?.choices.map((choice, index) => `${index + 1}. ${choice}`).join('\n')}\n\n
Answer: ${contextData?.answer}`
  const userResponse = await generateVoiceChallenge(context)
  if (!userResponse) {
    return 'Failed to generate voice challenge.'
  }

  return `
### Voice Challenge: ${userResponse.title}
\`\`\`
${userResponse.challenge}
\`\`\`
*Bonus Points if your voice has a ${userResponse.bonus.toLowerCase().replace(/\.$/, '')}.*
          `.trim()
}
