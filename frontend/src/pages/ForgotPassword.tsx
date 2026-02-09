import { useState } from "react";
import { Link } from "react-router-dom";
import { IconLeaf, IconMail, IconArrowLeft, IconCheck } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsLoading(false);
    setIsSubmitted(true);
    toast({
      title: "Email sent!",
      description: "Check your inbox for password reset instructions.",
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary">
            <IconLeaf className="size-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Academic Green</h1>
          <p className="text-muted-foreground">Sustainability KPI Dashboard</p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Reset password</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a reset link
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSubmitted ? (
              <div className="space-y-4 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
                  <IconCheck className="size-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Check your email</h3>
                  <p className="text-sm text-muted-foreground">
                    We've sent a password reset link to <strong>{email}</strong>
                  </p>
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/login">
                    <IconArrowLeft className="mr-2 size-4" />
                    Back to login
                  </Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <IconMail className="absolute left-3 top-3 size-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@university.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send reset link"}
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