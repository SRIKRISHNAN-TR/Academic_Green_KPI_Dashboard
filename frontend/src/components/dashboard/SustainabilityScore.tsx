import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface SustainabilityScoreProps {
  score: number;
  breakdown?: {
    energy: number;
    water: number;
    waste: number;
  };
}

export function SustainabilityScore({ score, breakdown }: SustainabilityScoreProps) {
  const getScoreColor = (value: number) => {
    if (value >= 80) return "text-green-600";
    if (value >= 60) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Overall Sustainability Score</CardTitle>
        <CardDescription>Combined performance across all KPIs</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-center">
          <div className="relative flex size-36 items-center justify-center">
            <svg className="absolute size-full -rotate-90" viewBox="0 0 100 100">
              <circle
                className="stroke-muted"
                strokeWidth="8"
                fill="none"
                r="42"
                cx="50"
                cy="50"
              />
              <circle
                className={cn(
                  "transition-all duration-1000",
                  score >= 80 && "stroke-green-500",
                  score >= 60 && score < 80 && "stroke-amber-500",
                  score < 60 && "stroke-red-500"
                )}
                strokeWidth="8"
                strokeLinecap="round"
                fill="none"
                r="42"
                cx="50"
                cy="50"
                strokeDasharray={`${score * 2.64} 264`}
              />
            </svg>
            <span className={cn("text-4xl font-bold", getScoreColor(score))}>
              {score}%
            </span>
          </div>
        </div>

        {breakdown && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Electricity Efficiency</span>
                <span className={cn("font-medium", getScoreColor(breakdown.energy))}>
                  {breakdown.energy}%
                </span>
              </div>
              <Progress value={breakdown.energy} className="[&>div]:bg-amber-500" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Water Conservation</span>
                <span className={cn("font-medium", getScoreColor(breakdown.water))}>
                  {breakdown.water}%
                </span>
              </div>
              <Progress value={breakdown.water} className="[&>div]:bg-blue-500" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Waste Management</span>
                <span className={cn("font-medium", getScoreColor(breakdown.waste))}>
                  {breakdown.waste}%
                </span>
              </div>
              <Progress value={breakdown.waste} className="[&>div]:bg-green-500" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}