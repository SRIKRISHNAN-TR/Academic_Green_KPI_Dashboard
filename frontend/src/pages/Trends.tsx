import { useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

const locationOptions = [
  "All Locations",
  ...Object.entries(LOCATION_CATEGORIES).flatMap(([cat, locs]) =>
    locs.map((l) => `${cat} - ${l}`)
  ),
];
const years = ["2026", "2025", "2024", "2023", "2022"];

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

  const { data: energyRaw, isLoading: loadingEnergy } = energyHooks.useAll(params);
  const { data: waterRaw, isLoading: loadingWater } = waterHooks.useAll(params);
  const { data: wasteRaw, isLoading: loadingWaste } = wasteHooks.useAll(params);

  const isLoading = loadingEnergy || loadingWater || loadingWaste;

  const sanitize = (data?: any[]) =>
  Array.isArray(data)
    ? data.map((d) => ({
        month: d.month?.substring?.(0, 3) || "",
        actual: Number(d.actual ?? 0),
        target: Number(d.target ?? 0),
      }))
    : [];

const energyData = sanitize(energyRaw);
const waterData = sanitize(waterRaw);
const wasteData = sanitize(wasteRaw);


  const totalEnergy = energyData.reduce((s, d) => s + d.actual, 0);
  const totalWater = waterData.reduce((s, d) => s + d.actual, 0);
  const avgWaste = wasteData.length > 0
    ? Math.round(wasteData.reduce((s, d) => s + d.actual, 0) / wasteData.length)
    : 0;

  const pieData = [
    { name: "Electricity (kWh)", value: totalEnergy },
    { name: "Water (m³)", value: totalWater },
    { name: "Waste Diversion (%)", value: avgWaste * 100 },
  ].filter((d) => d.value > 0);

  const monthlyTable = energyData.map((e, i) => ({
    month: e.month,
    energy: e.actual,
    energyTarget: e.target,
    water: waterData[i]?.actual ?? 0,
    waterTarget: waterData[i]?.target ?? 0,
    waste: wasteData[i]?.actual ?? 0,
    wasteTarget: wasteData[i]?.target ?? 0,
  }));

  const noData = energyData.length === 0 && waterData.length === 0 && wasteData.length === 0;

  const content = (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Trend Analysis</h2>
        <p className="text-muted-foreground">
          Historical sustainability trends — distinct from the Dashboard overview.
          {isLoading && " Loading data..."}
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

      {noData && !isLoading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No data available for {year}. Add data via the Data Entry page.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Category Distribution Pie */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution — {year}</CardTitle>
              </CardHeader>
              <CardContent>
                {pieData.length > 0 ? (
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
                ) : (
                  <p className="py-12 text-center text-muted-foreground">No data</p>
                )}
              </CardContent>
            </Card>

            {/* Monthly Comparison Table */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Comparison — {year}</CardTitle>
              </CardHeader>
              <CardContent className="max-h-[340px] overflow-auto">
                {monthlyTable.length > 0 ? (
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
                              {Number(row.energy ?? 0).toLocaleString()}
                            </span>
                            <span className="text-xs text-muted-foreground"> / {Number(row.energyTarget ?? 0).toLocaleString()}
</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={cn(row.water > row.waterTarget && "text-destructive font-semibold")}>
                              {Number(row.water ?? 0).toLocaleString()}
                            </span>
                            <span className="text-xs text-muted-foreground"> / {Number(row.waterTarget ?? 0).toLocaleString()}
</span>
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
                ) : (
                  <p className="py-12 text-center text-muted-foreground">No data</p>
                )}
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
              {energyData.length > 0 ? (
                <>
                  <Card>
                    <CardHeader><CardTitle>Electricity Consumption — Line Trend</CardTitle></CardHeader>
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
                </>
              ) : (
                <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">No electricity data for {year}</p></CardContent></Card>
              )}
            </TabsContent>

            <TabsContent value="water" className="space-y-6">
              {waterData.length > 0 ? (
                <>
                  <Card>
                    <CardHeader><CardTitle>Water Consumption — Line Trend</CardTitle></CardHeader>
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
                </>
              ) : (
                <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">No water data for {year}</p></CardContent></Card>
              )}
            </TabsContent>

            <TabsContent value="waste" className="space-y-6">
              {wasteData.length > 0 ? (
                <>
                  <Card>
                    <CardHeader><CardTitle>Waste Diversion Rate — Line Trend</CardTitle></CardHeader>
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
                </>
              ) : (
                <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">No waste data for {year}</p></CardContent></Card>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );

  if (!isAuthenticated) {
    return <PublicLayout title="Trends">{content}</PublicLayout>;
  }

  return <DashboardLayout title="Trend Analysis" requireAuth={false}>{content}</DashboardLayout>;
}