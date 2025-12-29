import { GoogleGenerativeAI } from '@google/generative-ai'

type Coordinate = {
  latitude: number
  longitude: number
}

type DetectedLawn = {
  name: string
  boundary: Coordinate[]
  area_sqm: number
  confidence: number
}

type LawnDetectionParams = {
  latitude: number
  longitude: number
  zoom: number
  width: number
  height: number
}

/**
 * Fetch satellite image from Google Static Maps API
 */
export async function fetchStaticMap(params: LawnDetectionParams): Promise<ArrayBuffer> {
  const { latitude, longitude, zoom, width, height } = params

  const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY')
  if (!apiKey) {
    throw new Error('GOOGLE_MAPS_API_KEY not configured')
  }

  const url = new URL('https://maps.googleapis.com/maps/api/staticmap')
  url.searchParams.set('center', `${latitude},${longitude}`)
  url.searchParams.set('zoom', zoom.toString())
  url.searchParams.set('size', `${width}x${height}`)
  url.searchParams.set('maptype', 'satellite')
  url.searchParams.set('key', apiKey)

  const response = await fetch(url.toString())

  if (!response.ok) {
    throw new Error(`Failed to fetch static map: ${response.status} ${response.statusText}`)
  }

  return response.arrayBuffer()
}

/**
 * Convert pixel coordinates to lat/lng using Web Mercator projection
 */
function pixelToLatLng(
  pixelX: number,
  pixelY: number,
  centerLat: number,
  centerLng: number,
  zoom: number,
  imageWidth: number,
  imageHeight: number
): Coordinate {
  const scale = Math.pow(2, zoom)
  const worldCoordinatePerPixel = 256 / scale

  // Calculate world coordinates of center
  const centerWorldX = ((centerLng + 180) / 360) * 256
  const latRad = (centerLat * Math.PI) / 180
  const centerWorldY = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * 256

  // Calculate pixel offset from center
  const pixelOffsetX = pixelX - imageWidth / 2
  const pixelOffsetY = pixelY - imageHeight / 2

  // Calculate world coordinates of pixel
  const worldX = centerWorldX + (pixelOffsetX * worldCoordinatePerPixel) / 256
  const worldY = centerWorldY + (pixelOffsetY * worldCoordinatePerPixel) / 256

  // Convert world coordinates back to lat/lng
  const longitude = worldX * 360 - 180
  const n = Math.PI - 2 * Math.PI * worldY
  const latitude = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)))

  return { latitude, longitude }
}

/**
 * Calculate polygon area in square meters using Shoelace formula with WGS84 approximation
 */
function calculatePolygonArea(coords: Coordinate[]): number {
  if (coords.length < 3) return 0

  // Earth's radius in meters
  const R = 6371000

  let area = 0
  const n = coords.length

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n

    // Convert to radians
    const lat1 = (coords[i].latitude * Math.PI) / 180
    const lat2 = (coords[j].latitude * Math.PI) / 180
    const lng1 = (coords[i].longitude * Math.PI) / 180
    const lng2 = (coords[j].longitude * Math.PI) / 180

    area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2))
  }

  area = Math.abs((area * R * R) / 2)
  return Math.round(area * 100) / 100 // Round to 2 decimal places
}

/**
 * Analyze satellite image with Google Gemini to detect lawn boundaries
 */
export async function analyzeLawnsWithGemini(
  imageData: ArrayBuffer,
  params: LawnDetectionParams
): Promise<DetectedLawn[]> {
  const apiKey = Deno.env.get('GOOGLE_GEMINI_API_KEY')
  if (!apiKey) {
    throw new Error('GOOGLE_GEMINI_API_KEY not configured')
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

  // Convert ArrayBuffer to base64
  const uint8Array = new Uint8Array(imageData)
  const base64 = btoa(String.fromCharCode(...uint8Array))

  const prompt = `Analyze this satellite image of a residential property. Identify all lawn/grass areas.

For each lawn area found:
1. Provide a descriptive name (e.g., "Front Garden", "Back Garden", "Side Strip")
2. Outline the boundary as a polygon with pixel coordinates [x, y] where (0,0) is top-left
3. Provide a confidence score (0-1) for how certain you are this is a lawn

Return the response as JSON only, no markdown:
{
  "lawns": [
    {
      "name": "string",
      "boundary_pixels": [[x1,y1], [x2,y2], ...],
      "confidence": number
    }
  ]
}

Image dimensions: ${params.width}x${params.height} pixels

Rules:
- Only include grass/lawn areas, not driveways, patios, flowerbeds, or buildings
- Each polygon should have at least 4 points
- Coordinates should be within the image bounds (0-${params.width}, 0-${params.height})
- If no lawns are visible, return {"lawns": []}
- Close each polygon by repeating the first point at the end`

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: 'image/png',
        data: base64,
      },
    },
    { text: prompt },
  ])

  const response = result.response
  const text = response.text()

  // Parse JSON from response (handle potential markdown code blocks)
  let jsonText = text
  if (text.includes('```json')) {
    jsonText = text.split('```json')[1].split('```')[0].trim()
  } else if (text.includes('```')) {
    jsonText = text.split('```')[1].split('```')[0].trim()
  }

  type GeminiLawn = {
    name: string
    boundary_pixels: [number, number][]
    confidence: number
  }

  type GeminiResponse = {
    lawns: GeminiLawn[]
  }

  const parsed: GeminiResponse = JSON.parse(jsonText)

  // Convert pixel coordinates to lat/lng
  const detectedLawns: DetectedLawn[] = parsed.lawns.map((lawn) => {
    const boundary = lawn.boundary_pixels.map(([x, y]) =>
      pixelToLatLng(x, y, params.latitude, params.longitude, params.zoom, params.width, params.height)
    )

    const area_sqm = calculatePolygonArea(boundary)

    return {
      name: lawn.name,
      boundary,
      area_sqm,
      confidence: lawn.confidence,
    }
  })

  return detectedLawns
}

/**
 * Main function to detect lawns from coordinates
 */
export async function detectLawns(params: LawnDetectionParams): Promise<DetectedLawn[]> {
  // Fetch satellite image
  const imageData = await fetchStaticMap(params)

  // Analyze with Gemini
  const lawns = await analyzeLawnsWithGemini(imageData, params)

  return lawns
}
