export interface ModelInfo {
  id: string
  name: string
  contextWindow: number
  pricing?: {
    input: number
    output: number
  }
}

export interface GenerateOptions {
  model: string
  systemPrompt: string
  userPrompt: string
  temperature: number
  maxTokens: number
}

export abstract class AIProvider {
  protected apiKey: string
  protected baseUrl?: string

  constructor(apiKey: string, baseUrl?: string) {
    this.apiKey = apiKey
    this.baseUrl = baseUrl
  }

  abstract fetchModels(): Promise<ModelInfo[]>
  abstract generateStream(options: GenerateOptions): AsyncIterableIterator<string>
  abstract testConnection(model: string): Promise<void>
}
