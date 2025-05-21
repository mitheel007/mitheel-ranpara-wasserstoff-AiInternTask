"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb, FileText } from "lucide-react"

export default function ThemeVisualizer() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Theme Analysis</CardTitle>
        <CardDescription>Visualize connections between documents and themes</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center h-[calc(100%-6rem)]">
        <div className="w-full h-64 bg-muted/30 rounded-md flex items-center justify-center mb-4 relative">
          {/* Placeholder visualization */}
          <div className="absolute" style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
            <Lightbulb className="h-8 w-8 text-primary/50" />
          </div>

          {/* Theme nodes */}
          <div
            className="absolute rounded-full bg-primary/20 border border-primary/30 w-20 h-20 flex items-center justify-center"
            style={{ top: "30%", left: "30%" }}
          >
            <span className="text-xs text-center">Theme 1</span>
          </div>

          <div
            className="absolute rounded-full bg-primary/20 border border-primary/30 w-16 h-16 flex items-center justify-center"
            style={{ top: "60%", left: "70%" }}
          >
            <span className="text-xs text-center">Theme 2</span>
          </div>

          <div
            className="absolute rounded-full bg-primary/20 border border-primary/30 w-14 h-14 flex items-center justify-center"
            style={{ top: "20%", left: "65%" }}
          >
            <span className="text-xs text-center">Theme 3</span>
          </div>

          {/* Document nodes */}
          <div
            className="absolute rounded-md bg-muted border border-muted-foreground/20 w-10 h-10 flex items-center justify-center"
            style={{ top: "40%", left: "20%" }}
          >
            <FileText className="h-4 w-4" />
          </div>

          <div
            className="absolute rounded-md bg-muted border border-muted-foreground/20 w-10 h-10 flex items-center justify-center"
            style={{ top: "15%", left: "40%" }}
          >
            <FileText className="h-4 w-4" />
          </div>

          <div
            className="absolute rounded-md bg-muted border border-muted-foreground/20 w-10 h-10 flex items-center justify-center"
            style={{ top: "70%", left: "40%" }}
          >
            <FileText className="h-4 w-4" />
          </div>

          <div
            className="absolute rounded-md bg-muted border border-muted-foreground/20 w-10 h-10 flex items-center justify-center"
            style={{ top: "50%", left: "80%" }}
          >
            <FileText className="h-4 w-4" />
          </div>

          <div
            className="absolute rounded-md bg-muted border border-muted-foreground/20 w-10 h-10 flex items-center justify-center"
            style={{ top: "30%", left: "80%" }}
          >
            <FileText className="h-4 w-4" />
          </div>
        </div>

        <p className="text-sm text-muted-foreground text-center">
          This visualization shows how themes connect across your documents. Ask a question to see real theme
          connections.
        </p>
      </CardContent>
    </Card>
  )
}
