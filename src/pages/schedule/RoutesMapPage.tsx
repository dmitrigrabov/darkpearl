import { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useRoutesForDate, useRoute } from '@/hooks/use-routes';
import { useActiveOperators } from '@/hooks/use-operators';
import { calculateRouteStatus, calculateStopStatus } from '@/lib/schedule-utils';
import { RouteProgressCard } from '@/components/schedule/RouteProgressCard';
import { ScheduleStatusBadge } from '@/components/schedule/ScheduleStatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, MapPin, Route } from 'lucide-react';
import type { RouteDetailWithStops, RouteStopWithLocation } from '@/types/schedule.types';

// Fix Leaflet default marker icon
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-expect-error - Leaflet type issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom marker icons
const createIcon = (color: string) =>
  new L.DivIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });

const completedIcon = createIcon('#22c55e');
const currentIcon = createIcon('#3b82f6');
const pendingIcon = createIcon('#9ca3af');

// Component to fit map bounds
function FitBounds({ stops }: { stops: RouteStopWithLocation[] }) {
  const map = useMap();

  useEffect(() => {
    if (stops.length === 0) return;

    const validStops = stops.filter(
      (s) => s.lawn.property.latitude != null && s.lawn.property.longitude != null
    );

    if (validStops.length === 0) return;

    const bounds = L.latLngBounds(
      validStops.map((s) => [s.lawn.property.latitude!, s.lawn.property.longitude!])
    );
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [stops, map]);

  return null;
}

// Route overlay component
function RouteOverlay({
  route,
  isSelected,
  onSelect,
}: {
  route: RouteDetailWithStops;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const validStops = route.stops
    .filter((s) => s.lawn.property.latitude != null && s.lawn.property.longitude != null)
    .sort((a, b) => a.stop_order - b.stop_order);

  if (validStops.length === 0) return null;

  // Find current stop index
  const currentStopIndex = validStops.findIndex((s) => !s.actual_arrival);

  // Create polyline coordinates
  const polylineCoords = validStops.map((s) => [
    s.lawn.property.latitude!,
    s.lawn.property.longitude!,
  ] as [number, number]);

  // Determine route color based on status
  const routeColor =
    route.status === 'in_progress'
      ? '#f59e0b'
      : route.status === 'completed'
        ? '#22c55e'
        : '#3b82f6';

  return (
    <>
      {/* Route polyline */}
      <Polyline
        positions={polylineCoords}
        pathOptions={{
          color: routeColor,
          weight: isSelected ? 4 : 2,
          opacity: isSelected ? 1 : 0.6,
          dashArray: route.status === 'draft' ? '5, 10' : undefined,
        }}
        eventHandlers={{ click: onSelect }}
      />

      {/* Stop markers */}
      {validStops.map((stop, index) => {
        const stopStatus = calculateStopStatus(stop);
        const isCurrent = index === currentStopIndex;
        const isCompleted = stopStatus.isCompleted;

        const icon = isCompleted ? completedIcon : isCurrent ? currentIcon : pendingIcon;

        return (
          <Marker
            key={stop.id}
            position={[stop.lawn.property.latitude!, stop.lawn.property.longitude!]}
            icon={icon}
            eventHandlers={{ click: onSelect }}
          >
            <Popup>
              <div className="min-w-48">
                <div className="font-semibold">{stop.lawn.name}</div>
                <div className="text-sm text-gray-600">{stop.lawn.property.address_line1}</div>
                <div className="text-sm text-gray-600">{stop.lawn.property.postcode}</div>
                <div className="mt-2 text-xs">
                  <div>Stop #{stop.stop_order}</div>
                  {stop.estimated_arrival && (
                    <div>Est. arrival: {format(new Date(stop.estimated_arrival), 'HH:mm')}</div>
                  )}
                  {stop.actual_arrival && (
                    <div>Actual arrival: {format(new Date(stop.actual_arrival), 'HH:mm')}</div>
                  )}
                </div>
                {stopStatus.status !== 'not_started' && (
                  <div className="mt-2">
                    <ScheduleStatusBadge
                      status={stopStatus.status}
                      minutesAheadBehind={stopStatus.minutesAheadBehind}
                    />
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

export function RoutesMapPage() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [operatorFilter, setOperatorFilter] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Fetch routes for selected date
  const {
    data: routesData,
    isLoading: routesLoading,
    refetch,
    isFetching,
  } = useRoutesForDate(selectedDate);

  // Fetch selected route details
  const { data: selectedRoute } = useRoute(selectedRouteId ?? undefined);

  // Fetch operators for filter
  const { data: operatorsData } = useActiveOperators();

  // Auto-refresh when enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refetch();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, refetch]);

  // Filter routes by operator
  const filteredRoutes = useMemo(() => {
    if (!routesData?.data) return [];
    if (operatorFilter === 'all') return routesData.data;
    return routesData.data.filter((r) => r.operator_id === operatorFilter);
  }, [routesData, operatorFilter]);

  // Calculate route status when selected route is loaded
  const routeStatus = useMemo(() => {
    if (!selectedRoute) return null;
    return calculateRouteStatus(selectedRoute);
  }, [selectedRoute]);

  // Default map center (UK)
  const defaultCenter: [number, number] = [51.5074, -0.1278];

  // Check if any routes have in-progress status
  const hasInProgressRoutes = filteredRoutes.some((r) => r.status === 'in_progress');

  return (
    <div className="space-y-4 h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Routes Map</h1>
        <div className="flex items-center gap-2">
          {hasInProgressRoutes && (
            <Button
              variant={autoRefresh ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
              {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh'}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setSelectedRouteId(null);
            }}
            className="w-40"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Operator</Label>
          <Select value={operatorFilter} onValueChange={setOperatorFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All operators" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All operators</SelectItem>
              {operatorsData?.data?.map((op) => (
                <SelectItem key={op.id} value={op.id}>
                  {op.first_name} {op.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Route</Label>
          <Select
            value={selectedRouteId ?? 'none'}
            onValueChange={(v) => setSelectedRouteId(v === 'none' ? null : v)}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select a route" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">All routes</SelectItem>
              {filteredRoutes.map((route) => (
                <SelectItem key={route.id} value={route.id}>
                  <div className="flex items-center gap-2">
                    <Route className="h-4 w-4" />
                    <span>
                      {route.operator.first_name} {route.operator.last_name}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-xs"
                      style={{
                        borderColor:
                          route.status === 'in_progress'
                            ? '#f59e0b'
                            : route.status === 'completed'
                              ? '#22c55e'
                              : '#3b82f6',
                      }}
                    >
                      {route.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Map and Progress Panel */}
      <div className="relative flex gap-4" style={{ height: 'calc(100vh - 280px)' }}>
        {/* Map */}
        <Card className="flex-1">
          <CardContent className="p-0 h-full">
            {routesLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredRoutes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <MapPin className="h-12 w-12 mb-4" />
                <p>No routes found for {format(new Date(selectedDate), 'MMMM d, yyyy')}</p>
              </div>
            ) : (
              <MapContainer
                center={defaultCenter}
                zoom={10}
                className="h-full w-full rounded-lg"
                scrollWheelZoom
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Show selected route or all routes */}
                {selectedRoute ? (
                  <>
                    <RouteOverlay
                      route={selectedRoute}
                      isSelected
                      onSelect={() => {}}
                    />
                    <FitBounds stops={selectedRoute.stops} />
                  </>
                ) : (
                  filteredRoutes.map((route) => (
                    <RouteOverlay
                      key={route.id}
                      route={route as unknown as RouteDetailWithStops}
                      isSelected={false}
                      onSelect={() => setSelectedRouteId(route.id)}
                    />
                  ))
                )}
              </MapContainer>
            )}
          </CardContent>
        </Card>

        {/* Progress Panel */}
        {selectedRoute && routeStatus && (
          <div className="absolute top-4 right-4 z-[1000]">
            <RouteProgressCard route={selectedRoute} routeStatus={routeStatus} />
          </div>
        )}
      </div>

      {/* Route List */}
      {!selectedRouteId && filteredRoutes.length > 0 && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm">Routes on {format(new Date(selectedDate), 'MMMM d, yyyy')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredRoutes.map((route) => (
                <button
                  key={route.id}
                  onClick={() => setSelectedRouteId(route.id)}
                  className="p-3 border rounded-lg hover:bg-accent text-left transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {route.operator.first_name} {route.operator.last_name}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-xs"
                      style={{
                        borderColor:
                          route.status === 'in_progress'
                            ? '#f59e0b'
                            : route.status === 'completed'
                              ? '#22c55e'
                              : '#3b82f6',
                      }}
                    >
                      {route.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  {route.vehicle && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Vehicle: {route.vehicle.registration}
                    </div>
                  )}
                  {route.estimated_duration_minutes && (
                    <div className="text-xs text-muted-foreground">
                      Est. duration: {Math.floor(route.estimated_duration_minutes / 60)}h{' '}
                      {route.estimated_duration_minutes % 60}m
                    </div>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
