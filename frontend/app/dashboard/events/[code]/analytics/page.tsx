"use client";

import React, { useEffect, useState, use } from "react";
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement 
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/lib/api-client";
import { 
  Users, 
  MessageSquare, 
  ThumbsUp, 
  Loader2, 
  CheckCircle2, 
  HelpCircle, 
  EyeOff 
} from "lucide-react";
import { toast } from "sonner";

// Đăng ký ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

interface EventStats {
  eventName: string;
  totalMembers: number;
  totalQuestions: number;
  totalVotes: number;
  questionsByStatus: {
    PENDING?: number;
    APPROVED?: number;
    HIDDEN?: number;
    REJECTED?: number;
    [key: string]: number | undefined;
  };
}

export default function EventAnalyticsPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<EventStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Gọi API Backend: GET /api/events/:code/stats
        const { data } = await apiClient.get(`/events/${code}/stats`);
        setStats(data);
      } catch (error) {
        console.error("Lỗi tải thống kê:", error);
        toast.error("Không thể tải dữ liệu thống kê");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [code]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) return <div>Không có dữ liệu.</div>;

  // Cấu hình biểu đồ tròn (Status)
  const statusData = {
    labels: ['Đã duyệt', 'Chờ duyệt', 'Đã ẩn'],
    datasets: [
      {
        data: [
          stats.questionsByStatus.APPROVED || 0,
          stats.questionsByStatus.PENDING || 0,
          stats.questionsByStatus.HIDDEN || 0,
        ],
        backgroundColor: ['#22c55e', '#f59e0b', '#64748b'], // Xanh, Vàng, Xám
        borderWidth: 0,
      },
    ],
  };

  // Cấu hình biểu đồ cột (Tương tác giả lập - vì chưa có API history theo thời gian)
  // Bạn có thể update backend sau để trả về history thực tế
  const interactionData = {
    labels: ['08:00', '10:00', '12:00', '14:00', '16:00'],
    datasets: [
      {
        label: 'Câu hỏi mới',
        data: [2, 5, stats.totalQuestions > 10 ? 8 : 3, 4, 2], // Mock data dựa trên tổng số
        backgroundColor: '#39E079',
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className="p-6 space-y-6 bg-[#f8f9fb] dark:bg-[#122017] min-h-full">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Thống kê sự kiện</h2>
        <p className="text-muted-foreground">
            Dữ liệu tổng quan về tương tác trong sự kiện <span className="font-semibold text-primary">{stats.eventName}</span>
        </p>
      </div>

      {/* 1. Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm border-none bg-white dark:bg-gray-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Người tham gia
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
            <p className="text-xs text-muted-foreground mt-1">
               Thành viên đã join vào sự kiện
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-white dark:bg-gray-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng câu hỏi
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQuestions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Câu hỏi từ khán giả
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-white dark:bg-gray-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng lượt Votes
            </CardTitle>
            <ThumbsUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVotes}</div>
            <p className="text-xs text-muted-foreground mt-1">
               Lượt tương tác (Upvotes)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 2. Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Biểu đồ trạng thái (Doughnut) */}
        <Card className="col-span-3 shadow-sm border-none bg-white dark:bg-gray-900">
          <CardHeader>
            <CardTitle>Trạng thái câu hỏi</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
             <div className="h-[250px] flex items-center justify-center">
                 {stats.totalQuestions > 0 ? (
                    <Doughnut 
                        data={statusData} 
                        options={{ 
                            plugins: { legend: { position: 'bottom' } }, 
                            cutout: '70%' 
                        }} 
                    />
                 ) : (
                    <div className="text-center text-muted-foreground flex flex-col items-center">
                        <HelpCircle className="w-10 h-10 mb-2 opacity-20" />
                        Chưa có dữ liệu câu hỏi
                    </div>
                 )}
             </div>
             {/* Legend Custom */}
             {stats.totalQuestions > 0 && (
                 <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="flex flex-col items-center p-2 rounded bg-green-50 text-green-700">
                        <CheckCircle2 className="w-4 h-4 mb-1" />
                        <span className="font-bold">{stats.questionsByStatus.APPROVED || 0}</span>
                        <span>Đã duyệt</span>
                    </div>
                    <div className="flex flex-col items-center p-2 rounded bg-amber-50 text-amber-700">
                        <HelpCircle className="w-4 h-4 mb-1" />
                        <span className="font-bold">{stats.questionsByStatus.PENDING || 0}</span>
                        <span>Chờ duyệt</span>
                    </div>
                    <div className="flex flex-col items-center p-2 rounded bg-gray-100 text-gray-600">
                        <EyeOff className="w-4 h-4 mb-1" />
                        <span className="font-bold">{stats.questionsByStatus.HIDDEN || 0}</span>
                        <span>Đã ẩn</span>
                    </div>
                 </div>
             )}
          </CardContent>
        </Card>

        {/* Biểu đồ cột (Bar) */}
        <Card className="col-span-4 shadow-sm border-none bg-white dark:bg-gray-900">
          <CardHeader>
            <CardTitle>Xu hướng đặt câu hỏi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
                <Bar 
                    data={interactionData} 
                    options={{ 
                        maintainAspectRatio: false,
                        responsive: true,
                        scales: { y: { beginAtZero: true, grid: { color: '#f3f4f6' } }, x: { grid: { display: false } } },
                        plugins: { legend: { display: false } }
                    }} 
                />
            </div>
            <div className="text-xs text-center text-muted-foreground mt-4 italic">
                * Biểu đồ đang hiển thị dữ liệu mẫu (Sẽ cập nhật khi có đủ dữ liệu lịch sử)
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}