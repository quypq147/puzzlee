"use client";

import { useEffect, useState } from "react";
import { getMyEvents } from "@/lib/api/event"; // API mới
import { Event } from "@/types/custom"; // Type mới
import { EventCard } from "@/components/event-card"; // Component hiển thị (giữ nguyên UI)
import { CreateEventDialog } from "@/components/dialog/create-event-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const data = await getMyEvents();
      setEvents(data);
    } catch (error) {
      console.error("Lỗi tải sự kiện", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Sự kiện của tôi</h2>
        <CreateEventDialog onCreated={fetchEvents} />
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[200px] w-full rounded-xl" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          Bạn chưa tham gia sự kiện nào.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}