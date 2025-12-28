import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useUserProfiles, useUpdateUserRole } from '@/hooks/use-user-profiles';
import { useAuth } from '@/providers/AuthProvider';
import { DataTable } from '@/components/data-table/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toaster';
import { Shield, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import type { UserProfileWithEmail, UserRole } from '@/lib/api';

const roleLabels: Record<UserRole, string> = {
  admin: 'Admin',
  manager: 'Manager',
  viewer: 'Viewer',
};

const roleBadgeVariants: Record<UserRole, 'default' | 'secondary' | 'outline'> = {
  admin: 'default',
  manager: 'secondary',
  viewer: 'outline',
};

export function UserManagementPage() {
  const { user } = useAuth();
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfileWithEmail | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('viewer');
  const { toast } = useToast();

  const { data, isLoading } = useUserProfiles({
    limit: pagination.pageSize,
    offset: pagination.pageIndex * pagination.pageSize,
  });

  const updateRoleMutation = useUpdateUserRole();

  const handleUpdateRole = async () => {
    if (!editingUser) return;

    try {
      await updateRoleMutation.mutateAsync({ id: editingUser.id, role: selectedRole });
      toast({ title: 'User role updated successfully' });
      setIsDialogOpen(false);
      setEditingUser(null);
    } catch (error) {
      toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    }
  };

  const openEditDialog = (userProfile: UserProfileWithEmail) => {
    setEditingUser(userProfile);
    setSelectedRole(userProfile.role);
    setIsDialogOpen(true);
  };

  const columns: ColumnDef<UserProfileWithEmail>[] = [
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.email}
          {row.original.id === user?.id && (
            <Badge variant="outline" className="text-xs">
              You
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => {
        const role = row.getValue('role') as UserRole;
        return <Badge variant={roleBadgeVariants[role]}>{roleLabels[role]}</Badge>;
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Joined',
      cell: ({ row }) => format(new Date(row.getValue('created_at')), 'MMM d, yyyy'),
    },
    {
      accessorKey: 'updated_at',
      header: 'Last Updated',
      cell: ({ row }) => format(new Date(row.getValue('updated_at')), 'MMM d, yyyy HH:mm'),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const isCurrentUser = row.original.id === user?.id;
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openEditDialog(row.original)}
            disabled={isCurrentUser}
            title={isCurrentUser ? 'Cannot modify your own role' : 'Edit role'}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6" />
          <h1 className="text-2xl font-bold">User Management</h1>
        </div>
      </div>

      <div className="bg-muted/50 rounded-lg p-4">
        <h2 className="font-semibold mb-2">Role Permissions</h2>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <Badge variant="default" className="mb-1">
              Admin
            </Badge>
            <p className="text-muted-foreground">Full access. Can manage users and delete any resource.</p>
          </div>
          <div>
            <Badge variant="secondary" className="mb-1">
              Manager
            </Badge>
            <p className="text-muted-foreground">Can create and update resources they own.</p>
          </div>
          <div>
            <Badge variant="outline" className="mb-1">
              Viewer
            </Badge>
            <p className="text-muted-foreground">Read-only access to their own resources.</p>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        totalCount={data?.count}
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize}
        onPaginationChange={(pageIndex, pageSize) => setPagination({ pageIndex, pageSize })}
        isLoading={isLoading}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent onClose={() => setIsDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <p className="text-sm text-muted-foreground">{editingUser.email}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as UserRole)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin - Full access</SelectItem>
                    <SelectItem value="manager">Manager - Create and update</SelectItem>
                    <SelectItem value="viewer">Viewer - Read only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleUpdateRole}
                className="w-full"
                disabled={updateRoleMutation.isPending || selectedRole === editingUser.role}
              >
                {updateRoleMutation.isPending ? 'Updating...' : 'Update Role'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
