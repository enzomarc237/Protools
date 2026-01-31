"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, FileText, Sparkles, Settings, Search, Filter, LayoutGrid, List } from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/trpc"

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const { data: projects, isLoading } = api.project.getAll.useQuery()

  const filteredProjects = projects?.filter(project => 
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">Manage your projects and generated documents</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Projects</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">
                {isLoading ? "..." : projects?.length || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Documents Generated</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">
                {isLoading ? "..." : projects?.reduce((acc, p) => acc + p.documents.length, 0) || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">AI Provider</p>
              <p className="text-lg font-semibold text-slate-900 mt-2">
                <Link href="/settings" className="text-blue-600 hover:underline flex items-center gap-1">
                  <Settings className="w-4 h-4" />
                  Configure
                </Link>
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Projects */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="p-6 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-slate-900">Projects</h2>
            
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search projects..."
                  className="pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none w-full sm:w-64"
                />
              </div>

              {/* View Toggle */}
              <div className="flex items-center border border-slate-200 rounded-lg">
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${viewMode === "list" ? "bg-slate-100 text-slate-900" : "text-slate-500"}`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${viewMode === "grid" ? "bg-slate-100 text-slate-900" : "text-slate-500"}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>

              <Link
                href="/generate"
                className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Project
              </Link>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredProjects?.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {searchQuery ? "No projects found" : "No projects yet"}
            </h3>
            <p className="text-slate-600 mb-6">
              {searchQuery 
                ? "Try adjusting your search query" 
                : "Create your first project to start generating documentation"}
            </p>
            {!searchQuery && (
              <Link
                href="/generate"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Project
              </Link>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects?.map((project) => (
              <Link
                key={project.id}
                href={`/project/${project.id}`}
                className="group p-6 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {project.title}
                  </h3>
                  {project.status === "generating" && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                      Generating...
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 line-clamp-2 mb-4">{project.description}</p>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{project.documents.length} documents</span>
                  <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredProjects?.map((project) => (
              <Link
                key={project.id}
                href={`/project/${project.id}`}
                className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-slate-900">{project.title}</h3>
                    {project.status === "generating" && (
                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                        Generating...
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-1">{project.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-slate-400">
                      {project.documents.length} documents
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-400">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
