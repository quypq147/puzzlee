import { QuestionsList } from "@/components/questions-list"

export default async function QAPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Danh sách câu hỏi</h2>
      {/* [FIX] Sửa 'qa' thành 'QA' để khớp với Enum Backend/Interface */}
      <QuestionsList eventId={code} type="QA" />
    </div>
  )
}