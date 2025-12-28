"use client";

import React, { useEffect, useState, useMemo } from "react";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler, 
  ArcElement 
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiClient } from "@/lib/api-client"; // [FIX] Dùng API Client thay Supabase
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { 
  Loader2, 
  MessageSquare, 
  ThumbsUp, 
  CheckCircle2, 
  TrendingUp, 
  Hash, 
  MoreVertical,
  ArrowUpRight,
  Filter
} from "lucide-react";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// --- ĐĂNG KÝ CHARTJS ---
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, ArcElement);

// --- TYPES ---
// Type khớp với dữ liệu trả về từ Backend (Prisma)
type QuestionData = {
  id: string;
  content: string;
  upvotes: number; // Prisma: upvotes, Supabase cũ: score
  createdAt: string;
  isAnswered: boolean;
  event: {
    title: string;
    code: string;
  };
  author: {
    fullName: string | null;
    avatarUrl: string | null;
  } | null;
  isAnonymous: boolean;
};

type DashboardStats = {
  totalQuestions: number;
  totalVotes: number;
  answeredRate: number;
  activeEvents: number;
};

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalQuestions: 0,
    totalVotes: 0,
    answeredRate: 0,
    activeEvents: 0
  });
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  
  // Dữ liệu biểu đồ (Giữ nguyên logic random frontend hoặc chờ update backend sau)
  const [activityData, setActivityData] = useState<number[]>(new Array(7).fill(0));

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        // [FIX] Gọi API Backend: GET /api/users/analytics
        const { data } = await apiClient.get("/users/analytics");
        
        // Cập nhật State từ response
        setStats(data.stats);
        setQuestions(data.topQuestions);

        // Tạo dữ liệu biểu đồ giả lập (hoặc lấy từ API nếu backend hỗ trợ)
        const totalQ = data.stats.totalQuestions;
        const chartData = [0, 0, 0, 0, 0, 0, 0].map(() => Math.floor(Math.random() * (totalQ > 10 ? 10 : totalQ + 1)));
        setActivityData(chartData);

      } catch (error) {
        console.error("Lỗi tải thống kê:", error);
        toast.error("Không thể tải dữ liệu thống kê");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // --- CHART CONFIG ---
  const lineChartData = useMemo(() => ({
    labels: ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"],
    datasets: [{
      label: "Tương tác mới",
      data: activityData,
      borderColor: "#1c5b9f", 
      backgroundColor: (context: any) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, "rgba(28, 91, 159, 0.2)");
        gradient.addColorStop(1, "rgba(28, 91, 159, 0)");
        return gradient;
      },
      borderWidth: 2,
      tension: 0.4,
      fill: true,
      pointBackgroundColor: "#fff",
      pointBorderColor: "#1c5b9f",
    }],
  }), [activityData]);

  const doughnutData = {
    labels: ["Đã trả lời", "Chưa trả lời"],
    datasets: [{
      data: [stats.answeredRate, 100 - stats.answeredRate],
      backgroundColor: ["#10b981", "#e5e7eb"], 
      borderWidth: 0,
      hoverOffset: 4,
    }],
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Thống kê tổng quan
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Hiệu suất hoạt động và mức độ tương tác trong các sự kiện của bạn.
          </p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="hidden sm:flex bg-white dark:bg-gray-800">
             <Filter className="w-4 h-4 mr-2" /> Lọc 7 ngày
           </Button>
           <Button className="hidden sm:flex bg-[#1c5b9f] hover:bg-[#164e8a] text-white">
              <ArrowUpRight className="w-4 h-4 mr-2" /> Xuất báo cáo
           </Button>
        </div>
      </div>

      {/* 2. Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 shadow-sm border-none bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tổng câu hỏi</p>
              <div className="flex items-baseline gap-2 mt-2">
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.totalQuestions}</p>
                <span className="text-xs text-green-600 font-medium flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" /> +{stats.activeEvents} sự kiện
                </span>
              </div>
            </div>
            <div className="p-3 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
              <MessageSquare className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-sm border-none bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tổng lượt bình chọn</p>
              <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-gray-100">{stats.totalVotes}</p>
            </div>
            <div className="p-3 rounded-full bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
              <ThumbsUp className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-sm border-none bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tỷ lệ đã trả lời</p>
              <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-gray-100">{stats.answeredRate}%</p>
            </div>
            <div className="p-3 rounded-full bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* 3. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Line Chart */}
          <Card className="lg:col-span-2 p-6 shadow-sm border-none bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-800">
             <h3 className="text-lg font-semibold mb-6">Xu hướng câu hỏi</h3>
             <div className="h-[300px] w-full">
                <Line data={lineChartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
             </div>
          </Card>

          {/* Doughnut Chart */}
          <Card className="lg:col-span-1 p-6 shadow-sm border-none bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-800 flex flex-col items-center justify-center">
             <h3 className="text-lg font-semibold mb-6 self-start">Trạng thái</h3>
             <div className="h-[200px] w-full flex justify-center relative">
                <Doughnut data={doughnutData} options={{ maintainAspectRatio: false, cutout: '75%' }} />
                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                    <span className="text-2xl font-bold">{stats.answeredRate}%</span>
                    <span className="text-xs text-muted-foreground">Hoàn thành</span>
                </div>
             </div>
             <div className="mt-6 w-full space-y-3">
                 <div className="flex justify-between text-sm">
                    <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>Đã trả lời</span>
                    <span className="font-semibold">{stats.answeredRate}%</span>
                 </div>
                 <div className="flex justify-between text-sm">
                    <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-gray-200 mr-2"></span>Chưa trả lời</span>
                    <span className="font-semibold">{100 - stats.answeredRate}%</span>
                 </div>
             </div>
          </Card>
      </div>

      {/* 4. Top Questions Table */}
      <Card className="overflow-hidden border shadow-sm bg-white dark:bg-gray-900 ring-1 ring-gray-200 dark:ring-gray-800">
        <div className="p-6 border-b bg-white dark:bg-gray-900 flex justify-between items-center">
            <div>
                <h3 className="font-semibold text-lg">Top câu hỏi phổ biến</h3>
                <p className="text-sm text-muted-foreground">Các câu hỏi nhận được nhiều sự quan tâm nhất.</p>
            </div>
        </div>

        {/* Header Table */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50/50 dark:bg-gray-800/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b">
          <div className="col-span-6 sm:col-span-5">Nội dung câu hỏi</div>
          <div className="col-span-2 text-center">Votes</div>
          <div className="col-span-3 hidden sm:block">Sự kiện</div>
          <div className="col-span-2 hidden sm:block text-right">Ngày tạo</div>
          <div className="col-span-1 text-right"></div>
        </div>

        {/* Body Table */}
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {loading ? (
             <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#1c5b9f]" />
             </div>
          ) : questions.length === 0 ? (
             <div className="text-center py-12 text-muted-foreground">Chưa có dữ liệu.</div>
          ) : (
            questions.map((q) => (
              <div key={q.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors group">
                
                {/* Col 1: Content & Author */}
                <div className="col-span-6 sm:col-span-5 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate pr-4" title={q.content}>
                    {q.content}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                      <Avatar className="h-5 w-5 border">
                        <AvatarImage src={q.author?.avatarUrl || ""} />
                        <AvatarFallback className="text-[9px]">{q.author?.fullName?.[0] || "?"}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                        {q.isAnonymous ? "Ẩn danh" : (q.author?.fullName || "Người dùng")}
                      </span>
                  </div>
                </div>

                {/* Col 2: Votes */}
                <div className="col-span-2 flex justify-center">
                   <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">
                      <ThumbsUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{q.upvotes}</span>
                   </div>
                </div>

                {/* Col 3: Event */}
                <div className="col-span-3 hidden sm:block">
                  <div className="flex items-center gap-2">
                     <div className="p-1.5 rounded bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                        <Hash className="w-3.5 h-3.5" />
                     </div>
                     <div className="min-w-0">
                        <p className="text-sm font-medium truncate max-w-[150px]">{q.event?.title}</p>
                        <p className="text-xs text-muted-foreground">#{q.event?.code}</p>
                     </div>
                  </div>
                </div>

                {/* Col 4: Date */}
                <div className="col-span-2 hidden sm:block text-right text-sm text-muted-foreground">
                   {q.createdAt ? format(new Date(q.createdAt), "dd/MM/yyyy", { locale: vi }) : "N/A"}
                </div>

                {/* Col 5: Menu */}
                <div className="col-span-1 text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}