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

    const prompt = `Translate the following text into ${targetLang}. Preserve paragraph breaks and formatting. Return ONLY the translated text with the same paragraph structure and do not add any commentary. If the next is already written in ${targetLang}, return the original text unchanged.\n\n${text}`

    const translated = await translatePrompt(prompt)

    return NextResponse.json({ translated })
  } catch (err: any) {
    console.error('/api/translate-paragraphs error:', err)
    return NextResponse.json({ error: err.message || 'Translation failed' }, { status: 500 })
  }
}
