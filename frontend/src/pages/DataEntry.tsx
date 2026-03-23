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
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { IconBolt, IconDroplet, IconRecycle, IconTrash, IconRefresh } from "@tabler/icons-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { energyHooks, waterHooks, wasteHooks } from "@/hooks/useApi";
import type { MetricInput } from "@/services/api";
import { LOCATION_CATEGORIES } from "@/lib/locations";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
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

const statusColors: Record<string, string> = {
  GREEN: "bg-emerald-100 text-emerald-700 border-emerald-200",
  YELLOW: "bg-amber-100 text-amber-700 border-amber-200",
  RED: "bg-red-100 text-red-700 border-red-200",
};

export default function DataEntry() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { toast } = useToast();

  const [selectedMonth, setSelectedMonth] = useState("January");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedLocation, setSelectedLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string; type: string } | null>(null);

  const [energyForm, setEnergyForm] = useState({ electricity: "", solar: "", peak: "" });
  const [waterForm, setWaterForm] = useState({ mains: "", rainwater: "", recycled: "", irrigation: "" });
  const [wasteForm, setWasteForm] = useState({ general: "", recycling: "", compost: "", hazardous: "" });

  const createEnergy = energyHooks.useCreate();
  const createWater  = waterHooks.useCreate();
  const createWaste  = wasteHooks.useCreate();

  const deleteEnergy = energyHooks.useDelete();
  const deleteWater  = waterHooks.useDelete();
  const deleteWaste  = wasteHooks.useDelete();

  const { data: recentEnergy, refetch: refetchEnergy } = energyHooks.useAll();
  const { data: recentWater,  refetch: refetchWater  } = waterHooks.useAll();
  const { data: recentWaste,  refetch: refetchWaste  } = wasteHooks.useAll();

  // Merge all into one table sorted by createdAt desc
  const recentSubmissions = [
    ...(recentEnergy || []).map((d) => ({ ...d, type: "Electricity", typeKey: "energy" })),
    ...(recentWater  || []).map((d) => ({ ...d, type: "Water",       typeKey: "water"  })),
    ...(recentWaste  || []).map((d) => ({ ...d, type: "Waste",       typeKey: "waste"  })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 30);

  // ── Submit handlers ──────────────────────────────────────────────────────
  const handleSubmitEnergy = async () => {
    if (!selectedLocation) { toast({ title: "Select a location", variant: "destructive" }); return; }
    setIsSubmitting(true);
    const actual = Number(energyForm.electricity);
    const target = 32000;
    const payload: MetricInput = {
      month: selectedMonth, year: Number(selectedYear),
      actual, target, unit: "kWh", source: "Manual Entry",
      location: selectedLocation, status: calcStatus(actual, target, "ENERGY"),
    };
    try {
      await createEnergy.mutateAsync(payload);
      toast({ title: "Saved", description: `Electricity data for ${selectedMonth} ${selectedYear}.` });
      setEnergyForm({ electricity: "", solar: "", peak: "" });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
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
      location: selectedLocation, status: calcStatus(actual, target, "WATER"),
    };
    try {
      await createWater.mutateAsync(payload);
      toast({ title: "Saved", description: `Water data for ${selectedMonth} ${selectedYear}.` });
      setWaterForm({ mains: "", rainwater: "", recycled: "", irrigation: "" });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  const handleSubmitWaste = async () => {
    if (!selectedLocation) { toast({ title: "Select a location", variant: "destructive" }); return; }
    setIsSubmitting(true);
    const total   = Number(wasteForm.general) + Number(wasteForm.recycling) + Number(wasteForm.compost) + Number(wasteForm.hazardous);
    const diverted = Number(wasteForm.recycling) + Number(wasteForm.compost);
    const actual  = total > 0 ? Math.round((diverted / total) * 100) : 0;
    const target  = 70;
    const payload: MetricInput = {
      month: selectedMonth, year: Number(selectedYear),
      actual, target, unit: "%", source: "Manual Entry",
      location: selectedLocation, status: calcStatus(actual, target, "WASTE"),
    };
    try {
      await createWaste.mutateAsync(payload);
      toast({ title: "Saved", description: `Waste data for ${selectedMonth} ${selectedYear}.` });
      setWasteForm({ general: "", recycling: "", compost: "", hazardous: "" });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  // ── Delete handler ───────────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === "energy")      await deleteEnergy.mutateAsync(deleteTarget.id);
      else if (deleteTarget.type === "water")  await deleteWater.mutateAsync(deleteTarget.id);
      else if (deleteTarget.type === "waste")  await deleteWaste.mutateAsync(deleteTarget.id);
      toast({ title: "Record deleted", description: deleteTarget.label });
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    }
    setDeleteTarget(null);
  };

  // ── Reset form helpers ───────────────────────────────────────────────────
  const resetAll = () => {
    setEnergyForm({ electricity: "", solar: "", peak: "" });
    setWaterForm({ mains: "", rainwater: "", recycled: "", irrigation: "" });
    setWasteForm({ general: "", recycling: "", compost: "", hazardous: "" });
    setSelectedLocation("");
    toast({ title: "Forms cleared" });
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
    <DashboardLayout title="Data Entry" requireAuth>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Data Entry</h2>
            <p className="text-muted-foreground">Enter monthly sustainability data for electricity, water, and waste metrics.</p>
          </div>
          <Button variant="outline" onClick={resetAll} className="gap-2 shrink-0">
            <IconRefresh className="size-4" />
            Reset All Forms
          </Button>
        </div>

        {/* Period & Location selector */}
        <Card>
          <CardHeader><CardTitle className="text-base">Select Period & Location</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Month</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {months.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["2026","2025","2024","2023"].map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location *</Label>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                  <SelectContent>
                    {locationOptions.map((loc) => <SelectItem key={loc.value} value={loc.value}>{loc.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Entry forms */}
        <Tabs defaultValue="energy" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="energy" className="gap-2"><IconBolt className="size-4" />Electricity</TabsTrigger>
            <TabsTrigger value="water"  className="gap-2"><IconDroplet className="size-4" />Water</TabsTrigger>
            <TabsTrigger value="waste"  className="gap-2"><IconRecycle className="size-4" />Waste</TabsTrigger>
          </TabsList>

          {/* Energy */}
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
                    <Input id="electricity" type="number" placeholder="Enter kWh" value={energyForm.electricity}
                      onChange={(e) => setEnergyForm({ ...energyForm, electricity: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="solar">Solar Generation (kWh)</Label>
                    <Input id="solar" type="number" placeholder="Enter kWh" value={energyForm.solar}
                      onChange={(e) => setEnergyForm({ ...energyForm, solar: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="peak">Peak Demand (kW)</Label>
                    <Input id="peak" type="number" placeholder="Enter kW" value={energyForm.peak}
                      onChange={(e) => setEnergyForm({ ...energyForm, peak: e.target.value })} />
                  </div>
                </div>
                <div className="rounded-lg bg-muted/50 p-4 text-sm">
                  <p className="font-medium mb-2">Auto-calculated</p>
                  <div className="grid gap-2 text-muted-foreground md:grid-cols-2">
                    <div>Total: <span className="font-medium text-foreground">{totalEnergy > 0 ? totalEnergy.toLocaleString() : "--"} kWh</span></div>
                    <div>Renewable %: <span className="font-medium text-foreground">{renewablePct}%</span></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSubmitEnergy} disabled={isSubmitting}>
                    {isSubmitting ? "Saving…" : "Save Electricity Data"}
                  </Button>
                  <Button variant="ghost" onClick={() => setEnergyForm({ electricity: "", solar: "", peak: "" })}>
                    <IconRefresh className="mr-2 size-4" />Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Water */}
          <TabsContent value="water">
            <Card>
              <CardHeader>
                <CardTitle>Water Data Entry</CardTitle>
                <CardDescription>Enter water consumption for {selectedMonth} {selectedYear}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    { label: "Mains Water (m³)", key: "mains" },
                    { label: "Rainwater Harvested (m³)", key: "rainwater" },
                    { label: "Recycled Water (m³)", key: "recycled" },
                    { label: "Irrigation (m³)", key: "irrigation" },
                  ].map(({ label, key }) => (
                    <div key={key} className="space-y-2">
                      <Label>{label}</Label>
                      <Input type="number" placeholder="Enter m³"
                        value={waterForm[key as keyof typeof waterForm]}
                        onChange={(e) => setWaterForm({ ...waterForm, [key]: e.target.value })} />
                    </div>
                  ))}
                </div>
                <div className="rounded-lg bg-muted/50 p-4 text-sm">
                  <p className="font-medium mb-2">Auto-calculated</p>
                  <div className="grid gap-2 text-muted-foreground md:grid-cols-2">
                    <div>Total: <span className="font-medium text-foreground">{totalWater > 0 ? totalWater.toLocaleString() : "--"} m³</span></div>
                    <div>Recycled %: <span className="font-medium text-foreground">{recycledPct}%</span></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSubmitWater} disabled={isSubmitting}>
                    {isSubmitting ? "Saving…" : "Save Water Data"}
                  </Button>
                  <Button variant="ghost" onClick={() => setWaterForm({ mains: "", rainwater: "", recycled: "", irrigation: "" })}>
                    <IconRefresh className="mr-2 size-4" />Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Waste */}
          <TabsContent value="waste">
            <Card>
              <CardHeader>
                <CardTitle>Waste Data Entry</CardTitle>
                <CardDescription>Enter waste generation and diversion for {selectedMonth} {selectedYear}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    { label: "General Waste (kg)", key: "general" },
                    { label: "Recycling (kg)", key: "recycling" },
                    { label: "Compost/Organic (kg)", key: "compost" },
                    { label: "Hazardous Waste (kg)", key: "hazardous" },
                  ].map(({ label, key }) => (
                    <div key={key} className="space-y-2">
                      <Label>{label}</Label>
                      <Input type="number" placeholder="Enter kg"
                        value={wasteForm[key as keyof typeof wasteForm]}
                        onChange={(e) => setWasteForm({ ...wasteForm, [key]: e.target.value })} />
                    </div>
                  ))}
                </div>
                <div className="rounded-lg bg-muted/50 p-4 text-sm">
                  <p className="font-medium mb-2">Auto-calculated</p>
                  <div className="grid gap-2 text-muted-foreground md:grid-cols-2">
                    <div>Total Waste: <span className="font-medium text-foreground">{totalWaste > 0 ? totalWaste.toLocaleString() : "--"} kg</span></div>
                    <div>Diversion Rate: <span className="font-medium text-foreground">{diversionRate}%</span></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSubmitWaste} disabled={isSubmitting}>
                    {isSubmitting ? "Saving…" : "Save Waste Data"}
                  </Button>
                  <Button variant="ghost" onClick={() => setWasteForm({ general: "", recycling: "", compost: "", hazardous: "" })}>
                    <IconRefresh className="mr-2 size-4" />Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Recent Submissions table with delete */}
        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between space-y-0">
            <div>
              <CardTitle>Recent Submissions</CardTitle>
              <CardDescription>Last 30 entries across all metrics</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="gap-2 shrink-0 self-start sm:self-auto"
              onClick={() => { refetchEnergy(); refetchWater(); refetchWaste(); }}>
              <IconRefresh className="size-4" />Refresh
            </Button>
          </CardHeader>
          <CardContent>
            {recentSubmissions.length > 0 ? (
              <div className="rounded-md border overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-right">Actual</TableHead>
                      <TableHead className="text-right">Target</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentSubmissions.map((sub) => (
                      <TableRow key={sub._id}>
                        <TableCell className="font-medium whitespace-nowrap">{sub.month} {sub.year}</TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1.5">
                            {sub.typeKey === "energy" && <IconBolt className="size-3.5 text-amber-500" />}
                            {sub.typeKey === "water"  && <IconDroplet className="size-3.5 text-blue-500" />}
                            {sub.typeKey === "waste"  && <IconRecycle className="size-3.5 text-emerald-500" />}
                            {sub.type}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{sub.location || "—"}</TableCell>
                        <TableCell className="text-right font-mono text-sm">{sub.actual.toLocaleString()} {sub.unit}</TableCell>
                        <TableCell className="text-right font-mono text-sm text-muted-foreground">{sub.target.toLocaleString()} {sub.unit}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusColors[sub.status] ?? ""}>
                            {sub.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(sub.createdAt).toLocaleDateString()}
                        </TableCell>
                        {isAdmin && (
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => setDeleteTarget({
                                id: sub._id,
                                label: `${sub.type} – ${sub.month} ${sub.year} – ${sub.location || "No location"}`,
                                type: sub.typeKey,
                              })}
                            >
                              <IconTrash className="size-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="py-8 text-center text-muted-foreground">No submissions yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this record?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove: <strong>{deleteTarget?.label}</strong>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}