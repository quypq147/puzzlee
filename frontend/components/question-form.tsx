// components/question-form.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, HelpCircle, BarChart3, CheckCircle2, Circle } from "lucide-react"
import { createQuestion } from "@/lib/api/questions" // Gọi từ lib mới
import { toast } from "sonner"
import { QuestionType } from "@/types/custom"

interface QuestionFormProps {
  eventId: string
  onQuestionCreated?: (question: any) => void
}

export function QuestionForm({ eventId, onQuestionCreated }: QuestionFormProps) {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<QuestionType>('qa')
  const [content, setContent] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  
  const [options, setOptions] = useState<{ content: string; is_correct: boolean }[]>([
    { content: "", is_correct: false },
    { content: "", is_correct: false }
  ])

  // --- Logic xử lý Options (giống logic Interaction cũ) ---
  const addOption = () => setOptions([...options, { content: "", is_correct: false }])
  
  const removeOption = (idx: number) => {
    if (options.length <= 2) return
    setOptions(options.filter((_, i) => i !== idx))
  }

  const updateOption = (idx: number, text: string) => {
    const newOpts = [...options]
    newOpts[idx].content = text
    setOptions(newOpts)
  }

  const setCorrectAnswer = (idx: number) => {
    const newOpts = options.map((opt, i) => ({ ...opt, is_correct: i === idx }))
    setOptions(newOpts)
  }
  // --------------------------------------------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return toast.error("Vui lòng nhập nội dung")

    // Validate cho Poll/Quiz
    if (activeTab !== 'qa') {
      const validOptions = options.filter(o => o.content.trim())
      if (validOptions.length < 2) return toast.error("Cần tối thiểu 2 lựa chọn")
      if (activeTab === 'quiz' && !options.some(o => o.is_correct)) {
        return toast.error("Vui lòng chọn đáp án đúng")
      }
    }

    setLoading(true)
    try {
      const newQuestion = await createQuestion({
        event_id: eventId,
        content,
        type: activeTab,
        is_anonymous: isAnonymous,
        options: activeTab === 'qa' ? undefined : options.filter(o => o.content.trim())
      })

      toast.success("Đăng thành công!")
      // Reset form
      setContent("")
      setOptions([{ content: "", is_correct: false }, { content: "", is_correct: false }])
      onQuestionCreated?.(newQuestion)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-primary/20 bg-card">
      <CardHeader className="pb-3 pt-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as QuestionType)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="qa"><HelpCircle className="w-4 h-4 mr-2"/> Hỏi đáp</TabsTrigger>
            <TabsTrigger value="poll"><BarChart3 className="w-4 h-4 mr-2"/> Bình chọn</TabsTrigger>
            <TabsTrigger value="quiz"><CheckCircle2 className="w-4 h-4 mr-2"/> Câu đố</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder={activeTab === 'qa' ? "Đặt câu hỏi cho diễn giả..." : "Nhập câu hỏi..."}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-20"
          />

          {(activeTab === 'poll' || activeTab === 'quiz') && (
            <div className="space-y-2">
              <Label>Các lựa chọn:</Label>
              {options.map((opt, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  {activeTab === 'quiz' && (
                    <button type="button" onClick={() => setCorrectAnswer(idx)}>
                      {opt.is_correct 
                        ? <CheckCircle2 className="w-5 h-5 text-green-500"/> 
                        : <Circle className="w-5 h-5 text-muted-foreground"/>}
                    </button>
                  )}
                  <Input 
                    value={opt.content} 
                    onChange={(e) => updateOption(idx, e.target.value)}
                    placeholder={`Lựa chọn ${idx + 1}`} 
                  />
                  {options.length > 2 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(idx)}>
                      <Trash2 className="w-4 h-4 text-destructive"/>
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addOption} className="w-full mt-2">
                <Plus className="w-4 h-4 mr-1"/> Thêm lựa chọn
              </Button>
            </div>
          )}

          <div className="flex justify-between items-center pt-2">
            <div className="flex items-center space-x-2">
              <Switch id="anon" checked={isAnonymous} onCheckedChange={setIsAnonymous} />
              <Label htmlFor="anon">Ẩn danh</Label>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Đang gửi..." : "Gửi đi"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}