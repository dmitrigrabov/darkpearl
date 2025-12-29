import { useCallback, useRef, useEffect } from 'react'
import { Polygon } from '@react-google-maps/api'
import type { DetectedLawn, Coordinate } from '@/types/api.types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Trash2, GripVertical, Edit2, Check, X } from 'lucide-react'
import { useState } from 'react'

type LawnPolygonEditorProps = {
  lawns: DetectedLawn[]
  onLawnsChange: (lawns: DetectedLawn[]) => void
  selectedLawnIndex: number | null
  onSelectLawn: (index: number | null) => void
}

// Color palette for lawns
const LAWN_COLORS = [
  { fill: 'rgba(34, 197, 94, 0.4)', stroke: '#16a34a' },   // Green
  { fill: 'rgba(59, 130, 246, 0.4)', stroke: '#2563eb' },  // Blue
  { fill: 'rgba(168, 85, 247, 0.4)', stroke: '#9333ea' },  // Purple
  { fill: 'rgba(234, 179, 8, 0.4)', stroke: '#ca8a04' },   // Yellow
  { fill: 'rgba(236, 72, 153, 0.4)', stroke: '#db2777' },  // Pink
]

function getLawnColor(index: number) {
  return LAWN_COLORS[index % LAWN_COLORS.length]
}

// Convert our Coordinate type to Google Maps LatLng format
function toGooglePath(boundary: Coordinate[]): google.maps.LatLngLiteral[] {
  return boundary.map(coord => ({
    lat: coord.latitude,
    lng: coord.longitude,
  }))
}

// Convert Google Maps path back to our Coordinate type
function fromGooglePath(path: google.maps.MVCArray<google.maps.LatLng>): Coordinate[] {
  const coords: Coordinate[] = []
  path.forEach(point => {
    coords.push({
      latitude: point.lat(),
      longitude: point.lng(),
    })
  })
  return coords
}

// Calculate polygon area in square meters
function calculateArea(boundary: Coordinate[]): number {
  if (boundary.length < 3) return 0

  const R = 6371000 // Earth radius in meters
  let area = 0
  const n = boundary.length

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    const lat1 = (boundary[i].latitude * Math.PI) / 180
    const lat2 = (boundary[j].latitude * Math.PI) / 180
    const lng1 = (boundary[i].longitude * Math.PI) / 180
    const lng2 = (boundary[j].longitude * Math.PI) / 180
    area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2))
  }

  area = Math.abs((area * R * R) / 2)
  return Math.round(area * 100) / 100
}

type LawnPolygonProps = {
  lawn: DetectedLawn
  index: number
  isSelected: boolean
  onSelect: () => void
  onUpdate: (updatedLawn: DetectedLawn) => void
}

function LawnPolygon({ lawn, index, isSelected, onSelect, onUpdate }: LawnPolygonProps) {
  const polygonRef = useRef<google.maps.Polygon | null>(null)
  const listenersRef = useRef<google.maps.MapsEventListener[]>([])
  const colors = getLawnColor(index)

  const handleLoad = useCallback((polygon: google.maps.Polygon) => {
    polygonRef.current = polygon
  }, [])

  const handleUnmount = useCallback(() => {
    listenersRef.current.forEach(listener => listener.remove())
    listenersRef.current = []
    polygonRef.current = null
  }, [])

  // Set up path change listeners when selected
  useEffect(() => {
    if (!polygonRef.current) return

    // Clear old listeners
    listenersRef.current.forEach(listener => listener.remove())
    listenersRef.current = []

    if (isSelected) {
      const path = polygonRef.current.getPath()

      const handlePathChange = () => {
        if (!polygonRef.current) return
        const newPath = polygonRef.current.getPath()
        const newBoundary = fromGooglePath(newPath)
        const newArea = calculateArea(newBoundary)

        onUpdate({
          ...lawn,
          boundary: newBoundary,
          area_sqm: newArea,
        })
      }

      // Listen for vertex changes
      listenersRef.current.push(
        google.maps.event.addListener(path, 'set_at', handlePathChange),
        google.maps.event.addListener(path, 'insert_at', handlePathChange),
        google.maps.event.addListener(path, 'remove_at', handlePathChange)
      )
    }

    return () => {
      listenersRef.current.forEach(listener => listener.remove())
      listenersRef.current = []
    }
  }, [isSelected, lawn, onUpdate])

  return (
    <Polygon
      path={toGooglePath(lawn.boundary)}
      options={{
        fillColor: colors.fill,
        fillOpacity: isSelected ? 0.6 : 0.4,
        strokeColor: colors.stroke,
        strokeOpacity: 1,
        strokeWeight: isSelected ? 3 : 2,
        clickable: true,
        editable: isSelected,
        draggable: isSelected,
        zIndex: isSelected ? 2 : 1,
      }}
      onLoad={handleLoad}
      onUnmount={handleUnmount}
      onClick={onSelect}
    />
  )
}

