import { useRef, useEffect, useState } from 'react'
import { useJsApiLoader } from '@react-google-maps/api'
import { Input } from '@/components/ui/input'

type AddressAutocompleteProps = {
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void
  placeholder?: string
  defaultValue?: string
  className?: string
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
const libraries: ('places')[] = ['places']

export function AddressAutocomplete({
  onPlaceSelect,
  placeholder = 'Search for an address...',
  defaultValue = '',
  className,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [inputValue, setInputValue] = useState(defaultValue)

  // Use the same loader as GoogleMap component - it will reuse the loaded script
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  })

  useEffect(() => {
    if (!inputRef.current || !isLoaded) return

    // Initialize autocomplete only after API is loaded
    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
      fields: ['formatted_address', 'geometry', 'name', 'address_components'],
    })

    // Listen for place selection
    const listener = autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace()
      if (place && place.geometry) {
        setInputValue(place.formatted_address || '')
        onPlaceSelect(place)
      }
    })

    return () => {
      if (listener) {
        google.maps.event.removeListener(listener)
      }
    }
  }, [isLoaded, onPlaceSelect])

  return (
    <Input
      ref={inputRef}
      value={inputValue}
      onChange={e => setInputValue(e.target.value)}
      placeholder={placeholder}
      className={className}
      disabled={!isLoaded}
    />
  )
}
