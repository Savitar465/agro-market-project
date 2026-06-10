'use client'

import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'
import type { Coordinates } from '@/data/products'

const PickerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowSize: [41, 41]
})

interface LocationPickerProps {
  /** Currently selected coordinates, if any. */
  value?: Coordinates | null
  /** Called when the user clicks the map or drags the marker. */
  onChange: (coords: Coordinates) => void
  /** Initial view when there is no value yet. */
  fallbackCenter?: [number, number]
  fallbackZoom?: number
}

function ClickToPlace({ onChange }: { onChange: (coords: Coordinates) => void }) {
  useMapEvents({
    click(event) {
      onChange({ lat: event.latlng.lat, lng: event.latlng.lng })
    },
  })
  return null
}

/** Keeps the map centered on the value when it changes from outside (e.g. "use my location"). */
function FollowValue({ value }: { value?: Coordinates | null }) {
  const map = useMap()
  useEffect(() => {
    if (value) {
      map.setView([value.lat, value.lng], Math.max(map.getZoom(), 13))
    }
  }, [value, map])
  return null
}

export default function LocationPicker({
  value,
  onChange,
  fallbackCenter = [-34.6037, -58.3816],
  fallbackZoom = 4,
}: LocationPickerProps) {
  const center: [number, number] = value ? [value.lat, value.lng] : fallbackCenter

  return (
    <MapContainer
      center={center}
      zoom={value ? 13 : fallbackZoom}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickToPlace onChange={onChange} />
      <FollowValue value={value} />
      {value && (
        <Marker
          position={[value.lat, value.lng]}
          icon={PickerIcon}
          draggable
          eventHandlers={{
            dragend(event) {
              const position = (event.target as L.Marker).getLatLng()
              onChange({ lat: position.lat, lng: position.lng })
            },
          }}
        />
      )}
    </MapContainer>
  )
}
