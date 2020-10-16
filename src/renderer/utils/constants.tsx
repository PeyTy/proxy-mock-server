export const nonTunnelledHeaders: string[] = [
  'Vary',
  'Access-Control-Allow-Origin',
  'Cross-Origin-Resource-Policy',
  'Access-Control-Allow-Credentials',
  'Timing-Allow-Origin',
  'Cache-Control',
  'Transfer-Encoding',
  'Set-Cookie',
  'Location',
  'Host',
  'Forwarded',
  'Last-Modified',
  'Content-Length',
  'X-Forwarded-Host',
  'X-Forwarded-For',
  'X-Forwarded-Proto'
]

export const nonTunnelledHeadersLowercase: string[] = nonTunnelledHeaders.map(header => header.toLowerCase())

export const tunnelSaveExtensions: string[] = ['.png', '.jpg', '.css', '.gif', '.svg', '.ico', '.ttf', '.woff', '.woff', '.woff2', '.eot']

export const defaultHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Cross-Origin-Resource-Policy': 'cross-origin',
  'Access-Control-Allow-Credentials': 'true',
  'Timing-Allow-Origin': '*',
  Server: 'tunnel',
  'Cache-Control': 'no-store'
}
