import { useCallback, useState } from 'react'
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

  const handleCenterChanged = useCallback(() => {
    if (map) {
      const center = map.getCenter()
      if (center) {
        onCenterChange?.({
          lat: center.lat(),
          lng: center.lng(),
        })
      }
    }
  }, [map, onCenterChange])

  const handleZoomChanged = useCallback(() => {
    if (map) {
      const newZoom = map.getZoom()
      if (newZoom !== undefined) {
        onZoomChange?.(newZoom)
      }
    }
  }, [map, onZoomChange])

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
      onCenterChanged={handleCenterChanged}
      onZoomChanged={handleZoomChanged}
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
