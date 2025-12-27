"use client";

import { useEffect, useState } from "react";
import { useOrganization } from "@/contexts/organization-context";
import { Event } from "@/types/custom";
import {apiClient} from "@/lib/api-client";
import { OrgSwitcher } from "@/components/org-switcher";
import { CreateEventDialog } from "@/components/dialog/create-event-dialog";
import { EventCard } from "@/components/event-card"; // Giả sử bạn đã có component này
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { currentOrganization, isLoading: isOrgLoading } = useOrganization();
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  // Hàm load events
  const loadEvents = async () => {
    if (!currentOrganization) return;
    setLoadingEvents(true);
    try {
      // Gọi API lấy events theo Org ID
      const res = await apiClient.get(`/events/org/${currentOrganization.id}`);
      setEvents(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [currentOrganization]); // Chạy lại khi đổi Org

  if (isOrgLoading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Tổng quan</h2>
          <p className="text-muted-foreground">Quản lý sự kiện trong tổ chức của bạn.</p>
        </div>
        
        <div className="flex items-center gap-3">
            {/* Dropdown chuyển Org */}
            <OrgSwitcher /> 
            
            {/* Nút tạo Event */}
            <CreateEventDialog onEventCreated={loadEvents} />
        </div>
      </div>
      
      {/* Danh sách Event */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
        
        {events.length === 0 && !loadingEvents && (
             <div className="col-span-full flex flex-col items-center justify-center py-16 border border-dashed rounded-lg bg-muted/50">
                <p className="text-lg font-medium text-muted-foreground mb-2">Chưa có sự kiện nào</p>
                <p className="text-sm text-muted-foreground mb-4">Hãy tạo sự kiện đầu tiên cho {currentOrganization?.name}</p>
                <CreateEventDialog onEventCreated={loadEvents} />
             </div>
        )}
      </div>
    </div>
  );
}