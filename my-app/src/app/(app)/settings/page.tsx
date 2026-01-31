"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Save, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Key,
  Thermometer,
  Hash,
  Bot,
} from "lucide-react"
import { api } from "@/lib/trpc"
import { toast } from "sonner"

type ProviderType = "openai" | "openrouter" | "gemini" | "ollama"

interface Model {
  id: string
  name: string
  contextWindow: number
}

const providers = [
  { id: "openai" as ProviderType, name: "OpenAI", description: "GPT-4, GPT-3.5 Turbo" },
  { id: "openrouter" as ProviderType, name: "OpenRouter", description: "Access to multiple models" },
  { id: "gemini" as ProviderType, name: "Google Gemini", description: "Gemini Pro, Ultra" },
  { id: "ollama" as ProviderType, name: "Ollama", description: "Self-hosted local models" },
]

export default function SettingsPage() {
  const { data: settings, isLoading } = api.settings.get.useQuery()
  const utils = api.useUtils()
  
  const [formData, setFormData] = useState({
    provider: "openai" as ProviderType,
    apiKey: "",
    baseUrl: "",
    defaultModel: "",
    temperature: 0.7,
    maxTokens: 4000,
    prdSystemPrompt: "",
    techSpecSystemPrompt: "",
    designSpecSystemPrompt: "",
    planSystemPrompt: "",
  })
  
  const [models, setModels] = useState<Model[]>([])
  const [isFetchingModels, setIsFetchingModels] = useState(false)
  const [testStatus, setTestStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [testError, setTestError] = useState("")

  const saveSettings = api.settings.save.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate()
      toast.success("Settings saved successfully")
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save settings")
    },
  })

  const fetchModels = api.settings.fetchModels.useQuery(
    { 
      provider: formData.provider, 
      apiKey: formData.apiKey,
      baseUrl: formData.baseUrl || undefined,
    },
    { enabled: false }
  )

  const testConnection = api.settings.testConnection.useMutation()

  useEffect(() => {
    if (settings) {
      setFormData({
        provider: (settings.provider as ProviderType) || "openai",
        apiKey: "", // Don't show saved API key for security
        baseUrl: settings.baseUrl || "",
        defaultModel: settings.defaultModel || "",
        temperature: settings.temperature,
        maxTokens: settings.maxTokens,
        prdSystemPrompt: settings.prdSystemPrompt || "",
        techSpecSystemPrompt: settings.techSpecSystemPrompt || "",
        designSpecSystemPrompt: settings.designSpecSystemPrompt || "",
        planSystemPrompt: settings.planSystemPrompt || "",
      })
    }
  }, [settings])

  const handleFetchModels = async () => {
    if (!formData.apiKey) return
    
    setIsFetchingModels(true)
    try {
      const result = await fetchModels.refetch()
      if (result.data) {
        setModels(result.data)
      }
    } catch (error) {
      console.error("Failed to fetch models:", error)
    } finally {
      setIsFetchingModels(false)
    }
  }

  const handleTestConnection = async () => {
    if (!formData.apiKey || !formData.defaultModel) return
    
    setTestStatus("loading")
    setTestError("")
    
    try {
      const result = await testConnection.mutateAsync({
        provider: formData.provider,
        apiKey: formData.apiKey,
        baseUrl: formData.baseUrl || undefined,
        model: formData.defaultModel,
      })
      
      if (result.success) {
        setTestStatus("success")
      } else {
        setTestStatus("error")
        setTestError(result.error || "Connection failed")
      }
    } catch (error) {
      setTestStatus("error")
      setTestError(error instanceof Error ? error.message : "Connection failed")
    }
  }

  const handleSave = async () => {
    // Only send apiKey if it was entered (to avoid overwriting saved key with empty string)
    const dataToSave = {
      ...formData,
      apiKey: formData.apiKey || undefined,
    }
    await saveSettings.mutateAsync(dataToSave)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-1">Configure your AI provider and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Provider Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
        >
          <h2 className="text-lg font-semibold text-slate-900 mb-4">AI Provider</h2>
          
          <div className="grid grid-cols-2 gap-3 mb-6">
            {providers.map((provider) => (
              <button
                key={provider.id}
                onClick={() => setFormData({ ...formData, provider: provider.id })}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  formData.provider === provider.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="font-medium text-slate-900">{provider.name}</div>
                <div className="text-sm text-slate-500">{provider.description}</div>
              </button>
            ))}
          </div>

          {/* API Key */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                API Key
                {settings?.apiKey && (
                  <span className="ml-2 text-xs text-green-600 font-normal">
                    ✓ Key saved (enter new one to replace)
                  </span>
                )}
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  placeholder={settings?.apiKey ? "••••••••••••••••" : "Enter your API key"}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
                <button
                  onClick={handleFetchModels}
                  disabled={!formData.apiKey || isFetchingModels}
                  className="px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isFetchingModels ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Fetch Models
                </button>
              </div>
            </div>

            {/* Base URL (for Ollama) */}
            {formData.provider === "ollama" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Base URL
                </label>
                <input
                  type="text"
                  value={formData.baseUrl}
                  onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                  placeholder="http://localhost:11434"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>
            )}

            {/* Model Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Default Model
              </label>
              <select
                value={formData.defaultModel}
                onChange={(e) => setFormData({ ...formData, defaultModel: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white"
              >
                <option value="">Select a model</option>
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name} ({model.contextWindow.toLocaleString()} tokens)
                  </option>
                ))}
              </select>
            </div>

            {/* Test Connection */}
            <button
              onClick={handleTestConnection}
              disabled={!formData.apiKey || !formData.defaultModel || testStatus === "loading"}
              className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
            >
              {testStatus === "loading" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Testing...
                </>
              ) : testStatus === "success" ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Connection successful!
                </>
              ) : testStatus === "error" ? (
                <>
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  {testError}
                </>
              ) : (
                "Test connection"
              )}
            </button>
          </div>
        </motion.div>

        {/* Parameters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
        >
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Generation Parameters</h2>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Thermometer className="w-4 h-4 inline mr-1" />
                Temperature
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-slate-500 mt-1">
                <span>Precise</span>
                <span className="font-medium text-slate-900">{formData.temperature}</span>
                <span>Creative</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Hash className="w-4 h-4 inline mr-1" />
                Max Tokens
              </label>
              <input
                type="number"
                min="100"
                max="100000"
                step="100"
                value={formData.maxTokens}
                onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              />
            </div>
          </div>
        </motion.div>

        {/* System Prompts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
        >
          <h2 className="text-lg font-semibold text-slate-900 mb-4">System Prompts (Advanced)</h2>
          
          <div className="space-y-4">
            {[
              { key: "prdSystemPrompt", label: "PRD Generation" },
              { key: "techSpecSystemPrompt", label: "Technical Spec" },
              { key: "designSpecSystemPrompt", label: "Design Spec" },
              { key: "planSystemPrompt", label: "Implementation Plan" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {label}
                </label>
                <textarea
                  value={formData[key as keyof typeof formData] as string}
                  onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                  placeholder="Custom system prompt for this document type..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-none"
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saveSettings.isPending}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {saveSettings.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
