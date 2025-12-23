import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { subscribeToEventQuestions } from "@/lib/realtime";

export function useEventQuestions(eventId: string) {
  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    if (!eventId) return;

    const supabase = createClient();

    supabase
      .from("questions")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false })
      .then((res) => {
        setQuestions(res.data ?? []);
      });

    const unsubscribe = subscribeToEventQuestions(eventId, (q) => {
      setQuestions((prev) => [q, ...prev]);
    });

    return () => unsubscribe();
  }, [eventId]);

  return { questions };
}
