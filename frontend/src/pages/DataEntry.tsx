import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { IconBolt, IconDroplet, IconRecycle } from "@tabler/icons-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { energyHooks, waterHooks, wasteHooks } from "@/hooks/useApi";
import type { MetricInput } from "@/services/api";
import { LOCATION_CATEGORIES } from "@/lib/locations";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const locationOptions = Object.entries(LOCATION_CATEGORIES).flatMap(([cat, locs]) =>
  locs.map((l) => ({ label: `${cat} - ${l}`, value: `${cat} - ${l}` }))
);

const calcStatus = (actual: number, target: number, metric: string): "GREEN" | "YELLOW" | "RED" => {
  if (metric === "WASTE") {
    if (actual >= target) return "GREEN";
    if (actual >= target * 0.9) return "YELLOW";
    return "RED";
  }
  if (actual <= target) return "GREEN";
  if (actual <= target * 1.1) return "YELLOW";
  return "RED";
};

export default function DataEntry() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState("January");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [energyForm, setEnergyForm] = useState({ electricity: "", solar: "", peak: "" });
  const [waterForm, setWaterForm] = useState({ mains: "", rainwater: "", recycled: "", irrigation: "" });
  const [wasteForm, setWasteForm] = useState({ general: "", recycling: "", compost: "", hazardous: "" });

  const createEnergy = energyHooks.useCreate();
  const createWater = waterHooks.useCreate();
  const createWaste = wasteHooks.useCreate();

  const { data: recentEnergy } = energyHooks.useAll();
  const { data: recentWater } = waterHooks.useAll();
  const { data: recentWaste } = wasteHooks.useAll();

  const recentSubmissions = [
    ...(recentEnergy || []).slice(0, 2).map((d) => ({
      id: d._id, month: `${d.month} ${d.year}`, type: "Electricity", status: "approved",
      location: d.location || "—", submittedBy: user?.name || "Unknown", date: new Date(d.createdAt).toLocaleDateString(),
    })),
    ...(recentWater || []).slice(0, 2).map((d) => ({
      id: d._id, month: `${d.month} ${d.year}`, type: "Water", status: "approved",
      location: d.location || "—", submittedBy: user?.name || "Unknown", date: new Date(d.createdAt).toLocaleDateString(),
    })),
    ...(recentWaste || []).slice(0, 2).map((d) => ({
      id: d._id, month: `${d.month} ${d.year}`, type: "Waste", status: "approved",
      location: d.location || "—", submittedBy: user?.name || "Unknown", date: new Date(d.createdAt).toLocaleDateString(),
    })),
  ].slice(0, 6);

  const fallbackSubmissions = [
    { id: "1", month: "December 2024", type: "Electricity", status: "approved", location: "Boys Hostel - Sapphire", submittedBy: "Admin", date: "Jan 5, 2025" },
    { id: "2", month: "December 2024", type: "Water", status: "approved", location: "Girls Hostel - Ganga", submittedBy: "Admin", date: "Jan 5, 2025" },
    { id: "3", month: "November 2024", type: "Waste", status: "approved", location: "Academic Blocks - AS", submittedBy: "Admin", date: "Dec 8, 2024" },
  ];

  const displaySubmissions = recentSubmissions.length > 0 ? recentSubmissions : fallbackSubmissions;

  if (!user || user.role === "viewer") {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmitEnergy = async () => {
    if (!selectedLocation) { toast({ title: "Select a location", variant: "destructive" }); return; }
    setIsSubmitting(true);
    const actual = Number(energyForm.electricity);
    const target = 32000;
    const payload: MetricInput = {
      month: selectedMonth, year: Number(selectedYear),
      actual, target, unit: "kWh", source: "Manual Entry",
      location: selectedLocation,
      status: calcStatus(actual, target, "ENERGY"),
    };
    try {
      await createEnergy.mutateAsync(payload);
      toast({ title: "Data submitted", description: `Electricity data for ${selectedMonth} ${selectedYear} saved.` });
      setEnergyForm({ electricity: "", solar: "", peak: "" });
    } catch (err: any) {
      toast({ title: "Submission failed", description: err.message, variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  const handleSubmitWater = async () => {
    if (!selectedLocation) { toast({ title: "Select a location", variant: "destructive" }); return; }
    setIsSubmitting(true);
    const actual = Number(waterForm.mains) + Number(waterForm.rainwater) + Number(waterForm.recycled) + Number(waterForm.irrigation);
    const target = 7500;
    const payload: MetricInput = {
      month: selectedMonth, year: Number(selectedYear),
      actual, target, unit: "m³", source: "Manual Entry",
      location: selectedLocation,
      status: calcStatus(actual, target, "WATER"),
    };
    try {
      await createWater.mutateAsync(payload);
      toast({ title: "Data submitted", description: `Water data for ${selectedMonth} ${selectedYear} saved.` });
      setWaterForm({ mains: "", rainwater: "", recycled: "", irrigation: "" });
    } catch (err: any) {
      toast({ title: "Submission failed", description: err.message, variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  const handleSubmitWaste = async () => {
    if (!selectedLocation) { toast({ title: "Select a location", variant: "destructive" }); return; }
    setIsSubmitting(true);
    const total = Number(wasteForm.general) + Number(wasteForm.recycling) + Number(wasteForm.compost) + Number(wasteForm.hazardous);
    const diverted = Number(wasteForm.recycling) + Number(wasteForm.compost);
    const actual = total > 0 ? Math.round((diverted / total) * 100) : 0;
    const target = 70;
    const payload: MetricInput = {
      month: selectedMonth, year: Number(selectedYear),
      actual, target, unit: "%", source: "Manual Entry",
      location: selectedLocation,
      status: calcStatus(actual, target, "WASTE"),
    };
    try {
      await createWaste.mutateAsync(payload);
      toast({ title: "Data submitted", description: `Waste data for ${selectedMonth} ${selectedYear} saved.` });
      setWasteForm({ general: "", recycling: "", compost: "", hazardous: "" });
    } catch (err: any) {
      toast({ title: "Submission failed", description: err.message, variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  const totalEnergy = Number(energyForm.electricity);
  const renewablePct = totalEnergy > 0 && Number(energyForm.solar) > 0
    ? ((Number(energyForm.solar) / totalEnergy) * 100).toFixed(1) : "--";
  const totalWater = Number(waterForm.mains) + Number(waterForm.rainwater) + Number(waterForm.recycled) + Number(waterForm.irrigation);
  const recycledPct = totalWater > 0 ? ((Number(waterForm.recycled) / totalWater) * 100).toFixed(1) : "--";
  const totalWaste = Number(wasteForm.general) + Number(wasteForm.recycling) + Number(wasteForm.compost) + Number(wasteForm.hazardous);
  const diversionRate = totalWaste > 0
    ? (((Number(wasteForm.recycling) + Number(wasteForm.compost)) / totalWaste) * 100).toFixed(1) : "--";

  return (
    <DashboardLayout title="Data Entry">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Data Entry</h2>
          <p className="text-muted-foreground">
            Enter monthly sustainability data for electricity, water, and waste metrics.
          </p>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Select Period & Location</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Month</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (<SelectItem key={month} value={month}>{month}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location *</Label>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                  <SelectContent>
                    {locationOptions.map((loc) => (
                      <SelectItem key={loc.value} value={loc.value}>{loc.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="energy" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="energy" className="gap-2"><IconBolt className="size-4" />Electricity</TabsTrigger>
            <TabsTrigger value="water" className="gap-2"><IconDroplet className="size-4" />Water</TabsTrigger>
            <TabsTrigger value="waste" className="gap-2"><IconRecycle className="size-4" />Waste</TabsTrigger>
          </TabsList>

          <TabsContent value="energy">
            <Card>
              <CardHeader>
                <CardTitle>Electricity Data Entry</CardTitle>
                <CardDescription>Enter electricity consumption for {selectedMonth} {selectedYear}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="electricity">Electricity Consumption (kWh)</Label>
                    <Input id="electricity" type="number" placeholder="Enter kWh" value={energyForm.electricity} onChange={(e) => setEnergyForm({ ...energyForm, electricity: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="solar">Solar Generation (kWh)</Label>
                    <Input id="solar" type="number" placeholder="Enter kWh" value={energyForm.solar} onChange={(e) => setEnergyForm({ ...energyForm, solar: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="peak">Peak Demand (kW)</Label>
                    <Input id="peak" type="number" placeholder="Enter kW" value={energyForm.peak} onChange={(e) => setEnergyForm({ ...energyForm, peak: e.target.value })} />
                  </div>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm font-medium">Auto-calculated</p>
                  <div className="mt-2 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                    <div>Total Electricity: <span className="font-medium text-foreground">{totalEnergy > 0 ? totalEnergy.toLocaleString() : "--"} kWh</span></div>
                    <div>Renewable %: <span className="font-medium text-foreground">{renewablePct} %</span></div>
                  </div>
                </div>
                <Button onClick={handleSubmitEnergy} disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Electricity Data"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="water">
            <Card>
              <CardHeader>
                <CardTitle>Water Data Entry</CardTitle>
                <CardDescription>Enter water consumption for {selectedMonth} {selectedYear}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Mains Water (m³)</Label>
                    <Input type="number" placeholder="Enter m³" value={waterForm.mains} onChange={(e) => setWaterForm({ ...waterForm, mains: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Rainwater Harvested (m³)</Label>
                    <Input type="number" placeholder="Enter m³" value={waterForm.rainwater} onChange={(e) => setWaterForm({ ...waterForm, rainwater: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Recycled Water (m³)</Label>
                    <Input type="number" placeholder="Enter m³" value={waterForm.recycled} onChange={(e) => setWaterForm({ ...waterForm, recycled: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Irrigation (m³)</Label>
                    <Input type="number" placeholder="Enter m³" value={waterForm.irrigation} onChange={(e) => setWaterForm({ ...waterForm, irrigation: e.target.value })} />
                  </div>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm font-medium">Auto-calculated</p>
                  <div className="mt-2 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                    <div>Total Water: <span className="font-medium text-foreground">{totalWater > 0 ? totalWater.toLocaleString() : "--"} m³</span></div>
                    <div>Recycled %: <span className="font-medium text-foreground">{recycledPct} %</span></div>
                  </div>
                </div>
                <Button onClick={handleSubmitWater} disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Water Data"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="waste">
            <Card>
              <CardHeader>
                <CardTitle>Waste Data Entry</CardTitle>
                <CardDescription>Enter waste generation and diversion for {selectedMonth} {selectedYear}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>General Waste (kg)</Label>
                    <Input type="number" placeholder="Enter kg" value={wasteForm.general} onChange={(e) => setWasteForm({ ...wasteForm, general: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Recycling (kg)</Label>
                    <Input type="number" placeholder="Enter kg" value={wasteForm.recycling} onChange={(e) => setWasteForm({ ...wasteForm, recycling: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Compost/Organic (kg)</Label>
                    <Input type="number" placeholder="Enter kg" value={wasteForm.compost} onChange={(e) => setWasteForm({ ...wasteForm, compost: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Hazardous Waste (kg)</Label>
                    <Input type="number" placeholder="Enter kg" value={wasteForm.hazardous} onChange={(e) => setWasteForm({ ...wasteForm, hazardous: e.target.value })} />
                  </div>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm font-medium">Auto-calculated</p>
                  <div className="mt-2 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                    <div>Total Waste: <span className="font-medium text-foreground">{totalWaste > 0 ? totalWaste.toLocaleString() : "--"} kg</span></div>
                    <div>Diversion Rate: <span className="font-medium text-foreground">{diversionRate} %</span></div>
                  </div>
                </div>
                <Button onClick={handleSubmitWaste} disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Waste Data"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
            <CardDescription>Your recent data entry submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displaySubmissions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">{sub.month}</TableCell>
                    <TableCell>{sub.type}</TableCell>
                    <TableCell className="text-sm">{sub.location}</TableCell>
                    <TableCell>{sub.submittedBy}</TableCell>
                    <TableCell>{sub.date}</TableCell>
                    <TableCell>
                      <Badge variant={sub.status === "approved" ? "default" : "secondary"} className={sub.status === "approved" ? "bg-primary" : ""}>
                        {sub.status === "approved" ? "Approved" : "Pending"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}