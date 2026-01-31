"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { FileText, Download, Loader2, Save, Edit2, History, Trash2, Maximize2, Minimize2 } from "lucide-react"
import { api } from "@/lib/trpc"
import { MarkdownViewer } from "@/components/ui/markdown-viewer"
import { TableOfContents } from "@/components/ui/table-of-contents"
import { exportDocument, downloadBlob, ExportFormat } from "@/lib/export"
import { toast } from "sonner"

const documentTypeLabels: Record<string, string> = {
  prd: "PRD",
  "tech-spec": "Tech Spec",
  "design-spec": "Design Spec",
  plan: "Plan",
}

export default function ProjectPage() {
  const { id } = useParams()
  const router = useRouter()
  const [activeDoc, setActiveDoc] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<ExportFormat | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState("")
  const [showVersions, setShowVersions] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const { data: project, isLoading, refetch } = api.project.getById.useQuery(
    { id: id as string },
    { enabled: !!id }
  )

  const updateDocument = api.document.update.useMutation({
    onSuccess: () => {
      refetch()
      setIsEditing(false)
      toast.success("Document saved")
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save document")
    },
  })

  const deleteDocument = api.document.delete.useMutation({
    onSuccess: () => {
      refetch()
      setActiveDoc(null)
      toast.success("Document deleted")
    },
    onError: () => {
      toast.error("Failed to delete document")
    },
  })

  const deleteProject = api.project.delete.useMutation({
    onSuccess: () => {
      toast.success("Project deleted")
      router.push("/dashboard")
    },
    onError: () => {
      toast.error("Failed to delete project")
    },
  })

  const selectedDocument = project?.documents.find((d) => d.id === activeDoc)

  const handleEdit = () => {
    if (!selectedDocument) return
    setEditContent(selectedDocument.content)
    setIsEditing(true)
  }

  const handleSave = () => {
    if (!selectedDocument) return
    updateDocument.mutate({
      id: selectedDocument.id,
      content: editContent,
    })
  }

  const handleDeleteDocument = () => {
    if (!selectedDocument) return
    if (!confirm("Are you sure you want to delete this document?")) return
    deleteDocument.mutate({ id: selectedDocument.id })
  }

  const handleDeleteProject = () => {
    if (!confirm("Are you sure you want to delete this project? All documents will be deleted. This action cannot be undone.")) return
    deleteProject.mutate({ id: id as string })
  }

  const handleExport = async (format: ExportFormat) => {
    if (!selectedDocument) return
    
    setIsExporting(true)
    setExportFormat(format)
    
    try {
      const blob = await exportDocument(
        selectedDocument.content,
        selectedDocument.title,
        format
      )
      
      const extension = format === "docx" ? ".docx" : format === "pdf" ? ".pdf" : format === "json" ? ".json" : ".md"
      const filename = `${selectedDocument.title.replace(/\s+/g, "_")}${extension}`
      
      downloadBlob(blob, filename)
      toast.success(`Exported as ${format.toUpperCase()}`)
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Failed to export document")
    } finally {
      setIsExporting(false)
      setExportFormat(null)
    }
  }

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
      <div className="mb-8 flex items-start justify-between">
        <div>
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
        <button
          onClick={handleDeleteProject}
          className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Delete Project
        </button>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Document List */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Documents</h2>
          <div className="space-y-2">
            {project.documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => {
                  setActiveDoc(doc.id)
                  setIsEditing(false)
                  setShowVersions(false)
                }}
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
        <div className="lg:col-span-3 xl:col-span-2">
          {selectedDocument ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
            >
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {selectedDocument.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                      <span>{selectedDocument.content.split(/\s+/).filter(Boolean).length} words</span>
                      <span>•</span>
                      <span>{Math.ceil(selectedDocument.content.split(/\s+/).filter(Boolean).length / 200)} min read</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => isEditing ? handleSave() : handleEdit()}
                      disabled={updateDocument.isPending}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      {updateDocument.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isEditing ? (
                        <>
                          <Save className="w-4 h-4" />
                          Save
                        </>
                      ) : (
                        <>
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setShowVersions(!showVersions)}
                      className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                        showVersions ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <History className="w-4 h-4" />
                      Versions
                    </button>
                    <button
                      onClick={handleDeleteDocument}
                      disabled={deleteDocument.isPending}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                  <div className="w-px h-4 bg-slate-200 mx-1" />
                  <span className="text-xs text-slate-400 mr-2">Export:</span>
                  {(["markdown", "pdf", "docx", "json"] as ExportFormat[]).map((format) => (
                    <button
                      key={format}
                      onClick={() => handleExport(format)}
                      disabled={isExporting}
                      className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 uppercase"
                    >
                      {isExporting && exportFormat === format ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        format
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className={`p-6 overflow-y-auto ${isFullscreen ? 'fixed inset-0 z-50 max-h-screen' : 'max-h-[70vh]'}`}>
                {showVersions ? (
                  <div className="space-y-4">
                    <h4 className="font-medium text-slate-900 mb-4">Version History</h4>
                    {!selectedDocument.versions || selectedDocument.versions.length === 0 ? (
                      <p className="text-slate-500 text-sm">No previous versions.</p>
                    ) : (
                      selectedDocument.versions.map((version) => (
                        <div 
                          key={version.id}
                          className="p-4 bg-slate-50 rounded-xl border border-slate-200"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-slate-900">Version {version.version}</span>
                            <span className="text-xs text-slate-500">
                              {new Date(version.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 line-clamp-3">
                            {version.content.substring(0, 200)}...
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                ) : isEditing ? (
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full h-[60vh] p-4 font-mono text-sm bg-slate-50 border border-slate-200 rounded-xl resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  />
                ) : (
                  <MarkdownViewer content={selectedDocument.content} />
                )}
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center h-96 bg-white rounded-2xl border border-slate-200 border-dashed">
              <FileText className="w-12 h-12 text-slate-300 mb-4" />
              <p className="text-slate-500">Select a document to view</p>
            </div>
          )}
        </div>

        {/* Table of Contents Sidebar */}
        {selectedDocument && !isEditing && !showVersions && (
          <TableOfContents content={selectedDocument.content} />
        )}
      </div>
    </div>
  )
}
