import { GoogleGenerativeAI } from "@google/generative-ai"
import { AIProvider, ModelInfo, GenerateOptions } from "./base"

export class GeminiProvider extends AIProvider {
  private client: GoogleGenerativeAI

  constructor(apiKey: string) {
    super(apiKey)
    this.client = new GoogleGenerativeAI(apiKey)
  }

  async fetchModels(): Promise<ModelInfo[]> {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`
    )

    if (!response.ok) {
      throw new Error("Failed to fetch models from Gemini")
    }

    const data = await response.json()
    
    return data.models
      .filter((model: any) => model.name.includes("gemini"))
      .map((model: any) => ({
        id: model.name.replace("models/", ""),
        name: model.displayName || model.name,
        contextWindow: model.inputTokenLimit || 32768,
      }))
  }

  async *generateStream(options: GenerateOptions): AsyncIterableIterator<string> {
    const model = this.client.getGenerativeModel({
      model: options.model,
    })

    const result = await model.generateContentStream({
      contents: [{ role: "user", parts: [{ text: options.userPrompt }] }],
      generationConfig: {
        temperature: options.temperature,
        maxOutputTokens: options.maxTokens,
      },
    })

    for await (const chunk of result.stream) {
      const content = chunk.text()
      if (content) {
        yield content
      }
    }
  }

  async testConnection(model: string): Promise<void> {
    const genModel = this.client.getGenerativeModel({ model })
    await genModel.generateContent("Hi")
  }
}
