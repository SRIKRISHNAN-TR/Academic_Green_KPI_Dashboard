import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { IconSearch, IconPlus, IconEdit, IconTrash } from "@tabler/icons-react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const users = [
  { id: "1", name: "Dr. Sarah Green", email: "admin@university.edu", role: "admin", department: "Sustainability Office", status: "active" },
  { id: "2", name: "John Smith", email: "dataentry@university.edu", role: "data-entry", department: "Facilities", status: "active" },
  { id: "3", name: "Prof. Emily Brown", email: "viewer@university.edu", role: "viewer", department: "Environmental Sciences", status: "active" },
  { id: "4", name: "Michael Davis", email: "mdavis@university.edu", role: "viewer", department: "Management", status: "inactive" },
  { id: "5", name: "Lisa Johnson", email: "ljohnson@university.edu", role: "data-entry", department: "Operations", status: "pending" },
];

export default function UserManagement() {
  const { user } = useAuth();

  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <DashboardLayout title="User Management">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
            <p className="text-muted-foreground">
              Manage user accounts and permissions.
            </p>
          </div>
          <Button>
            <IconPlus className="mr-2 size-4" />
            Add User
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Users</CardTitle>
                <CardDescription>{users.length} total users</CardDescription>
              </div>
              <div className="relative w-64">
                <IconSearch className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input placeholder="Search users..." className="pl-8" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {u.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{u.name}</p>
                          <p className="text-sm text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {u.role.replace("-", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>{u.department}</TableCell>
                    <TableCell>
                      <Badge
                        variant={u.status === "active" ? "default" : "secondary"}
                        className={
                          u.status === "active"
                            ? "bg-primary"
                            : u.status === "pending"
                            ? "bg-amber-100 text-amber-700"
                            : ""
                        }
                      >
                        {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <IconEdit className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <IconTrash className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}