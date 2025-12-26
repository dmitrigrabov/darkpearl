import { useProducts } from '@/hooks/use-products';
import { useWarehouses } from '@/hooks/use-warehouses';
import { useInventory } from '@/hooks/use-inventory';
import { useOrders } from '@/hooks/use-orders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Warehouse, AlertTriangle, ShoppingCart } from 'lucide-react';

export function DashboardPage() {
  const { data: products } = useProducts({ limit: 1 });
  const { data: warehouses } = useWarehouses({ limit: 1 });
  const { data: lowStock } = useInventory({ low_stock: true, limit: 5 });
  const { data: pendingOrders } = useOrders({ status: 'pending', limit: 5 });

  const stats = [
    { title: 'Total Products', value: products?.count ?? 0, icon: Package },
    { title: 'Warehouses', value: warehouses?.count ?? 0, icon: Warehouse },
    { title: 'Low Stock Items', value: lowStock?.count ?? 0, icon: AlertTriangle },
    { title: 'Pending Orders', value: pendingOrders?.count ?? 0, icon: ShoppingCart },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            {lowStock?.data?.length ? (
              <ul className="space-y-2">
                {lowStock.data.map((item) => (
                  <li key={item.id} className="flex justify-between text-sm">
                    <span>{item.product?.name}</span>
                    <span className="text-destructive font-medium">
                      {item.quantity_available} left
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">No low stock items</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Pending Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingOrders?.data?.length ? (
              <ul className="space-y-2">
                {pendingOrders.data.map((order) => (
                  <li key={order.id} className="flex justify-between text-sm">
                    <span>{order.order_number}</span>
                    <span className="font-medium">
                      ${Number(order.total_amount).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">No pending orders</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
