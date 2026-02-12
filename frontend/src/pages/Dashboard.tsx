import { IconBolt, IconDroplet, IconRecycle, IconAlertTriangle, IconMapPin } from "@tabler/icons-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { KPICard } from "@/components/dashboard/KPICard";
import { SustainabilityScore } from "@/components/dashboard/SustainabilityScore";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardSummary, useHighestUsage } from "@/hooks/useApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { KPIStatus } from "@/components/dashboard/KPICard";

const mapStatus = (s: string | undefined): KPIStatus => {
  if (s === "GREEN") return "success";
  if (s === "YELLOW") return "warning";
  return "danger";
};

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.role === "admin";
  const isDataEntry = user?.role === "data-entry";

  const { data: summary, isLoading } = useDashboardSummary();
  const { data: highestUsage } = useHighestUsage();

  const computeScore = (actual: number, target: number, metric: string) => {
    if (metric === "WASTE") return target > 0 ? Math.round((actual / target) * 100) : 0;
    return target > 0 ? Math.round(Math.max(0, (1 - (actual - target) / target) * 100)) : 0;
  };

  const breakdown = summary
    ? {
        energy: computeScore(summary.energy.ytd.actual, summary.energy.ytd.target, "ENERGY"),
        water: computeScore(summary.water.ytd.actual, summary.water.ytd.target, "WATER"),
        waste: computeScore(summary.waste.ytd.actual, summary.waste.ytd.target, "WASTE"),
      }
    : { energy: 0, water: 0, waste: 0 };

  const overallScore = summary ? Math.round((breakdown.energy + breakdown.water + breakdown.waste) / 3) : 0;

  const topEnergyLocations = highestUsage?.energy?.slice(0, 3) || [];
  const topWaterLocations = highestUsage?.water?.slice(0, 3) || [];

  const content = (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {isAuthenticated ? `Welcome back, ${user?.name?.split(" ")[0] || "User"}!` : "Sustainability Dashboard"}
        </h2>
        <p className="text-muted-foreground">
          {isAuthenticated
            ? "Here's an overview of your institution's sustainability performance."
            : "Public view of sustainability KPIs. Login for full access."}
          {isLoading && " Loading data..."}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <KPICard
          title="Electricity Consumption"
          value={summary?.energy.mtd ? summary.energy.mtd.actual.toLocaleString() : isLoading ? "..." : "0"}
          unit={summary?.energy.mtd?.unit || "kWh"}
          target={summary?.energy.mtd ? summary.energy.mtd.target.toLocaleString() : "0"}
          actual={summary?.energy.mtd ? summary.energy.mtd.actual.toLocaleString() : "0"}
          status={summary?.energy.mtd ? mapStatus(summary.energy.mtd.status) : "success"}
          trend={{ direction: "down", value: "—", label: "vs last month" }}
          icon={<IconBolt className="size-5" />}
          variant="energy"
        />
        <KPICard
          title="Water Usage"
          value={summary?.water.mtd ? summary.water.mtd.actual.toLocaleString() : isLoading ? "..." : "0"}
          unit={summary?.water.mtd?.unit || "m³"}
          target={summary?.water.mtd ? summary.water.mtd.target.toLocaleString() : "0"}
          actual={summary?.water.mtd ? summary.water.mtd.actual.toLocaleString() : "0"}
          status={summary?.water.mtd ? mapStatus(summary.water.mtd.status) : "success"}
          trend={{ direction: "down", value: "—", label: "vs last month" }}
          icon={<IconDroplet className="size-5" />}
          variant="water"
        />
        <KPICard
          title="Waste Diverted"
          value={summary?.waste.mtd ? summary.waste.mtd.actual.toLocaleString() : isLoading ? "..." : "0"}
          unit={summary?.waste.mtd?.unit || "%"}
          target={summary?.waste.mtd ? summary.waste.mtd.target.toLocaleString() : "0"}
          actual={summary?.waste.mtd ? summary.waste.mtd.actual.toLocaleString() : "0"}
          status={summary?.waste.mtd ? mapStatus(summary.waste.mtd.status) : "success"}
          trend={{ direction: "up", value: "—", label: "vs last month" }}
          icon={<IconRecycle className="size-5" />}
          variant="waste"
        />
      </div>

      {/* Usage vs Target Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Usage vs Target Overview</CardTitle>
          <CardDescription>Current month progress toward sustainability targets</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {[
            {
              label: "Electricity",
              actual: summary?.energy.mtd?.actual ?? 0,
              target: summary?.energy.mtd?.target ?? 0,
              unit: summary?.energy.mtd?.unit || "kWh",
              icon: <IconBolt className="size-4 text-amber-500" />,
              color: "bg-amber-500",
              lowerIsBetter: true,
            },
            {
              label: "Water",
              actual: summary?.water.mtd?.actual ?? 0,
              target: summary?.water.mtd?.target ?? 0,
              unit: summary?.water.mtd?.unit || "m³",
              icon: <IconDroplet className="size-4 text-blue-500" />,
              color: "bg-blue-500",
              lowerIsBetter: true,
            },
            {
              label: "Waste Diversion",
              actual: summary?.waste.mtd?.actual ?? 0,
              target: summary?.waste.mtd?.target ?? 0,
              unit: "%",
              icon: <IconRecycle className="size-4 text-green-500" />,
              color: "bg-green-500",
              lowerIsBetter: false,
            },
          ].map((item) => {
            const pct = item.target > 0 ? Math.round((item.actual / item.target) * 100) : 0;
            const isOverTarget = item.lowerIsBetter ? item.actual > item.target : item.actual < item.target;

            return (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="tabular-nums">
                      {item.actual.toLocaleString()} / {item.target.toLocaleString()} {item.unit}
                    </span>
                    {isOverTarget && item.target > 0 && (
                      <IconAlertTriangle className="size-4 text-destructive" />
                    )}
                  </div>
                </div>
                <div className="relative">
                  <Progress
                    value={Math.min(pct, 100)}
                    className={cn("[&>div]:transition-all", `[&>div]:${item.color}`)}
                  />
                  {pct > 100 && (
                    <div
                      className="absolute top-0 h-full rounded-r-full bg-destructive/30"
                      style={{ left: "100%", width: `${Math.min(pct - 100, 30)}%` }}
                    />
                  )}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{pct}% of target</span>
                  {isOverTarget && item.target > 0 && (
                    <Badge variant="outline" className="border-destructive/50 text-destructive text-xs">
                      Exceeds Target
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Highest Usage Locations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconMapPin className="size-5" />
                Highest Usage Locations
              </CardTitle>
              <CardDescription>Locations with the highest resource consumption</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="flex items-center gap-2 text-sm font-semibold">
                    <IconBolt className="size-4 text-amber-500" /> Top Electricity Users
                  </h4>
                  {topEnergyLocations.length > 0 ? (
                    topEnergyLocations.map((loc, i) => {
                      const overTarget = loc.totalActual > loc.totalTarget;
                      return (
                        <div key={loc._id} className={cn(
                          "flex items-center justify-between rounded-lg border p-3",
                          overTarget && "border-destructive/50 bg-destructive/5"
                        )}>
                          <div className="flex items-center gap-2">
                            <span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-bold">{i + 1}</span>
                            <span className="text-sm font-medium">{loc._id}</span>
                          </div>
                          <div className="text-right text-sm">
                            <span className={cn("font-semibold", overTarget && "text-destructive")}>
                              {loc.totalActual.toLocaleString()} kWh
                            </span>
                            {overTarget && <IconAlertTriangle className="ml-1 inline size-3 text-destructive" />}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground">No data available yet.</p>
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="flex items-center gap-2 text-sm font-semibold">
                    <IconDroplet className="size-4 text-blue-500" /> Top Water Users
                  </h4>
                  {topWaterLocations.length > 0 ? (
                    topWaterLocations.map((loc, i) => {
                      const overTarget = loc.totalActual > loc.totalTarget;
                      return (
                        <div key={loc._id} className={cn(
                          "flex items-center justify-between rounded-lg border p-3",
                          overTarget && "border-destructive/50 bg-destructive/5"
                        )}>
                          <div className="flex items-center gap-2">
                            <span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-bold">{i + 1}</span>
                            <span className="text-sm font-medium">{loc._id}</span>
                          </div>
                          <div className="text-right text-sm">
                            <span className={cn("font-semibold", overTarget && "text-destructive")}>
                              {loc.totalActual.toLocaleString()} m³
                            </span>
                            {overTarget && <IconAlertTriangle className="ml-1 inline size-3 text-destructive" />}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground">No data available yet.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <AlertsPanel alerts={[]} />
        </div>

        <div className="space-y-6">
          <SustainabilityScore score={overallScore} breakdown={breakdown} />

          {isDataEntry && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <h3 className="mb-2 font-semibold">Data Entry Status</h3>
                <p className="text-sm text-muted-foreground">
                  You have pending submissions for this month. Electricity and Water data are due.
                </p>
              </CardContent>
            </Card>
          )}

          {isAdmin && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <h3 className="mb-2 font-semibold text-primary">Admin Quick Actions</h3>
                <p className="text-sm text-muted-foreground">
                  3 users pending approval. 2 target reviews scheduled this week.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );

  if (!isAuthenticated) {
    return <PublicLayout title="Dashboard">{content}</PublicLayout>;
  }

  return <DashboardLayout title="Dashboard" requireAuth={false}>{content}</DashboardLayout>;
}