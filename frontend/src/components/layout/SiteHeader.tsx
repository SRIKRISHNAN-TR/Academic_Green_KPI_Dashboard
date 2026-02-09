import { Link } from "react-router-dom";
import { IconBell, IconSearch, IconLogin, IconUserPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

interface SiteHeaderProps {
  title: string;
}

export function SiteHeader({ title }: SiteHeaderProps) {
  const { isAuthenticated } = useAuth();

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4 lg:px-6">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mx-2 h-4" />
      <h1 className="text-base font-semibold">{title}</h1>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden md:block">
          <IconSearch className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-64 pl-8"
          />
        </div>

        {isAuthenticated ? (
          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link to="/notifications">
              <IconBell className="size-5" />
              <Badge className="absolute -right-1 -top-1 size-5 rounded-full p-0 text-xs">
                3
              </Badge>
              <span className="sr-only">Notifications</span>
            </Link>
          </Button>
        ) : (
          <>
            <Link to="/login">
              <Button variant="ghost" size="sm" className="gap-2">
                <IconLogin className="size-4" />
                Login
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="gap-2">
                <IconUserPlus className="size-4" />
                Sign Up
              </Button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}