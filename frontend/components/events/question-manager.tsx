"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Filter, CheckCircle2, EyeOff, Pin, Archive } from "lucide-react"
import { QuestionCard } from "@/components/question-card"
import { getQuestionsForAdmin, moderateQuestion } from "@/lib/api/questions"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

interface QuestionManagerProps {
  eventId: string
  eventCode: string
}

export function QuestionManager({ eventId, eventCode }: QuestionManagerProps) {
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const loadQuestions = async () => {
    setLoading(true)
    try {
      const data = await getQuestionsForAdmin(eventId)
      setQuestions(data)
    } catch (error) {
      toast.error("Không thể tải danh sách câu hỏi")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadQuestions()
    // Ở đây nên subscribe realtime để thấy câu hỏi mới ngay lập tức
  }, [eventId])

  // Xử lý hành động từ QuestionCard (cần sửa QuestionCard để emit event này hoặc wrap nó)
  const handleModerate = async (id: string, action: 'pin' | 'hide' | 'show' | 'answer') => {
    try {
        // Optimistic update
        setQuestions(prev => prev.map(q => {
            if (q.id !== id) {
                // Nếu pin, bỏ pin các câu khác (nếu logic là chỉ 1 câu pin)
                if (action === 'pin') return { ...q, is_pinned: false }
                return q
            }
            if (action === 'pin') return { ...q, is_pinned: true }
            if (action === 'hide') return { ...q, status: 'HIDDEN' }
            if (action === 'show') return { ...q, status: 'VISIBLE' }
            if (action === 'answer') return { ...q, is_answered: true }
            return q
        }))

        await moderateQuestion(id, action)
        toast.success("Đã cập nhật trạng thái")
    } catch (error) {
        toast.error("Lỗi cập nhật")
        loadQuestions() // Revert nếu lỗi
    }
  }

  // Filter Logic
  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.content.toLowerCase().includes(searchQuery.toLowerCase())
    if (!matchesSearch) return false

    if (activeTab === 'pending') return q.status === 'VISIBLE' && !q.is_answered && !q.is_pinned
    if (activeTab === 'answered') return q.is_answered
    if (activeTab === 'hidden') return q.status === 'HIDDEN'
    if (activeTab === 'pinned') return q.is_pinned
    
    return true // 'all'
  })

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex justify-between items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Tìm kiếm câu hỏi..." 
            className="pl-8" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" onClick={loadQuestions} title="Làm mới">
           <Filter className="h-4 w-4" />
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-4 md:w-auto md:inline-flex">
          <TabsTrigger value="all">Tất cả ({questions.length})</TabsTrigger>
          <TabsTrigger value="pinned" className="text-orange-600"><Pin className="w-3 h-3 mr-1"/> Ghim</TabsTrigger>
          <TabsTrigger value="answered" className="text-green-600"><CheckCircle2 className="w-3 h-3 mr-1"/> Đã trả lời</TabsTrigger>
          <TabsTrigger value="hidden" className="text-gray-500"><EyeOff className="w-3 h-3 mr-1"/> Đã ẩn</TabsTrigger>
        </TabsList>

        <div className="mt-4 flex-1 overflow-y-auto pr-2 space-y-3 min-h-[400px]">
          {loading ? (
             Array.from({ length: 3 }).map((_, i) => (
               <Skeleton key={i} className="h-32 w-full rounded-lg" />
             ))
          ) : filteredQuestions.length === 0 ? (
             <div className="text-center py-10 text-muted-foreground border border-dashed rounded-lg">
               Không có câu hỏi nào trong mục này.
             </div>
          ) : (
            filteredQuestions.map(q => (
              <div key={q.id} className="relative group">
                 <QuestionCard question={q} />
                 
                 {/* Admin Overlay Toolbar - Chỉ hiện khi hover */}
                 <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 p-1 rounded-md shadow-sm border">
                    {!q.is_pinned && (
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleModerate(q.id, 'pin')} title="Ghim câu hỏi">
                        <Pin className="h-4 w-4 text-orange-500" />
                      </Button>
                    )}
                    
                    {!q.is_answered && (
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleModerate(q.id, 'answer')} title="Đánh dấu đã trả lời">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      </Button>
                    )}

                    {q.status === 'VISIBLE' ? (
                       <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleModerate(q.id, 'hide')} title="Ẩn câu hỏi">
                         <EyeOff className="h-4 w-4 text-gray-500" />
                       </Button>
                    ) : (
                       <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleModerate(q.id, 'show')} title="Hiện lại">
                         <Archive className="h-4 w-4 text-blue-500" />
                       </Button>
                    )}
                 </div>
              </div>
            ))
          )}
        </div>
      </Tabs>
    </div>
  )
}