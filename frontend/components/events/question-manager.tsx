"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Filter, CheckCircle2, EyeOff, Pin, Archive, Trash2, Loader2 } from "lucide-react"
import { QuestionCard } from "@/components/question-card" // Đảm bảo component này hiển thị đúng
import { questionApi } from "@/lib/api/questions" // [FIX] Import đúng API
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { Question } from "@/types/custom"

interface QuestionManagerProps {
  eventId: string
  eventCode: string
}

export function QuestionManager({ eventId, eventCode }: QuestionManagerProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  // 1. Tải danh sách câu hỏi
  const loadQuestions = async () => {
    setLoading(true)
    try {
      const res = await questionApi.getByEvent(eventId)
      setQuestions(res.data)
    } catch (error) {
      console.error(error)
      toast.error("Không thể tải danh sách câu hỏi")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (eventId) loadQuestions()
    
    // [TODO] Nếu có socket, lắng nghe sự kiện 'question:created', 'question:updated' ở đây để update state
  }, [eventId])

  // 2. Xử lý hành động Admin (Ghim, Ẩn, Trả lời)
  const handleModerate = async (id: string, action: 'pin' | 'hide' | 'show' | 'answer' | 'delete') => {
    try {
        // Optimistic Update (Cập nhật giao diện trước khi gọi API)
        const previousQuestions = [...questions];
        
        setQuestions(prev => {
            if (action === 'delete') return prev.filter(q => q.id !== id);
            
            return prev.map(q => {
                if (q.id !== id) {
                    // Nếu ghim câu mới, bỏ ghim câu cũ (nếu muốn chỉ 1 câu ghim)
                    return action === 'pin' ? { ...q, isPinned: false } : q
                }
                
                switch(action) {
                    case 'pin': return { ...q, isPinned: !q.isPinned };
                    case 'hide': return { ...q, status: 'HIDDEN' };
                    case 'show': return { ...q, status: 'APPROVED' }; // Hoặc PENDING
                    case 'answer': return { ...q, isAnswered: !q.isAnswered };
                    default: return q;
                }
            })
        });

        // Gọi API thực sự
        if (action === 'delete') {
            await questionApi.delete(id);
        } else {
            const question = questions.find(q => q.id === id);
            if (!question) return;

            if (action === 'pin') await questionApi.update(id, { isPinned: !question.isPinned });
            if (action === 'answer') await questionApi.update(id, { isAnswered: !question.isAnswered });
            if (action === 'hide') await questionApi.update(id, { status: 'HIDDEN' });
            if (action === 'show') await questionApi.update(id, { status: 'APPROVED' });
        }

        toast.success("Đã cập nhật thành công");
    } catch (error) {
        toast.error("Có lỗi xảy ra");
        loadQuestions(); // Revert data nếu lỗi
    }
  }

  // 3. Filter Logic
  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.content.toLowerCase().includes(searchQuery.toLowerCase())
    if (!matchesSearch) return false

    if (activeTab === 'pinned') return q.isPinned
    if (activeTab === 'answered') return q.isAnswered
    if (activeTab === 'hidden') return q.status === 'HIDDEN' || q.status === 'REJECTED'
    
    // Mặc định tab 'all' chỉ hiện câu chưa bị ẩn (hoặc hiện tất cả tùy logic)
    if (activeTab === 'all') return q.status !== 'HIDDEN' && q.status !== 'REJECTED'
    
    return true
  })

  return (
    <div className="space-y-4 h-full flex flex-col bg-white dark:bg-gray-900 rounded-lg shadow-sm border p-4">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Tìm kiếm nội dung..." 
            className="pl-8 bg-gray-50 dark:bg-gray-800" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" onClick={loadQuestions} className="ml-auto">
           <Filter className="h-4 w-4 mr-2" /> Làm mới
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-4 md:w-auto md:inline-flex bg-gray-100 dark:bg-gray-800">
          <TabsTrigger value="all">Công khai ({questions.filter(q => q.status !== 'HIDDEN').length})</TabsTrigger>
          <TabsTrigger value="pinned" className="data-[state=active]:text-orange-600"><Pin className="w-3 h-3 mr-1"/> Ghim</TabsTrigger>
          <TabsTrigger value="answered" className="data-[state=active]:text-green-600"><CheckCircle2 className="w-3 h-3 mr-1"/> Đã trả lời</TabsTrigger>
          <TabsTrigger value="hidden" className="data-[state=active]:text-gray-500"><EyeOff className="w-3 h-3 mr-1"/> Đã ẩn</TabsTrigger>
        </TabsList>

        {/* List */}
        <div className="mt-4 flex-1 overflow-y-auto pr-2 space-y-3 min-h-[400px]">
          {loading ? (
             Array.from({ length: 3 }).map((_, i) => (
               <Skeleton key={i} className="h-32 w-full rounded-lg" />
             ))
          ) : filteredQuestions.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border border-dashed rounded-lg bg-gray-50/50">
               <p>Không có câu hỏi nào trong mục này.</p>
             </div>
          ) : (
            filteredQuestions.map(q => (
              <div key={q.id} className="relative group transition-all hover:ring-1 hover:ring-primary/20 rounded-xl">
                 {/* Render câu hỏi (cần chỉnh QuestionCard để nhận type Question mới) */}
                 <QuestionCard question={q} />
                 
                 {/* Admin Actions Overlay (Hiện khi hover) */}
                 <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 p-1 rounded-md shadow-sm border">
                    <Button 
                        size="icon" variant="ghost" className={`h-8 w-8 ${q.isPinned ? 'text-orange-500 bg-orange-50' : 'text-gray-400'}`} 
                        onClick={() => handleModerate(q.id, 'pin')} title={q.isPinned ? "Bỏ ghim" : "Ghim lên đầu"}
                    >
                        <Pin className="h-4 w-4" fill={q.isPinned ? "currentColor" : "none"} />
                    </Button>
                    
                    <Button 
                        size="icon" variant="ghost" className={`h-8 w-8 ${q.isAnswered ? 'text-green-600 bg-green-50' : 'text-gray-400'}`} 
                        onClick={() => handleModerate(q.id, 'answer')} title="Đánh dấu đã trả lời"
                    >
                        <CheckCircle2 className="h-4 w-4" />
                    </Button>

                    {q.status === 'HIDDEN' ? (
                       <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-500 hover:text-blue-600" onClick={() => handleModerate(q.id, 'show')} title="Hiện lại">
                         <Archive className="h-4 w-4" />
                       </Button>
                    ) : (
                       <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-gray-600" onClick={() => handleModerate(q.id, 'hide')} title="Ẩn câu hỏi">
                         <EyeOff className="h-4 w-4" />
                       </Button>
                    )}
                    
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-red-600" onClick={() => { if(confirm('Xóa vĩnh viễn câu này?')) handleModerate(q.id, 'delete') }} title="Xóa">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                 </div>
              </div>
            ))
          )}
        </div>
      </Tabs>
    </div>
  )
}