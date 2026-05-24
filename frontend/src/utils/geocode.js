/**
 * Reverse geocode — backend proxy first, then browser fallback (no API key).
 */

import { marg } from '../api'

function uniqueParts(parts) {
  const seen = new Set()
  return parts.filter(p => {
    const key = String(p).trim().toLowerCase()
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function formatAddressFromNominatim(data) {
  if (!data) return null
  if (data.error && !data.display_name && !data.address) return null

  if (data.display_name) {
    let bits = data.display_name
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
    if (bits[bits.length - 1]?.toLowerCase() === 'india') {
      bits = bits.slice(0, -1)
    }
    if (bits.length >= 1) {
      return bits.slice(0, 5).join(', ')
    }
  }

  const a = data.address || {}

  const road = a.road || a.pedestrian || a.footway || a.street
  const area =
    a.suburb ||
    a.neighbourhood ||
    a.quarter ||
    a.hamlet ||
    a.locality
  const locality =
    a.city ||
    a.town ||
    a.village ||
    a.municipality
  const district = a.state_district || a.district || a.county
  const region = a.state || a.region

  const parts = uniqueParts([
    [a.house_number, road].filter(Boolean).join(' ') || road,
    area,
    locality,
    district && district !== locality ? district : null,
    region,
    a.postcode,
  ].filter(Boolean))

  if (parts.length >= 1) return parts.join(', ')
  return null
}

/** BigDataCloud client API — works from browser without User-Agent issues. */
export function formatAddressFromBigDataCloud(data) {
  if (!data || data.status === 'FAILED') return null

  const parts = uniqueParts([
    data.locality,
    data.city,
    data.principalSubdivision,
    data.postcode,
  ].filter(Boolean))

  if (parts.length >= 1) return parts.join(', ')
  if (data.countryName) return data.countryName
  return null
}

function bigDataCloudToNominatimShape(data) {
  const line = formatAddressFromBigDataCloud(data)
  if (!line) return null
  return {
    display_name: line,
    address: {
      road: data.locality,
      city: data.city,
      state: data.principalSubdivision,
      postcode: data.postcode,
    },
  }
}

export function formatLocationLabels(data, lat, lng) {
  const fallback = `${lat.toFixed(4)}, ${lng.toFixed(4)}`
  const full = formatAddressFromNominatim(data) || fallback

  const a = data?.address || {}
  const shortParts = uniqueParts([
    a.road || a.suburb || a.neighbourhood || a.village,
    a.city || a.town || a.state_district,
    a.state,
  ])

  let short = shortParts.slice(0, 2).join(', ')
  if (!short && full !== fallback) {
    short = full.split(',').slice(0, 2).join(',').trim()
  }
  if (!short) short = full

  return { short, full }
}

async function reverseGeocodeBigDataCloud(lat, lng) {
  const url =
    `https://api.bigdatacloud.net/data/reverse-geocode-client` +
    `?latitude=${encodeURIComponent(lat)}` +
    `&longitude=${encodeURIComponent(lng)}` +
    `&localityLanguage=en`
  const res = await fetch(url)
  if (!res.ok) return null
  const data = await res.json()
  return bigDataCloudToNominatimShape(data)
}

export async function reverseGeocode(lat, lng) {
  try {
    const data = await marg.reverseGeocode(lat, lng)
    if (data?.display_name || data?.address) return data
  } catch (err) {
    console.warn('Backend reverse geocode failed:', err?.status || err)
  }

  try {
    return await reverseGeocodeBigDataCloud(lat, lng)
  } catch (err) {
    console.warn('Fallback reverse geocode failed:', err)
    return null
  }
}
