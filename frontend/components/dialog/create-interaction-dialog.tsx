"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  BarChart3, 
  Cloud, 
  MessageSquare, 
  ListOrdered, 
  Star, 
  Trophy, 
} from "lucide-react"
import { QuestionForm } from "@/components/question-form"
import { QuestionType } from "@/types/custom"

interface CreateInteractionDialogProps {
  eventId: string
  trigger?: React.ReactNode 
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onQuestionCreated?: () => void
}

export function CreateInteractionDialog({ 
  eventId, 
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  onQuestionCreated
}: CreateInteractionDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [step, setStep] = useState<'selection' | 'form'>('selection')
  const [selectedType, setSelectedType] = useState<QuestionType>('qa')

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? setControlledOpen : setInternalOpen

  const handleSelect = (type: QuestionType) => {
    setSelectedType(type)
    setStep('form')
  }

  const handleBack = () => {
    setStep('selection')
  }

  const handleSuccess = () => {
    onQuestionCreated?.()
    if (!isControlled) setInternalOpen(false)
    if (setControlledOpen) setControlledOpen(false)
    setTimeout(() => setStep('selection'), 300)
  }

  // Danh sách các loại tương tác
  const interactionTypes = [
    {
      id: 'poll',
      label: 'Trắc nghiệm',
      icon: <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      disabled: false,
      visual: (
        <div className="flex flex-col gap-2 w-3/4 mx-auto">
            <div className="h-2 w-full bg-blue-600 rounded-full"></div>
            <div className="h-2 w-2/3 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="h-2 w-1/2 bg-blue-400/50 rounded-full"></div>
        </div>
      )
    },
    {
      id: 'cloud',
      label: 'Đám mây từ',
      icon: <Cloud className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
      disabled: true, 
      visual: (
        <div className="flex flex-wrap gap-1 justify-center items-center w-4/5">
            <div className="h-3 w-8 bg-purple-200 dark:bg-purple-900/30 rounded-full"></div>
            <div className="h-5 w-12 bg-purple-600 rounded-full"></div>
            <div className="h-3 w-6 bg-purple-300 dark:bg-purple-700 rounded-full"></div>
        </div>
      )
    },
    {
      id: 'qa',
      label: 'Câu hỏi mở',
      icon: <MessageSquare className="w-6 h-6 text-teal-600 dark:text-teal-400" />,
      visual: (
        <div className="space-y-1 w-3/4">
            <div className="p-1.5 bg-teal-600 rounded-lg rounded-bl-none w-3/4 ml-auto"></div>
            <div className="p-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg rounded-br-none w-3/4"></div>
        </div>
      )
    },
    {
      id: 'quiz',
      label: 'Đố vui',
      icon: <Trophy className="w-6 h-6 text-orange-600 dark:text-orange-400" />,
      visual: (
        <div className="flex flex-col items-center justify-center">
             <Trophy className="w-10 h-10 text-orange-500/20" />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <Trophy className="w-8 h-8 text-orange-500" />
             </div>
        </div>
      )
    },
    {
      id: 'rating',
      label: 'Đánh giá',
      icon: <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />,
      disabled: true,
      visual: (
        <div className="flex gap-0.5 justify-center">
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            <Star className="w-3 h-3 text-gray-300 dark:text-gray-600" />
        </div>
      )
    },
    {
        id: 'ranking',
        label: 'Xếp hạng',
        icon: <ListOrdered className="w-6 h-6 text-pink-600 dark:text-pink-400" />,
        disabled: true,
        visual: (
          <div className="flex flex-col gap-1.5 w-3/4 mx-auto">
              <div className="h-1.5 w-full bg-pink-500 rounded-full"></div>
              <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          </div>
        )
      },
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 bg-[#f8f9fa] dark:bg-gray-900">
        <DialogHeader className="p-6 border-b bg-white dark:bg-gray-900 shrink-0">
          <DialogTitle>
            {step === 'selection' ? "Thêm tương tác mới" : "Chi tiết tương tác"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {step === 'selection' ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {interactionTypes.map((item) => (
                <button
                  key={item.id}
                  onClick={() => !item.disabled && handleSelect(item.id as QuestionType)}
                  disabled={item.disabled}
                  className={`
                    group relative flex flex-col items-center text-left rounded-xl transition-all
                    ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1 cursor-pointer'}
                  `}
                >
                  {/* Card Visual */}
                  <div className={`
                    w-full aspect-4/3 mb-3 rounded-xl border border-transparent 
                    group-hover:shadow-lg group-hover:border-gray-200 dark:group-hover:border-gray-700
                    bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden relative
                  `}>
                     {item.visual}
                  </div>

                  {/* Label */}
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-md bg-white dark:bg-gray-800 shadow-sm border dark:border-gray-700">
                        {item.icon}
                    </span>
                    <span className="font-medium text-sm text-gray-700 dark:text-gray-200">
                        {item.label}
                    </span>
                  </div>
                  
                  {item.disabled && (
                      <span className="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 border">Soon</span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm">
               <QuestionForm 
                  eventId={eventId} 
                  defaultType={selectedType}
                  onBack={handleBack}
                  onQuestionCreated={handleSuccess}
               />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}