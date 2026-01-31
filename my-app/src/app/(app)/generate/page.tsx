"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Sparkles, ArrowRight, Loader2, CheckCircle } from "lucide-react"
import { api } from "@/lib/trpc"
import { useRouter } from "next/navigation"

const documentTypes = [
  { id: "prd", label: "Product Requirements Document", description: "Comprehensive PRD with user stories, requirements, and success metrics" },
  { id: "tech-spec", label: "Technical Specification", description: "Architecture, API design, database schema, and deployment strategy" },
  { id: "design-spec", label: "Design Specification", description: "UX flows, visual design system, and interaction design" },
  { id: "plan", label: "Implementation Plan", description: "Phase breakdown, timeline, and task dependencies" },
]

export default function GeneratePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetAudience: "",
    constraints: "",
    techStack: "",
    selectedTypes: ["prd"] as string[],
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedProjectId, setGeneratedProjectId] = useState<string | null>(null)

  const createProject = api.project.create.useMutation({
    onSuccess: (data) => {
      setGeneratedProjectId(data.id)
      generateDocuments(data.id)
    },
  })

  const generateDocument = api.ai.generateDocument.useMutation()

  const generateDocuments = async (projectId: string) => {
    setIsGenerating(true)
    
    try {
      for (const type of formData.selectedTypes) {
        // Start generation for each document type
        await generateDocument.mutateAsync({
          projectId,
          type: type as "prd" | "tech-spec" | "design-spec" | "plan",
          context: {
            idea: formData.description,
            audience: formData.targetAudience || undefined,
            constraints: formData.constraints || undefined,
            techStack: formData.techStack || undefined,
          },
        })
      }
      
      // Navigate to the project
      router.push(`/project/${projectId}`)
    } catch (error) {
      console.error("Generation error:", error)
      setIsGenerating(false)
    }
  }

  const handleSubmit = async () => {
    if (step < 3) {
      setStep(step + 1)
      return
    }

    // Create project first
    await createProject.mutateAsync({
      title: formData.title,
      description: formData.description,
      targetAudience: formData.targetAudience || undefined,
      constraints: formData.constraints || undefined,
      techStack: formData.techStack || undefined,
    })
  }

  const toggleDocumentType = (typeId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedTypes: prev.selectedTypes.includes(typeId)
        ? prev.selectedTypes.filter(t => t !== typeId)
        : [...prev.selectedTypes, typeId]
    }))
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Generate Documentation</h1>
        <p className="text-slate-600 mt-1">Transform your idea into comprehensive product documentation</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                s <= step
                  ? "bg-slate-900 text-white"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {s < step ? <CheckCircle className="w-5 h-5" /> : s}
            </div>
            {s < 3 && (
              <div
                className={`w-12 h-1 rounded ${
                  s < step ? "bg-slate-900" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100"
      >
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Project Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., AI-powered Writing Assistant"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Describe Your Idea
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your product or feature idea in detail. What problem does it solve? Who is it for?"
                rows={6}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-none"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Target Audience (Optional)
              </label>
              <input
                type="text"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                placeholder="e.g., Marketing professionals, Small business owners"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Constraints (Optional)
              </label>
              <textarea
                value={formData.constraints}
                onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
                placeholder="Any limitations, budget constraints, timeline requirements, etc."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Preferred Tech Stack (Optional)
              </label>
              <input
                type="text"
                value={formData.techStack}
                onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                placeholder="e.g., Next.js, TypeScript, PostgreSQL"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <p className="text-slate-600">Select the documents you want to generate:</p>
            
            <div className="grid gap-4">
              {documentTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => toggleDocumentType(type.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all flex items-start gap-4 ${
                    formData.selectedTypes.includes(type.id)
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      formData.selectedTypes.includes(type.id)
                        ? "border-blue-500 bg-blue-500"
                        : "border-slate-300"
                    }`}
                  >
                    {formData.selectedTypes.includes(type.id) && (
                      <CheckCircle className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">{type.label}</div>
                    <div className="text-sm text-slate-500">{type.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
          <button
            onClick={() => setStep(step - 1)}
            disabled={step === 1 || isGenerating}
            className="px-6 py-3 text-slate-600 font-medium hover:text-slate-900 transition-colors disabled:opacity-50"
          >
            Back
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={
              isGenerating ||
              (step === 1 && (!formData.title || !formData.description)) ||
              (step === 3 && formData.selectedTypes.length === 0)
            }
            className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : step === 3 ? (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Documents
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
