import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Warehouse,
  Boxes,
  ArrowRightLeft,
  ShoppingCart,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';
import { Badge } from '@/components/ui/badge';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/warehouses', icon: Warehouse, label: 'Warehouses' },
  { to: '/inventory', icon: Boxes, label: 'Inventory' },
  { to: '/stock-movements', icon: ArrowRightLeft, label: 'Movements' },
  { to: '/orders', icon: ShoppingCart, label: 'Orders' },
];

const adminNavItems = [{ to: '/users', icon: Users, label: 'Users' }];

const roleLabels = {
  admin: 'Admin',
  manager: 'Manager',
  viewer: 'Viewer',
};

export function Sidebar() {
  const { isAdmin, role, user } = useAuth();

  return (
    <aside className="w-64 bg-primary text-primary-foreground flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold">Stock Manager</h1>
      </div>
      <nav className="mt-2 flex-1">
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

        {isAdmin && (
          <>
            <div className="px-6 py-2 mt-4">
              <div className="text-xs uppercase text-primary-foreground/50 font-semibold">
                Admin
              </div>
            </div>
            {adminNavItems.map((item) => (
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
          </>
        )}
      </nav>

      <div className="p-4 border-t border-primary-foreground/20 space-y-2">
        {user?.email && (
          <div className="text-xs text-primary-foreground/80 truncate" title={user.email}>
            {user.email}
          </div>
        )}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-primary-foreground border-primary-foreground/50">
            {roleLabels[role]}
          </Badge>
        </div>
        <div className="text-xs text-primary-foreground/60 space-y-0.5">
          <div>Create/Update: {role !== 'viewer' ? 'Yes' : 'No'}</div>
          <div>Delete: {role === 'admin' ? 'Yes' : 'No'}</div>
        </div>
      </div>
    </aside>
  );
}
