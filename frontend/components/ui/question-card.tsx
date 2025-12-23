"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { VoteButton } from "@/components/vote-button"
import { MessageSquare, Pin, User, MoreVertical, Pencil, Trash } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
// Sử dụng type QuestionExtended như trong file custom.ts của bạn
import { QuestionExtended } from "@/types/custom" 
import { useAuth } from "@/hooks/use-auth"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EditQuestionDialog } from "@/components/dialog/edit-question-dialog"
import { deleteQuestion } from "@/lib/api/questions"
import { toast } from "sonner"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { RoleBadge } from "@/components/ui/role-badge" // Import component RoleBadge mới

interface QuestionCardProps {
  question: QuestionExtended
  authorRole?: string | null // [MỚI] Nhận role từ component cha
  onVoteChange?: (id: string, value: number) => void
  onDelete?: (id: string) => void
}

export function QuestionCard({ question, authorRole, onVoteChange, onDelete }: QuestionCardProps) {
  const { user } = useAuth()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentContent, setCurrentContent] = useState(question.content)
  
  const isAuthor = user?.id === question.author_id
  const isPollOrQuiz = question.type === 'poll' || question.type === 'quiz';

  const authorProfile = question.profiles;
  const authorName = question.is_anonymous 
    ? "Ẩn danh" 
    : (authorProfile?.first_name ? `${authorProfile.first_name} ${authorProfile.second_name || ''}` : "Người dùng");
  
  const authorAvatar = !question.is_anonymous && authorProfile?.avatar_url;

  const handleDelete = async () => {
    try {
      await deleteQuestion(question.id)
      toast.success("Đã xóa câu hỏi")
      onDelete?.(question.id)
    } catch (error) {
      toast.error("Không thể xóa câu hỏi")
    }
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow group relative bg-white dark:bg-gray-800">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                 {question.type === 'poll' && <Badge variant="outline" className="text-blue-600 border-blue-200">Bình chọn</Badge>}
                 {question.type === 'quiz' && <Badge variant="outline" className="text-purple-600 border-purple-200">Câu đố</Badge>}
                 {question.is_pinned && <Badge variant="secondary" className="gap-1"><Pin className="w-3 h-3"/> Ghim</Badge>}
              </div>
              <h3 className="font-semibold text-base whitespace-pre-wrap text-foreground break-words">{currentContent}</h3>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={question.status === 'VISIBLE' ? 'default' : 'secondary'}>
                 {question.status === 'VISIBLE' ? 'Mở' : 'Đóng'}
              </Badge>

              {isAuthor && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                      <Pencil className="mr-2 h-4 w-4" /> Chỉnh sửa
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive">
                      <Trash className="mr-2 h-4 w-4" /> Xóa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isPollOrQuiz && question.question_options?.length ? (
            <div className="my-3 space-y-2 pl-4 border-l-2 border-muted">
              {question.question_options.map((opt) => (
                <div key={opt.id} className="p-2 bg-secondary/50 rounded-md text-sm flex justify-between">
                  <span>{opt.content}</span>
                </div>
              ))}
            </div>
          ) : null}

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
                   <span className="font-medium truncate max-w-[150px]">{authorName}</span>
                   
                   {/* [HIỂN THỊ ROLE BADGE] */}
                   {!question.is_anonymous && authorRole && <RoleBadge role={authorRole} />}
                 </div>
              </div>
              
              <span>•</span>
              
              <span>
                {question.created_at 
                  ? formatDistanceToNow(new Date(question.created_at), { addSuffix: true, locale: vi })
                  : 'Vừa xong'}
              </span>
            </div>

            <div className="flex items-center gap-3">
               <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MessageSquare className="w-4 h-4"/> {question.answers_count || 0}
               </div>
               
               <VoteButton 
                  initialVotes={question.score || 0}
                  questionId={question.id}
                  onVoteChange={onVoteChange}
               />
            </div>
          </div>
        </CardContent>
      </Card>

      <EditQuestionDialog 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen}
        question={{ id: question.id, content: currentContent }}
        onSuccess={(newContent) => setCurrentContent(newContent)}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>Hành động này không thể hoàn tác.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}