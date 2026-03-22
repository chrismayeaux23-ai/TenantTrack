import { useState } from "react";
import { useSubscription } from "@/hooks/use-subscription";
import { Button } from "@/components/ui/Button";
import { X, Zap, AlertTriangle } from "lucide-react";

export function TrialBanner() {
  const { tier, hasSubscription, trialDaysRemaining, trialExpired } = useSubscription();
  const [dismissed, setDismissed] = useState(false);

  if (hasSubscription || dismissed) return null;
  if (tier !== "trial") return null;

  const urgent = trialDaysRemaining <= 3;
  const expired = trialExpired;

  if (expired) {
    return (
      <div className="w-full px-4 py-3 flex items-center justify-between gap-3 text-sm"
        style={{ background: "linear-gradient(90deg, hsl(0 70% 20%) 0%, hsl(0 60% 15%) 100%)", borderBottom: "1px solid hsl(0 70% 30%)" }}>
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
          <span className="text-red-200 font-medium">Your free trial has ended.</span>
          <span className="text-red-300/70 hidden sm:inline">Subscribe to keep accessing your data.</span>
        </div>
        <Button size="sm" className="shrink-0 rounded-full h-7 px-4 text-xs neon-glow" onClick={() => window.location.href = "/pricing"} data-testid="button-trial-banner-upgrade">
          Choose a Plan
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-2.5 flex items-center justify-between gap-3 text-sm"
      style={{
        background: urgent
          ? "linear-gradient(90deg, hsl(217 60% 15%) 0%, hsl(222 34% 8%) 100%)"
          : "linear-gradient(90deg, hsl(226 34% 7%) 0%, hsl(226 30% 9%) 100%)",
        borderBottom: "1px solid hsl(226 22% 14%)",
      }}>
      <div className="flex items-center gap-2.5 min-w-0">
        <Zap className={`h-3.5 w-3.5 shrink-0 ${urgent ? "text-primary" : "text-muted-foreground"}`} />
        <span className={`font-medium ${urgent ? "text-foreground" : "text-muted-foreground"}`}>
          {urgent
            ? `${trialDaysRemaining} day${trialDaysRemaining !== 1 ? "s" : ""} left in your free trial`
            : `Free trial · ${trialDaysRemaining} days remaining`}
        </span>
        <span className="text-muted-foreground/50 hidden sm:inline">— no credit card required to continue</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button size="sm" className="rounded-full h-7 px-4 text-xs" onClick={() => window.location.href = "/pricing"} data-testid="button-trial-banner-upgrade">
          Start Free Trial
        </Button>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded-md hover:bg-white/5 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          data-testid="button-trial-banner-dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
