'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { ToolIcon } from '@/components/icons'

export default function ToolsPage() {
  const [tools, setTools] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTools() {
      try {
        const data = await api.getTools()
        setTools(data.tools)
      } catch (error) {
        console.error('Failed to load tools:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTools()
  }, [])

  const categoryColors: Record<string, { bg: string, text: string }> = {
    COMPUTATION: { bg: 'bg-blue-100', text: 'text-blue-600' },
    EXTERNAL_API: { bg: 'bg-purple-100', text: 'text-purple-600' },
    SYSTEM: { bg: 'bg-green-100', text: 'text-green-600' },
    DATA_ACCESS: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
    CUSTOM: { bg: 'bg-gray-100', text: 'text-gray-600' },
  }

  return (
    <div>
      <Header 
        title="Tools" 
        subtitle={`${tools.length} available tool plugins`}
        actions={
          <Button asChild variant="secondary">
            <Link href="/tools?action=create">
              Add Tool
            </Link>
          </Button>
        }
      />
      
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-2 border-surface-active border-t-brand rounded-full animate-spin mx-auto mb-4" />
              <span className="text-text-secondary">Loading tools...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {tools.map((tool) => {
                const categoryStyle = categoryColors[tool.category] || categoryColors.CUSTOM
                return (
                  <Card 
                    key={tool.id} 
                    className="border border-[#E5E7EB] bg-white hover:bg-[#FBF7F2] transition-colors duration-150 ease-in-out rounded-lg"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between mb-4">
                        <ToolIcon className={`w-12 h-12 ${categoryStyle.text}`} />
                        <div
                          className={`px-3 py-1 text-xs font-semibold rounded-lg ${categoryStyle.bg} ${categoryStyle.text}`}
                        >
                          {tool.category}
                        </div>
                      </div>
                      <CardTitle>{tool.name}</CardTitle>
                      <CardDescription className="line-clamp-2">{tool.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-text-secondary">PARAMETERS</div>
                        {tool.parameters.length === 0 ? (
                          <div className="text-xs text-text-secondary">No parameters</div>
                        ) : (
                          <div className="space-y-1">
                            {tool.parameters.slice(0, 3).map((param: any, idx: number) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between text-xs p-2 bg-surface-active rounded-lg"
                              >
                                <span className="text-text-primary font-medium">
                                  {param.name}
                                  {param.required && <span className="text-red-600 ml-1">*</span>}
                                </span>
                                <span className="text-text-secondary font-mono">{param.type}</span>
                              </div>
                            ))}
                            {tool.parameters.length > 3 && (
                              <div className="text-xs text-text-secondary text-center pt-1">
                                +{tool.parameters.length - 3} more
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-[#E5E7EB] space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-text-secondary">Timeout</span>
                          <span className="text-text-primary font-mono">{tool.timeout}ms</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-text-secondary">Version</span>
                          <span className="text-text-primary font-mono">{tool.version}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
