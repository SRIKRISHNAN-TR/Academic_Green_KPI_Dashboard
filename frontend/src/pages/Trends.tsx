import { useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { IconBolt, IconDroplet, IconRecycle } from "@tabler/icons-react";
import { energyHooks, waterHooks, wasteHooks } from "@/hooks/useApi";
import { useAuth } from "@/contexts/AuthContext";
import { LOCATION_CATEGORIES } from "@/lib/locations";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";

const fallbackEnergy = [
  { month: "Jan", actual: 45000, target: 48000 },
  { month: "Feb", actual: 42000, target: 46000 },
  { month: "Mar", actual: 38000, target: 44000 },
  { month: "Apr", actual: 35000, target: 42000 },
  { month: "May", actual: 32000, target: 40000 },
  { month: "Jun", actual: 30000, target: 38000 },
  { month: "Jul", actual: 28000, target: 36000 },
  { month: "Aug", actual: 29000, target: 35000 },
  { month: "Sep", actual: 31000, target: 37000 },
  { month: "Oct", actual: 34000, target: 39000 },
  { month: "Nov", actual: 38000, target: 42000 },
  { month: "Dec", actual: 42000, target: 45000 },
];

const fallbackWater = [
  { month: "Jan", actual: 8500, target: 9000 },
  { month: "Feb", actual: 8200, target: 8800 },
  { month: "Mar", actual: 7800, target: 8500 },
  { month: "Apr", actual: 7200, target: 8200 },
  { month: "May", actual: 6800, target: 7800 },
  { month: "Jun", actual: 6500, target: 7500 },
  { month: "Jul", actual: 6200, target: 7200 },
  { month: "Aug", actual: 6400, target: 7400 },
  { month: "Sep", actual: 6800, target: 7600 },
  { month: "Oct", actual: 7200, target: 8000 },
  { month: "Nov", actual: 7800, target: 8400 },
  { month: "Dec", actual: 8200, target: 8800 },
];

const fallbackWaste = [
  { month: "Jan", actual: 62, target: 70 },
  { month: "Feb", actual: 64, target: 70 },
  { month: "Mar", actual: 66, target: 70 },
  { month: "Apr", actual: 67, target: 70 },
  { month: "May", actual: 69, target: 70 },
  { month: "Jun", actual: 70, target: 70 },
  { month: "Jul", actual: 71, target: 70 },
  { month: "Aug", actual: 72, target: 70 },
  { month: "Sep", actual: 71, target: 70 },
  { month: "Oct", actual: 72, target: 70 },
  { month: "Nov", actual: 73, target: 70 },
  { month: "Dec", actual: 74, target: 70 },
];

const locationOptions = [
  "All Locations",
  ...Object.entries(LOCATION_CATEGORIES).flatMap(([cat, locs]) =>
    locs.map((l) => `${cat} - ${l}`)
  ),
];
const years = ["2025", "2024", "2023", "2022"];

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const lineConfig: ChartConfig = {
  actual: { label: "Actual", color: "hsl(var(--primary))" },
  target: { label: "Target", color: "hsl(var(--muted-foreground))" },
};

const toChart = (data: { month: string; actual: number; target: number }[]) =>
  data.map((d) => ({ month: d.month.substring(0, 3), actual: d.actual, target: d.target }));

export default function Trends() {
  const { isAuthenticated } = useAuth();
  const [year, setYear] = useState("2025");
  const [location, setLocation] = useState("All Locations");

  const params: { year: number; location?: string } = { year: Number(year) };
  if (location !== "All Locations") params.location = location;

  const { data: energyRaw } = energyHooks.useAll(params);
  const { data: waterRaw } = waterHooks.useAll(params);
  const { data: wasteRaw } = wasteHooks.useAll(params);

  const energyData = energyRaw && energyRaw.length > 0 ? toChart(energyRaw) : fallbackEnergy;
  const waterData = waterRaw && waterRaw.length > 0 ? toChart(waterRaw) : fallbackWater;
  const wasteData = wasteRaw && wasteRaw.length > 0 ? toChart(wasteRaw) : fallbackWaste;

  // Summary pie data for category breakdown
  const totalEnergy = energyData.reduce((s, d) => s + d.actual, 0);
  const totalWater = waterData.reduce((s, d) => s + d.actual, 0);
  const avgWaste = wasteData.length > 0
    ? Math.round(wasteData.reduce((s, d) => s + d.actual, 0) / wasteData.length)
    : 0;

  const pieData = [
    { name: "Electricity (kWh)", value: totalEnergy },
    { name: "Water (m³)", value: totalWater },
    { name: "Waste Diversion (%)", value: avgWaste * 100 },
  ];

  // Monthly comparison table
  const monthlyTable = energyData.map((e, i) => ({
    month: e.month,
    energy: e.actual,
    energyTarget: e.target,
    water: waterData[i]?.actual ?? 0,
    waterTarget: waterData[i]?.target ?? 0,
    waste: wasteData[i]?.actual ?? 0,
    wasteTarget: wasteData[i]?.target ?? 0,
  }));

  const content = (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Trend Analysis</h2>
        <p className="text-muted-foreground">
          Historical sustainability trends — distinct from the Dashboard overview.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Year</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {years.map((y) => (<SelectItem key={y} value={y}>{y}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {locationOptions.map((l) => (<SelectItem key={l} value={l}>{l}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Distribution Pie */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Category Distribution — {year}</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={lineConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => `${name.split(" ")[0]} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Monthly Comparison Table */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Comparison — {year}</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[340px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Electricity</TableHead>
                  <TableHead className="text-right">Water</TableHead>
                  <TableHead className="text-right">Waste %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyTable.map((row) => (
                  <TableRow key={row.month}>
                    <TableCell className="font-medium">{row.month}</TableCell>
                    <TableCell className="text-right">
                      <span className={cn(row.energy > row.energyTarget && "text-destructive font-semibold")}>
                        {row.energy.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground"> / {row.energyTarget.toLocaleString()}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={cn(row.water > row.waterTarget && "text-destructive font-semibold")}>
                        {row.water.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground"> / {row.waterTarget.toLocaleString()}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={cn(row.waste < row.wasteTarget && "text-destructive font-semibold")}>
                        {row.waste}%
                      </span>
                      <span className="text-xs text-muted-foreground"> / {row.wasteTarget}%</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="energy" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="energy" className="gap-2"><IconBolt className="size-4" />Electricity Trends</TabsTrigger>
          <TabsTrigger value="water" className="gap-2"><IconDroplet className="size-4" />Water Trends</TabsTrigger>
          <TabsTrigger value="waste" className="gap-2"><IconRecycle className="size-4" />Waste Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="energy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Electricity Consumption — Line Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={lineConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={energyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="actual" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} name="Actual (kWh)" />
                    <Line type="monotone" dataKey="target" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Target" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
          <TrendChart title="Electricity Target vs Actual" description="Bar comparison" data={energyData} type="bar" />
        </TabsContent>

        <TabsContent value="water" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Water Consumption — Line Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={lineConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={waterData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="actual" stroke="hsl(199, 89%, 48%)" strokeWidth={2} dot={{ r: 4 }} name="Actual (m³)" />
                    <Line type="monotone" dataKey="target" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Target" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
          <TrendChart title="Water Target vs Actual" description="Bar comparison" data={waterData} type="bar" />
        </TabsContent>

        <TabsContent value="waste" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Waste Diversion Rate — Line Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={lineConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={wasteData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="actual" stroke="hsl(142, 76%, 36%)" strokeWidth={2} dot={{ r: 4 }} name="Actual (%)" />
                    <Line type="monotone" dataKey="target" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Target" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
          <TrendChart title="Waste Target vs Actual" description="Bar comparison" data={wasteData} type="bar" />
        </TabsContent>
      </Tabs>
    </div>
  );

  if (!isAuthenticated) {
    return <PublicLayout title="Trends">{content}</PublicLayout>;
  }

  return <DashboardLayout title="Trend Analysis" requireAuth={false}>{content}</DashboardLayout>;
}