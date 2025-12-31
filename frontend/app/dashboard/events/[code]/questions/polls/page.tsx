import { QuestionsList } from "@/components/questions-list"

export default async function PollsPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Các cuộc bình chọn</h2>
      <QuestionsList eventId={code} type="POLL" />
    </div>
  )
}