import { useState, useCallback } from 'react'
import { GoogleMap } from '@/components/maps/GoogleMap'
import { LawnPolygonEditor, LawnListPanel } from '@/components/maps/LawnPolygonEditor'
import { AddressAutocomplete } from '@/components/maps/AddressAutocomplete'
import type { DetectedLawn, Coordinate } from '@/types/api.types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Save, Trash2, MapPin, Plus } from 'lucide-react'

// Default center (London, UK)
const DEFAULT_CENTER = { lat: 51.5074, lng: -0.1278 }
const DEFAULT_ZOOM = 18

// Create a default lawn polygon centered on the current map view
function createDefaultLawn(
  center: google.maps.LatLngLiteral,
  index: number
): DetectedLawn {
  // Create a small square polygon around the center point
  const offset = 0.0002 // ~20 meters
  const boundary: Coordinate[] = [
    { latitude: center.lat + offset, longitude: center.lng - offset },
    { latitude: center.lat + offset, longitude: center.lng + offset },
    { latitude: center.lat - offset, longitude: center.lng + offset },
    { latitude: center.lat - offset, longitude: center.lng - offset },
    { latitude: center.lat + offset, longitude: center.lng - offset }, // Close polygon
  ]

  return {
    name: `Lawn ${index + 1}`,
    boundary,
    area_sqm: 400, // Approximate for default size
    confidence: 1.0, // Manual = full confidence
  }
}

export function LawnDetectionPage() {
  // Map state
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral>(DEFAULT_CENTER)
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM)
  const [map, setMap] = useState<google.maps.Map | null>(null)

  // Address state
  const [selectedAddress, setSelectedAddress] = useState<string>('')

  // Lawn state
  const [lawns, setLawns] = useState<DetectedLawn[]>([])
  const [selectedLawnIndex, setSelectedLawnIndex] = useState<number | null>(null)

  // Handle address selection from autocomplete
  const handlePlaceSelect = useCallback(
    (place: google.maps.places.PlaceResult) => {
      if (place.geometry?.location) {
        const lat = place.geometry.location.lat()
        const lng = place.geometry.location.lng()
        setMapCenter({ lat, lng })
        setMapZoom(19) // Zoom in for better lawn visibility
        setSelectedAddress(place.formatted_address || '')

        // Pan map to location
        if (map) {
          map.panTo({ lat, lng })
          map.setZoom(19)
        }

        // Clear previous lawns when changing location
        setLawns([])
        setSelectedLawnIndex(null)
      }
    },
    [map]
  )

  // Handle adding a new lawn polygon
  const handleAddLawn = useCallback(() => {
    const center = map?.getCenter()
    if (!center) return

    const newLawn = createDefaultLawn(
      { lat: center.lat(), lng: center.lng() },
      lawns.length
    )

    setLawns(prev => [...prev, newLawn])
    setSelectedLawnIndex(lawns.length) // Select the new lawn
  }, [map, lawns.length])

  // Handle saving lawns (placeholder - would integrate with lawns API)
  const handleSaveLawns = useCallback(() => {
    // TODO: Integrate with lawns API to persist
    console.log('Saving lawns:', lawns)
    alert(`${lawns.length} lawn(s) would be saved. API integration pending.`)
  }, [lawns])

  // Handle clearing all lawns
  const handleClearLawns = useCallback(() => {
    setLawns([])
    setSelectedLawnIndex(null)
  }, [])

  // Calculate total area
  const totalArea = lawns.reduce((sum, lawn) => sum + lawn.area_sqm, 0)

  return (
    <div className="space-y-4 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Lawn Mapping</h1>
          <p className="text-muted-foreground text-sm">
            Draw and edit lawn boundaries using satellite view
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4" style={{ height: 'calc(100vh - 200px)' }}>
        {/* Left Panel - Controls */}
        <div className="lg:col-span-1 space-y-4 overflow-y-auto">
          {/* Address Search */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Property Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="address">Search Address</Label>
                <AddressAutocomplete
                  onPlaceSelect={handlePlaceSelect}
                  placeholder="Enter property address..."
                />
              </div>
              {selectedAddress && (
                <p className="text-xs text-muted-foreground truncate" title={selectedAddress}>
                  Selected: {selectedAddress}
                </p>
              )}
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>
                  <Label className="text-xs">Latitude</Label>
                  <Input
                    value={mapCenter.lat.toFixed(6)}
                    readOnly
                    className="h-7 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Longitude</Label>
                  <Input
                    value={mapCenter.lng.toFixed(6)}
                    readOnly
                    className="h-7 text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Manual Drawing Controls */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Draw Lawns
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Position the map over the lawn area, then click "Add Lawn" to create a polygon. Drag vertices to adjust the boundary.
              </p>
              <Button
                onClick={handleAddLawn}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Lawn
              </Button>
            </CardContent>
          </Card>

          {/* Lawns List */}
          <LawnListPanel
            lawns={lawns}
            onLawnsChange={setLawns}
            selectedLawnIndex={selectedLawnIndex}
            onSelectLawn={setSelectedLawnIndex}
          />

          {/* Action Buttons */}
          {lawns.length > 0 && (
            <Card>
              <CardContent className="pt-4 space-y-2">
                <div className="text-sm font-medium flex justify-between">
                  <span>Total Lawn Area:</span>
                  <span>{totalArea.toFixed(1)} m²</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearLawns}
                    className="flex-1"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveLawns}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Panel - Map */}
        <Card className="lg:col-span-3 overflow-hidden">
          <CardContent className="p-0 h-full">
            <GoogleMap
              center={mapCenter}
              zoom={mapZoom}
              onCenterChange={setMapCenter}
              onZoomChange={setMapZoom}
              onMapLoad={setMap}
              className="h-full w-full"
            >
              {/* Lawn polygons overlay */}
              <LawnPolygonEditor
                lawns={lawns}
                onLawnsChange={setLawns}
                selectedLawnIndex={selectedLawnIndex}
                onSelectLawn={setSelectedLawnIndex}
              />
            </GoogleMap>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
