import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useWarehouses, useCreateWarehouse, useUpdateWarehouse, useDeleteWarehouse } from '@/hooks/use-warehouses';
import { DataTable } from '@/components/data-table/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toaster';
import { Plus, Pencil, Trash } from 'lucide-react';
import type { Warehouse, CreateWarehouseRequest } from '@/types/api.types';

export function WarehousesPage() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const { toast } = useToast();

  const { data, isLoading } = useWarehouses({
    limit: pagination.pageSize,
    offset: pagination.pageIndex * pagination.pageSize,
  });

  const createMutation = useCreateWarehouse();
  const updateMutation = useUpdateWarehouse();
  const deleteMutation = useDeleteWarehouse();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const warehouseData: CreateWarehouseRequest = {
      code: formData.get('code') as string,
      name: formData.get('name') as string,
      address: (formData.get('address') as string) || undefined,
      is_active: formData.get('is_active') === 'on',
    };

    try {
      if (editingWarehouse) {
        await updateMutation.mutateAsync({ id: editingWarehouse.id, data: warehouseData });
        toast({ title: 'Warehouse updated successfully' });
      } else {
        await createMutation.mutateAsync(warehouseData);
        toast({ title: 'Warehouse created successfully' });
      }
      setIsDialogOpen(false);
      setEditingWarehouse(null);
    } catch (error) {
      toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this warehouse?')) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: 'Warehouse deleted successfully' });
    } catch (error) {
      toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    }
  };

  const columns: ColumnDef<Warehouse>[] = [
    { accessorKey: 'code', header: 'Code' },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'address', header: 'Address' },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.getValue('is_active') ? 'default' : 'secondary'}>
          {row.getValue('is_active') ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditingWarehouse(row.original);
              setIsDialogOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(row.original.id)}>
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Warehouses</h1>
        <Button
          onClick={() => {
            setEditingWarehouse(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Warehouse
        </Button>
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
            <DialogTitle>{editingWarehouse ? 'Edit Warehouse' : 'Add Warehouse'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input id="code" name="code" defaultValue={editingWarehouse?.code} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={editingWarehouse?.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" defaultValue={editingWarehouse?.address ?? ''} />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                name="is_active"
                defaultChecked={editingWarehouse?.is_active ?? true}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
