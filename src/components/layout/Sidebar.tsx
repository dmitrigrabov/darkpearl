import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Warehouse,
  Boxes,
  ArrowRightLeft,
  ShoppingCart,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/warehouses', icon: Warehouse, label: 'Warehouses' },
  { to: '/inventory', icon: Boxes, label: 'Inventory' },
  { to: '/stock-movements', icon: ArrowRightLeft, label: 'Movements' },
  { to: '/orders', icon: ShoppingCart, label: 'Orders' },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-primary text-primary-foreground">
      <div className="p-6">
        <h1 className="text-xl font-bold">Stock Manager</h1>
      </div>
      <nav className="mt-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-6 py-3 hover:bg-primary-foreground/10 transition-colors',
                isActive && 'bg-primary-foreground/20 border-l-4 border-primary-foreground'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
