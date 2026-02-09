import { ReactNode } from "react";
import { IconTrendingUp, IconTrendingDown, IconMinus } from "@tabler/icons-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type KPIStatus = "success" | "warning" | "danger";
export type TrendDirection = "up" | "down" | "neutral";

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  description?: string;
  target?: string | number;
  actual?: string | number;
  status?: KPIStatus;
  trend?: {
    direction: TrendDirection;
    value: string;
    label?: string;
  };
  icon?: ReactNode;
  className?: string;
  variant?: "energy" | "water" | "waste" | "default";
}

const statusColors: Record<KPIStatus, string> = {
  success: "bg-green-500/10 text-green-600 border-green-200",
  warning: "bg-amber-500/10 text-amber-600 border-amber-200",
  danger: "bg-red-500/10 text-red-600 border-red-200",
};

const variantColors: Record<string, string> = {
  energy: "from-amber-500/10 to-orange-500/5",
  water: "from-blue-500/10 to-cyan-500/5",
  waste: "from-green-500/10 to-emerald-500/5",
  default: "from-primary/5 to-primary/10",
};

const TrendIcon = ({ direction }: { direction: TrendDirection }) => {
  switch (direction) {
    case "up":
      return <IconTrendingUp className="size-4" />;
    case "down":
      return <IconTrendingDown className="size-4" />;
    default:
      return <IconMinus className="size-4" />;
  }
};

export function KPICard({
  title,
  value,
  unit,
  description,
  target,
  actual,
  status = "success",
  trend,
  icon,
  className,
  variant = "default",
}: KPICardProps) {
  return (
    <Card className={cn(
      "bg-gradient-to-br transition-all hover:shadow-md",
      variantColors[variant],
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardDescription className="font-medium">{title}</CardDescription>
        {icon && (
          <div className="text-muted-foreground">{icon}</div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline gap-1">
          <CardTitle className="text-3xl font-bold tabular-nums">
            {value}
          </CardTitle>
          {unit && (
            <span className="text-sm text-muted-foreground">{unit}</span>
          )}
        </div>

        {(target !== undefined || actual !== undefined) && (
          <div className="flex items-center gap-4 text-sm">
            {actual !== undefined && (
              <div>
                <span className="text-muted-foreground">Actual: </span>
                <span className="font-medium">{actual}</span>
              </div>
            )}
            {target !== undefined && (
              <div>
                <span className="text-muted-foreground">Target: </span>
                <span className="font-medium">{target}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          {trend && (
            <Badge
              variant="outline"
              className={cn(
                "gap-1",
                trend.direction === "up" && status === "success" && "text-green-600",
                trend.direction === "down" && status === "danger" && "text-red-600",
                trend.direction === "down" && status === "success" && "text-green-600",
              )}
            >
              <TrendIcon direction={trend.direction} />
              {trend.value}
            </Badge>
          )}
          {status && (
            <Badge variant="outline" className={cn(statusColors[status])}>
              {status === "success" && "On Track"}
              {status === "warning" && "Needs Attention"}
              {status === "danger" && "Critical"}
            </Badge>
          )}
        </div>

        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}