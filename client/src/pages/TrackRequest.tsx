import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/card";
import { Loader2, Wrench, Search, CheckCircle2, Clock, AlertTriangle, MapPin, Calendar } from "lucide-react";
import { format } from "date-fns";
import type { TrackRequestResponse } from "@shared/routes";

function TrackingResult({ data }: { data: TrackRequestResponse }) {
  const statusSteps = ["New", "In-Progress", "Completed"];
  const currentStep = statusSteps.indexOf(data.status);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed": return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "In-Progress": return <Clock className="h-5 w-5 text-yellow-600" />;
      default: return <AlertTriangle className="h-5 w-5 text-primary" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed": return <Badge variant="success" data-testid="badge-status">Completed</Badge>;
      case "In-Progress": return <Badge variant="warning" data-testid="badge-status">In Progress</Badge>;
      default: return <Badge variant="default" data-testid="badge-status">New</Badge>;
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "Emergency": return <Badge variant="destructive" data-testid="badge-urgency">Emergency</Badge>;
      case "Med": return <Badge variant="warning" data-testid="badge-urgency">Medium</Badge>;
      default: return <Badge variant="default" data-testid="badge-urgency">Low</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-0 duration-500" data-testid="track-result">
      <div className="flex items-center gap-3 mb-2">
        {getStatusIcon(data.status)}
        <h2 className="text-xl font-display font-bold text-foreground" data-testid="text-property-name">{data.propertyName}</h2>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {getStatusBadge(data.status)}
        {getUrgencyBadge(data.urgency)}
        <Badge variant="outline" data-testid="badge-issue-type">{data.issueType}</Badge>
      </div>

      <div className="w-full bg-muted rounded-full h-2 mt-4">
        <div
          className={`h-2 rounded-full transition-all duration-700 ${
            data.status === "Completed" ? "bg-green-500 w-full" :
            data.status === "In-Progress" ? "bg-yellow-500 w-2/3" :
            "bg-primary w-1/3"
          }`}
          data-testid="progress-bar"
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        {statusSteps.map((step, i) => (
          <span key={step} className={i <= currentStep ? "text-foreground font-semibold" : ""}>{step}</span>
        ))}
      </div>

      <div className="space-y-4 mt-6">
        <div className="flex items-start gap-3">
          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="text-sm text-muted-foreground">Unit</p>
            <p className="font-medium" data-testid="text-unit">{data.unitNumber}</p>
          </div>
        </div>

        {data.createdAt && (
          <div className="flex items-start gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">Submitted</p>
              <p className="font-medium" data-testid="text-date">{format(new Date(data.createdAt), "MMMM d, yyyy 'at' h:mm a")}</p>
            </div>
          </div>
        )}

        <div className="bg-muted/50 rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-1">Description</p>
          <p className="text-sm font-medium" data-testid="text-description">{data.description}</p>
        </div>
      </div>
    </div>
  );
}

export default function TrackRequest() {
  const { code } = useParams<{ code: string }>();
  const [inputCode, setInputCode] = useState(code || "");
  const [searchCode, setSearchCode] = useState(code || "");

  const { data, isLoading, error } = useQuery<TrackRequestResponse>({
    queryKey: ["/api/requests/track", searchCode],
    queryFn: async () => {
      if (!searchCode) throw new Error("No code");
      const res = await fetch(`/api/requests/track/${searchCode}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error("not_found");
        throw new Error("Failed to fetch");
      }
      return res.json();
    },
    enabled: !!searchCode,
    retry: false,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchCode(inputCode.trim());
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-background">
      <header className="bg-white dark:bg-card border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-xl">
            <Wrench className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-tight text-foreground">Track Your Request</h1>
            <p className="text-xs font-medium text-muted-foreground">Check the status of your maintenance request</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 py-6 md:py-10">
        <div className="bg-white dark:bg-card p-6 sm:p-8 rounded-[2rem] shadow-sm border border-border">
          <form onSubmit={handleSearch} className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Enter your tracking code..."
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                className="pl-10"
                data-testid="input-tracking-code"
              />
            </div>
            <Button type="submit" data-testid="button-track">Track</Button>
          </form>

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          )}

          {error && searchCode && !isLoading && (
            <div className="text-center py-12" data-testid="track-not-found">
              <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">Request Not Found</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                We couldn't find a request with that tracking code. Please double-check the code and try again.
              </p>
            </div>
          )}

          {data && !isLoading && <TrackingResult data={data} />}

          {!searchCode && !isLoading && (
            <div className="text-center py-12">
              <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">Enter Your Tracking Code</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Enter the tracking code you received when submitting your maintenance request.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
