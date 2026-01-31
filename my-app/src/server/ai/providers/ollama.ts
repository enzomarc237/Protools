import { AIProvider, ModelInfo, GenerateOptions } from "./base"

export class OllamaProvider extends AIProvider {
  private baseUrl: string

  constructor(apiKey: string, baseUrl: string = "http://localhost:11434") {
    super(apiKey, baseUrl)
    this.baseUrl = baseUrl
  }

  async fetchModels(): Promise<ModelInfo[]> {
    const response = await fetch(`${this.baseUrl}/api/tags`)

    if (!response.ok) {
      throw new Error("Failed to fetch models from Ollama. Is it running?")
    }

    const data = await response.json()
    
    return data.models.map((model: any) => ({
      id: model.name,
      name: model.name,
      contextWindow: 4096, // Default, varies by model
    }))
  }

  async *generateStream(options: GenerateOptions): AsyncIterableIterator<string> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: options.model,
        prompt: options.userPrompt,
        system: options.systemPrompt,
        stream: true,
        options: {
          temperature: options.temperature,
          num_predict: options.maxTokens,
        },
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to generate from Ollama")
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error("No response body")
    }

    const decoder = new TextDecoder()
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split("\n").filter(line => line.trim())

      for (const line of lines) {
        try {
          const data = JSON.parse(line)
          if (data.response) {
            yield data.response
          }
        } catch {
          // Ignore invalid JSON
        }
      }
    }
  }

  async testConnection(model: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt: "Hi",
        stream: false,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to connect to Ollama")
    }
  }
}
