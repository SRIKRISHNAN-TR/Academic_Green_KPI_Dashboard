import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  IconBell, IconAlertTriangle, IconInfoCircle, IconCircleCheck,
  IconCheck, IconCircleX, IconTrash, IconBolt, IconDroplet, IconRecycle,
} from "@tabler/icons-react";
import {
  useNotifications, useMarkAsRead, useMarkAllAsRead,
  useToggleResolved, useDeleteNotification,
} from "@/hooks/useApi";
import { useAuth } from "@/contexts/AuthContext";
import type { NotificationData } from "@/services/api";

const typeConfig = {
  warning: { icon: IconAlertTriangle, bg: "bg-amber-500/10", text: "text-amber-600", border: "border-l-amber-500" },
  info:    { icon: IconInfoCircle,    bg: "bg-blue-500/10",  text: "text-blue-600",  border: "border-l-blue-500" },
  success: { icon: IconCircleCheck,   bg: "bg-green-500/10", text: "text-green-600", border: "border-l-green-500" },
};

const kpiIcon: Record<string, React.ElementType> = {
  ENERGY: IconBolt,
  WATER:  IconDroplet,
  WASTE:  IconRecycle,
};

const kpiColor: Record<string, string> = {
  ENERGY: "text-amber-500",
  WATER:  "text-blue-500",
  WASTE:  "text-emerald-500",
};

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default function Notifications() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const { data: notifications, isLoading } = useNotifications();
  const markAsRead       = useMarkAsRead();
  const markAllAsRead    = useMarkAllAsRead();
  const toggleResolved   = useToggleResolved();
  const deleteNotif      = useDeleteNotification();

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const all      = notifications || [];
  const unread   = all.filter((n) => !n.read);
  const warnings = all.filter((n) => n.type === "warning");
  const kpiAlerts = all.filter((n) => n.type === "warning" && n.kpi);

  // ── Notification card (used in All/Unread tabs) ───────────────────────────
  const renderCard = (n: NotificationData) => {
    const config = typeConfig[n.type as keyof typeof typeConfig] || typeConfig.info;
    const Icon = config.icon;
    return (
      <Card key={n._id} className={`border-l-4 ${config.border} ${!n.read ? "bg-muted/40" : ""} ${n.resolved ? "opacity-60" : ""}`}>
        <CardContent className="flex items-start gap-4 p-4">
          <div className={`mt-0.5 rounded-full p-2 ${config.bg} shrink-0`}>
            <Icon className={`size-4 ${config.text}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h4 className="font-medium leading-tight">{n.title}</h4>
                <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                {n.resolved && (
                  <span className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
                    <IconCircleCheck className="size-3" /> Resolved {n.resolvedAt ? `· ${formatTime(n.resolvedAt)}` : ""}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!n.read && (
                  <Badge className="bg-primary text-[10px] px-1.5 py-0">New</Badge>
                )}
                {!n.read && (
                  <Button variant="ghost" size="icon" className="size-7" title="Mark as read"
                    onClick={() => markAsRead.mutate(n._id)}>
                    <IconCheck className="size-3.5" />
                  </Button>
                )}
                {isAdmin && (
                  <Button variant="ghost" size="icon" className="size-7 text-destructive hover:bg-destructive/10"
                    title="Delete" onClick={() => setDeleteTarget(n._id)}>
                    <IconTrash className="size-3.5" />
                  </Button>
                )}
              </div>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">{formatTime(n.createdAt)}</p>
          </div>
        </CardContent>
      </Card>
    );
  };

  // ── KPI Alerts table (admin view) ────────────────────────────────────────
  const renderAlertsTable = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">KPI Threshold Breach Log</CardTitle>
        <CardDescription>
          Track all locations that exceeded their sustainability targets.
          Mark as <strong>Fixed</strong> once corrective action has been taken.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {kpiAlerts.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <IconCircleCheck className="mx-auto size-8 text-emerald-500 mb-2" />
            <p>No KPI threshold breaches — all targets met! 🎉</p>
          </div>
        ) : (
          <div className="rounded-md border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>KPI</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead className="text-right">Actual</TableHead>
                  <TableHead className="text-right">Target</TableHead>
                  <TableHead>When</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kpiAlerts.map((n) => {
                  const KpiIcon = kpiIcon[n.kpi || ""] || IconAlertTriangle;
                  const pct = n.targetValue && n.targetValue > 0
                    ? ((n.actualValue! / n.targetValue) * 100).toFixed(0)
                    : null;
                  return (
                    <TableRow key={n._id} className={n.resolved ? "opacity-50" : ""}>
                      <TableCell>
                        <span className="flex items-center gap-1.5 font-medium">
                          <KpiIcon className={`size-4 ${kpiColor[n.kpi || ""] ?? "text-muted-foreground"}`} />
                          {n.kpi}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{n.location || "—"}</TableCell>
                      <TableCell className="max-w-[220px]">
                        <p className="text-sm text-muted-foreground truncate" title={n.message}>{n.message}</p>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-red-600 font-semibold">
                        {n.actualValue?.toLocaleString() ?? "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-muted-foreground">
                        {n.targetValue?.toLocaleString() ?? "—"}
                        {pct && (
                          <span className="block text-xs text-red-500">{pct}%</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatTime(n.createdAt)}
                      </TableCell>
                      <TableCell>
                        {n.resolved ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
                            <IconCircleCheck className="size-3" />Fixed
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1">
                            <IconCircleX className="size-3" />Not Fixed
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className={`h-7 text-xs gap-1 ${n.resolved
                              ? "border-amber-300 text-amber-700 hover:bg-amber-50"
                              : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"}`}
                            onClick={() => toggleResolved.mutate(n._id)}
                            disabled={toggleResolved.isPending}
                          >
                            {n.resolved ? (
                              <><IconCircleX className="size-3" />Reopen</>
                            ) : (
                              <><IconCircleCheck className="size-3" />Mark Fixed</>
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteTarget(n._id)}
                          >
                            <IconTrash className="size-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout title="Notifications">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
            <p className="text-muted-foreground">
              Stay updated with sustainability alerts and system notifications.
              {isLoading && " Loading…"}
            </p>
          </div>
          {unread.length > 0 && (
            <Button variant="outline" onClick={() => markAllAsRead.mutate()} className="gap-2 shrink-0 self-start sm:self-auto">
              <IconCheck className="size-4" />
              Mark all as read
            </Button>
          )}
        </div>

        {/* Summary chips */}
        <div className="flex flex-wrap gap-3">
          <div className="rounded-lg border bg-card px-4 py-2 text-sm">
            <span className="text-muted-foreground">Total</span>
            <span className="ml-2 font-semibold">{all.length}</span>
          </div>
          <div className="rounded-lg border bg-card px-4 py-2 text-sm">
            <span className="text-muted-foreground">Unread</span>
            <span className="ml-2 font-semibold text-primary">{unread.length}</span>
          </div>
          <div className="rounded-lg border bg-card px-4 py-2 text-sm">
            <span className="text-muted-foreground">KPI Alerts</span>
            <span className="ml-2 font-semibold text-amber-600">{kpiAlerts.length}</span>
          </div>
          <div className="rounded-lg border bg-card px-4 py-2 text-sm">
            <span className="text-muted-foreground">Unresolved</span>
            <span className="ml-2 font-semibold text-red-600">{kpiAlerts.filter((n) => !n.resolved).length}</span>
          </div>
        </div>

        <Tabs defaultValue={isAdmin ? "alerts" : "all"} className="space-y-4">
          <TabsList>
            <TabsTrigger value="all" className="gap-2">
              <IconBell className="size-4" />All
              <Badge variant="secondary" className="ml-1 px-1.5">{all.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="unread" className="gap-2">
              Unread
              {unread.length > 0 && (
                <Badge className="ml-1 px-1.5 bg-primary">{unread.length}</Badge>
              )}
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="alerts" className="gap-2">
                <IconAlertTriangle className="size-4 text-amber-500" />
                KPI Alerts
                {kpiAlerts.filter((n) => !n.resolved).length > 0 && (
                  <Badge className="ml-1 px-1.5 bg-red-500">
                    {kpiAlerts.filter((n) => !n.resolved).length}
                  </Badge>
                )}
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="all" className="space-y-3">
            {all.length > 0 ? all.map(renderCard) : (
              <Card><CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No notifications yet.</p>
              </CardContent></Card>
            )}
          </TabsContent>

          <TabsContent value="unread" className="space-y-3">
            {unread.length > 0 ? unread.map(renderCard) : (
              <Card><CardContent className="py-12 text-center">
                <IconCircleCheck className="mx-auto size-8 text-emerald-500 mb-2" />
                <p className="text-muted-foreground">All caught up! No unread notifications.</p>
              </CardContent></Card>
            )}
          </TabsContent>

          {isAdmin && (
            <TabsContent value="alerts">
              {renderAlertsTable()}
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this notification?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the notification. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { if (deleteTarget) deleteNotif.mutate(deleteTarget); setDeleteTarget(null); }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}