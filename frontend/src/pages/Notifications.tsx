import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IconBell, IconAlertTriangle, IconInfoCircle, IconCircleCheck, IconCheck } from "@tabler/icons-react";
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from "@/hooks/useApi";

const typeConfig = {
  warning: { icon: IconAlertTriangle, bg: "bg-amber-500/10", text: "text-amber-600", border: "border-l-amber-500" },
  info: { icon: IconInfoCircle, bg: "bg-blue-500/10", text: "text-blue-600", border: "border-l-blue-500" },
  success: { icon: IconCircleCheck, bg: "bg-green-500/10", text: "text-green-600", border: "border-l-green-500" },
};

export default function Notifications() {
  const { data: notifications, isLoading } = useNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const allNotifications = notifications || [];
  const unreadNotifications = allNotifications.filter((n) => !n.read);
  const warningNotifications = allNotifications.filter((n) => n.type === "warning");

  const handleMarkAsRead = (id: string) => {
    markAsRead.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  const renderNotification = (notification: (typeof allNotifications)[0]) => {
    const config = typeConfig[notification.type as keyof typeof typeConfig] || typeConfig.info;
    const Icon = config.icon;

    return (
      <Card
        key={notification._id}
        className={`border-l-4 ${config.border} ${!notification.read ? "bg-muted/50" : ""}`}
      >
        <CardContent className="flex items-start gap-4 p-4">
          <div className={`mt-0.5 rounded-full p-2 ${config.bg}`}>
            <Icon className={`size-4 ${config.text}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium">{notification.title}</h4>
                <p className="text-sm text-muted-foreground">{notification.message}</p>
              </div>
              {!notification.read && (
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary">New</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMarkAsRead(notification._id)}
                  >
                    <IconCheck className="size-4" />
                  </Button>
                </div>
              )}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {formatTime(notification.createdAt)}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout title="Notifications">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
            <p className="text-muted-foreground">
              Stay updated with sustainability alerts and system notifications.
              {isLoading && " Loading..."}
            </p>
          </div>
          {unreadNotifications.length > 0 && (
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              <IconCheck className="mr-2 size-4" />
              Mark all as read
            </Button>
          )}
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all" className="gap-2">
              <IconBell className="size-4" />
              All
              <Badge variant="secondary" className="ml-1 px-1.5">
                {allNotifications.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="unread" className="gap-2">
              Unread
              {unreadNotifications.length > 0 && (
                <Badge className="ml-1 px-1.5 bg-primary">{unreadNotifications.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="warnings">Warnings</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {allNotifications.length > 0 ? (
              allNotifications.map(renderNotification)
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No notifications yet.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="unread" className="space-y-4">
            {unreadNotifications.length > 0 ? (
              unreadNotifications.map(renderNotification)
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">All caught up! No unread notifications.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="warnings" className="space-y-4">
            {warningNotifications.length > 0 ? (
              warningNotifications.map(renderNotification)
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No warning notifications.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}