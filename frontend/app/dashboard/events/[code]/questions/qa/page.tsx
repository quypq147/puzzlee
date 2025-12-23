import { QuestionsList } from "@/components/questions-list"

// 1. Thêm async
// 2. Định nghĩa type cho params là Promise
export default async function QAPage({ params }: { params: Promise<{ code: string }> }) {
  // 3. Await params để lấy code
  const { code } = await params;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Danh sách câu hỏi</h2>
      <QuestionsList eventId={code} type="qa" />
    </div>
  )
}