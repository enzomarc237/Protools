"use client"

import { motion } from "framer-motion"
import { Lightbulb, Sparkles } from "lucide-react"

export default function BrainstormPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Brainstorm</h1>
        <p className="text-slate-600 mt-1">AI-powered ideation and brainstorming canvas</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center"
      >
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lightbulb className="w-10 h-10 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Coming Soon</h2>
        <p className="text-slate-600 max-w-md mx-auto mb-6">
          The brainstorming canvas is under development. Soon you&apos;ll be able to explore ideas with AI-powered suggestions.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
          <Sparkles className="w-4 h-4" />
          Infinite canvas • AI ideation • Mind mapping
        </div>
      </motion.div>
    </div>
  )
}
