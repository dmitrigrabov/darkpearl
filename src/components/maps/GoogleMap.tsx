import { useCallback, useState, useRef } from 'react'
import { GoogleMap as GoogleMapComponent, useJsApiLoader } from '@react-google-maps/api'

type GoogleMapProps = {
  center: google.maps.LatLngLiteral
  zoom: number
  onCenterChange?: (center: google.maps.LatLngLiteral) => void
  onZoomChange?: (zoom: number) => void
  onMapLoad?: (map: google.maps.Map) => void
  className?: string
  children?: React.ReactNode
}

const containerStyle = {
  width: '100%',
  height: '100%',
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''

// Libraries to load - places for autocomplete
const libraries: ('places')[] = ['places']

export function GoogleMap({
  center,
  zoom,
  onCenterChange,
  onZoomChange,
  onMapLoad,
  className,
  children,
}: GoogleMapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null)
  // Track the last reported values to prevent feedback loops
  const lastCenterRef = useRef<{ lat: number; lng: number } | null>(null)
  const lastZoomRef = useRef<number | null>(null)

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  })

  const handleLoad = useCallback(
    (map: google.maps.Map) => {
      setMap(map)
      onMapLoad?.(map)
    },
    [onMapLoad]
  )

  const handleUnmount = useCallback(() => {
    setMap(null)
  }, [])

  // Use onIdle instead of onCenterChanged/onZoomChanged to avoid feedback loops
  // onIdle fires after the map stops moving (user finished dragging/zooming)
  const handleIdle = useCallback(() => {
    if (!map) return

    const newCenter = map.getCenter()
    const newZoom = map.getZoom()

    if (newCenter && onCenterChange) {
      const lat = newCenter.lat()
      const lng = newCenter.lng()

      // Only notify if center actually changed (compare with tolerance for floating point)
      const lastCenter = lastCenterRef.current
      if (
        !lastCenter ||
        Math.abs(lastCenter.lat - lat) > 0.000001 ||
        Math.abs(lastCenter.lng - lng) > 0.000001
      ) {
        lastCenterRef.current = { lat, lng }
        onCenterChange({ lat, lng })
      }
    }

    if (newZoom !== undefined && onZoomChange) {
      if (lastZoomRef.current !== newZoom) {
        lastZoomRef.current = newZoom
        onZoomChange(newZoom)
      }
    }
  }, [map, onCenterChange, onZoomChange])

  if (loadError) {
    return (
      <div className={`flex items-center justify-center bg-muted ${className}`}>
        <div className="text-center p-4">
          <p className="text-destructive font-medium">Failed to load Google Maps</p>
          <p className="text-sm text-muted-foreground mt-1">
            Please check your API key configuration
          </p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center bg-muted ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-muted-foreground mt-2">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <GoogleMapComponent
      mapContainerStyle={containerStyle}
      mapContainerClassName={className}
      center={center}
      zoom={zoom}
      onLoad={handleLoad}
      onUnmount={handleUnmount}
      onIdle={handleIdle}
      options={{
        mapTypeId: 'satellite',
        mapTypeControl: true,
        mapTypeControlOptions: {
          position: google.maps.ControlPosition.TOP_RIGHT,
          mapTypeIds: ['satellite', 'hybrid', 'roadmap'],
        },
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        gestureHandling: 'greedy',
      }}
    >
      {children}
    </GoogleMapComponent>
  )
}

// Export the useJsApiLoader hook for other components
export { useJsApiLoader }