type LawnListItemProps = {
  lawn: DetectedLawn
  index: number
  isSelected: boolean
  onSelect: () => void
  onUpdate: (lawn: DetectedLawn) => void
  onDelete: () => void
}

function LawnListItem({
  lawn,
  index,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
}: LawnListItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(lawn.name)
  const colors = getLawnColor(index)

  const handleSave = () => {
    onUpdate({ ...lawn, name: editedName })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedName(lawn.name)
    setIsEditing(false)
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors',
        isSelected ? 'bg-accent border-primary' : 'hover:bg-muted/50'
      )}
      onClick={onSelect}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <div
        className="w-4 h-4 rounded-sm flex-shrink-0"
        style={{ backgroundColor: colors.stroke }}
      />
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
            <Input
              value={editedName}
              onChange={e => setEditedName(e.target.value)}
              className="h-6 text-sm"
              autoFocus
            />
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleSave}>
              <Check className="h-3 w-3" />
            </Button>
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleCancel}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <>
            <p className="text-sm font-medium truncate">{lawn.name}</p>
            <p className="text-xs text-muted-foreground">
              {lawn.area_sqm.toFixed(1)} m² | {(lawn.confidence * 100).toFixed(0)}% confidence
            </p>
          </>
        )}
      </div>
      {!isEditing && (
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  )
}

export function LawnPolygonEditor({
  lawns,
  onLawnsChange,
  selectedLawnIndex,
  onSelectLawn,
}: LawnPolygonEditorProps) {
  const handleUpdateLawn = useCallback(
    (index: number, updatedLawn: DetectedLawn) => {
      const newLawns = [...lawns]
      newLawns[index] = updatedLawn
      onLawnsChange(newLawns)
    },
    [lawns, onLawnsChange]
  )

  return (
    <>
      {/* Render polygons on the map */}
      {lawns.map((lawn, index) => (
        <LawnPolygon
          key={`lawn-${index}`}
          lawn={lawn}
          index={index}
          isSelected={selectedLawnIndex === index}
          onSelect={() => onSelectLawn(index)}
          onUpdate={updatedLawn => handleUpdateLawn(index, updatedLawn)}
        />
      ))}
    </>
  )
}

// Sidebar panel for lawn list
export function LawnListPanel({
  lawns,
  onLawnsChange,
  selectedLawnIndex,
  onSelectLawn,
}: LawnPolygonEditorProps) {
  const handleUpdateLawn = useCallback(
    (index: number, updatedLawn: DetectedLawn) => {
      const newLawns = [...lawns]
      newLawns[index] = updatedLawn
      onLawnsChange(newLawns)
    },
    [lawns, onLawnsChange]
  )

  const handleDeleteLawn = useCallback(
    (index: number) => {
      const newLawns = lawns.filter((_, i) => i !== index)
      onLawnsChange(newLawns)
      if (selectedLawnIndex === index) {
        onSelectLawn(null)
      } else if (selectedLawnIndex !== null && selectedLawnIndex > index) {
        onSelectLawn(selectedLawnIndex - 1)
      }
    },
    [lawns, onLawnsChange, selectedLawnIndex, onSelectLawn]
  )

  if (lawns.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Detected Lawns</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No lawns detected yet. Position the map and click "Detect Lawns" to analyze.
          </p>
        </CardContent>
      </Card>
    )
  }

  const totalArea = lawns.reduce((sum, lawn) => sum + lawn.area_sqm, 0)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>Detected Lawns ({lawns.length})</span>
          <span className="font-normal text-muted-foreground">
            Total: {totalArea.toFixed(1)} m²
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {lawns.map((lawn, index) => (
          <LawnListItem
            key={`lawn-item-${index}`}
            lawn={lawn}
            index={index}
            isSelected={selectedLawnIndex === index}
            onSelect={() => onSelectLawn(selectedLawnIndex === index ? null : index)}
            onUpdate={updatedLawn => handleUpdateLawn(index, updatedLawn)}
            onDelete={() => handleDeleteLawn(index)}
          />
        ))}
        <p className="text-xs text-muted-foreground pt-2">
          Click a lawn to select it. When selected, drag vertices to adjust the boundary.
        </p>
      </CardContent>
    </Card>
  )
}
