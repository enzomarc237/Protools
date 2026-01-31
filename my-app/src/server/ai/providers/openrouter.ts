import OpenAI from "openai"
import { AIProvider, ModelInfo, GenerateOptions } from "./base"

export class OpenRouterProvider extends AIProvider {
  private client: OpenAI

  constructor(apiKey: string) {
    super(apiKey)
    this.client = new OpenAI({
      apiKey,
      baseURL: "https://openrouter.ai/api/v1",
    })
  }

  async fetchModels(): Promise<ModelInfo[]> {
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch models from OpenRouter")
    }

    const data = await response.json()
    
    return data.data.map((model: any) => ({
      id: model.id,
      name: model.name || model.id,
      contextWindow: model.context_length || 4096,
      pricing: model.pricing ? {
        input: parseFloat(model.pricing.prompt),
        output: parseFloat(model.pricing.completion),
      } : undefined,
    }))
  }

  async *generateStream(options: GenerateOptions): AsyncIterableIterator<string> {
    const stream = await this.client.chat.completions.create({
      model: options.model,
      messages: [
        { role: "system", content: options.systemPrompt },
        { role: "user", content: options.userPrompt },
      ],
      stream: true,
      temperature: options.temperature,
      max_tokens: options.maxTokens,
    })

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content
      if (content) {
        yield content
      }
    }
  }

  async testConnection(model: string): Promise<void> {
    await this.client.chat.completions.create({
      model,
      messages: [{ role: "user", content: "Hi" }],
      max_tokens: 5,
    })
  }
}
