import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

interface User {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  created_at: string;
  membership: {
    tier: string;
    is_active: boolean;
  } | null;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          phone,
          created_at
        `)
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      const usersWithDetails = await Promise.all(
        (profilesData || []).map(async (profile) => {
          const { data: authData } = await supabase.auth.admin.getUserById(profile.id);
          
          const { data: membershipData } = await supabase
            .from("user_memberships")
            .select(`
              is_active,
              memberships (tier)
            `)
            .eq("user_id", profile.id)
            .eq("is_active", true)
            .single();

          return {
            ...profile,
            email: authData?.user?.email || "N/A",
            membership: membershipData ? {
              tier: (membershipData.memberships as any)?.tier || "none",
              is_active: membershipData.is_active,
            } : null,
          };
        })
      );

      setUsers(usersWithDetails);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({ title: "Error fetching users", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading users...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">Manage Users</h1>

      <Card>
        <CardHeader>
          <CardTitle>All Members</CardTitle>
          <CardDescription>View and manage registered family members</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Membership</TableHead>
                <TableHead>Joined Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone || "N/A"}</TableCell>
                  <TableCell>
                    {user.membership ? (
                      <Badge variant="secondary" className="capitalize">
                        {user.membership.tier}
                      </Badge>
                    ) : (
                      <Badge variant="outline">No Membership</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {users.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No users found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
