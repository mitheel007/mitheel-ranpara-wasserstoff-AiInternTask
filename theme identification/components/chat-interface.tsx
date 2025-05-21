"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Send, MessageSquare, Lightbulb, FileText, AlertCircle, Info, Database } from "lucide-react"
import type { Document } from "@/types/document"
import { processQuery } from "@/app/actions/query-actions"
import DocumentResponse from "@/components/document-response"
import type { DocumentResult, ThemeResult } from "@/types/results"

interface ChatInterfaceProps {
  documents: Document[]
}

export default function ChatInterface({ documents }: ChatInterfaceProps) {
  const [query, setQuery] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [documentResults, setDocumentResults] = useState<DocumentResult[]>([])
  const [themeResults, setThemeResults] = useState<ThemeResult[]>([])
  const [activeResultTab, setActiveResultTab] = useState("documents")
  const [error, setError] = useState<string | null>(null)
  const [showMockDataNotice, setShowMockDataNotice] = useState(false)
  const [usingVectorSearch, setUsingVectorSearch] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Check if any documents are vectorized
  const hasVectorizedDocuments = documents.some((doc) => doc.vectorized)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || isProcessing || documents.length === 0) return

    setIsProcessing(true)
    setError(null)
    setShowMockDataNotice(false)
    setUsingVectorSearch(false)

    try {
      const results = await processQuery(
        query,
        documents.map((doc) => doc.id),
      )
      setDocumentResults(results.documentResults)
      setThemeResults(results.themeResults)
      setActiveResultTab("documents")

      // Check if we're using vector search based on document IDs
      // In a real implementation, the backend would tell us this
      const usingVector =
        hasVectorizedDocuments &&
        results.documentResults.some(
          (result) =>
            result.documentId.includes("_chunk_") || documents.find((d) => d.id === result.documentId)?.vectorized,
        )

      setUsingVectorSearch(usingVector)
      setShowMockDataNotice(!usingVector)
    } catch (error) {
      console.error("Error processing query:", error)
      setError(error instanceof Error ? error.message : "An unknown error occurred while processing your query")
    } finally {
      setIsProcessing(false)
    }
  }

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [documentResults, themeResults, activeResultTab])

  const handleExampleQuery = (exampleQuery: string) => {
    setQuery(exampleQuery)
  }

  return (
    <Card className="h-[calc(100vh-12rem)]">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Research Assistant
          {hasVectorizedDocuments && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Database className="h-3 w-3 mr-1" />
              Vector Search Enabled
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Ask questions about your documents to discover insights and themes</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col h-[calc(100%-10rem)] overflow-hidden">
        {documents.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No documents available</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload some documents to start researching and identifying themes
            </p>
            <Button variant="outline" onClick={() => document.getElementById("upload-tab")?.click()}>
              Upload Documents
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto mb-4 pr-2">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {showMockDataNotice && (
                <Alert className="mb-4">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Demo Mode</AlertTitle>
                  <AlertDescription>
                    Currently showing simulated results for demonstration purposes. Upload text documents to enable
                    semantic search.
                  </AlertDescription>
                </Alert>
              )}

              {usingVectorSearch && (
                <Alert className="mb-4" variant="default">
                  <Database className="h-4 w-4" />
                  <AlertTitle>Semantic Search</AlertTitle>
                  <AlertDescription>
                    Using vector-based semantic search to find the most relevant documents for your query.
                  </AlertDescription>
                </Alert>
              )}

              {documentResults.length === 0 && themeResults.length === 0 && !error ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Ask a research question</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Your query will be processed against all {documents.length} documents in your knowledge base
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4 w-full max-w-md">
                    <Button
                      variant="outline"
                      onClick={() => handleExampleQuery("What are the key concepts of artificial intelligence?")}
                      className="justify-start text-left"
                    >
                      Key concepts of AI
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleExampleQuery("How is machine learning applied in healthcare?")}
                      className="justify-start text-left"
                    >
                      ML in healthcare
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleExampleQuery("What are the ethical implications of AI?")}
                      className="justify-start text-left"
                    >
                      Ethical implications
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleExampleQuery("Compare different approaches to natural language processing")}
                      className="justify-start text-left"
                    >
                      NLP approaches
                    </Button>
                  </div>
                </div>
              ) : documentResults.length > 0 || themeResults.length > 0 ? (
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="font-medium mb-1">Your query:</p>
                    <p>{documentResults[0]?.query}</p>
                  </div>

                  <Tabs value={activeResultTab} onValueChange={setActiveResultTab}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="documents">
                        <FileText className="h-4 w-4 mr-2" />
                        Document Results ({documentResults.length})
                      </TabsTrigger>
                      <TabsTrigger value="themes">
                        <Lightbulb className="h-4 w-4 mr-2" />
                        Identified Themes ({themeResults.length})
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="documents" className="mt-4 space-y-4">
                      {documentResults.map((result) => (
                        <DocumentResponse key={result.documentId} result={result} />
                      ))}
                    </TabsContent>

                    <TabsContent value="themes" className="mt-4 space-y-4">
                      {themeResults.map((theme, index) => (
                        <div key={index} className="bg-card border rounded-lg p-4">
                          <h3 className="text-lg font-medium mb-2">
                            Theme {index + 1}: {theme.name}
                          </h3>
                          <p className="mb-3">{theme.description}</p>
                          <div className="mb-2">
                            <span className="text-sm font-medium">Supporting Documents:</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {theme.documentIds.map((docId) => {
                                const doc = documents.find((d) => d.id === docId)
                                return (
                                  <Badge key={docId} variant="outline">
                                    <FileText className="h-3 w-3 mr-1" />
                                    {doc?.filename || docId}
                                  </Badge>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>
                </div>
              ) : null}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <Textarea
                placeholder="Ask a question about your documents..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="min-h-[80px] resize-none"
              />
              <Button
                type="submit"
                size="icon"
                className="h-10 w-10"
                disabled={isProcessing || !query.trim() || documents.length === 0}
              >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </>
        )}
      </CardContent>
      {documents.length > 0 && (
        <CardFooter className="text-sm text-muted-foreground">
          <p>
            {hasVectorizedDocuments
              ? "Semantic search is enabled for text documents. Ask specific questions to get more relevant results."
              : "Upload text documents to enable semantic search for more accurate results."}
          </p>
        </CardFooter>
      )}
    </Card>
  )
}
