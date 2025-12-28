import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useStockMovements, useCreateStockMovement } from '@/hooks/use-stock-movements';
import { useProducts } from '@/hooks/use-products';
import { useWarehouses } from '@/hooks/use-warehouses';
import { CanCreate } from '@/components/auth';
import { DataTable } from '@/components/data-table/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { Plus } from 'lucide-react';
import { format } from 'date-fns';
import type { StockMovementWithRelations, MovementType } from '@/types/api.types';

const MOVEMENT_TYPES: MovementType[] = [
  'receive',
  'transfer_out',
  'transfer_in',
  'adjust',
  'reserve',
  'release',
  'fulfill',
];

const MOVEMENT_TYPE_COLORS: Record<MovementType, 'default' | 'secondary' | 'destructive'> = {
  receive: 'default',
  transfer_in: 'default',
  transfer_out: 'secondary',
  adjust: 'secondary',
  reserve: 'secondary',
  release: 'secondary',
  fulfill: 'destructive',
};

export function StockMovementsPage() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [selectedMovementType, setSelectedMovementType] = useState<MovementType | ''>('');
  const { toast } = useToast();

  const { data, isLoading } = useStockMovements({
    limit: pagination.pageSize,
    offset: pagination.pageIndex * pagination.pageSize,
  });

  const { data: products } = useProducts({ limit: 100 });
  const { data: warehouses } = useWarehouses({ limit: 100 });
  const createMutation = useCreateStockMovement();

  const resetForm = () => {
    setSelectedProductId('');
    setSelectedWarehouseId('');
    setSelectedMovementType('');
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) resetForm();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (!selectedProductId || !selectedWarehouseId || !selectedMovementType) {
      toast({ title: 'Error', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    try {
      await createMutation.mutateAsync({
        product_id: selectedProductId,
        warehouse_id: selectedWarehouseId,
        movement_type: selectedMovementType,
        quantity: parseInt(formData.get('quantity') as string),
        notes: (formData.get('notes') as string) || undefined,
      });
      toast({ title: 'Stock movement created successfully' });
      handleDialogChange(false);
    } catch (error) {
      toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    }
  };

  const columns: ColumnDef<StockMovementWithRelations>[] = [
    {
      accessorKey: 'created_at',
      header: 'Date',
      cell: ({ row }) => format(new Date(row.getValue('created_at')), 'MMM d, yyyy HH:mm'),
    },
    {
      accessorKey: 'movement_type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.getValue('movement_type') as MovementType;
        return <Badge variant={MOVEMENT_TYPE_COLORS[type]}>{type.replace('_', ' ')}</Badge>;
      },
    },
    {
      accessorKey: 'product.name',
      header: 'Product',
      cell: ({ row }) => row.original.product?.name,
    },
    {
      accessorKey: 'warehouse.name',
      header: 'Warehouse',
      cell: ({ row }) => row.original.warehouse?.name,
    },
    { accessorKey: 'quantity', header: 'Quantity' },
    { accessorKey: 'notes', header: 'Notes' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Stock Movements</h1>
        <CanCreate>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Movement
          </Button>
        </CanCreate>
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

      <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent onClose={() => handleDialogChange(false)}>
          <DialogHeader>
            <DialogTitle>New Stock Movement</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Product</Label>
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products?.data?.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.sku} - {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Warehouse</Label>
              <Select value={selectedWarehouseId} onValueChange={setSelectedWarehouseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses?.data?.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.code} - {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Movement Type</Label>
              <Select value={selectedMovementType} onValueChange={(v) => setSelectedMovementType(v as MovementType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  {MOVEMENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" name="quantity" type="number" min="1" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input id="notes" name="notes" />
            </div>
            <Button type="submit" className="w-full" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Movement'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
