"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"

export function useRealtimeQuestions(eventId: string) {
  const supabase = createClient()
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  const subscribe = useCallback(() => {
    const questionChannel = supabase
      .channel(`questions:event_id=eq.${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "questions",
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          console.log("[Realtime] Câu hỏi mới:", payload.new)
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "questions",
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          console.log("[Realtime] Câu hỏi cập nhật:", payload.new)
        },
      )
      .subscribe()

    setChannel(questionChannel)

    return () => {
      supabase.removeChannel(questionChannel)
    }
  }, [supabase, eventId])

  useEffect(() => {
    subscribe()
  }, [subscribe])

  return { channel }
}

export function useRealtimeVotes() {
  const supabase = createClient()

  return supabase.channel("votes").on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "question_votes",
    },
    (payload) => {
      console.log("[Realtime] Thay đổi vote:", payload)
    },
  )
}
