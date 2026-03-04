import { useState, useEffect, useRef } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Loader2, Wrench, Search, CheckCircle2, Clock, AlertTriangle, MapPin, Calendar, MessageSquare, Send } from "lucide-react";
import { format } from "date-fns";
import type { TrackRequestResponse } from "@shared/routes";

function MessageThread({ trackingCode }: { trackingCode: string }) {
  const [content, setContent] = useState("");
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading } = useQuery<any[]>({
    queryKey: ["/api/requests/track", trackingCode, "messages"],
    queryFn: async () => {
      const res = await fetch(`/api/requests/track/${trackingCode}/messages`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    refetchInterval: 10000,
  });

  const sendMessage = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/requests/track/${trackingCode}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["/api/requests/track", trackingCode, "messages"] });
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="mt-6 pt-6 border-t border-border">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-4 w-4 text-primary" />
        <h3 className="font-bold text-sm text-foreground">Messages</h3>
        {(messages || []).length > 0 && (
          <Badge variant="outline" className="text-[10px]">{(messages || []).length}</Badge>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div ref={scrollRef} className="space-y-3 max-h-64 overflow-y-auto mb-4 scroll-smooth">
          {(messages || []).length === 0 && (
            <div className="text-center py-6">
              <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No messages yet. Send a message to your landlord about this request.</p>
            </div>
          )}
          {(messages || []).map((msg: any) => (
            <div
              key={msg.id}
              className={`rounded-xl p-3 max-w-[85%] ${
                msg.senderType === "tenant"
                  ? "bg-primary/10 ml-auto"
                  : "bg-muted/50 mr-auto"
              }`}
              data-testid={`message-${msg.id}`}
            >
              <p className="text-sm text-foreground">{msg.content}</p>
              <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                <span className={msg.senderType === "landlord" ? "text-primary font-semibold" : ""}>{msg.senderName}</span>
                <span>&middot;</span>
                <span>{msg.createdAt ? format(new Date(msg.createdAt), "MMM d, h:mm a") : ""}</span>
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Input
          placeholder="Type a message..."
          className="text-sm h-10"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && content.trim()) sendMessage.mutate(); }}
          data-testid="input-tenant-message"
        />
        <Button
          size="sm"
          className="h-10 px-4"
          disabled={!content.trim() || sendMessage.isPending}
          onClick={() => sendMessage.mutate()}
          data-testid="button-send-tenant-message"
        >
          {sendMessage.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

function TrackingResult({ data, trackingCode }: { data: TrackRequestResponse; trackingCode: string }) {
  const statusSteps = ["New", "In-Progress", "Completed"];
  const currentStep = statusSteps.indexOf(data.status);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed": return <CheckCircle2 className="h-5 w-5 text-primary" />;
      case "In-Progress": return <Clock className="h-5 w-5 text-warning" />;
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
            data.status === "Completed" ? "bg-primary w-full" :
            data.status === "In-Progress" ? "bg-warning w-2/3" :
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

      <MessageThread trackingCode={trackingCode} />
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
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-xl">
            <Wrench className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-tight text-foreground">Track Your Request</h1>
            <p className="text-xs font-medium text-muted-foreground">Check status and message your landlord</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 py-6 md:py-10">
        <div className="bg-card p-6 sm:p-8 rounded-[2rem] shadow-sm border border-border">
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

          {data && !isLoading && <TrackingResult data={data} trackingCode={searchCode} />}

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
