import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { AuthCallback } from '@/pages/auth/AuthCallback';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { ProductsPage } from '@/pages/products/ProductsPage';
import { WarehousesPage } from '@/pages/warehouses/WarehousesPage';
import { InventoryPage } from '@/pages/inventory/InventoryPage';
import { StockMovementsPage } from '@/pages/stock-movements/StockMovementsPage';
import { OrdersPage } from '@/pages/orders/OrdersPage';
import { OrderDetailPage } from '@/pages/orders/OrderDetailPage';
import { UserManagementPage } from '@/pages/users/UserManagementPage';
import { ScheduleCalendarPage } from '@/pages/schedule/ScheduleCalendarPage';
import { RoutesMapPage } from '@/pages/schedule/RoutesMapPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/auth/callback',
    element: <AuthCallback />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: '/',
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: '/dashboard',
            element: <DashboardPage />,
          },
          {
            path: '/products',
            element: <ProductsPage />,
          },
          {
            path: '/warehouses',
            element: <WarehousesPage />,
          },
          {
            path: '/inventory',
            element: <InventoryPage />,
          },
          {
            path: '/stock-movements',
            element: <StockMovementsPage />,
          },
          {
            path: '/orders',
            element: <OrdersPage />,
          },
          {
            path: '/orders/:id',
            element: <OrderDetailPage />,
          },
          // Schedule routes
          {
            path: '/schedule/calendar',
            element: <ScheduleCalendarPage />,
          },
          {
            path: '/schedule/map',
            element: <RoutesMapPage />,
          },
          // Admin-only routes
          {
            element: <AdminRoute />,
            children: [
              {
                path: '/users',
                element: <UserManagementPage />,
              },
            ],
          },
        ],
      },
    ],
  },
]);
