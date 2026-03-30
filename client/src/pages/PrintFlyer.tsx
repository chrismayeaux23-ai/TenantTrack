import { useParams, useLocation } from "wouter";
import { useProperty } from "@/hooks/use-properties";
import { QRCodeSVG } from "qrcode.react";
import { Loader2, Printer, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import logoPng from "@assets/tenanttrack-final-logo.png";

export default function PrintFlyer() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const id = parseInt(propertyId || "0");
  const [, setLocation] = useLocation();
  const { data: property, isLoading } = useProperty(id);

  const reportUrl = `${window.location.origin}/report/${id}`;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Property Not Found</h1>
          <Button onClick={() => setLocation("/properties")} variant="outline">Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="print:hidden sticky top-0 z-10 bg-card border-b border-border p-4 flex items-center justify-between max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => setLocation("/properties")} data-testid="button-back-properties">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Properties
        </Button>
        <Button onClick={() => window.print()} data-testid="button-print-flyer">
          <Printer className="mr-2 h-4 w-4" /> Print Flyer
        </Button>
      </div>

      <div className="max-w-[8.5in] mx-auto p-6 print:p-0">
        <div className="rounded-3xl print:rounded-none shadow-xl print:shadow-none border border-border print:border-0 overflow-hidden bg-[hsl(224,50%,5%)]">
          <div className="bg-gradient-to-br from-[hsl(224,50%,8%)] to-[hsl(224,50%,3%)] text-white p-8 sm:p-12 text-center border-b border-[hsl(18,100%,50%)]/30">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img src={logoPng} alt="TenantTrack" className="h-16 w-16 rounded-xl" />
              <span className="text-3xl sm:text-4xl font-bold tracking-tight">TenantTrack</span>
            </div>
            <div className="w-16 h-1 bg-[hsl(18,100%,50%)] rounded-full mx-auto mb-4"></div>
            <p className="text-[hsl(18,100%,70%)] text-lg font-medium">Fast. Easy. Maintenance Reporting.</p>
          </div>

          <div className="p-8 sm:p-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Need Something Fixed?</h2>
              <p className="text-[hsl(210,20%,65%)] text-lg">Report maintenance issues in under 2 minutes.</p>
            </div>

            <div className="flex flex-col items-center mb-10">
              <div className="bg-white p-6 rounded-2xl shadow-lg shadow-[hsl(18,100%,50%)]/10 border-2 border-[hsl(18,100%,50%)]/40 inline-block mb-4">
                <QRCodeSVG
                  value={reportUrl}
                  size={240}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <p className="text-sm text-[hsl(210,20%,50%)] font-mono break-all max-w-xs text-center">{reportUrl}</p>
            </div>

            <div className="bg-[hsl(224,44%,8%)] rounded-2xl p-6 sm:p-8 mb-8 border border-[hsl(18,100%,50%)]/20">
              <h3 className="text-xl font-bold text-white mb-5 text-center">How It Works</h3>
              <div className="grid sm:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="h-12 w-12 rounded-full bg-[hsl(18,100%,50%)] text-white flex items-center justify-center text-xl font-bold mx-auto mb-3">1</div>
                  <p className="font-semibold text-white mb-1">Scan the Code</p>
                  <p className="text-sm text-[hsl(210,20%,60%)]">Open your phone camera and point it at the QR code above.</p>
                </div>
                <div>
                  <div className="h-12 w-12 rounded-full bg-[hsl(18,100%,50%)] text-white flex items-center justify-center text-xl font-bold mx-auto mb-3">2</div>
                  <p className="font-semibold text-white mb-1">Describe the Issue</p>
                  <p className="text-sm text-[hsl(210,20%,60%)]">Fill out the form with details and take a photo if you can.</p>
                </div>
                <div>
                  <div className="h-12 w-12 rounded-full bg-[hsl(18,100%,50%)] text-white flex items-center justify-center text-xl font-bold mx-auto mb-3">3</div>
                  <p className="font-semibold text-white mb-1">We'll Handle It</p>
                  <p className="text-sm text-[hsl(210,20%,60%)]">Your landlord gets notified instantly and will follow up.</p>
                </div>
              </div>
            </div>

            <div className="bg-[hsl(224,44%,8%)] rounded-2xl p-6 text-center border border-[hsl(224,24%,15%)]">
              <p className="text-sm text-[hsl(210,20%,55%)] mb-1">This flyer is for tenants of</p>
              <p className="text-xl font-bold text-white">{property.name}</p>
              <p className="text-sm text-[hsl(210,20%,55%)]">{property.address}</p>
            </div>

            <div className="mt-8 text-center">
              <p className="text-xs text-[hsl(210,20%,45%)]">No app download required. Works on any smartphone browser.</p>
              <p className="text-xs text-[hsl(18,100%,50%)] mt-1 font-medium">Powered by TenantTrack</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
