import { QuestionsList } from "@/components/questions-list"

export default async function QuizPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Câu đố vui</h2>
      <QuestionsList eventId={code} type="quiz" />
    </div>
  )
}