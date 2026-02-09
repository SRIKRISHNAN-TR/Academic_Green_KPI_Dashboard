import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconDownload, IconFileDescription, IconFile } from "@tabler/icons-react";
import { useToast } from "@/hooks/use-toast";
import { energyHooks, waterHooks, wasteHooks } from "@/hooks/useApi";
import { generatePDF, generateDOCX, type ReportData } from "@/lib/reportGenerator";
import { LOCATION_CATEGORIES } from "@/lib/locations";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const locationOptions = [
  "All Locations",
  ...Object.entries(LOCATION_CATEGORIES).flatMap(([cat, locs]) =>
    locs.map((l) => `${cat} - ${l}`)
  ),
];

export default function Reports() {
  const { toast } = useToast();
  const [kpiType, setKpiType] = useState("ENERGY");
  const [location, setLocation] = useState("All Locations");
  const [fromMonth, setFromMonth] = useState("January");
  const [toMonth, setToMonth] = useState("December");
  const [year, setYear] = useState("2025");
  const [isGenerating, setIsGenerating] = useState(false);

  const params: { year: number; location?: string } = { year: Number(year) };
  if (location !== "All Locations") params.location = location;

  const { data: energyData } = energyHooks.useAll(params);
  const { data: waterData } = waterHooks.useAll(params);
  const { data: wasteData } = wasteHooks.useAll(params);

  const kpiLabel: Record<string, string> = {
    ENERGY: "Electricity Consumption",
    WATER: "Water Consumption",
    WASTE: "Waste Management",
  };

  const getRecords = () => {
    const fromIdx = months.indexOf(fromMonth);
    const toIdx = months.indexOf(toMonth);
    const filterMonths = months.slice(fromIdx, toIdx + 1);

    let raw: Array<{ month: string; year: number; actual: number; target: number; status: string; location?: string }> = [];
    if (kpiType === "ENERGY") raw = (energyData || []).map((d) => ({ month: d.month, year: d.year, actual: d.actual, target: d.target, status: d.status, location: d.location }));
    else if (kpiType === "WATER") raw = (waterData || []).map((d) => ({ month: d.month, year: d.year, actual: d.actual, target: d.target, status: d.status, location: d.location }));
    else raw = (wasteData || []).map((d) => ({ month: d.month, year: d.year, actual: d.actual, target: d.target, status: d.status, location: d.location }));

    return raw.filter((r) => filterMonths.includes(r.month));
  };

  const buildReportData = (): ReportData => ({
    kpiType: kpiLabel[kpiType] || kpiType,
    location,
    dateRange: `${fromMonth} – ${toMonth} ${year}`,
    records: getRecords(),
  });

  const handleGenerate = async (format: "pdf" | "docx") => {
    setIsGenerating(true);
    const data = buildReportData();

    if (data.records.length === 0) {
      toast({ title: "No data available", description: "No records found for the selected filters. Using sample data.", variant: "destructive" });
      // Add fallback sample data
      data.records = months.slice(0, 6).map((m, i) => ({
        month: m, year: Number(year),
        actual: 3000 + i * 200, target: 4000,
        status: i < 3 ? "GREEN" : "YELLOW",
        location: location !== "All Locations" ? location : undefined,
      }));
    }

    try {
      if (format === "pdf") {
        await generatePDF(data);
      } else {
        await generateDOCX(data);
      }
      toast({ title: "Report generated!", description: `${format.toUpperCase()} report downloaded successfully.` });
    } catch (err: any) {
      toast({ title: "Error generating report", description: err.message, variant: "destructive" });
    }
    setIsGenerating(false);
  };

  return (
    <DashboardLayout title="Reports">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Report Generation</h2>
          <p className="text-muted-foreground">
            Generate sustainability reports in PDF or DOCX format with selected KPIs, locations, and date ranges.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configure Report</CardTitle>
            <CardDescription>Select the KPI, location, and date range for your report</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label>KPI Type</Label>
                <Select value={kpiType} onValueChange={setKpiType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ENERGY">Electricity Consumption</SelectItem>
                    <SelectItem value="WATER">Water Consumption</SelectItem>
                    <SelectItem value="WASTE">Waste Management</SelectItem>
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
              <div className="space-y-2">
                <Label>From Month</Label>
                <Select value={fromMonth} onValueChange={setFromMonth}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {months.map((m) => (<SelectItem key={m} value={m}>{m}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>To Month</Label>
                <Select value={toMonth} onValueChange={setToMonth}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {months.map((m) => (<SelectItem key={m} value={m}>{m}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Year</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <IconFileDescription className="mr-2 size-5 text-red-500" />
              <CardTitle className="text-base font-medium">PDF Report</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Generate a formatted PDF with charts, tables, and target vs actual analysis.
              </p>
              <Button
                className="mt-4 w-full gap-2"
                onClick={() => handleGenerate("pdf")}
                disabled={isGenerating}
              >
                <IconDownload className="size-4" />
                {isGenerating ? "Generating..." : "Download PDF"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <IconFile className="mr-2 size-5 text-blue-500" />
              <CardTitle className="text-base font-medium">DOCX Report</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Generate a Word document with detailed tables and highlighted over-usage areas.
              </p>
              <Button
                className="mt-4 w-full gap-2"
                variant="outline"
                onClick={() => handleGenerate("docx")}
                disabled={isGenerating}
              >
                <IconDownload className="size-4" />
                {isGenerating ? "Generating..." : "Download DOCX"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Report Contents</CardTitle>
            <CardDescription>What's included in generated reports</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ Selected KPI type (Electricity / Water / Waste)</li>
              <li>✓ Location-wise usage breakdown</li>
              <li>✓ Target vs Actual comparison per month</li>
              <li>✓ Highlighted over-usage areas with visual indicators</li>
              <li>✓ Date range filtering</li>
              <li>✓ Summary statistics (totals, averages, over-target count)</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}