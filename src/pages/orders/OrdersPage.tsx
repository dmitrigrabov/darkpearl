import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { useOrders, useCreateOrder, useCancelOrder } from '@/hooks/use-orders';
import { useProducts } from '@/hooks/use-products';
import { useWarehouses } from '@/hooks/use-warehouses';
import { useAuth } from '@/providers/AuthProvider';
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
import { Plus, Eye, X, Trash } from 'lucide-react';
import { format } from 'date-fns';
import type { OrderWithRelations, OrderStatus, CreateOrderItemRequest } from '@/types/api.types';

const STATUS_COLORS: Record<OrderStatus, 'default' | 'secondary' | 'destructive'> = {
  pending: 'secondary',
  reserved: 'default',
  payment_processing: 'secondary',
  payment_failed: 'destructive',
  paid: 'default',
  fulfilling: 'secondary',
  fulfilled: 'default',
  cancelled: 'destructive',
};

export function OrdersPage() {
  const navigate = useNavigate();
  const { canUpdate } = useAuth();
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [orderItems, setOrderItems] = useState<CreateOrderItemRequest[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const { toast } = useToast();

  const { data, isLoading } = useOrders({
    limit: pagination.pageSize,
    offset: pagination.pageIndex * pagination.pageSize,
  });

  const { data: products } = useProducts({ limit: 100 });
  const { data: warehouses } = useWarehouses({ limit: 100 });
  const createMutation = useCreateOrder();
  const cancelMutation = useCancelOrder();

  const resetForm = () => {
    setOrderItems([]);
    setSelectedWarehouseId('');
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) resetForm();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (!selectedWarehouseId) {
      toast({ title: 'Error', description: 'Please select a warehouse', variant: 'destructive' });
      return;
    }

    if (orderItems.length === 0) {
      toast({ title: 'Error', description: 'Add at least one item', variant: 'destructive' });
      return;
    }

    try {
      await createMutation.mutateAsync({
        warehouse_id: selectedWarehouseId,
        notes: (formData.get('notes') as string) || undefined,
        items: orderItems,
      });
      toast({ title: 'Order created successfully' });
      handleDialogChange(false);
    } catch (error) {
      toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      await cancelMutation.mutateAsync(id);
      toast({ title: 'Order cancelled successfully' });
    } catch (error) {
      toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    }
  };

  const addItem = () => {
    setOrderItems([...orderItems, { product_id: '', quantity: 1, unit_price: 0 }]);
  };

  const updateItem = (index: number, field: keyof CreateOrderItemRequest, value: string | number) => {
    const newItems = [...orderItems];
    if (field === 'product_id') {
      const product = products?.data?.find((p) => p.id === value);
      newItems[index] = {
        ...newItems[index],
        product_id: value as string,
        unit_price: product?.unit_price ?? 0,
      };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setOrderItems(newItems);
  };

  const removeItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const columns: ColumnDef<OrderWithRelations>[] = [
    { accessorKey: 'order_number', header: 'Order #' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as OrderStatus;
        return <Badge variant={STATUS_COLORS[status]}>{status.replace('_', ' ')}</Badge>;
      },
    },
    {
      accessorKey: 'warehouse.name',
      header: 'Warehouse',
      cell: ({ row }) => row.original.warehouse?.name,
    },
    {
      accessorKey: 'total_amount',
      header: 'Total',
      cell: ({ row }) => `$${Number(row.getValue('total_amount')).toFixed(2)}`,
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }) => format(new Date(row.getValue('created_at')), 'MMM d, yyyy HH:mm'),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const statusAllowsCancel = ['pending', 'reserved', 'payment_failed'].includes(row.original.status);
        return (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate(`/orders/${row.original.id}`)}>
              <Eye className="h-4 w-4" />
            </Button>
            {canUpdate && statusAllowsCancel && (
              <Button variant="ghost" size="sm" onClick={() => handleCancel(row.original.id)}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Orders</h1>
        <CanCreate>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Order
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
            <DialogTitle>New Order</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="flex justify-between items-center">
                <Label>Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-1" /> Add Item
                </Button>
              </div>
              {orderItems.map((item, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Select
                      value={item.product_id}
                      onValueChange={(v) => updateItem(index, 'product_id', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products?.data?.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                    className="w-20"
                    placeholder="Qty"
                  />
                  <Input
                    type="number"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value))}
                    className="w-24"
                    placeholder="Price"
                  />
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input id="notes" name="notes" />
            </div>

            <Button type="submit" className="w-full" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Order'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
