import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IconBell, IconAlertTriangle, IconInfoCircle, IconCircleCheck, IconCheck } from "@tabler/icons-react";

const notifications = [
  {
    id: "1",
    type: "warning",
    title: "Energy consumption spike detected",
    message: "Science Building exceeded monthly target by 15%. Review usage patterns.",
    timestamp: "2 hours ago",
    read: false,
  },
  {
    id: "2",
    type: "info",
    title: "Monthly report ready",
    message: "January 2024 sustainability report is now available for download.",
    timestamp: "5 hours ago",
    read: false,
  },
  {
    id: "3",
    type: "success",
    title: "Target achieved",
    message: "Waste diversion rate exceeded 70% target for Q4 2023.",
    timestamp: "1 day ago",
    read: true,
  },
  {
    id: "4",
    type: "warning",
    title: "Water meter calibration due",
    message: "Main campus water meters require annual calibration by Feb 15.",
    timestamp: "2 days ago",
    read: true,
  },
  {
    id: "5",
    type: "info",
    title: "New user registration",
    message: "Lisa Johnson has requested data entry access.",
    timestamp: "3 days ago",
    read: true,
  },
];

const typeConfig = {
  warning: { icon: IconAlertTriangle, bg: "bg-amber-500/10", text: "text-amber-600", border: "border-l-amber-500" },
  info: { icon: IconInfoCircle, bg: "bg-blue-500/10", text: "text-blue-600", border: "border-l-blue-500" },
  success: { icon: IconCircleCheck, bg: "bg-green-500/10", text: "text-green-600", border: "border-l-green-500" },
};

export default function Notifications() {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <DashboardLayout title="Notifications">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
            <p className="text-muted-foreground">
              Stay updated with sustainability alerts and system notifications.
            </p>
          </div>
          <Button variant="outline">
            <IconCheck className="mr-2 size-4" />
            Mark all as read
          </Button>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all" className="gap-2">
              <IconBell className="size-4" />
              All
              <Badge variant="secondary" className="ml-1 px-1.5">
                {notifications.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="unread" className="gap-2">
              Unread
              {unreadCount > 0 && (
                <Badge className="ml-1 px-1.5 bg-primary">{unreadCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="warnings">Warnings</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {notifications.map((notification) => {
              const config = typeConfig[notification.type as keyof typeof typeConfig];
              const Icon = config.icon;

              return (
                <Card
                  key={notification.id}
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
                          <Badge className="bg-primary">New</Badge>
                        )}
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">{notification.timestamp}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="unread" className="space-y-4">
            {notifications
              .filter((n) => !n.read)
              .map((notification) => {
                const config = typeConfig[notification.type as keyof typeof typeConfig];
                const Icon = config.icon;

                return (
                  <Card key={notification.id} className={`border-l-4 ${config.border} bg-muted/50`}>
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
                          <Badge className="bg-primary">New</Badge>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">{notification.timestamp}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </TabsContent>

          <TabsContent value="warnings" className="space-y-4">
            {notifications
              .filter((n) => n.type === "warning")
              .map((notification) => {
                const config = typeConfig.warning;
                const Icon = config.icon;

                return (
                  <Card
                    key={notification.id}
                    className={`border-l-4 ${config.border} ${!notification.read ? "bg-muted/50" : ""}`}
                  >
                    <CardContent className="flex items-start gap-4 p-4">
                      <div className={`mt-0.5 rounded-full p-2 ${config.bg}`}>
                        <Icon className={`size-4 ${config.text}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{notification.title}</h4>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <p className="mt-2 text-xs text-muted-foreground">{notification.timestamp}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
