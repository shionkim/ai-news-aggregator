import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// Choose provider via environment variable: "openai" or "gemini"
type Provider = 'openai' | 'gemini'
const provider: Provider = (process.env.TRANSLATE_PROVIDER as Provider) || 'openai'

async function translateWithOpenAI(prompt: string, model?: string) {
  const completion = await openai.chat.completions.create({
    model: model || process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0,
  })
  return completion.choices[0].message?.content?.trim() || ''
}

async function translateWithGemini(prompt: string, model?: string) {
  const genModel = genAI.getGenerativeModel({
    model: model || process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite',
  })
  const response = await genModel.generateContent(prompt)
  return response.response.text().trim()
}

async function translatePrompt(prompt: string): Promise<string> {
  if (provider === 'openai') return translateWithOpenAI(prompt)
  return translateWithGemini(prompt)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const text: string = body?.text || ''
    const targetLang: string = body?.targetLang || 'English'

    if (!text) return NextResponse.json({ translated: '' })

    const prompt = `
    Translate the following text into ${targetLang}.
    The output MUST be in ${targetLang} (do not use any other language).
    Preserve all paragraph breaks and formatting.
    Do not include explanations, commentary, or summaries.
    Return only the translated text.

    TEXT:
    ${text}
    `.trim()

    // 🔍 LOG FULL PROMPT
    console.log('========== TRANSLATION REQUEST ==========')
    console.log('Provider:', provider)
    console.log('Target language:', targetLang)
    console.log('Prompt sent to model:\n', prompt)
    console.log('========================================')

    const translated = await translatePrompt(prompt)

    // 🔍 LOG FULL RESPONSE
    console.log('========== TRANSLATION RESPONSE ==========')
    console.log(translated)
    console.log('========================================')

    console.log('/api/translate-paragraphs prompt:', prompt)

    return NextResponse.json({ translated })
  } catch (err: any) {
    console.error('/api/translate-paragraphs error:', err)
    return NextResponse.json({ error: err.message || 'Translation failed' }, { status: 500 })
  }
}
