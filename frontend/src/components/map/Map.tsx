'use client'

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo } from 'react'

// Fix for default marker icon in Leaflet + Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

L.Marker.prototype.options.icon = DefaultIcon

// Blue dot for the user's own position, visually distinct from seller pins.
const UserIcon = L.divIcon({
  className: '',
  html: '<span style="display:block;width:16px;height:16px;border-radius:9999px;background:#2563eb;border:3px solid #fff;box-shadow:0 0 0 2px #2563eb66, 0 1px 4px rgba(0,0,0,.4)"></span>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})

export interface MapMarker {
  position: [number, number]
  label: string
  id?: string
  /** Optional link rendered inside the popup (e.g. a product page). */
  href?: string
}

interface MapProps {
  center: [number, number]
  zoom?: number
  markers?: MapMarker[]
  /** The user's own position, rendered as a blue dot. */
  userPosition?: [number, number] | null
  /** Fit the viewport to all markers (and the user) instead of using center/zoom. */
  fitToMarkers?: boolean
}

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])
  return null
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap()
  // Re-fit only when the actual coordinates change, not on every render.
  const key = JSON.stringify(points)
  useEffect(() => {
    if (points.length === 0) return
    if (points.length === 1) {
      map.setView(points[0], 13)
      return
    }
    map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 14 })
    // biome-ignore lint/correctness/useExhaustiveDependencies: key is the stable identity of points
  }, [key, map])
  return null
}

export default function Map({ center, zoom = 13, markers = [], userPosition = null, fitToMarkers = false }: MapProps) {
  const boundPoints = useMemo(() => {
    const points = markers.map((m) => m.position)
    if (userPosition) points.push(userPosition)
    return points
  }, [markers, userPosition])

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {fitToMarkers && boundPoints.length > 0
        ? <FitBounds points={boundPoints} />
        : <ChangeView center={center} zoom={zoom} />}
      {userPosition && (
        <Marker position={userPosition} icon={UserIcon}>
          <Popup>Tu ubicación</Popup>
        </Marker>
      )}
      {markers.map((marker, index) => (
        <Marker key={marker.id || index} position={marker.position}>
          <Popup>
            <span className="block text-sm">{marker.label}</span>
            {marker.href && (
              <a href={marker.href} className="mt-1 block text-sm font-medium text-indigo-600 hover:text-indigo-500">
                Ver más →
              </a>
            )}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
