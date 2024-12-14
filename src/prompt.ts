import { GoogleGenerativeAI, StartChatParams, SchemaType } from '@google/generative-ai'

const apiKey = process.env.GEMINI_API_KEY as string
const genAI = new GoogleGenerativeAI(apiKey)

export async function generateVoiceChallenge(
  userInput: string
): Promise<{ title: string; challenge: string; bonus: string }> {
  let retry = 0
  while (retry < 3) {
    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-exp-1206',
        systemInstruction: `You are a discord bot. Daily, or on command, you will output a "voice challenge". The challenge will be for discord members of the challenge to use as a basis for a character voice 1 line, 1 character improv scene. It should be in this format:

  Voice challenges should come with pitch and speed variations. This refers to how fast someone should speak (Fast, medium, or slow), as well as how high or low their voice is (High, Mid, Low).

  Additionally, the user may supply some extra information. Please use this as inspiration for a funny prompt, but do not output anything political or religious in nature. Keep suggestions PG-13.

  The bonus should be a suggestion for a specific speed and pitch. For example, "fast speed and low pitch.", "slow speed and high pitch.", etc. there should never be any punctuation at the end of the bonus, or any other words besides the speed and pitch. "<speed> speed and <pitch> pitch".

  \`\`\`
  {
  "title": "<title>",
  "challenge: "<challenge>",
  "bonus": "<bonus points for a specific speed and pitch>"
  }
  \`\`\`
  For example:
  \`\`\`
  {
  "title":"Deranged YouTube Channel"
  "challenge": "You are a first time youtuber creating their sign off. Make sure to incorporate \\"Don’t forget to click like and subscribe!!!\\"",
  "bonus": "fast speed and low pitch."
  }
  \`\`\`
  `,
      })

      const generationConfig: StartChatParams['generationConfig'] = {
        temperature: 1,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            title: {
              type: SchemaType.STRING,
            },
            challenge: {
              type: SchemaType.STRING,
            },
            bonus: {
              type: SchemaType.STRING,
            },
          },
        },
      }
      const chatSession = model.startChat({
        generationConfig,
        history: [
          {
            role: 'user',
            parts: [{ text: userInput }],
          },
        ],
      })
      const result = await chatSession.sendMessage(userInput)
      return JSON.parse(result.response.text())
    } catch (e) {
      console.error(e)
      retry++
    }
  }
  return {
    title: 'Failed to generate voice challenge',
    challenge: 'Failed to generate voice challenge',
    bonus: 'Failed to generate voice challenge',
  }
}
