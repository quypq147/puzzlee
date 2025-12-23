// lib/realtime.ts
import { createClient } from "@/lib/supabase/client";

export function subscribeToEventQuestions(eventId: string, onNew: (q: any) => void) {
  const supabase = createClient();

  const channel = supabase
    .channel(`questions:event:${eventId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "questions",
        filter: `event_id=eq.${eventId}`,
      },
      (payload) => {
        onNew(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
