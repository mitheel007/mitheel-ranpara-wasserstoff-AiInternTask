"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Loader2, Upload, FileText } from "lucide-react"
import DocumentList from "@/components/document-list"
import ChatInterface from "@/components/chat-interface"
import ThemeVisualizer from "@/components/theme-visualizer"
import { uploadDocuments } from "@/app/actions/document-actions"
import type { Document } from "@/types/document"

export default function Home() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [activeTab, setActiveTab] = useState("upload")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setUploadProgress(0)

    try {
      // Create FormData to send files
      const formData = new FormData()
      for (let i = 0; i < files.length; i++) {
        formData.append("documents", files[i])
      }

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 5
        })
      }, 300)

      // Upload documents
      const result = await uploadDocuments(formData)

      clearInterval(progressInterval)
      setUploadProgress(100)

      // Update documents list
      setDocuments((prev) => [...prev, ...result])

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      // Switch to documents tab after successful upload
      setTimeout(() => {
        setActiveTab("documents")
        setUploading(false)
        setUploadProgress(0)
      }, 1000)
    } catch (error) {
      console.error("Error uploading documents:", error)
      setUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <main className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-2">Document Research & Theme Identification</h1>
      <p className="text-muted-foreground mb-6">
        Upload documents, ask questions, and discover themes across your document collection
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>
          <TabsTrigger value="chat">Chat & Research</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Documents</CardTitle>
              <CardDescription>
                Upload PDF files, Word documents, or scanned images to build your knowledge base
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div
                className="border-2 border-dashed rounded-lg p-12 w-full flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Drag & drop files or click to browse</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Supported formats: PDF, DOCX, JPG, PNG (OCR will be applied to images)
                </p>
                <Input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.docx,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                <Button disabled={uploading}>
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                    </>
                  ) : (
                    "Select Files"
                  )}
                </Button>
              </div>

              {uploading && (
                <div className="w-full mt-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Uploading documents...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              )}

              {documents.length > 0 && (
                <div className="w-full mt-6">
                  <h3 className="text-lg font-medium mb-2">Recently Uploaded</h3>
                  <ul className="space-y-2">
                    {documents.slice(-3).map((doc) => (
                      <li key={doc.id} className="flex items-center p-2 bg-muted rounded-md">
                        <FileText className="h-4 w-4 mr-2" />
                        <span className="text-sm truncate flex-1">{doc.filename}</span>
                        <Badge variant="outline">{doc.pages} pages</Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-sm text-muted-foreground">
                {documents.length} document{documents.length !== 1 ? "s" : ""} in your knowledge base
              </p>
              {documents.length > 0 && (
                <Button variant="outline" onClick={() => setActiveTab("documents")}>
                  View All Documents
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <DocumentList documents={documents} />
        </TabsContent>

        <TabsContent value="chat" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ChatInterface documents={documents} />
            </div>
            <div>
              <ThemeVisualizer />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  )
}
