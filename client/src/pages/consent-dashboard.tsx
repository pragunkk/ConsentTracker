import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ConsentRecord } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { ConsentStats } from "@/components/consent-stats";
import { ConsentFilters } from "@/components/consent-filters";
import { ConsentTable } from "@/components/consent-table";
import { ConsentModal } from "@/components/consent-modal";
import { useToast } from "@/hooks/use-toast";
import { Shield, Bell, User } from "lucide-react";

export default function ConsentDashboard() {
  const [selectedRecord, setSelectedRecord] = useState<ConsentRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("30");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: records = [], isLoading } = useQuery<ConsentRecord[]>({
    queryKey: ["/api/consent-records"],
  });

  const revokeAccessMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/consent-records/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consent-records"] });
      queryClient.invalidateQueries({ queryKey: ["/api/consent-stats"] });
      toast({
        title: "Access revoked",
        description: "The consent has been successfully revoked.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to revoke access. Please try again.",
        variant: "destructive",
      });
    },
  });

  const renewAccessMutation = useMutation({
    mutationFn: async (id: number) => {
      const newExpiryDate = new Date();
      newExpiryDate.setDate(newExpiryDate.getDate() + 30);
      
      await apiRequest("PUT", `/api/consent-records/${id}`, {
        status: "active",
        expiryDate: newExpiryDate.toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consent-records"] });
      queryClient.invalidateQueries({ queryKey: ["/api/consent-stats"] });
      toast({
        title: "Access renewed",
        description: "The consent has been successfully renewed for 30 days.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to renew access. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Filter records based on search and filters
  const filteredRecords = useMemo(() => {
    let filtered = records;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(record =>
        record.documentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.dataAccessed.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.hostUserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.guestUserName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(record => record.status === statusFilter);
    }

    // Apply date filter
    if (dateFilter !== "all") {
      const days = parseInt(dateFilter);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      filtered = filtered.filter(record => 
        new Date(record.accessDate) >= cutoffDate
      );
    }

    return filtered;
  }, [records, searchQuery, statusFilter, dateFilter]);

  const handleViewDetails = (record: ConsentRecord) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleRevokeAccess = (id: number) => {
    revokeAccessMutation.mutate(id);
  };

  const handleRenewAccess = (id: number) => {
    renewAccessMutation.mutate(id);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setDateFilter("30");
  };

  const handleExport = () => {
    const csvContent = [
      ["Document Name", "Data Accessed", "Host User", "Guest User", "Access Date", "Expiry Date", "Status"],
      ...filteredRecords.map(record => [
        record.documentName,
        record.dataAccessed,
        record.hostUserName,
        record.guestUserName,
        new Date(record.accessDate).toLocaleDateString(),
        new Date(record.expiryDate).toLocaleDateString(),
        record.status,
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "consent-records.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="animate-pulse">
          <div className="h-16 bg-white border-b"></div>
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-white rounded-lg border"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="text-blue-600 h-8 w-8" />
                <h1 className="text-xl font-semibold text-slate-800">Document Locker</h1>
              </div>
              <div className="hidden md:block text-slate-400">|</div>
              <nav className="hidden md:flex space-x-6">
                <a href="#" className="text-blue-600 font-medium">Consent Dashboard</a>
                <a href="#" className="text-slate-600 hover:text-slate-900 transition-colors">Documents</a>
                <a href="#" className="text-slate-600 hover:text-slate-900 transition-colors">Settings</a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-slate-600 hover:text-slate-900 transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-slate-800">John Doe</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Consent Management Dashboard</h2>
          <p className="text-slate-600">Manage and monitor document access permissions and consent records</p>
        </div>

        {/* Stats Cards */}
        <ConsentStats />

        {/* Filters */}
        <ConsentFilters
          onSearch={setSearchQuery}
          onStatusFilter={setStatusFilter}
          onDateFilter={setDateFilter}
          onClearFilters={handleClearFilters}
          onExport={handleExport}
        />

        {/* Table */}
        <ConsentTable
          records={filteredRecords}
          onViewDetails={handleViewDetails}
          onRevokeAccess={handleRevokeAccess}
          onRenewAccess={handleRenewAccess}
        />

        {/* Modal */}
        <ConsentModal
          record={selectedRecord}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onRevokeAccess={handleRevokeAccess}
        />
      </main>
    </div>
  );
}
