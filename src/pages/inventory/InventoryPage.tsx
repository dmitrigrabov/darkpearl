import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useInventory } from '@/hooks/use-inventory';
import { DataTable } from '@/components/data-table/DataTable';
import { Badge } from '@/components/ui/badge';
import type { InventoryWithRelations } from '@/types/api.types';

export function InventoryPage() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const { data, isLoading } = useInventory({
    limit: pagination.pageSize,
    offset: pagination.pageIndex * pagination.pageSize,
    low_stock: lowStockOnly || undefined,
  });

  const columns: ColumnDef<InventoryWithRelations>[] = [
    {
      accessorKey: 'product.sku',
      header: 'SKU',
      cell: ({ row }) => row.original.product?.sku,
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
    {
      accessorKey: 'quantity_available',
      header: 'Available',
      cell: ({ row }) => {
        const qty = row.getValue('quantity_available') as number;
        const reorderPoint = row.original.reorder_point;
        const isLow = qty <= reorderPoint;
        return (
          <span className={isLow ? 'text-destructive font-medium' : ''}>{qty}</span>
        );
      },
    },
    { accessorKey: 'quantity_reserved', header: 'Reserved' },
    { accessorKey: 'reorder_point', header: 'Reorder Point' },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const qty = row.original.quantity_available;
        const reorderPoint = row.original.reorder_point;
        if (qty <= reorderPoint) {
          return <Badge variant="destructive">Low Stock</Badge>;
        }
        return <Badge variant="default">In Stock</Badge>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => setLowStockOnly(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm">Show low stock only</span>
        </label>
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
    </div>
  );
}
