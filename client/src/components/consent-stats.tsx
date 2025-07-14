import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, CheckCircle, Clock, XCircle } from "lucide-react";

interface ConsentStats {
  total: number;
  active: number;
  expiring: number;
  expired: number;
}

export function ConsentStats() {
  const { data: stats, isLoading } = useQuery<ConsentStats>({
    queryKey: ["/api/consent-stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Consents",
      value: stats?.total || 0,
      icon: FileText,
      color: "text-blue-600",
    },
    {
      title: "Active Consents",
      value: stats?.active || 0,
      icon: CheckCircle,
      color: "text-emerald-600",
    },
    {
      title: "Expiring Soon",
      value: stats?.expiring || 0,
      icon: Clock,
      color: "text-amber-600",
    },
    {
      title: "Expired",
      value: stats?.expired || 0,
      icon: XCircle,
      color: "text-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
