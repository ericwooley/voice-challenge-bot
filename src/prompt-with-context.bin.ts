import { generateVoiceChallenge } from './prompt'

async function main() {
  const apiResponse = await (await fetch('https://opentdb.com/api.php?amount=1')).json()
  const question = apiResponse.results[0].question
  const answer = apiResponse.results[0].correct_answer
  const context = `${question}\nAnswer: ${answer}`
  console.warn('Context:', context)
  console.warn('Generating voice challenge...')
  const response = await generateVoiceChallenge(context)
  if (!response) {
    console.error('Failed to generate voice challenge.')
    process.exit(1)
  }
  console.log(JSON.parse(response))
}

main()
