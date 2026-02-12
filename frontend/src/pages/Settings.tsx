import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useDashboardSummary } from "@/hooks/useApi";

interface PerformanceRow {
  kpi: string;
  mtdActual: number;
  mtdTarget: number;
  ytdActual: number;
  ytdTarget: number;
  prevYear: number;
  unit: string;
}

const fallbackData: PerformanceRow[] = [
  { kpi: "Electricity Consumption", mtdActual: 0, mtdTarget: 0, ytdActual: 0, ytdTarget: 0, prevYear: 0, unit: "kWh" },
  { kpi: "Water Usage", mtdActual: 0, mtdTarget: 0, ytdActual: 0, ytdTarget: 0, prevYear: 0, unit: "m³" },
  { kpi: "Waste Diversion Rate", mtdActual: 0, mtdTarget: 0, ytdActual: 0, ytdTarget: 0, prevYear: 0, unit: "%" },
];

const getStatus = (actual: number, target: number, isLowerBetter: boolean = true): "success" | "warning" | "danger" => {
  const ratio = actual / target;
  if (isLowerBetter) {
    if (ratio <= 0.9) return "success";
    if (ratio <= 1.0) return "warning";
    return "danger";
  } else {
    if (ratio >= 1.1) return "success";
    if (ratio >= 1.0) return "warning";
    return "danger";
  }
};

const getPercentChange = (current: number, previous: number): string => {
  const change = ((current - previous) / previous) * 100;
  return `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`;
};

const statusStyles = {
  success: "bg-green-100 text-green-800 border-green-200",
  warning: "bg-amber-100 text-amber-800 border-amber-200",
  danger: "bg-red-100 text-red-800 border-red-200",
};

export default function Performance() {
  const { data: summary } = useDashboardSummary();

  const performanceData: PerformanceRow[] = summary
    ? [
        {
          kpi: "Electricity Consumption",
          mtdActual: summary.energy.mtd?.actual ?? 0,
          mtdTarget: summary.energy.mtd?.target ?? 0,
          ytdActual: summary.energy.ytd.actual,
          ytdTarget: summary.energy.ytd.target,
          prevYear: 395000,
          unit: summary.energy.mtd?.unit || "kWh",
        },
        {
          kpi: "Water Usage",
          mtdActual: summary.water.mtd?.actual ?? 0,
          mtdTarget: summary.water.mtd?.target ?? 0,
          ytdActual: summary.water.ytd.actual,
          ytdTarget: summary.water.ytd.target,
          prevYear: 91000,
          unit: summary.water.mtd?.unit || "m³",
        },
        {
          kpi: "Waste Diversion Rate",
          mtdActual: summary.waste.mtd?.actual ?? 0,
          mtdTarget: summary.waste.mtd?.target ?? 0,
          ytdActual: summary.waste.ytd.actual,
          ytdTarget: summary.waste.ytd.target,
          prevYear: 65,
          unit: summary.waste.mtd?.unit || "%",
        },
      ]
    : fallbackData;

  return (
    <DashboardLayout title="Performance Tracking">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Performance Tracking</h2>
          <p className="text-muted-foreground">
            Detailed comparison of MTD, YTD, and previous year performance across all KPIs.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>KPI Performance Summary</CardTitle>
            <CardDescription>Month-to-date, year-to-date, and year-over-year comparisons</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[180px]">KPI</TableHead>
                    <TableHead className="text-right">MTD Actual</TableHead>
                    <TableHead className="text-right">MTD Target</TableHead>
                    <TableHead className="text-right">MTD Status</TableHead>
                    <TableHead className="text-right">YTD Actual</TableHead>
                    <TableHead className="text-right">YTD Target</TableHead>
                    <TableHead className="text-right">YTD Status</TableHead>
                    <TableHead className="text-right">Prev Year</TableHead>
                    <TableHead className="text-right">YoY Change</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {performanceData.map((row) => {
                    const isHigherBetter = row.kpi.includes("Diversion");
                    const mtdStatus = getStatus(row.mtdActual, row.mtdTarget, !isHigherBetter);
                    const ytdStatus = getStatus(row.ytdActual, row.ytdTarget, !isHigherBetter);
                    const yoyChange = row.prevYear > 0 ? getPercentChange(row.ytdActual, row.prevYear) : "N/A";
                    const isPositiveChange = isHigherBetter
                      ? row.ytdActual > row.prevYear
                      : row.ytdActual < row.prevYear;

                    return (
                      <TableRow key={row.kpi}>
                        <TableCell className="font-medium">{row.kpi}</TableCell>
                        <TableCell className="text-right tabular-nums">{row.mtdActual.toLocaleString()} {row.unit}</TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">{row.mtdTarget.toLocaleString()} {row.unit}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className={cn(statusStyles[mtdStatus])}>
                            {mtdStatus === "success" && "On Track"}
                            {mtdStatus === "warning" && "Attention"}
                            {mtdStatus === "danger" && "Critical"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{row.ytdActual.toLocaleString()} {row.unit}</TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">{row.ytdTarget.toLocaleString()} {row.unit}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className={cn(statusStyles[ytdStatus])}>
                            {ytdStatus === "success" && "On Track"}
                            {ytdStatus === "warning" && "Attention"}
                            {ytdStatus === "danger" && "Critical"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">{row.prevYear.toLocaleString()} {row.unit}</TableCell>
                        <TableCell className="text-right">
                          <span className={cn("font-medium tabular-nums", isPositiveChange ? "text-green-600" : "text-red-600")}>
                            {yoyChange}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center gap-6">
              <span className="text-sm font-medium">Status Legend:</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn(statusStyles.success)}>On Track</Badge>
                <span className="text-sm text-muted-foreground">Meeting or exceeding targets</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn(statusStyles.warning)}>Attention</Badge>
                <span className="text-sm text-muted-foreground">Within 10% of target</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn(statusStyles.danger)}>Critical</Badge>
                <span className="text-sm text-muted-foreground">Exceeding target threshold</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}