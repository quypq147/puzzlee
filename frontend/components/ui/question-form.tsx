"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface QuestionFormProps {
  eventId: string
  onQuestionCreated: (question: any) => void
}

export function QuestionForm({ eventId, onQuestionCreated }: QuestionFormProps) {
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: eventId, title, content }),
      })

      if (res.ok) {
        const question = await res.json()
        onQuestionCreated(question)
        setTitle("")
        setContent("")
      }
    } catch (error) {
      console.error("Failed to create question:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="text-lg">Đặt một câu hỏi</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Input
              placeholder="Tiêu đề câu hỏi..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
              className="font-medium"
            />
          </div>

          <div>
            <Textarea
              placeholder="Mô tả chi tiết (tùy chọn)..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={loading}
              className="resize-none"
              rows={3}
            />
          </div>

          <Button type="submit" disabled={loading || !title.trim()} className="w-full">
            {loading ? "Đang gửi..." : "Gửi câu hỏi"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
