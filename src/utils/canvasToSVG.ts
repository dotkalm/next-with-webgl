/**
 * Converts edge detection canvas output to SVG paths
 */

interface Point {
  x: number;
  y: number;
}

interface EdgePath {
  points: Point[];
  strength: number; // 0-1, based on edge intensity
}

/**
 * Extract edge pixels from canvas
 */
export function getEdgePixels(canvas: HTMLCanvasElement): ImageData {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D context');
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

/**
 * Convert edge pixels to paths using edge following algorithm
 */
export function pixelsToPath(imageData: ImageData, threshold: number = 127): EdgePath[] {
  const { width, height, data } = imageData;
  const visited = new Set<string>();
  const paths: EdgePath[] = [];

  // Helper to check if pixel is an edge
  const isEdge = (x: number, y: number): boolean => {
    if (x < 0 || x >= width || y < 0 || y >= height) return false;
    const idx = (y * width + x) * 4;
    return data[idx] > threshold; // Check red channel
  };

  // Helper to mark as visited
  const markVisited = (x: number, y: number) => {
    visited.add(`${x},${y}`);
  };

  const isVisited = (x: number, y: number): boolean => {
    return visited.has(`${x},${y}`);
  };

  // Follow edge from starting point
  const followEdge = (startX: number, startY: number): Point[] => {
    const path: Point[] = [];
    let x = startX;
    let y = startY;

    // 8-directional neighbors
    const directions = [
      [-1, -1], [0, -1], [1, -1],
      [-1, 0],           [1, 0],
      [-1, 1],  [0, 1],  [1, 1]
    ];

    while (isEdge(x, y) && !isVisited(x, y)) {
      path.push({ x, y });
      markVisited(x, y);

      // Find next edge pixel in neighborhood
      let found = false;
      for (const [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;
        if (isEdge(nx, ny) && !isVisited(nx, ny)) {
          x = nx;
          y = ny;
          found = true;
          break;
        }
      }

      if (!found) break;
    }

    return path;
  };

  // Scan image for edge starting points
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (isEdge(x, y) && !isVisited(x, y)) {
        const points = followEdge(x, y);
        if (points.length > 2) { // Minimum path length
          const idx = (y * width + x) * 4;
          const strength = data[idx] / 255;
          paths.push({ points, strength });
        }
      }
    }
  }

  return paths;
}

/**
 * Simplify path using Ramer-Douglas-Peucker algorithm
 */
export function simplifyPath(points: Point[], epsilon: number = 2): Point[] {
  if (points.length <= 2) return points;

  const distanceToLine = (point: Point, lineStart: Point, lineEnd: Point): number => {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;
    const mag = Math.sqrt(dx * dx + dy * dy);
    if (mag < 0.00000001) return Math.hypot(point.x - lineStart.x, point.y - lineStart.y);
    
    const u = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / (mag * mag);
    const ix = lineStart.x + u * dx;
    const iy = lineStart.y + u * dy;
    return Math.hypot(point.x - ix, point.y - iy);
  };

  let dmax = 0;
  let index = 0;
  const end = points.length - 1;

  for (let i = 1; i < end; i++) {
    const d = distanceToLine(points[i], points[0], points[end]);
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

/**
 * Convert paths to SVG path data string
 */
export function pathsToSVGData(paths: EdgePath[]): string {
  return paths.map(path => {
    const simplified = simplifyPath(path.points, 2);
    if (simplified.length < 2) return '';
    
    const d = simplified.map((p, i) => 
      i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`
    ).join(' ');
    
    return d;
  }).filter(d => d.length > 0).join(' ');
}

/**
 * Generate complete SVG string from canvas
 */
export function canvasToSVG(
  canvas: HTMLCanvasElement, 
  options: {
    threshold?: number;
    simplification?: number;
    strokeWidth?: number;
    strokeColor?: string;
  } = {}
): string {
  const {
    threshold = 127,
    simplification = 2,
    strokeWidth = 1,
    strokeColor = '#000000'
  } = options;

  const imageData = getEdgePixels(canvas);
  const paths = pixelsToPath(imageData, threshold);
  
  const svgPaths = paths.map(path => {
    const simplified = simplifyPath(path.points, simplification);
    if (simplified.length < 2) return '';
    
    const d = simplified.map((p, i) => 
      i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`
    ).join(' ');
    
    const opacity = path.strength;
    return `<path d="${d}" stroke="${strokeColor}" stroke-width="${strokeWidth}" fill="none" opacity="${opacity.toFixed(2)}" />`;
  }).filter(p => p.length > 0).join('\n    ');

  return `<svg width="${canvas.width}" height="${canvas.height}" xmlns="http://www.w3.org/2000/svg">
  <g>
    ${svgPaths}
  </g>
</svg>`;
}

/**
 * Download SVG file
 */
export function downloadSVG(svgString: string, filename: string = 'edges.svg') {
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
