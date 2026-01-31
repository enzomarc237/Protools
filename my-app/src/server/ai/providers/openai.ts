import OpenAI from "openai"
import { AIProvider, ModelInfo, GenerateOptions } from "./base"

export class OpenAIProvider extends AIProvider {
  private client: OpenAI

  constructor(apiKey: string, baseUrl?: string) {
    super(apiKey, baseUrl)
    this.client = new OpenAI({
      apiKey,
      baseURL: baseUrl,
    })
  }

  async fetchModels(): Promise<ModelInfo[]> {
    const response = await this.client.models.list()
    
    return response.data
      .filter(model => model.id.startsWith("gpt"))
      .map(model => ({
        id: model.id,
        name: model.id,
        contextWindow: this.getContextWindow(model.id),
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
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

  private getContextWindow(modelId: string): number {
    if (modelId.includes("gpt-4o")) return 128000
    if (modelId.includes("gpt-4-turbo")) return 128000
    if (modelId.includes("gpt-4")) return 8192
    if (modelId.includes("gpt-3.5-turbo-16k")) return 16384
    if (modelId.includes("gpt-3.5-turbo")) return 4096
    return 4096
  }
}
