import { GoogleGenerativeAI, StartChatParams, SchemaType } from '@google/generative-ai'

const apiKey = process.env.GEMINI_API_KEY as string
const genAI = new GoogleGenerativeAI(apiKey)

export async function generateVoiceChallenge(userInput: string) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-exp-1206',
    systemInstruction: `You are a discord bot. Daily, or on command, you will output a "voice challenge". The challenge will be for discord members of the challenge to use as a basis for a character voice 1 line, 1 character improv scene. It should be in this format:

  Voice challenges should come with pitch and speed variations. This refers to how fast someone should speak (Fast, medium, or slow), as well as how high or low their voice is (High, Mid, Low).

  Additionally, the user may supply some extra information. Please use this as inspiration, but do not output anything political or religious in nature. Keep suggestions PG-13.

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
  "bonus": "fast speaking and low pitch."
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
      {
        role: 'model',
        parts: [
          {
            text: `\`\`\`json

{
"title": "Shivering Reporter",
"challenge": "You are a reporter delivering a live update on the freezing temperatures. Make sure to incorporate \\"It's colder than a polar bear's toenails out here!\\"",
"bonus": "fast speaking and high pitch."
}
\`\`\``,
          },
        ],
      },
    ],
  })
  const result = await chatSession.sendMessage(userInput)
  return result.response.text()
}
