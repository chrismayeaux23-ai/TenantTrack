import React, { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useProperty } from "@/hooks/use-properties";
import { useCreateRequest } from "@/hooks/use-requests";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { PhotoUploadGroup } from "@/components/PhotoUploadGroup";
import { Wrench, CheckCircle2, Loader2, Info } from "lucide-react";
import type { MaintenanceRequestInput } from "@shared/routes";

export default function TenantReport() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const id = parseInt(propertyId || "0");
  const [, setLocation] = useLocation();
  
  const { data: property, isLoading: propLoading, error: propError } = useProperty(id);
  const { mutate: submitRequest, isPending: isSubmitting } = useCreateRequest();

  const [isSuccess, setIsSuccess] = useState(false);
  const [trackingCode, setTrackingCode] = useState<string | null>(null);
  const [formData, setFormData] = useState<MaintenanceRequestInput>({
    propertyId: id,
    tenantName: "",
    tenantPhone: "",
    tenantEmail: "",
    unitNumber: "",
    issueType: "",
    urgency: "Low",
    description: "",
    photoUrls: [],
  });

  const handleChange = (field: keyof MaintenanceRequestInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.issueType) {
      alert("Please select an issue type.");
      return;
    }
    submitRequest(formData, {
      onSuccess: (data) => {
        setTrackingCode(data.trackingCode || null);
        setIsSuccess(true);
      }
    });
  };

  if (propLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (propError || !property) {
    return (
      <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full">
          <Wrench className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-display font-bold mb-2">Property Not Found</h1>
          <p className="text-muted-foreground mb-6">The QR code link is invalid or the property no longer exists.</p>
          <Button onClick={() => setLocation('/')} className="w-full">Return Home</Button>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-10 rounded-[2rem] shadow-xl max-w-md w-full animate-in zoom-in-95 duration-500">
          <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-display font-bold mb-3" data-testid="text-success-title">Request Sent!</h1>
          <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
            Your landlord has been notified about the issue at <strong>{property.name}</strong>, Unit {formData.unitNumber}.
          </p>

          {trackingCode && (
            <div className="bg-muted/50 rounded-xl p-5 mb-6 border border-border">
              <p className="text-sm text-muted-foreground mb-2">Your Tracking Code</p>
              <p className="text-2xl font-mono font-bold tracking-widest text-foreground" data-testid="text-tracking-code">{trackingCode}</p>
              <p className="text-xs text-muted-foreground mt-3">Save this code to check your request status anytime.</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {trackingCode && (
              <Button
                onClick={() => setLocation(`/track/${trackingCode}`)}
                className="w-full rounded-xl"
                size="lg"
                data-testid="link-track-request"
              >
                Track My Request
              </Button>
            )}
            <Button onClick={() => window.location.reload()} variant="outline" className="w-full rounded-xl" size="lg" data-testid="button-submit-another">
              Submit Another Request
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Mobile-optimized Header */}
      <header className="bg-white border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-xl">
            <Wrench className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-tight text-foreground">Maintenance Request</h1>
            <p className="text-xs font-medium text-muted-foreground">{property.name}</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 py-6 md:py-10">
        <div className="bg-green-50 text-green-800 rounded-2xl p-4 flex gap-3 items-start mb-8 border border-green-200">
          <Info className="h-5 w-5 mt-0.5 shrink-0 text-green-700" />
          <p className="text-sm leading-relaxed">Please provide as much detail as possible. Uploading photos helps resolve the issue faster.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-border">
          
          <div className="space-y-6">
            <h2 className="text-xl font-display font-bold border-b pb-2">Contact Info</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tenantName">Your Name</Label>
                <Input id="tenantName" required value={formData.tenantName} onChange={e => handleChange("tenantName", e.target.value)} placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unitNumber">Unit Number</Label>
                <Input id="unitNumber" required value={formData.unitNumber} onChange={e => handleChange("unitNumber", e.target.value)} placeholder="e.g. 4B" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tenantPhone">Phone Number</Label>
                <Input id="tenantPhone" type="tel" required value={formData.tenantPhone} onChange={e => handleChange("tenantPhone", e.target.value)} placeholder="(555) 123-4567" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tenantEmail">Email Address</Label>
                <Input id="tenantEmail" type="email" required value={formData.tenantEmail} onChange={e => handleChange("tenantEmail", e.target.value)} placeholder="john@example.com" />
              </div>
            </div>
          </div>

          <div className="space-y-6 pt-4">
            <h2 className="text-xl font-display font-bold border-b pb-2">Issue Details</h2>
            
            <div className="space-y-2">
              <Label htmlFor="issueType">Type of Issue</Label>
              <Select 
                id="issueType"
                required
                value={formData.issueType}
                onChange={e => handleChange("issueType", e.target.value)}
                options={[
                  { label: "Plumbing", value: "Plumbing" },
                  { label: "HVAC (Heating/Cooling)", value: "HVAC" },
                  { label: "Electrical", value: "Electrical" },
                  { label: "Appliances", value: "Appliances" },
                  { label: "Miscellaneous", value: "Misc" }
                ]}
              />
            </div>

            <div className="space-y-2">
              <Label>Urgency Level</Label>
              <div className="grid grid-cols-3 gap-3">
                {["Low", "Med", "Emergency"].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => handleChange("urgency", level)}
                    className={`
                      py-3 rounded-xl text-sm font-semibold border-2 transition-all active-elevate
                      ${formData.urgency === level 
                        ? level === 'Emergency' ? 'border-destructive bg-destructive/10 text-destructive'
                        : level === 'Med' ? 'border-warning bg-warning/10 text-yellow-700'
                        : 'border-primary bg-primary/10 text-primary'
                        : 'border-input bg-transparent text-muted-foreground hover:bg-muted'
                      }
                    `}
                  >
                    {level === 'Med' ? 'Medium' : level}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                required 
                value={formData.description}
                onChange={e => handleChange("description", e.target.value)}
                placeholder="Please describe what is happening in detail..."
                className="h-32"
              />
            </div>

            <div className="space-y-3">
              <Label>Photos (Optional, max 3)</Label>
              <PhotoUploadGroup 
                maxPhotos={3} 
                value={formData.photoUrls || []} 
                onChange={(urls) => handleChange("photoUrls", urls)} 
              />
            </div>
          </div>

          <div className="pt-6">
            <Button 
              type="submit" 
              size="lg" 
              className="w-full text-lg rounded-2xl h-16 shadow-xl shadow-primary/25" 
              isLoading={isSubmitting}
            >
              Submit Request
            </Button>
            <p className="text-center text-xs text-muted-foreground mt-4">
              By submitting, you agree to allow maintenance staff to contact you regarding this issue.
            </p>
          </div>
        </form>
      </main>
    </div>
  );
}
