import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText } from "lucide-react"
import type { DocumentResult } from "@/types/results"

interface DocumentResponseProps {
  result: DocumentResult
}

export default function DocumentResponse({ result }: DocumentResponseProps) {
  return (
    <Card className="border border-muted">
      <CardHeader className="pb-2 bg-muted/30">
        <CardTitle className="text-base flex items-center">
          <FileText className="h-4 w-4 mr-2" />
          {result.documentName}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="text-sm">{result.answer}</div>
        <div className="mt-3 flex items-center">
          <Badge variant="outline" className="text-xs">
            Citation: {result.citation}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
