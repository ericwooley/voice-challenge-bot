import { input } from '@inquirer/prompts'
import { generateVoiceChallenge } from './prompt'

async function main() {
  const context = await input({
    message: 'Please provide context for the voice challenge:',
  })

  const response = await generateVoiceChallenge(context)
  console.log('Generated Voice Challenge:', response)
}

main()
