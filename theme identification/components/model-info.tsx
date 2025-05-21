import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function ModelInfo() {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">About Gemini AI</CardTitle>
        <CardDescription>Google's multimodal AI model for various tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-2">
          <Badge variant="outline">Text Generation</Badge>
          <Badge variant="outline">Creative Writing</Badge>
          <Badge variant="outline">Q&A</Badge>
          <Badge variant="outline">Problem Solving</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          This demo uses the <strong>gemini-pro</strong> model, which is optimized for text-based tasks. It can handle a
          wide range of prompts from creative writing to technical explanations.
        </p>
      </CardContent>
    </Card>
  )
}
