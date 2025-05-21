"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { FileText, Search, Trash2, Database } from "lucide-react"
import type { Document } from "@/types/document"
import { formatDistanceToNow } from "date-fns"

interface DocumentListProps {
  documents: Document[]
}

export default function DocumentList({ documents }: DocumentListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDocs, setSelectedDocs] = useState<string[]>([])

  const filteredDocuments = documents.filter((doc) => doc.filename.toLowerCase().includes(searchTerm.toLowerCase()))

  const toggleDocumentSelection = (docId: string) => {
    setSelectedDocs((prev) => (prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]))
  }

  const toggleSelectAll = () => {
    if (selectedDocs.length === filteredDocuments.length) {
      setSelectedDocs([])
    } else {
      setSelectedDocs(filteredDocuments.map((doc) => doc.id))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Management</CardTitle>
        <CardDescription>View, search, and manage your uploaded documents</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" disabled={selectedDocs.length === 0}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected
          </Button>
        </div>

        {filteredDocuments.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No documents found</h3>
            <p className="text-sm text-muted-foreground">
              {documents.length === 0 ? "Upload some documents to get started" : "Try a different search term"}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center mb-2 px-4 py-2 bg-muted/50 rounded-md">
              <div className="flex items-center w-12">
                <Checkbox
                  checked={filteredDocuments.length > 0 && selectedDocs.length === filteredDocuments.length}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all documents"
                />
              </div>
              <div className="flex-1 font-medium">Filename</div>
              <div className="w-24 text-center">Pages</div>
              <div className="w-32 text-center">Type</div>
              <div className="w-32 text-center">Status</div>
              <div className="w-32 text-center">Uploaded</div>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center px-4 py-3 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center w-12">
                    <Checkbox
                      checked={selectedDocs.includes(doc.id)}
                      onCheckedChange={() => toggleDocumentSelection(doc.id)}
                      aria-label={`Select ${doc.filename}`}
                    />
                  </div>
                  <div className="flex-1 truncate">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{doc.filename}</span>
                    </div>
                  </div>
                  <div className="w-24 text-center">
                    <Badge variant="outline">{doc.pages}</Badge>
                  </div>
                  <div className="w-32 text-center">
                    <Badge variant="secondary">{doc.fileType}</Badge>
                  </div>
                  <div className="w-32 text-center">
                    {doc.vectorized ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <Database className="h-3 w-3 mr-1" />
                        Vectorized
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        Standard
                      </Badge>
                    )}
                  </div>
                  <div className="w-32 text-center text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(doc.uploadedAt), { addSuffix: true })}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
