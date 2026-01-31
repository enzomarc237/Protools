"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { FileText, Download, RefreshCw, Loader2 } from "lucide-react"
import { api } from "@/lib/trpc"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

const documentTypeLabels: Record<string, string> = {
  prd: "PRD",
  "tech-spec": "Tech Spec",
  "design-spec": "Design Spec",
  plan: "Plan",
}

export default function ProjectPage() {
  const { id } = useParams()
  const [activeDoc, setActiveDoc] = useState<string | null>(null)
  
  const { data: project, isLoading } = api.project.getById.useQuery(
    { id: id as string },
    { enabled: !!id }
  )

  const selectedDocument = project?.documents.find((d) => d.id === activeDoc)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-slate-900">Project not found</h1>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">{project.title}</h1>
        <p className="text-slate-600 mt-2">{project.description}</p>
        <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-500">
          {project.targetAudience && (
            <span>Target: {project.targetAudience}</span>
          )}
          {project.techStack && (
            <span>Tech: {project.techStack}</span>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Document List */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Documents</h2>
          <div className="space-y-2">
            {project.documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => setActiveDoc(doc.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  activeDoc === doc.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-slate-400" />
                  <div>
                    <div className="font-medium text-slate-900">
                      {documentTypeLabels[doc.type] || doc.type}
                    </div>
                    <div className="text-xs text-slate-500">
                      v{doc.version} • {new Date(doc.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </button>
            ))}
            
            {project.documents.length === 0 && (
              <div className="text-center p-6 text-slate-500">
                No documents yet.
              </div>
            )}
          </div>
        </div>

        {/* Document Viewer */}
        <div className="lg:col-span-3">
          {selectedDocument ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
            >
              {/* Toolbar */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">
                  {selectedDocument.title}
                </h3>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                    <RefreshCw className="w-4 h-4" />
                    Regenerate
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="prose prose-slate max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {selectedDocument.content}
                  </ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center h-96 bg-white rounded-2xl border border-slate-200 border-dashed">
              <FileText className="w-12 h-12 text-slate-300 mb-4" />
              <p className="text-slate-500">Select a document to view</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
