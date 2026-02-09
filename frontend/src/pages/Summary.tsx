import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { KPICard } from "@/components/dashboard/KPICard";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { SustainabilityScore } from "@/components/dashboard/SustainabilityScore";
import { IconBolt, IconDroplet, IconRecycle } from "@tabler/icons-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDashboardSummary } from "@/hooks/useApi";
import type { KPIStatus } from "@/components/dashboard/KPICard";

const mapStatus = (s: string | undefined): KPIStatus => {
  if (s === "GREEN") return "success";
  if (s === "YELLOW") return "warning";
  return "danger";
};

const fallbackSummaryData = [
  { month: "Jul", actual: 4200, target: 4500 },
  { month: "Aug", actual: 4100, target: 4400 },
  { month: "Sep", actual: 3900, target: 4300 },
  { month: "Oct", actual: 3700, target: 4200 },
  { month: "Nov", actual: 3500, target: 4100 },
  { month: "Dec", actual: 3400, target: 4000 },
];

const complianceItems = [
  { name: "ISO 14001 Environmental Management", status: "compliant", dueDate: "Mar 2024" },
  { name: "Energy Efficiency Certification", status: "compliant", dueDate: "Jun 2024" },
  { name: "Water Conservation Standards", status: "review", dueDate: "Jan 2024" },
  { name: "Waste Management Protocol", status: "compliant", dueDate: "Sep 2024" },
];

export default function Summary() {
  const { data: summary, isLoading } = useDashboardSummary();

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
    : { energy: 88, water: 85, waste: 71 };

  const overallScore = Math.round((breakdown.energy + breakdown.water + breakdown.waste) / 3);

  return (
    <DashboardLayout title="Summary Dashboard">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sustainability Summary</h2>
          <p className="text-muted-foreground">
            Comprehensive overview of all sustainability KPIs and compliance status.
            {isLoading && " Loading..."}
          </p>
        </div>

        {/* MTD KPI Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <KPICard
            title="Electricity (MTD)"
            value={summary?.energy.mtd ? summary.energy.mtd.actual.toLocaleString() : "28,450"}
            unit={summary?.energy.mtd?.unit || "kWh"}
            target={summary?.energy.mtd ? summary.energy.mtd.target.toLocaleString() : "32,000"}
            status={summary?.energy.mtd ? mapStatus(summary.energy.mtd.status) : "success"}
            trend={{ direction: "down", value: "11%" }}
            icon={<IconBolt className="size-5" />}
            variant="energy"
          />
          <KPICard
            title="Water (MTD)"
            value={summary?.water.mtd ? summary.water.mtd.actual.toLocaleString() : "6,230"}
            unit={summary?.water.mtd?.unit || "m³"}
            target={summary?.water.mtd ? summary.water.mtd.target.toLocaleString() : "7,500"}
            status={summary?.water.mtd ? mapStatus(summary.water.mtd.status) : "success"}
            trend={{ direction: "down", value: "7%" }}
            icon={<IconDroplet className="size-5" />}
            variant="water"
          />
          <KPICard
            title="Waste Diverted (MTD)"
            value={summary?.waste.mtd ? summary.waste.mtd.actual.toLocaleString() : "68"}
            unit={summary?.waste.mtd?.unit || "%"}
            target={summary?.waste.mtd ? summary.waste.mtd.target.toLocaleString() : "70%"}
            status={summary?.waste.mtd ? mapStatus(summary.waste.mtd.status) : "warning"}
            trend={{ direction: "up", value: "2%" }}
            icon={<IconRecycle className="size-5" />}
            variant="waste"
          />
        </div>

        {/* YTD Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <KPICard
            title="Electricity (YTD)"
            value={summary ? summary.energy.ytd.actual.toLocaleString() : "312,000"}
            unit="kWh"
            target={summary ? summary.energy.ytd.target.toLocaleString() : "380,000"}
            status={summary ? mapStatus(summary.energy.ytd.status) : "success"}
            description={summary ? `${Math.round(((summary.energy.ytd.target - summary.energy.ytd.actual) / summary.energy.ytd.target) * 100)}% below annual target` : "18% below annual target"}
            icon={<IconBolt className="size-5" />}
            variant="energy"
          />
          <KPICard
            title="Water (YTD)"
            value={summary ? summary.water.ytd.actual.toLocaleString() : "68,500"}
            unit="m³"
            target={summary ? summary.water.ytd.target.toLocaleString() : "85,000"}
            status={summary ? mapStatus(summary.water.ytd.status) : "success"}
            description={summary ? `${Math.round(((summary.water.ytd.target - summary.water.ytd.actual) / summary.water.ytd.target) * 100)}% below annual target` : "19% below annual target"}
            icon={<IconDroplet className="size-5" />}
            variant="water"
          />
          <KPICard
            title="Waste Diverted (YTD)"
            value={summary ? summary.waste.ytd.actual.toLocaleString() : "71"}
            unit="%"
            target={summary ? summary.waste.ytd.target.toLocaleString() : "70%"}
            status={summary ? mapStatus(summary.waste.ytd.status) : "success"}
            description="Exceeding annual target"
            icon={<IconRecycle className="size-5" />}
            variant="waste"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TrendChart
              title="Target vs Actual Performance"
              description="6-month comparison across all KPIs"
              data={fallbackSummaryData}
              type="bar"
            />
          </div>
          <SustainabilityScore score={overallScore} breakdown={breakdown} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Compliance Status</CardTitle>
            <CardDescription>Environmental certifications and standards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {complianceItems.map((item) => (
                <div key={item.name} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">Review due: {item.dueDate}</p>
                  </div>
                  <Badge
                    variant={item.status === "compliant" ? "default" : "secondary"}
                    className={item.status === "compliant" ? "bg-primary" : "bg-amber-100 text-amber-700"}
                  >
                    {item.status === "compliant" ? "Compliant" : "Under Review"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}