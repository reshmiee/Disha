import { useEffect, useRef } from 'react'

function injectLeaflet(cb) {
  if (window.L) {
    cb()
    return () => {}
  }

  const CSS_ID = 'leaflet-css'
  const JS_ID = 'leaflet-js'

  if (!document.getElementById(CSS_ID)) {
    const link = document.createElement('link')
    link.id = CSS_ID
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)
  }

  if (!document.getElementById(JS_ID)) {
    const script = document.createElement('script')
    script.id = JS_ID
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => cb()
    document.head.appendChild(script)
    return () => {}
  }

  const poll = setInterval(() => {
    if (window.L) {
      clearInterval(poll)
      cb()
    }
  }, 100)

  return () => clearInterval(poll)
}

function buildIcon(color = '#93000a') {
  const L = window.L

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
      <ellipse cx="18" cy="42" rx="8" ry="3" fill="rgba(0,0,0,0.25)"/>
      <path d="M18 2 C9.16 2 2 9.16 2 18 C2 30 18 42 18 42 C18 42 34 30 34 18 C34 9.16 26.84 2 18 2Z"
        fill="${color}" stroke="white" stroke-width="2.5"/>
      <circle cx="18" cy="18" r="7" fill="white"/>
      <circle cx="18" cy="18" r="4" fill="${color}"/>
    </svg>
  `

  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [36, 44],
    iconAnchor: [18, 44],
  })
}

function clearLeafletContainer(container) {
  if (!container) return
  if (container._leaflet_id != null) {
    delete container._leaflet_id
  }
}

export default function LiveMap({
  coords = null,
  zoom = 15,
  height = '100%',
}) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    const cancelInject = injectLeaflet(() => {
      if (cancelled || !containerRef.current) return

      const container = containerRef.current
      clearLeafletContainer(container)

      const L = window.L
      if (!L) return

      const map = L.map(container, {
        center: coords
          ? [coords.lat, coords.lng]
          : [20.5937, 78.9629],
        zoom: coords ? zoom : 4,
      })

      L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '© OpenStreetMap',
        }
      ).addTo(map)

      mapRef.current = map

      if (coords) {
        markerRef.current = L.marker(
          [coords.lat, coords.lng],
          { icon: buildIcon() }
        ).addTo(map)
      }

      requestAnimationFrame(() => map.invalidateSize())
    })

    return () => {
      cancelled = true
      cancelInject()

      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        markerRef.current = null
      }

      clearLeafletContainer(containerRef.current)
    }
  }, [])

  useEffect(() => {
    if (!coords || !mapRef.current || !window.L) return

    const map = mapRef.current
    const L = window.L

    map.setView([coords.lat, coords.lng], zoom)

    if (markerRef.current) {
      markerRef.current.setLatLng([coords.lat, coords.lng])
    } else {
      markerRef.current = L.marker(
        [coords.lat, coords.lng],
        { icon: buildIcon() }
      ).addTo(map)
    }
  }, [coords, zoom])

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height,
        minHeight: 200,
      }}
    />
  )
}
