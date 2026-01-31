"use client"

import { useState, useRef, useCallback } from "react"
import { motion } from "framer-motion"
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
  Maximize2,
  Minimize2
} from "lucide-react"
import { api } from "@/lib/trpc"

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
  const [nodes, setNodes] = useState<Node[]>([
    { id: "1", content: "Main Idea", type: "idea", x: 400, y: 300 },
  ])
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedNode, setDraggedNode] = useState<string | null>(null)
  const [aiPrompt, setAiPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)
  const dragOffset = useRef({ x: 0, y: 0 })

  const generateIdeas = api.brainstorm.generateIdeas.useMutation()

  const addNode = (type: Node["type"], x?: number, y?: number) => {
    const newNode: Node = {
      id: Date.now().toString(),
      content: "",
      type,
      x: x ?? 400 + Math.random() * 100 - 50,
      y: y ?? 300 + Math.random() * 100 - 50,
    }
    setNodes([...nodes, newNode])
    setSelectedNode(newNode.id)
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

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !draggedNode || !canvasRef.current) return
    
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - dragOffset.current.x
    const y = e.clientY - rect.top - dragOffset.current.y
    
    updateNode(draggedNode, { x, y })
  }, [isDragging, draggedNode])

  const handleMouseUp = () => {
    setIsDragging(false)
    setDraggedNode(null)
  }

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return
    
    setIsGenerating(true)
    try {
      // For now, simulate AI response with sample ideas
      // In production, this would call the actual AI API
      const ideas = [
        { content: "User authentication system", type: "feature" as const },
        { content: "How to handle concurrent users?", type: "question" as const },
        { content: "Mobile responsiveness", type: "goal" as const },
        { content: "Limited budget for hosting", type: "constraint" as const },
      ]
      
      ideas.forEach((idea, i) => {
        setTimeout(() => {
          addNode(idea.type, 400 + i * 50, 200 + i * 80)
          // Update the last added node with content
          setNodes(prev => {
            const lastNode = prev[prev.length - 1]
            if (lastNode) {
              return prev.map(n => 
                n.id === lastNode.id ? { ...n, content: idea.content } : n
              )
            }
            return prev
          })
        }, i * 200)
      })
    } finally {
      setIsGenerating(false)
      setAiPrompt("")
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
        </div>
      </div>

      {/* AI Input */}
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          placeholder="Ask AI to generate ideas about..."
          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
        />
        <button
          onClick={handleAiGenerate}
          disabled={isGenerating || !aiPrompt.trim()}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
        >
          {isGenerating ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-5 h-5" />
            </motion.div>
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
        onClick={() => setSelectedNode(null)}
      >
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(to right, #cbd5e1 1px, transparent 1px),
              linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />

        {/* Nodes */}
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
                      {node.content || "Click to edit..."}
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
              <div className="mt-2 text-xs opacity-60 capitalize flex items-center gap-1">
                <Grip className="w-3 h-3" />
                {node.type}
              </div>
            </motion.div>
          )
        })}

        {/* Instructions overlay */}
        {nodes.length <= 1 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-slate-400">
              <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Start brainstorming</p>
              <p className="text-sm mt-1">Click buttons above or use AI to generate ideas</p>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-sm text-slate-600">
        <span className="font-medium">Legend:</span>
        {Object.entries(nodeColors).map(([type, colorClass]) => {
          const Icon = nodeIcons[type]
          return (
            <div key={type} className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded ${colorClass.split(' ')[0]}`} />
              <span className="capitalize">{type}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
