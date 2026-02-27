import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useRequests } from "@/hooks/use-requests";
import { useProperties } from "@/hooks/use-properties";
import { useStaff, useAssignRequest } from "@/hooks/use-staff";
import { Badge } from "@/components/ui/Badge";
import { format } from "date-fns";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { useUpdateRequestStatus } from "@/hooks/use-requests";
import { Loader2, AlertCircle, Phone, Mail, MapPin, Search, UserCheck } from "lucide-react";
import { Input } from "@/components/ui/Input";

export default function Dashboard() {
  const { data: requests, isLoading: reqLoading } = useRequests();
  const { data: properties, isLoading: propLoading } = useProperties();
  const { data: staffList } = useStaff();
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateRequestStatus();
  const { mutate: assignRequest } = useAssignRequest();
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  if (reqLoading || propLoading) {
    return (
      <AppLayout>
        <div className="h-[60vh] flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  const getUrgencyBadge = (urgency: string) => {
    switch(urgency) {
      case 'Emergency': return <Badge variant="destructive">Emergency</Badge>;
      case 'Med': return <Badge variant="warning">Medium</Badge>;
      default: return <Badge variant="default">Low</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Completed': return <Badge variant="success">Completed</Badge>;
      case 'In-Progress': return <Badge variant="warning">In Progress</Badge>;
      default: return <Badge variant="default">New</Badge>;
    }
  };

  const getPropertyName = (propId: number) => {
    return properties?.find(p => p.id === propId)?.name || 'Unknown Property';
  };

  const getStaffName = (staffId: number | null) => {
    if (!staffId || !staffList) return null;
    return staffList.find(s => s.id === staffId)?.name || null;
  };

  const staffOptions = [
    { label: "Unassigned", value: "0" },
    ...(staffList || []).map(s => ({ label: s.name, value: String(s.id) })),
  ];

  let filteredRequests = requests || [];
  
  if (searchTerm) {
    filteredRequests = filteredRequests.filter(r => 
      r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.tenantName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  if (statusFilter !== "All") {
    filteredRequests = filteredRequests.filter(r => r.status === statusFilter);
  }

  return (
    <AppLayout>
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Maintenance Requests</h1>
          <p className="text-muted-foreground mt-2">Manage and track issues across your properties.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search tenant or issue..." 
              className="pl-10 w-full sm:w-64 bg-card"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { label: "All Statuses", value: "All" },
              { label: "New", value: "New" },
              { label: "In-Progress", value: "In-Progress" },
              { label: "Completed", value: "Completed" }
            ]}
            className="w-full sm:w-48 bg-card"
          />
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="bg-card border border-border border-dashed rounded-3xl p-12 text-center flex flex-col items-center">
          <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold mb-2">No requests found</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            You're all caught up! There are no maintenance requests matching your current filters.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredRequests.map((request) => (
            <div key={request.id} className="bg-card rounded-2xl p-6 shadow-sm border border-border flex flex-col hover-elevate group transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-2 flex-wrap">
                  {getStatusBadge(request.status)}
                  {getUrgencyBadge(request.urgency)}
                  <Badge variant="outline">{request.issueType}</Badge>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                  {request.createdAt ? format(new Date(request.createdAt), 'MMM d, h:mm a') : ''}
                </span>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-bold mb-1 line-clamp-1">{getPropertyName(request.propertyId)}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Unit {request.unitNumber}
                </p>
              </div>

              <div className="bg-muted/50 rounded-xl p-4 mb-5 flex-1">
                <p className="text-sm font-medium text-foreground mb-1 line-clamp-3">{request.description}</p>
              </div>

              {request.photoUrls && request.photoUrls.length > 0 && (
                <div className="flex gap-2 mb-5 overflow-x-auto pb-2 scrollbar-hide">
                  {request.photoUrls.map((url, idx) => (
                    <img 
                      key={idx} 
                      src={url} 
                      alt="Issue" 
                      className="h-16 w-16 rounded-lg object-cover cursor-pointer border border-border hover:opacity-80 transition-opacity flex-shrink-0"
                      onClick={() => setSelectedImage(url)}
                    />
                  ))}
                </div>
              )}

              <div className="mt-auto border-t border-border pt-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-bold">{request.tenantName}</p>
                    <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                      <a href={`tel:${request.tenantPhone}`} className="flex items-center gap-1 hover:text-primary"><Phone className="h-3 w-3"/>{request.tenantPhone}</a>
                      <a href={`mailto:${request.tenantEmail}`} className="flex items-center gap-1 hover:text-primary"><Mail className="h-3 w-3"/> Email</a>
                    </div>
                  </div>
                </div>

                {getStaffName(request.assignedTo) && (
                  <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground" data-testid={`text-assigned-staff-${request.id}`}>
                    <UserCheck className="h-4 w-4 text-primary" />
                    <span>Assigned to <strong className="text-foreground">{getStaffName(request.assignedTo)}</strong></span>
                  </div>
                )}

                <div className="flex gap-2">
                  <Select 
                    value={request.status}
                    onChange={(e) => updateStatus({ id: request.id, data: { status: e.target.value } })}
                    disabled={isUpdating}
                    className="h-10 text-sm py-1 bg-muted border-none flex-1"
                    options={[
                      { label: "Mark New", value: "New" },
                      { label: "Mark In-Progress", value: "In-Progress" },
                      { label: "Mark Completed", value: "Completed" }
                    ]}
                    data-testid={`select-status-${request.id}`}
                  />
                  {staffList && staffList.length > 0 && (
                    <Select
                      value={String(request.assignedTo || 0)}
                      onChange={(e) => {
                        const staffId = parseInt(e.target.value);
                        assignRequest({ requestId: request.id, staffId });
                      }}
                      className="h-10 text-sm py-1 bg-muted border-none flex-1"
                      options={staffOptions}
                      data-testid={`select-assign-${request.id}`}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)} className="max-w-4xl p-2 bg-transparent border-0 shadow-none">
        {selectedImage && (
          <img src={selectedImage} alt="Full size" className="w-full h-auto max-h-[85vh] object-contain rounded-xl shadow-2xl" />
        )}
      </Dialog>
    </AppLayout>
  );
}
