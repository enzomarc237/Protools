import { AIProvider } from "./base"
import { OpenAIProvider } from "./openai"
import { OpenRouterProvider } from "./openrouter"
import { GeminiProvider } from "./gemini"
import { OllamaProvider } from "./ollama"

export type ProviderType = "openai" | "openrouter" | "gemini" | "ollama"

interface ProviderConfig {
  apiKey: string
  baseUrl?: string
}

export class AIProviderFactory {
  static create(type: ProviderType, config: ProviderConfig): AIProvider {
    switch (type) {
      case "openai":
        return new OpenAIProvider(config.apiKey, config.baseUrl)
      case "openrouter":
        return new OpenRouterProvider(config.apiKey)
      case "gemini":
        return new GeminiProvider(config.apiKey)
      case "ollama":
        return new OllamaProvider(config.apiKey, config.baseUrl)
      default:
        throw new Error(`Unknown provider type: ${type}`)
    }
  }
}
