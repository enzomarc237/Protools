"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Plus, 
  Sparkles, 
  Trash2, 
  Grip,
  Lightbulb,
  Target,
  AlertCircle,
  CheckCircle2,
  X,
  Zap,
  Expand,
  Settings,
  Loader2
} from "lucide-react"
import { api } from "@/lib/trpc"
import { toast } from "sonner"
import Link from "next/link"

interface Node {
  id: string
  content: string
  type: "idea" | "question" | "feature" | "constraint" | "goal"
  x: number
  y: number
}

const nodeColors: Record<string, string> = {
  idea: "bg-blue-100 border-blue-300 text-blue-800",
  question: "bg-purple-100 border-purple-300 text-purple-800",
  feature: "bg-green-100 border-green-300 text-green-800",
  constraint: "bg-red-100 border-red-300 text-red-800",
  goal: "bg-amber-100 border-amber-300 text-amber-800",
}

const nodeIcons: Record<string, typeof Lightbulb> = {
  idea: Lightbulb,
  question: AlertCircle,
  feature: CheckCircle2,
  constraint: X,
  goal: Target,
}

export default function BrainstormPage() {
  const [nodes, setNodes] = useState<Node[]>([])
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedNode, setDraggedNode] = useState<string | null>(null)
  const [aiPrompt, setAiPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)
  const dragOffset = useRef({ x: 0, y: 0 })
  const panStart = useRef({ x: 0, y: 0 })

  const generateIdeas = api.brainstorm.generateIdeas.useMutation()
  const expandIdea = api.brainstorm.expandIdea.useMutation()

  const addNode = (type: Node["type"], x?: number, y?: number, content?: string) => {
    const centerX = canvasRef.current ? canvasRef.current.clientWidth / 2 : 400
    const centerY = canvasRef.current ? canvasRef.current.clientHeight / 2 : 300
    
    const newNode: Node = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      content: content || "",
      type,
      x: x ?? centerX + (Math.random() - 0.5) * 200,
      y: y ?? centerY + (Math.random() - 0.5) * 200,
    }
    setNodes(prev => [...prev, newNode])
    if (!content) {
      setSelectedNode(newNode.id)
    }
    return newNode.id
  }

  const updateNode = (id: string, updates: Partial<Node>) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, ...updates } : n))
  }

  const deleteNode = (id: string) => {
    setNodes(nodes.filter(n => n.id !== id))
    setSelectedNode(null)
  }

  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation()
    setDraggedNode(nodeId)
    setIsDragging(true)
    setSelectedNode(nodeId)
    
    const node = nodes.find(n => n.id === nodeId)
    if (node && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      dragOffset.current = {
        x: e.clientX - rect.left - node.x,
        y: e.clientY - rect.top - node.y,
      }
    }
  }

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).classList.contains("grid-pattern")) {
      setIsPanning(true)
      panStart.current = { x: e.clientX - canvasOffset.x, y: e.clientY - canvasOffset.y }
      setSelectedNode(null)
    }
  }

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && draggedNode && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left - dragOffset.current.x - canvasOffset.x
      const y = e.clientY - rect.top - dragOffset.current.y - canvasOffset.y
      
      updateNode(draggedNode, { x, y })
    } else if (isPanning) {
      setCanvasOffset({
        x: e.clientX - panStart.current.x,
        y: e.clientY - panStart.current.y,
      })
    }
  }, [isDragging, draggedNode, isPanning, canvasOffset])

  const handleMouseUp = () => {
    setIsDragging(false)
    setDraggedNode(null)
    setIsPanning(false)
  }

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Please enter a prompt")
      return
    }
    
    setIsGenerating(true)
    try {
      const existingNodes = nodes.map(n => ({ content: n.content, type: n.type }))
      
      const result = await generateIdeas.mutateAsync({
        projectId: "brainstorm-session", // Using a placeholder since brainstorm isn't tied to a project
        prompt: aiPrompt,
        existingNodes: existingNodes.length > 0 ? existingNodes : undefined,
      })
      
      if (result.ideas && Array.isArray(result.ideas)) {
        const centerX = canvasRef.current ? canvasRef.current.clientWidth / 2 : 400
        const centerY = canvasRef.current ? canvasRef.current.clientHeight / 2 : 300
        
        result.ideas.forEach((idea: any, i: number) => {
          setTimeout(() => {
            const angle = (i / result.ideas.length) * 2 * Math.PI
            const radius = 150 + Math.random() * 100
            const x = centerX + Math.cos(angle) * radius - canvasOffset.x
            const y = centerY + Math.sin(angle) * radius - canvasOffset.y
            
            addNode(idea.type || "idea", x, y, idea.content)
          }, i * 300)
        })
        
        toast.success(`Generated ${result.ideas.length} ideas!`)
      }
    } catch (error: any) {
      console.error("Generation error:", error)
      if (error.message?.includes("AI settings not configured")) {
        toast.error(
          <div className="flex flex-col gap-2">
            <span>AI settings not configured</span>
            <Link href="/settings" className="text-blue-600 hover:underline text-sm">
              Go to Settings →
            </Link>
          </div>,
          { duration: 5000 }
        )
      } else {
        toast.error(error.message || "Failed to generate ideas")
      }
    } finally {
      setIsGenerating(false)
      setAiPrompt("")
    }
  }

  const handleExpandIdea = async (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId)
    if (!node || !node.content) {
      toast.error("Please add content to the idea first")
      return
    }

    setIsGenerating(true)
    try {
      const result = await expandIdea.mutateAsync({
        projectId: "brainstorm-session",
        ideaContent: node.content,
        ideaType: node.type,
      })
      
      if (result.ideas && Array.isArray(result.ideas)) {
        result.ideas.forEach((idea: any, i: number) => {
          setTimeout(() => {
            const angle = Math.random() * 2 * Math.PI
            const radius = 120 + Math.random() * 80
            const x = node.x + Math.cos(angle) * radius
            const y = node.y + Math.sin(angle) * radius
            
            addNode(idea.type || "idea", x, y, idea.content)
          }, i * 200)
        })
        
        toast.success(`Expanded into ${result.ideas.length} related ideas!`)
      }
    } catch (error: any) {
      console.error("Expand error:", error)
      toast.error(error.message || "Failed to expand idea")
    } finally {
      setIsGenerating(false)
    }
  }

  const clearCanvas = () => {
    if (confirm("Are you sure you want to clear all ideas?")) {
      setNodes([])
      setSelectedNode(null)
      toast.success("Canvas cleared")
    }
  }

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Brainstorm</h1>
          <p className="text-slate-600 mt-1">AI-powered ideation canvas</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => addNode("idea")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl font-medium hover:bg-blue-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Idea
          </button>
          <button
            onClick={() => addNode("feature")}
            className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-xl font-medium hover:bg-green-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Feature
          </button>
          <button
            onClick={() => addNode("question")}
            className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-xl font-medium hover:bg-purple-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Question
          </button>
          <button
            onClick={clearCanvas}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>

      {/* AI Input */}
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          placeholder="Ask AI to generate ideas about... (e.g., 'features for a productivity app')"
          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleAiGenerate()
            }
          }}
        />
        <button
          onClick={handleAiGenerate}
          disabled={isGenerating || !aiPrompt.trim()}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
        >
          {isGenerating ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Sparkles className="w-5 h-5" />
          )}
          Generate Ideas
        </button>
      </div>

      {/* Canvas */}
      <div 
        ref={canvasRef}
        className="flex-1 bg-slate-50 rounded-2xl border-2 border-slate-200 relative overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseDown={handleCanvasMouseDown}
      >
        {/* Grid pattern */}
        <div 
          className="grid-pattern absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, #cbd5e1 1px, transparent 1px),
              linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            transform: `translate(${canvasOffset.x % 40}px, ${canvasOffset.y % 40}px)`,
          }}
        />

        {/* Canvas Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          <button
            onClick={() => setCanvasOffset({ x: 0, y: 0 })}
            className="p-2 bg-white shadow-md rounded-lg text-slate-600 hover:text-slate-900"
            title="Reset view"
          >
            <Target className="w-5 h-5" />
          </button>
        </div>

        {/* Nodes Container */}
        <div 
          className="absolute inset-0"
          style={{
            transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px)`,
          }}
        >
          {/* Connection Lines */}
          <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
            {nodes.map((node, i) => 
              nodes.slice(i + 1).map((otherNode) => {
                const distance = Math.sqrt(
                  Math.pow(node.x - otherNode.x, 2) + 
                  Math.pow(node.y - otherNode.y, 2)
                )
                if (distance < 200) {
                  return (
                    <line
                      key={`${node.id}-${otherNode.id}`}
                      x1={node.x + 150}
                      y1={node.y + 50}
                      x2={otherNode.x + 150}
                      y2={otherNode.y + 50}
                      stroke="#cbd5e1"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                      opacity={1 - distance / 200}
                    />
                  )
                }
                return null
              })
            )}
          </svg>

          {/* Nodes */}
          <AnimatePresence>
            {nodes.map((node) => {
              const Icon = nodeIcons[node.type]
              const isSelected = selectedNode === node.id
              
              return (
                <motion.div
                  key={node.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: 1, 
                    opacity: 1,
                    x: node.x,
                    y: node.y,
                  }}
                  exit={{ scale: 0, opacity: 0 }}
                  className={`absolute ${nodeColors[node.type]} ${isSelected ? 'ring-2 ring-offset-2 ring-slate-400' : ''} rounded-xl p-4 min-w-[200px] max-w-[300px] shadow-sm border-2 cursor-move`}
                  onMouseDown={(e) => handleMouseDown(e, node.id)}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      {isSelected ? (
                        <textarea
                          value={node.content}
                          onChange={(e) => updateNode(node.id, { content: e.target.value })}
                          placeholder="Enter content..."
                          className="w-full bg-transparent border-none outline-none resize-none text-sm"
                          rows={2}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') setSelectedNode(null)
                          }}
                        />
                      ) : (
                        <p className="text-sm font-medium break-words">
                          {node.content || <span className="opacity-50">Click to edit...</span>}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNode(node.id)
                      }}
                      className="text-current opacity-50 hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Node Actions */}
                  {isSelected && node.content && (
                    <div className="mt-3 pt-3 border-t border-current border-opacity-20 flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleExpandIdea(node.id)
                        }}
                        disabled={isGenerating}
                        className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-white bg-opacity-50 rounded hover:bg-opacity-80 transition-colors"
                      >
                        <Expand className="w-3 h-3" />
                        Expand
                      </button>
                    </div>
                  )}
                  
                  <div className="mt-2 text-xs opacity-60 capitalize flex items-center gap-1">
                    <Grip className="w-3 h-3" />
                    {node.type}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Instructions overlay */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-slate-400">
              <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Start brainstorming</p>
              <p className="text-sm mt-1">Type a prompt above or click the buttons to add ideas</p>
              <p className="text-xs mt-4 text-slate-400">
                Tip: Drag to move ideas • Drag canvas to pan • Click idea to edit
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Legend & Stats */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <span className="font-medium">Legend:</span>
          {Object.entries(nodeColors).map(([type, colorClass]) => (
            <div key={type} className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded ${colorClass.split(' ')[0]}`} />
              <span className="capitalize">{type}</span>
            </div>
          ))}
        </div>
        <div className="text-sm text-slate-500">
          {nodes.length} {nodes.length === 1 ? 'idea' : 'ideas'}
        </div>
      </div>
    </div>
  )
}
