import { AppLayout } from "@/components/layout/AppLayout";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  BarChart2, ShieldCheck, TrendingUp, AlertTriangle, Clock, CheckCircle2,
  Wrench, Building2, Star, Loader2, Users, ClipboardList, Zap
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface AnalyticsData {
  statusSummary: { new: number; inProgress: number; completed: number; total: number };
  categoryBreakdown: Array<{ category: string; count: number }>;
  volumeByProperty: Array<{ name: string; count: number }>;
  overdueRequests: number;
  avgDaysToComplete: number | null;
  monthlyTrend: Array<{ month: string; count: number }>;
  leaderboard: Array<{
    id: number; name: string; companyName: string | null; tradeCategory: string;
    preferredVendor: boolean; trustScore: number; totalJobs: number; completedJobs: number;
    avgRating: number | null; totalSpent: number;
  }>;
  urgencyBreakdown: { emergency: number; high: number; medium: number; low: number };
  avgRating: number | null;
  totalVendors: number;
  totalAssignments: number;
}

function StatCard({ label, value, sub, icon: Icon, color = "text-primary" }: {
  label: string; value: string | number; sub?: string; icon: any; color?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className="text-3xl font-display font-extrabold text-foreground">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl bg-current/10 flex items-center justify-center ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function TrustBadge({ score }: { score: number }) {
  const color = score >= 80 ? "text-green-400 bg-green-400/10 border-green-400/20"
    : score >= 60 ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
    : "text-red-400 bg-red-400/10 border-red-400/20";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-xs font-bold ${color}`}>
      <ShieldCheck className="h-3 w-3" />{score}
    </span>
  );
}

function BarRow({ label, value, max, color = "bg-primary" }: { label: string; value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground w-32 truncate shrink-0">{label}</span>
      <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
        <div className={`h-2 rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-semibold text-foreground w-6 text-right">{value}</span>
    </div>
  );
}

export default function Analytics() {
  const { data, isLoading } = useQuery<AnalyticsData>({ queryKey: ["/api/analytics"] });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!data) return <AppLayout><div className="text-muted-foreground p-8">No data available.</div></AppLayout>;

  const maxCategory = Math.max(...(data.categoryBreakdown.map(c => c.count)), 1);
  const maxProp = Math.max(...(data.volumeByProperty.map(p => p.count)), 1);
  const maxTrend = Math.max(...(data.monthlyTrend.map(t => t.count)), 1);
  const completionRate = data.statusSummary.total > 0
    ? Math.round((data.statusSummary.completed / data.statusSummary.total) * 100)
    : 0;

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center">
              <BarChart2 className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground">Analytics</h1>
          </div>
          <p className="text-muted-foreground text-sm ml-12">Maintenance performance, vendor intelligence, and operational insights.</p>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Requests" value={data.statusSummary.total} icon={ClipboardList} />
          <StatCard label="Completion Rate" value={`${completionRate}%`} sub={`${data.statusSummary.completed} completed`} icon={CheckCircle2} color="text-green-400" />
          <StatCard label="Overdue" value={data.overdueRequests} sub="Open > 7 days" icon={AlertTriangle} color="text-red-400" />
          <StatCard
            label="Avg Days to Close"
            value={data.avgDaysToComplete !== null ? `${data.avgDaysToComplete}d` : "—"}
            sub="From assign to complete"
            icon={Clock}
            color="text-yellow-400"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Active Vendors" value={data.totalVendors} icon={Users} />
          <StatCard label="Total Dispatches" value={data.totalAssignments} icon={Zap} />
          <StatCard label="Avg Vendor Rating" value={data.avgRating !== null ? `${data.avgRating}/5` : "—"} icon={Star} color="text-yellow-400" />
          <StatCard
            label="In Progress"
            value={data.statusSummary.inProgress}
            sub={`${data.statusSummary.new} new`}
            icon={TrendingUp}
            color="text-blue-400"
          />
        </div>

        {/* Vendor Leaderboard */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-foreground">Vendor Trust Leaderboard</h2>
            <span className="ml-auto text-xs text-muted-foreground">Ranked by trust score</span>
          </div>
          {data.leaderboard.length === 0 ? (
            <div className="px-6 py-10 text-center text-muted-foreground text-sm">
              No vendors yet. Add vendors in the <Link href="/vendors" className="text-primary underline">Vendor Network</Link>.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {data.leaderboard.map((v, i) => (
                <Link key={v.id} href={`/vendors/${v.id}`}>
                  <div className="px-6 py-4 flex items-center gap-4 hover:bg-muted/30 transition-colors cursor-pointer" data-testid={`row-vendor-${v.id}`}>
                    <span className={`w-6 text-sm font-bold ${i === 0 ? "text-yellow-400" : i === 1 ? "text-slate-300" : i === 2 ? "text-amber-600" : "text-muted-foreground"}`}>
                      #{i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground truncate">{v.name}</p>
                        {v.preferredVendor && (
                          <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{v.tradeCategory}{v.companyName ? ` · ${v.companyName}` : ""}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="font-semibold text-foreground">{v.totalJobs}</p>
                        <p className="text-xs text-muted-foreground">Jobs</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-foreground">{v.completedJobs}</p>
                        <p className="text-xs text-muted-foreground">Done</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-foreground">{v.avgRating !== null ? v.avgRating.toFixed(1) : "—"}</p>
                        <p className="text-xs text-muted-foreground">Rating</p>
                      </div>
                      {v.totalSpent > 0 && (
                        <div className="text-center">
                          <p className="font-semibold text-foreground">${(v.totalSpent / 100).toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Spent</p>
                        </div>
                      )}
                    </div>
                    <TrustBadge score={v.trustScore} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <Wrench className="h-4 w-4 text-primary" />
              <h2 className="font-semibold text-foreground">Requests by Category</h2>
            </div>
            {data.categoryBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground">No request data yet.</p>
            ) : (
              <div className="space-y-3">
                {data.categoryBreakdown.map(c => (
                  <BarRow key={c.category} label={c.category} value={c.count} max={maxCategory} />
                ))}
              </div>
            )}
          </div>

          {/* Volume by Property */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <Building2 className="h-4 w-4 text-primary" />
              <h2 className="font-semibold text-foreground">Requests by Property</h2>
            </div>
            {data.volumeByProperty.length === 0 ? (
              <p className="text-sm text-muted-foreground">No properties yet.</p>
            ) : (
              <div className="space-y-3">
                {data.volumeByProperty.map(p => (
                  <BarRow key={p.name} label={p.name} value={p.count} max={maxProp} color="bg-blue-500" />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-foreground">Request Volume — Last 6 Months</h2>
          </div>
          <div className="flex items-end gap-2 h-36 px-1">
            {data.monthlyTrend.map((t, i) => {
              const pct = maxTrend > 0 ? Math.max((t.count / maxTrend) * 100, t.count > 0 ? 6 : 0) : 0;
              const isLast = i === data.monthlyTrend.length - 1;
              return (
                <div key={t.month} className="flex-1 flex flex-col items-center justify-end gap-1.5 h-full">
                  {t.count > 0 && (
                    <span className="text-xs font-bold text-foreground">{t.count}</span>
                  )}
                  <div
                    className={`w-full rounded-t-lg transition-all duration-700 ${isLast ? "bg-primary" : "bg-primary/40"}`}
                    style={{ height: `${pct}%`, minHeight: t.count > 0 ? "8px" : "0" }}
                  />
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">{t.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status + Urgency Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status Summary */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-semibold text-foreground mb-4">Request Status</h2>
            <div className="space-y-3">
              {[
                { label: "New", value: data.statusSummary.new, color: "bg-blue-400" },
                { label: "In Progress", value: data.statusSummary.inProgress, color: "bg-yellow-400" },
                { label: "Completed", value: data.statusSummary.completed, color: "bg-green-400" },
                { label: "Overdue (>7d)", value: data.overdueRequests, color: "bg-red-400" },
              ].map(item => {
                const pct = data.statusSummary.total > 0 ? Math.round((item.value / data.statusSummary.total) * 100) : 0;
                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${item.color}`} />
                        <span className="text-sm text-muted-foreground">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{pct}%</span>
                        <span className="text-sm font-bold text-foreground w-5 text-right">{item.value}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className={`h-1.5 rounded-full ${item.color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Completion rate</span>
              <span className={`text-lg font-display font-extrabold ${completionRate >= 70 ? "text-green-400" : completionRate >= 40 ? "text-yellow-400" : "text-red-400"}`}>{completionRate}%</span>
            </div>
          </div>

          {/* Urgency Breakdown */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-semibold text-foreground mb-4">Urgency Breakdown</h2>
            <div className="space-y-3">
              <BarRow label="Emergency" value={data.urgencyBreakdown.emergency} max={data.statusSummary.total || 1} color="bg-red-500" />
              <BarRow label="High" value={data.urgencyBreakdown.high} max={data.statusSummary.total || 1} color="bg-orange-500" />
              <BarRow label="Medium" value={data.urgencyBreakdown.medium} max={data.statusSummary.total || 1} color="bg-yellow-500" />
              <BarRow label="Low" value={data.urgencyBreakdown.low} max={data.statusSummary.total || 1} color="bg-green-500" />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
