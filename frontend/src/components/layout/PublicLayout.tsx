import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { IconLeaf, IconLogin, IconUserPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PublicLayoutProps {
  children: ReactNode;
  title?: string;
}

export function PublicLayout({ children, title }: PublicLayoutProps) {
  const location = useLocation();

  const navLinks = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Trends", href: "/trends" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <IconLeaf className="size-4" />
              </div>
              <span className="font-semibold">Academic Green KPI</span>
            </Link>
            <nav className="flex items-center gap-1">
              {navLinks.map((link) => (
                <Link key={link.href} to={link.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      location.pathname === link.href && "bg-accent text-accent-foreground"
                    )}
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
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
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-6">{children}</div>
      </main>
    </div>
  );
}