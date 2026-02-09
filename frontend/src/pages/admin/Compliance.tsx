import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { IconCheck, IconClock, IconAlertTriangle, IconDownload } from "@tabler/icons-react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const complianceItems = [
  {
    id: "1",
    name: "ISO 14001:2015 Environmental Management",
    status: "compliant",
    lastAudit: "Oct 15, 2023",
    nextAudit: "Oct 15, 2024",
    progress: 100,
  },
  {
    id: "2",
    name: "Energy Star Certification",
    status: "compliant",
    lastAudit: "Aug 20, 2023",
    nextAudit: "Aug 20, 2024",
    progress: 100,
  },
  {
    id: "3",
    name: "LEED Building Standards",
    status: "in-progress",
    lastAudit: "May 1, 2023",
    nextAudit: "May 1, 2024",
    progress: 75,
  },
  {
    id: "4",
    name: "Carbon Neutral Certification",
    status: "pending",
    lastAudit: "N/A",
    nextAudit: "Jun 30, 2024",
    progress: 45,
  },
  {
    id: "5",
    name: "Waste Management Protocol",
    status: "compliant",
    lastAudit: "Sep 10, 2023",
    nextAudit: "Sep 10, 2024",
    progress: 100,
  },
];

const statusConfig = {
  compliant: { icon: IconCheck, label: "Compliant", class: "bg-primary text-primary-foreground" },
  "in-progress": { icon: IconClock, label: "In Progress", class: "bg-amber-100 text-amber-700" },
  pending: { icon: IconAlertTriangle, label: "Pending", class: "bg-muted text-muted-foreground" },
};

export default function Compliance() {
  const { user } = useAuth();

  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  const compliantCount = complianceItems.filter((c) => c.status === "compliant").length;

  return (
    <DashboardLayout title="Sustainability Compliance">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sustainability Compliance</h2>
          <p className="text-muted-foreground">
            Track environmental certifications and compliance status.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Compliant Standards</CardDescription>
              <CardTitle className="text-3xl">{compliantCount}/{complianceItems.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={(compliantCount / complianceItems.length) * 100} className="[&>div]:bg-primary" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Next Audit Due</CardDescription>
              <CardTitle className="text-xl">May 1, 2024</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">LEED Building Standards</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pending Certifications</CardDescription>
              <CardTitle className="text-3xl">1</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Carbon Neutral Certification</p>
            </CardContent>
          </Card>
        </div>

        {/* Compliance Items */}
        <div className="grid gap-4">
          {complianceItems.map((item) => {
            const config = statusConfig[item.status as keyof typeof statusConfig];
            const StatusIcon = config.icon;

            return (
              <Card key={item.id}>
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className={`flex size-10 items-center justify-center rounded-full ${
                      item.status === "compliant" ? "bg-primary/10" : 
                      item.status === "in-progress" ? "bg-amber-100" : "bg-muted"
                    }`}>
                      <StatusIcon className={`size-5 ${
                        item.status === "compliant" ? "text-primary" :
                        item.status === "in-progress" ? "text-amber-600" : "text-muted-foreground"
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Last audit: {item.lastAudit} • Next: {item.nextAudit}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32">
                      <div className="mb-1 flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{item.progress}%</span>
                      </div>
                      <Progress value={item.progress} className="h-2" />
                    </div>
                    <Badge className={config.class}>{config.label}</Badge>
                    <Button variant="ghost" size="icon">
                      <IconDownload className="size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
