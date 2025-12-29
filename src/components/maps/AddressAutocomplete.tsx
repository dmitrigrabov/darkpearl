import { useRef, useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'

type AddressAutocompleteProps = {
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void
  placeholder?: string
  defaultValue?: string
  className?: string
}

export function AddressAutocomplete({
  onPlaceSelect,
  placeholder = 'Search for an address...',
  defaultValue = '',
  className,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [inputValue, setInputValue] = useState(defaultValue)

  useEffect(() => {
    if (!inputRef.current) return

    // Check if Google Maps Places library is loaded
    if (!google?.maps?.places?.Autocomplete) {
      console.warn('Google Maps Places library not loaded')
      return
    }

    // Initialize autocomplete
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
  }, [onPlaceSelect])

  return (
    <Input
      ref={inputRef}
      value={inputValue}
      onChange={e => setInputValue(e.target.value)}
      placeholder={placeholder}
      className={className}
    />
  )
}
