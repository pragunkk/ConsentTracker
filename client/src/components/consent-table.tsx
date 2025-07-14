import { useState } from "react";
import { ConsentRecord } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Eye, X, RotateCcw, ArrowUpDown } from "lucide-react";
import { format } from "date-fns";

interface ConsentTableProps {
  records: ConsentRecord[];
  onViewDetails: (record: ConsentRecord) => void;
  onRevokeAccess: (id: number) => void;
  onRenewAccess: (id: number) => void;
}

export function ConsentTable({ records, onViewDetails, onRevokeAccess, onRenewAccess }: ConsentTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof ConsentRecord>("accessDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const itemsPerPage = 10;

  const handleSort = (field: keyof ConsentRecord) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedRecords = [...records].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (aValue instanceof Date) aValue = aValue.getTime();
    if (bValue instanceof Date) bValue = bValue.getTime();
    
    if (typeof aValue === "string") aValue = aValue.toLowerCase();
    if (typeof bValue === "string") bValue = bValue.toLowerCase();
    
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRecords = sortedRecords.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-emerald-100 text-emerald-800">Active</Badge>;
      case "expiring":
        return <Badge className="bg-amber-100 text-amber-800">Expiring Soon</Badge>;
      case "expired":
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getDocumentIcon = (documentName: string) => {
    if (documentName.includes(".pdf")) return "📄";
    if (documentName.includes(".docx")) return "📝";
    if (documentName.includes(".xlsx")) return "📊";
    return "📄";
  };

  const SortButton = ({ field, children }: { field: keyof ConsentRecord; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className="h-auto p-0 font-medium text-xs uppercase tracking-wider hover:text-slate-700"
    >
      {children}
      <ArrowUpDown className="ml-1 h-3 w-3" />
    </Button>
  );

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Consent Records</CardTitle>
      </CardHeader>
      
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <SortButton field="documentName">Document Name</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="dataAccessed">Data Accessed</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="hostUserName">Host User</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="guestUserName">Guest User</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="accessDate">Access Date</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="expiryDate">Expiry Date</SortButton>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRecords.map((record) => (
              <TableRow key={record.id} className="hover:bg-slate-50">
                <TableCell>
                  <div className="flex items-center">
                    <span className="mr-2">{getDocumentIcon(record.documentName)}</span>
                    <span className="font-medium">{record.documentName}</span>
                  </div>
                </TableCell>
                <TableCell>{record.dataAccessed}</TableCell>
                <TableCell>{record.hostUserName}</TableCell>
                <TableCell>{record.guestUserName}</TableCell>
                <TableCell>{format(new Date(record.accessDate), "MMM dd, yyyy")}</TableCell>
                <TableCell>{format(new Date(record.expiryDate), "MMM dd, yyyy")}</TableCell>
                <TableCell>{getStatusBadge(record.status)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(record)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {record.status === "expired" ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRenewAccess(record.id)}
                        className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRevokeAccess(record.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Mobile Card View */}
      <div className="lg:hidden">
        <div className="divide-y divide-slate-200">
          {paginatedRecords.map((record) => (
            <div key={record.id} className="p-6 hover:bg-slate-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <span className="mr-2">{getDocumentIcon(record.documentName)}</span>
                  <span className="font-medium">{record.documentName}</span>
                </div>
                {getStatusBadge(record.status)}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Data Accessed:</span>
                  <span className="text-slate-900">{record.dataAccessed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Host User:</span>
                  <span className="text-slate-900">{record.hostUserName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Guest User:</span>
                  <span className="text-slate-900">{record.guestUserName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Access Date:</span>
                  <span className="text-slate-900">{format(new Date(record.accessDate), "MMM dd, yyyy")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Expiry Date:</span>
                  <span className="text-slate-900">{format(new Date(record.expiryDate), "MMM dd, yyyy")}</span>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails(record)}
                  className="h-8 w-8 p-0"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                {record.status === "expired" ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRenewAccess(record.id)}
                    className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRevokeAccess(record.id)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-700">
              Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
              <span className="font-medium">{Math.min(startIndex + itemsPerPage, sortedRecords.length)}</span> of{" "}
              <span className="font-medium">{sortedRecords.length}</span> results
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {[...Array(totalPages)].map((_, i) => (
              <Button
                key={i + 1}
                variant={currentPage === i + 1 ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(i + 1)}
                className="w-8 h-8"
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
