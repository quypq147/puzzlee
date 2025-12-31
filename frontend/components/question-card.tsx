"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { VoteButton } from "@/components/vote-button" //
import { MessageSquare, Pin, User, MoreVertical, Pencil, Trash, Send, CheckCircle2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import { useAuth } from "@/hooks/use-auth" //
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EditQuestionDialog } from "@/components/dialog/edit-question-dialog"
import { questionApi } from "@/lib/api/questions"
import { toast } from "sonner"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { RoleBadge } from "@/components/ui/role-badge" //

import { Question } from "@/types/custom"
import { socket } from "@/lib/socket" // Import socket để nghe sự kiện realtime

// Helper lấy guestId cho ẩn danh
function getGuestId() {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("guest_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("guest_id", id);
  }
  return id;
}

interface QuestionCardProps {
  question: Question
  authorRole?: string | null
  onVoteChange?: (id: string, value: number) => void
  onDelete?: (id: string) => void
}


export function QuestionCard({ question, authorRole, onVoteChange, onDelete }: QuestionCardProps) {
  const { user } = useAuth()
  // State UI
  const [isExpanded, setIsExpanded] = useState(false)
  const [answers, setAnswers] = useState<any[]>([])
  const [answerCount, setAnswerCount] = useState(question.answers_count || 0)
  const [isLoadingAnswers, setIsLoadingAnswers] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const [guestName, setGuestName] = useState("")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentContent, setCurrentContent] = useState(question.content)
  const [isVoting, setIsVoting] = useState(false)
  // --- LOGIC PHÂN QUYỀN & HIỂN THỊ ---
  const isAuthor = user && user.id === question.authorId;
  const qType = question.type ? question.type.toUpperCase() : "QA";
  const isPoll = qType === 'POLL';
  const isQuiz = qType === 'QUIZ';
  const authorProfile = question.author;
  const displayName = question.isAnonymous 
    ? (question.guestName || "Ẩn danh") 
    : (authorProfile?.fullName || authorProfile?.username || "Người dùng");
  const authorAvatar = !question.isAnonymous && authorProfile?.avatarUrl;
  const displayRole = question.isAnonymous ? "GUEST" : (authorRole || "PARTICIPANT");

  // [MỚI] Vote Poll/Quiz
  const handlePollVote = async (optionId: string) => {
    if (isVoting) return;
    setIsVoting(true);
    try {
      const guestId = !user ? getGuestId() : undefined;
      await questionApi.votePoll(question.id, optionId, guestId);
      toast.success("Đã ghi nhận bình chọn!");
    } catch (error) {
      toast.error("Lỗi khi bình chọn");
    } finally {
      setIsVoting(false);
    }
  }

  // --- LOGIC REALTIME ---

  // Lắng nghe sự kiện có người trả lời (comment) mới
  useEffect(() => {
    const handleNewAnswer = (newAnswer: any) => {
      // Chỉ xử lý nếu comment thuộc về câu hỏi này
      if (newAnswer.questionId === question.id) {
        // Tăng số lượng comment
        setAnswerCount(prev => prev + 1)
        
        // Nếu đang mở khung comment thì thêm vào list luôn
        if (isExpanded) {
          setAnswers(prev => [...prev, newAnswer])
        }
      }
    }

    socket.on('answer:created', handleNewAnswer)

    return () => {
      socket.off('answer:created', handleNewAnswer)
    }
  }, [question.id, isExpanded])

  // Load tên khách từ localStorage (Client side only)
  useEffect(() => {
    if (!user) {
      const saved = localStorage.getItem("guest_identity")
      if (saved) {
        try { setGuestName(JSON.parse(saved).name) } catch {}
      }
    }
  }, [user])

  // --- HANDLERS ---

  const toggleComments = async () => {
    if (!isExpanded) {
      setIsLoadingAnswers(true)
      try {
        const res = await questionApi.getAnswers(question.id)
        setAnswers(res.data)
      } catch (e) { console.error(e) } finally { setIsLoadingAnswers(false) }
    }
    setIsExpanded(!isExpanded)
  }

  const handleSendReply = async () => {
    if (!replyContent.trim()) return
    if (!user && !guestName.trim()) return toast.error("Vui lòng nhập tên")

    try {
      const savedGuestName = user ? undefined : guestName
      if (savedGuestName) localStorage.setItem("guest_identity", JSON.stringify({ name: savedGuestName }))

      // Gọi API tạo câu trả lời
      // Lưu ý: Socket server sẽ emit lại event 'answer:created', useEffect ở trên sẽ bắt và update UI
      await questionApi.createAnswer({
        questionId: question.id,
        content: replyContent,
        guestName: savedGuestName
      })
      
      setReplyContent("")
      // Không cần setAnswers thủ công ở đây nếu Socket hoạt động tốt, 
      // nhưng để UX mượt hơn có thể set tạm (optimistic update) nếu muốn.
    } catch (error) { toast.error("Lỗi gửi câu trả lời") }
  }

  const handleDelete = async () => {
    try {
      await questionApi.delete(question.id)
      toast.success("Đã xóa")
      onDelete?.(question.id)
    } catch { toast.error("Lỗi xóa") }
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow group relative bg-white dark:bg-gray-800 mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1">
              {/* Badge loại câu hỏi */}
              <div className="flex items-center gap-2 mb-1">
                 {isPoll && <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">Poll</Badge>}
                 {isQuiz && <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">Quiz</Badge>}
                 {question.isPinned && <Badge variant="secondary" className="gap-1"><Pin className="w-3 h-3"/> Ghim</Badge>}
              </div>
              <h3 className="font-semibold text-base whitespace-pre-wrap text-foreground break-words">{currentContent}</h3>

              {/* MEDIA HIỂN THỊ */}
              {question.mediaUrl && (
                <div className="mt-3">
                  {question.mediaType?.startsWith('image') ? (
                    <img
                      src={question.mediaUrl}
                      alt="media"
                      className="max-h-64 rounded-lg border object-contain bg-muted w-full mx-auto"
                      style={{ maxWidth: '100%' }}
                    />
                  ) : question.mediaType?.startsWith('video') ? (
                    <video
                      src={question.mediaUrl}
                      controls
                      className="max-h-64 rounded-lg border bg-black w-full mx-auto"
                      style={{ maxWidth: '100%' }}
                    />
                  ) : null}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
               <Badge variant={(!question.status || question.status === 'VISIBLE') ? 'default' : 'secondary'}>
                 {(!question.status || question.status === 'VISIBLE') ? 'Mở' : 'Đóng'}
               </Badge>
               
               {/* Menu Sửa/Xóa: CHỈ HIỆN KHI LÀ AUTHOR */}
               {isAuthor && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"><MoreVertical className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}><Pencil className="mr-2 h-4 w-4" /> Sửa</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive"><Trash className="mr-2 h-4 w-4" /> Xóa</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* HIỂN THỊ POLL / QUIZ OPTIONS */}
          {(isPoll || isQuiz) && question.pollOptions && question.pollOptions.length > 0 && (
            <div className="my-3 space-y-3">
              {question.pollOptions.map((opt: any) => {
                // Tính toán % vote
                const totalVotes = question.pollOptions?.reduce((acc: number, curr: any) => acc + (curr._count?.votes || curr.voteCount || 0), 0) || 0;
                const voteCount = opt._count?.votes || opt.voteCount || 0;
                const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

                return (
                  <div key={opt.id} className="relative group/opt">
                    {/* Progress Bar Background */}
                    <div className="absolute inset-0 bg-secondary/30 rounded-md overflow-hidden h-full">
                       <div className="h-full bg-blue-100/50 dark:bg-blue-900/30 transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                    </div>
                    
                    {/* Nội dung Option */}
                    <div 
                      className="relative p-3 flex justify-between items-center cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition select-none"
                      onClick={() => handlePollVote(opt.id)}
                    >
                      <span className="font-medium text-sm flex items-center gap-2">
                        {isQuiz && opt.isCorrect && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                        {opt.content}
                      </span>
                      <span className="text-xs font-bold text-muted-foreground">{percentage}% ({voteCount})</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                 {authorAvatar ? (
                   <img src={authorAvatar} className="w-5 h-5 rounded-full object-cover border border-border" alt="avatar" />
                 ) : (
                   <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center">
                     <User className="w-3 h-3 text-muted-foreground" />
                   </div>
                 )}
                 <div className="flex items-center gap-1.5">
                   <span className="font-medium truncate max-w-[150px]">{displayName}</span>
                   {/* Role Badge: Hiện cho cả Admin, Mod và Guest */}
                   <RoleBadge role={displayRole} />
                 </div>
              </div>
              <span>•</span>
              <span>{question.createdAt ? formatDistanceToNow(new Date(question.createdAt), { addSuffix: true, locale: vi }) : 'Vừa xong'}</span>
            </div>

            <div className="flex items-center gap-3">
               {/* Nút bật/tắt bình luận */}
               <Button variant="ghost" size="sm" onClick={toggleComments} className="flex gap-1 px-2 h-8">
                  <MessageSquare className="w-4 h-4"/> {answerCount}
               </Button>
               
               {/* Chỉ hiện Vote Up/Down cho Q&A, Poll thì không cần vote kiểu này */}
               {!isPoll && !isQuiz && (
                 <VoteButton initialVotes={question.upvotes || 0} questionId={question.id} onVoteChange={onVoteChange} />
               )}
            </div>
          </div>

          {/* KHUNG BÌNH LUẬN (Real-time updates) */}
           {isExpanded && (
            <div className="mt-4 pt-4 border-t border-dashed animate-in fade-in slide-in-from-top-2">
                {/* Danh sách bình luận */}
                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-1">
                   {isLoadingAnswers ? <p className="text-xs text-center">Đang tải...</p> : answers.length === 0 && <p className="text-xs text-center italic text-muted-foreground">Chưa có câu trả lời nào.</p>}
                   
                   {answers.map((ans) => (
                     <div key={ans.id} className="flex gap-2 text-sm group">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 font-bold text-[10px] text-blue-600">
                          {(ans.author?.fullName || ans.guestName || "U")[0]?.toUpperCase()}
                        </div>
                        <div className="bg-muted/50 p-2 rounded-lg rounded-tl-none flex-1">
                           <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-xs">{ans.author?.fullName || ans.guestName || "Người dùng"}</span>
                              <span className="text-[10px] text-muted-foreground">{ans.createdAt ? formatDistanceToNow(new Date(ans.createdAt), { locale: vi }) : ''}</span>
                           </div>
                           <p className="text-foreground break-words">{ans.content}</p>
                        </div>
                     </div>
                   ))}
                </div>

                {/* Form nhập bình luận */}
                <div className="flex flex-col gap-2">
                   {!user && (
                     <Input 
                       placeholder="Tên của bạn..." 
                       value={guestName} 
                       onChange={e => setGuestName(e.target.value)} 
                       className="h-8 text-sm"
                     />
                   )}
                   <div className="flex gap-2">
                      <Input 
                        placeholder="Viết câu trả lời..." 
                        value={replyContent} 
                        onChange={e => setReplyContent(e.target.value)} 
                        onKeyDown={e => e.key === 'Enter' && handleSendReply()}
                        className="flex-1 h-9 text-sm"
                      />
                      <Button size="sm" onClick={handleSendReply} disabled={!replyContent.trim()}>
                        <Send className="w-4 h-4" />
                      </Button>
                   </div>
                </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Dialog Sửa / Xóa */}
       <EditQuestionDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} question={{ id: question.id, content: currentContent }} onSuccess={(newContent) => setCurrentContent(newContent)} />
       
       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
         <AlertDialogContent>
           <AlertDialogHeader>
             <AlertDialogTitle>Xóa câu hỏi?</AlertDialogTitle>
             <AlertDialogDescription>Không thể hoàn tác hành động này.</AlertDialogDescription>
           </AlertDialogHeader>
           <AlertDialogFooter>
             <AlertDialogCancel>Hủy</AlertDialogCancel>
             <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Xóa</AlertDialogAction>
           </AlertDialogFooter>
         </AlertDialogContent>
       </AlertDialog>
    </>
  )
}