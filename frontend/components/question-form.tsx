"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, HelpCircle, BarChart3, CheckCircle2, Circle, ArrowLeft } from "lucide-react"
// Import hàm createQuestion đã được export ở Bước 1
import { createQuestion } from "@/lib/api/questions" 
import { toast } from "sonner"
import { QuestionType } from "@/types/custom"

interface QuestionFormProps {
  eventId: string
  onQuestionCreated?: (question: any) => void
  defaultType?: QuestionType // [Mới] Nhận loại câu hỏi mặc định từ Dialog
  onBack?: () => void        // [Mới] Nút quay lại để chọn loại khác
}

export function QuestionForm({ eventId, onQuestionCreated, defaultType = 'qa', onBack }: QuestionFormProps) {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<QuestionType>(defaultType)
  const [content, setContent] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  
  // Cập nhật tab khi prop thay đổi (khi chọn từ Dialog)
  useEffect(() => {
    if (defaultType) setActiveTab(defaultType)
  }, [defaultType])

  const [options, setOptions] = useState<{ content: string; is_correct: boolean }[]>([
    { content: "", is_correct: false },
    { content: "", is_correct: false }
  ])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return toast.error("Vui lòng nhập nội dung")

    if (activeTab !== 'qa') {
      const validOptions = options.filter(o => o.content.trim())
      if (validOptions.length < 2) return toast.error("Cần tối thiểu 2 lựa chọn")
      if (activeTab === 'quiz' && !options.some(o => o.is_correct)) {
        return toast.error("Vui lòng chọn đáp án đúng")
      }
    }

    setLoading(true)
    try {
      // Gọi API createQuestion
      const newQuestion = await createQuestion({
        eventId: eventId,        // [FIX] Khớp với backend (eventId)
        content,
        isAnonymous: isAnonymous, // [FIX] Khớp với backend (isAnonymous)
        type: activeTab.toUpperCase(), 
        // [FIX] Khớp với backend (pollOptions)
        ...(activeTab !== 'qa' && { 
            pollOptions: options.filter(o => o.content.trim()).map(o => ({ 
                content: o.content, 
                isCorrect: o.is_correct 
            })) 
        })
      })

      toast.success("Đăng thành công!")
      setContent("")
      setOptions([{ content: "", is_correct: false }, { content: "", is_correct: false }])
      onQuestionCreated?.(newQuestion)
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || "Lỗi khi tạo câu hỏi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="pb-3 pt-0 px-0">
        <div className="flex items-center gap-2 mb-4">
           {/* Nút quay lại chỉ hiện khi được gọi từ Dialog */}
           {onBack && (
              <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8 -ml-2">
                  <ArrowLeft className="h-4 w-4" />
              </Button>
           )}
           <h3 className="font-semibold text-lg">
              {activeTab === 'qa' && "Tạo câu hỏi Q&A"}
              {activeTab === 'poll' && "Tạo bình chọn (Poll)"}
              {activeTab === 'quiz' && "Tạo câu đố (Quiz)"}
           </h3>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as QuestionType)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50">
            <TabsTrigger value="qa"><HelpCircle className="w-4 h-4 mr-2"/> Hỏi đáp</TabsTrigger>
            <TabsTrigger value="poll"><BarChart3 className="w-4 h-4 mr-2"/> Bình chọn</TabsTrigger>
            <TabsTrigger value="quiz"><CheckCircle2 className="w-4 h-4 mr-2"/> Câu đố</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      
      <CardContent className="px-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nội dung</Label>
            <Textarea
              placeholder={activeTab === 'qa' ? "Đặt câu hỏi cho diễn giả..." : "Nhập câu hỏi..."}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-24 resize-none text-base bg-muted/20"
            />
          </div>

          {(activeTab === 'poll' || activeTab === 'quiz') && (
            <div className="space-y-3">
              <Label>Các lựa chọn:</Label>
              {options.map((opt, idx) => (
                <div key={idx} className="flex gap-2 items-center group">
                  {activeTab === 'quiz' && (
                    <button type="button" onClick={() => setCorrectAnswer(idx)} className="shrink-0" title="Chọn đáp án đúng">
                      {opt.is_correct 
                        ? <CheckCircle2 className="w-5 h-5 text-green-600"/> 
                        : <Circle className="w-5 h-5 text-gray-300 hover:text-gray-400"/>}
                    </button>
                  )}
                  <Input 
                    value={opt.content} 
                    onChange={(e) => updateOption(idx, e.target.value)}
                    placeholder={`Lựa chọn ${idx + 1}`} 
                    className="flex-1"
                  />
                  {options.length > 2 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(idx)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-4 h-4 text-red-500"/>
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addOption} className="w-full border-dashed">
                <Plus className="w-4 h-4 mr-1"/> Thêm lựa chọn
              </Button>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t mt-4">
            <div className="flex items-center space-x-2">
              <Switch id="anon" checked={isAnonymous} onCheckedChange={setIsAnonymous} />
              <Label htmlFor="anon" className="cursor-pointer font-normal">Ẩn danh</Label>
            </div>
            <div className="flex gap-2">
               {onBack && <Button type="button" variant="ghost" onClick={onBack}>Hủy</Button>}
               <Button type="submit" disabled={loading} className="min-w-[100px] bg-indigo-600 hover:bg-indigo-700 text-white">
                 {loading ? "Đang gửi..." : "Tạo mới"}
               </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}