import polyline from 'polyline'
import proj4 from 'proj4'
import cloneDeep from 'lodash/cloneDeep'

const PRECISION = 7

const SVY21 = '+proj=tmerc +lat_0=1.366666666666667 +lon_0=103.8333333333333 +k=1 +x_0=28001.642 +y_0=38744.572 +ellps=WGS84 +units=m +no_defs'
const SVY21proj = proj4('WGS84', SVY21)

/* eslint-disable camelcase */
export function inside ([lng, lat], polyline) {
  let isInside = false
  for (let i = 1; i < polyline.length; i++) {
    const deltaY_plus = polyline[i][1] - lat
    const deltaY_minus = lat - polyline[i - 1][1]
    if (deltaY_plus > 0 && deltaY_minus <= 0) continue
    if (deltaY_plus <= 0 && deltaY_minus > 0) continue
    const deltaX = (deltaY_plus * polyline[i - 1][0] + deltaY_minus * polyline[i][0]) /
      (deltaY_plus + deltaY_minus) - lng
    if (deltaX <= 0) continue
    isInside = !isInside
  }
  return isInside
}
/* eslint-enable camelcase */

export function encodePolyline (arr) {
  return polyline.encode(arr, PRECISION)
}

export function decodePolyline (str) {
  return polyline.decode(str, PRECISION).map(([lng, lat]) => ([
    Math.round(lng * Math.pow(10, PRECISION - 2)) / Math.pow(10, PRECISION - 2),
    Math.round(lat * Math.pow(10, PRECISION - 2)) / Math.pow(10, PRECISION - 2)
  ]))
}

export function fromSVY21 (x, y) {
  return SVY21proj.inverse([x, y])
}

export function toLinearRing (polyline) {
  const linearRing = (typeof polyline === 'string')
    ? decodePolyline(polyline) : cloneDeep(polyline)
  const firstPoint = linearRing[0]
  const lastPoint = linearRing[linearRing.length - 1]
  if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
    linearRing.push(firstPoint)
  }
  return linearRing
}
