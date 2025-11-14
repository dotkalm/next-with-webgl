import type { Point } from '@/types/svg';

/**
 * Calculate perpendicular distance from point to line
 */
function perpDistance(point: Point, lineStart: Point, lineEnd: Point): number {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  const mag = Math.sqrt(dx * dx + dy * dy);
  
  if (mag < 0.00001) {
    return Math.sqrt(
      (point.x - lineStart.x) ** 2 + 
      (point.y - lineStart.y) ** 2
    );
  }

  const u = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / (mag * mag);
  const ix = lineStart.x + u * dx;
  const iy = lineStart.y + u * dy;
  
  return Math.sqrt((point.x - ix) ** 2 + (point.y - iy) ** 2);
}

/**
 * Simplify path using Ramer-Douglas-Peucker algorithm
 */
export function simplifyPath(points: Point[], epsilon: number): Point[] {
  if (points.length <= 2) return points;

  let dmax = 0;
  let index = 0;
  const end = points.length - 1;

  for (let i = 1; i < end; i++) {
    const d = perpDistance(points[i], points[0], points[end]);
    if (d > dmax) {
      index = i;
      dmax = d;
    }
  }

  if (dmax > epsilon) {
    const left = simplifyPath(points.slice(0, index + 1), epsilon);
    const right = simplifyPath(points.slice(index), epsilon);
    return [...left.slice(0, -1), ...right];
  }

  return [points[0], points[end]];
}
