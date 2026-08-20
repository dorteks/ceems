"use client";

import { Plus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { systemUsers } from "../data/ceems";
import { PageHeader } from "../_components/app-shell";
import { StatusBadge } from "../_components/status-badge";
import { InviteUserDialog } from "../_components/invite-user-dialog";

// export const Route = createFileRoute("/administration")({
//   head: () => ({
//     meta: [
//       { title: "Administration — Users, Roles & Permissions | CEEMS" },
//       {
//         name: "description",
//         content: "Manage system users, assign roles and configure the permission matrix for enumeration operations.",
//       },
//       { property: "og:title", content: "Administration — Users, Roles & Permissions | CEEMS" },
//       { property: "og:description", content: "User accounts, role assignment and granular permission control." },
//     ],
//   }),
//   component: AdminPage,
// });

const roles = [
  "Super Administrator",
  "Data Manager",
  "Supervisor",
  "Enumerator",
  "Viewer",
];
const permissions = [
  { name: "View customers", grants: [true, true, true, true, true] },
  { name: "Edit customers", grants: [true, true, true, false, false] },
  { name: "Delete customers", grants: [true, false, false, false, false] },
  { name: "Import data", grants: [true, true, false, false, false] },
  { name: "Export data", grants: [true, true, true, false, false] },
  { name: "Approve enumeration", grants: [true, true, true, false, false] },
  { name: "Manage users", grants: [true, false, false, false, false] },
  { name: "View audit log", grants: [true, true, false, false, false] },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);
}

export default function AdminPage() {
  return (
    <>
      <PageHeader
        title="Administration"
        description="Users, roles and permission matrix"
        actions={<InviteUserDialog />}
      />

      <Tabs defaultValue="users" className={"flex flex-col"}>
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="permissions">Roles & permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="pt-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Email
                      </TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Hub
                      </TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {systemUsers.map((u) => (
                      <TableRow key={u.email}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="size-8">
                              <AvatarFallback className="bg-secondary text-xs">
                                {initials(u.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{u.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {u.email}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className="bg-muted rounded-sm font-semibold px-2 py-1"
                            variant="secondary"
                          >
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {u.hub}
                        </TableCell>
                        <TableCell>
                          <StatusBadge
                            className="rounded-sm"
                            value={u.status}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" /> Permission
                matrix
              </CardTitle>
              <CardDescription>
                Role-based access control across modules
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-44">Permission</TableHead>
                      {roles.map((r) => (
                        <TableHead key={r} className="text-center text-xs">
                          {r}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {permissions.map((p) => (
                      <TableRow key={p.name}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        {p.grants.map((g, i) => (
                          <TableCell key={i} className="text-center">
                            <Checkbox
                              defaultChecked={g}
                              aria-label={`${p.name} for ${roles[i]}`}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
