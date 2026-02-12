import { useLocation, Link } from "react-router-dom";
import {
  IconDashboard,
  IconChartLine,
  IconDatabase,
  IconSettings,
  IconUsers,
  IconTarget,
  IconBuildingSkyscraper,
  IconBell,
  IconFileAnalytics,
  IconLeaf,
  IconBolt,
  IconDroplet,
  IconRecycle,
  IconUser,
  IconLogout,
  IconChevronDown,
  IconFileDescription,
  IconLogin,
  IconUserPlus,
} from "@tabler/icons-react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
  roles?: UserRole[];
  publicVisible?: boolean;
}

const mainNavItems: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: IconDashboard, publicVisible: true },
  { title: "Trends", url: "/trends", icon: IconFileAnalytics, publicVisible: true },
  { title: "Summary", url: "/summary", icon: IconChartLine, publicVisible: true },
];

const dataEntryItems: NavItem[] = [
  { title: "Data Entry", url: "/data-entry", icon: IconDatabase, publicVisible: true },
  { title: "Electricity", url: "/data-entry/energy", icon: IconBolt, roles: ["admin", "data-entry"] },
  { title: "Water", url: "/data-entry/water", icon: IconDroplet, roles: ["admin", "data-entry"] },
  { title: "Waste", url: "/data-entry/waste", icon: IconRecycle, roles: ["admin", "data-entry"] },
];

const adminItems: NavItem[] = [
  { title: "User Management", url: "/admin/users", icon: IconUsers, roles: ["admin"] },
  { title: "Targets", url: "/admin/targets", icon: IconTarget, roles: ["admin", "data-entry"] },
  { title: "Locations", url: "/admin/departments", icon: IconBuildingSkyscraper, roles: ["admin"] },
];

const systemItems: NavItem[] = [
  { title: "Reports", url: "/reports", icon: IconFileDescription, publicVisible: true },
  { title: "Notifications", url: "/notifications", icon: IconBell },
  { title: "Settings", url: "/settings", icon: IconSettings },
];

function NavGroup({
  label,
  items,
  userRole,
  isAuthenticated,
}: {
  label: string;
  items: NavItem[];
  userRole: UserRole;
  isAuthenticated: boolean;
}) {
  const location = useLocation();
  const filteredItems = items.filter((item) => {
    if (!isAuthenticated) return item.publicVisible === true;
    return !item.roles || item.roles.includes(userRole);
  });

  if (filteredItems.length === 0) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {filteredItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === item.url}
                tooltip={item.title}
              >
                <Link to={item.url}>
                  <item.icon className="size-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isAuthenticated, logout } = useAuth();
  const userRole = user?.role || "viewer";

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "default";
      case "data-entry":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <IconLeaf className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Academic Green</span>
                  <span className="truncate text-xs text-muted-foreground">
                    KPI Dashboard
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavGroup label="Overview" items={mainNavItems} userRole={userRole} isAuthenticated={isAuthenticated} />
        <NavGroup label="Data Management" items={dataEntryItems} userRole={userRole} isAuthenticated={isAuthenticated} />
        {isAuthenticated && (
          <NavGroup label="Administration" items={adminItems} userRole={userRole} isAuthenticated={isAuthenticated} />
        )}
        <NavGroup label="System" items={systemItems} userRole={userRole} isAuthenticated={isAuthenticated} />
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="size-8 rounded-lg">
                      <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                        {user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{user?.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user?.email}
                      </span>
                    </div>
                    <IconChevronDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="size-8 rounded-lg">
                        <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                          {user?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">{user?.name}</span>
                        <Badge variant={getRoleBadgeVariant(userRole)} className="w-fit text-xs capitalize">
                          {userRole.replace("-", " ")}
                        </Badge>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/settings">
                      <IconUser className="mr-2 size-4" />
                      Profile & Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    <IconLogout className="mr-2 size-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex flex-col gap-2 p-2">
                <Link to="/login">
                  <Button variant="outline" className="w-full gap-2" size="sm">
                    <IconLogin className="size-4" />
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="w-full gap-2" size="sm">
                    <IconUserPlus className="size-4" />
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}