import { ConsentRecord } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { X } from "lucide-react";

interface ConsentModalProps {
  record: ConsentRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onRevokeAccess: (id: number) => void;
}

export function ConsentModal({ record, isOpen, onClose, onRevokeAccess }: ConsentModalProps) {
  if (!record) return null;

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Consent Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Document Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-2">Document Information</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="mr-2 text-lg">{getDocumentIcon(record.documentName)}</span>
                  <span className="font-medium">{record.documentName}</span>
                </div>
                <p className="text-sm text-slate-600">Size: {record.documentSize}</p>
                <p className="text-sm text-slate-600">Type: {record.documentType?.toUpperCase()}</p>
                <p className="text-sm text-slate-600">
                  Last modified: {format(new Date(record.createdAt), "MMM dd, yyyy")}
                </p>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-2">Access Details</h4>
              <div className="space-y-2">
                <p className="text-sm text-slate-600">
                  Data Accessed: <span className="text-slate-900">{record.dataAccessed}</span>
                </p>
                <p className="text-sm text-slate-600">
                  Access Level: <span className="text-slate-900">{record.accessLevel}</span>
                </p>
                <p className="text-sm text-slate-600">
                  Purpose: <span className="text-slate-900">{record.purpose || "Not specified"}</span>
                </p>
                <p className="text-sm text-slate-600">
                  Status: {getStatusBadge(record.status)}
                </p>
              </div>
            </div>
          </div>

          {/* User Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-2">Host User</h4>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                  {record.hostUserName.split(" ").map(n => n[0]).join("")}
                </div>
                <span className="font-medium">{record.hostUserName}</span>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-2">Guest User</h4>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-medium">
                  {record.guestUserName.split(" ").map(n => n[0]).join("")}
                </div>
                <span className="font-medium">{record.guestUserName}</span>
              </div>
            </div>
          </div>

          {/* Consent Timeline */}
          <div className="border-t pt-6">
            <h4 className="text-sm font-medium text-slate-700 mb-4">Consent Timeline</h4>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm text-slate-900">Consent requested by {record.guestUserName}</p>
                  <p className="text-xs text-slate-500">
                    {format(new Date(record.accessDate), "MMM dd, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm text-slate-900">Consent granted by {record.hostUserName}</p>
                  <p className="text-xs text-slate-500">
                    {format(new Date(record.accessDate), "MMM dd, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-3 ${
                  record.status === "expired" ? "bg-red-500" : "bg-amber-500"
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm text-slate-900">
                    Consent {record.status === "expired" ? "expired" : "expires"} on{" "}
                    {format(new Date(record.expiryDate), "MMM dd, yyyy")}
                  </p>
                  <p className="text-xs text-slate-500">
                    {Math.ceil(
                      (new Date(record.expiryDate).getTime() - new Date(record.accessDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                    )} days from grant date
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {record.status !== "expired" && (
            <Button
              variant="destructive"
              onClick={() => {
                onRevokeAccess(record.id);
                onClose();
              }}
            >
              <X className="h-4 w-4 mr-2" />
              Revoke Access
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
