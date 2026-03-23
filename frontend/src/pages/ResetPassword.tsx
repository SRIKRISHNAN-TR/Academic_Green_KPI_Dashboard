import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { IconLeaf, IconLock, IconArrowLeft, IconCheck, IconEye, IconEyeOff } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/services/apiClient";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const isValidLink = Boolean(token && email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast({ title: "Too short", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Mismatch", description: "Passwords do not match.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post("/auth/reset-password", { token, email, password });
      setIsDone(true);
      toast({ title: "Password updated!", description: "You can now log in with your new password." });
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: any) {
      toast({
        title: "Reset failed",
        description: err.message || "The link may have expired. Please request a new one.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary">
            <IconLeaf className="size-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Academic Green</h1>
          <p className="text-muted-foreground">Sustainability KPI Dashboard</p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Set new password</CardTitle>
            <CardDescription>
              {isValidLink
                ? `Setting a new password for ${email}`
                : "Invalid or missing reset link"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Invalid link */}
            {!isValidLink && (
              <div className="space-y-4 text-center">
                <p className="text-sm text-destructive">
                  This reset link is invalid or incomplete. Please request a new one.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/forgot-password">
                    Request a new link
                  </Link>
                </Button>
              </div>
            )}

            {/* Success state */}
            {isValidLink && isDone && (
              <div className="space-y-4 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
                  <IconCheck className="size-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Password changed!</h3>
                  <p className="text-sm text-muted-foreground">
                    Redirecting you to the login page…
                  </p>
                </div>
                <Button asChild className="w-full">
                  <Link to="/login">Go to Login</Link>
                </Button>
              </div>
            )}

            {/* Form */}
            {isValidLink && !isDone && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <IconLock className="absolute left-3 top-3 size-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 pr-9"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword((p) => !p)}
                    >
                      {showPassword ? <IconEyeOff className="size-4" /> : <IconEye className="size-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <IconLock className="absolute left-3 top-3 size-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Repeat your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Updating password…" : "Set new password"}
                </Button>

                <Button asChild variant="ghost" className="w-full">
                  <Link to="/login">
                    <IconArrowLeft className="mr-2 size-4" />
                    Back to login
                  </Link>
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


