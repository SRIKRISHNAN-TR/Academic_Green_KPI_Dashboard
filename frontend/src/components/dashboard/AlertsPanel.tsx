import { IconAlertTriangle, IconInfoCircle, IconCircleCheck } from "@tabler/icons-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Alert {
  id: string;
  type: "warning" | "info" | "success";
  title: string;
  message: string;
  timestamp: string;
}

interface AlertsPanelProps {
  alerts: Alert[];
}

const alertStyles = {
  warning: {
    icon: IconAlertTriangle,
    bg: "bg-amber-500/10",
    text: "text-amber-600",
    border: "border-l-amber-500",
  },
  info: {
    icon: IconInfoCircle,
    bg: "bg-blue-500/10",
    text: "text-blue-600",
    border: "border-l-blue-500",
  },
  success: {
    icon: IconCircleCheck,
    bg: "bg-green-500/10",
    text: "text-green-600",
    border: "border-l-green-500",
  },
};

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Alerts & Notifications</CardTitle>
          <CardDescription>Recent sustainability alerts</CardDescription>
        </div>
        <Badge variant="secondary">{alerts.length} Active</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">No active alerts</p>
        ) : (
          alerts.map((alert) => {
            const style = alertStyles[alert.type];
            const Icon = style.icon;
            return (
              <div
                key={alert.id}
                className={cn(
                  "rounded-lg border-l-4 p-3",
                  style.bg,
                  style.border
                )}
              >
                <div className="flex items-start gap-3">
                  <Icon className={cn("mt-0.5 size-5", style.text)} />
                  <div className="flex-1 space-y-1">
                    <p className="font-medium">{alert.title}</p>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">{alert.timestamp}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}