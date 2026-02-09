import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IconPlus, IconEdit, IconBuildingSkyscraper } from "@tabler/icons-react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { LOCATION_CATEGORIES } from "@/lib/locations";

export default function DepartmentManagement() {
  const { user } = useAuth();

  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <DashboardLayout title="Location Management">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Location Management</h2>
          <p className="text-muted-foreground">
            View hostels, academic blocks, and their sustainability tracking configuration.
          </p>
        </div>

        {Object.entries(LOCATION_CATEGORIES).map(([category, locations]) => (
          <Card key={category}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{category}</CardTitle>
                <CardDescription>{locations.length} locations</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Location Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locations.map((loc) => (
                    <TableRow key={loc}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <IconBuildingSkyscraper className="size-4 text-muted-foreground" />
                          {loc}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-primary">Active</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}