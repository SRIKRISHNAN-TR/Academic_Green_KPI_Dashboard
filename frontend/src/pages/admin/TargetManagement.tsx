import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IconEdit, IconCheck, IconPlus } from "@tabler/icons-react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useState } from "react";
import { useTargets, useUpdateTarget, useCreateTarget } from "@/hooks/useApi";
import { useToast } from "@/hooks/use-toast";
import { LOCATION_CATEGORIES } from "@/lib/locations";
import type { TargetInput } from "@/services/api";

const metricLabels: Record<string, string> = {
  ENERGY: "Electricity Consumption",
  WATER: "Water Usage",
  WASTE: "Waste Diversion Rate",
};

const locationOptions = [
  { label: "All (Global)", value: "" },
  ...Object.entries(LOCATION_CATEGORIES).flatMap(([cat, locs]) =>
    locs.map((l) => ({ label: `${cat} - ${l}`, value: `${cat} - ${l}` }))
  ),
];

const fallbackTargets = [
  { id: "1", kpi: "Electricity Consumption", monthly: "32,000 kWh", annual: "380,000 kWh", reduction: "5%", location: "Global" },
  { id: "2", kpi: "Water Usage", monthly: "7,500 m³", annual: "85,000 m³", reduction: "3%", location: "Global" },
  { id: "3", kpi: "Waste Diversion Rate", monthly: "70%", annual: "70%", reduction: "N/A", location: "Global" },
];

export default function TargetManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState("2025");

  // New target form
  const [newMetric, setNewMetric] = useState<string>("ENERGY");
  const [newValue, setNewValue] = useState("");
  const [newUnit, setNewUnit] = useState("kWh");
  const [newLocation, setNewLocation] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: apiTargets } = useTargets({ year: Number(selectedYear) });
  const updateTarget = useUpdateTarget();
  const createTarget = useCreateTarget();

  if (!user || (user.role !== "admin" && user.role !== "data-entry")) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSave = async (id: string) => {
    try {
      await updateTarget.mutateAsync({ id, data: { targetValue: Number(editValue) } });
      toast({ title: "Target updated", description: "Target value has been saved." });
    } catch {
      toast({ title: "Update failed", description: "Could not update target.", variant: "destructive" });
    }
    setEditingId(null);
  };

  const handleCreate = async () => {
    if (!newValue) return;
    const data: TargetInput = {
      metric: newMetric as "ENERGY" | "WATER" | "WASTE",
      year: Number(selectedYear),
      targetValue: Number(newValue),
      unit: newUnit,
      location: newLocation || undefined,
    };
    try {
      await createTarget.mutateAsync(data);
      toast({ title: "Target created", description: `New target for ${metricLabels[newMetric]} added.` });
      setNewValue("");
      setShowAddForm(false);
    } catch (err: any) {
      toast({ title: "Creation failed", description: err.message, variant: "destructive" });
    }
  };

  const targets = apiTargets && apiTargets.length > 0
    ? apiTargets.map((t) => ({
        id: t._id,
        kpi: metricLabels[t.metric] || t.metric,
        monthly: `${(t.targetValue / 12).toLocaleString()} ${t.unit}`,
        annual: `${t.targetValue.toLocaleString()} ${t.unit}`,
        reduction: "N/A",
        location: t.location || "Global",
        rawValue: t.targetValue,
      }))
    : fallbackTargets.map((t) => ({ ...t, rawValue: 0 }));

  return (
    <DashboardLayout title="Target Management">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Target Management</h2>
            <p className="text-muted-foreground">Set and manage sustainability targets per KPI and location.</p>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2">
            <IconPlus className="size-4" />
            Add Target
          </Button>
        </div>

        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add New Target</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-5">
                <div className="space-y-2">
                  <Label>KPI</Label>
                  <Select value={newMetric} onValueChange={(v) => {
                    setNewMetric(v);
                    setNewUnit(v === "ENERGY" ? "kWh" : v === "WATER" ? "m³" : "%");
                  }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ENERGY">Electricity</SelectItem>
                      <SelectItem value="WATER">Water</SelectItem>
                      <SelectItem value="WASTE">Waste</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Annual Target ({newUnit})</Label>
                  <Input type="number" value={newValue} onChange={(e) => setNewValue(e.target.value)} placeholder="e.g. 380000" />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Select value={newLocation} onValueChange={setNewLocation}>
                    <SelectTrigger><SelectValue placeholder="Global" /></SelectTrigger>
                    <SelectContent>
                      {locationOptions.map((l) => (
                        <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Input type="number" value={selectedYear} readOnly className="bg-muted" />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleCreate} className="w-full">Save Target</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Current Year Targets</CardTitle>
            <CardDescription>{selectedYear} sustainability targets and goals</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>KPI</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Monthly Target</TableHead>
                  <TableHead>Annual Target</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {targets.map((target) => (
                  <TableRow key={target.id}>
                    <TableCell className="font-medium">{target.kpi}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{target.location}</TableCell>
                    <TableCell>
                      {editingId === target.id ? (
                        <Input
                          defaultValue={target.rawValue || target.monthly}
                          className="h-8 w-32"
                          onChange={(e) => setEditValue(e.target.value)}
                        />
                      ) : (
                        target.monthly
                      )}
                    </TableCell>
                    <TableCell>{target.annual}</TableCell>
                    <TableCell className="text-right">
                      {editingId === target.id ? (
                        <Button size="sm" onClick={() => handleSave(target.id)}>
                          <IconCheck className="mr-1 size-4" />Save
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => { setEditingId(target.id); setEditValue(String(target.rawValue)); }}>
                          <IconEdit className="mr-1 size-4" />Edit
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Historical Targets</CardTitle>
            <CardDescription>Previous year target configurations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="space-y-2">
                <Label>Select Year</Label>
                <select
                  className="flex h-10 w-32 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}