/**
 * Convert edge detection pixel data directly to SVG paths
 * More efficient than canvas-based approach since we work with the raw data
 */

interface Point {
  x: number;
  y: number;
}

interface EdgePath {
  points: Point[];
  intensity: number;
}

/**
 * Convert Uint8Array edge data to SVG paths
 * @param data - RGBA pixel data from WebGL readPixels
 * @param width - Image width
 * @param height - Image height
 * @param threshold - Minimum pixel intensity to consider an edge (0-255)
 */
export function edgeDataToSVG(
  data: Uint8Array,
  width: number,
  height: number,
  options: {
    threshold?: number;
    minPathLength?: number;
    simplification?: number;
    strokeWidth?: number;
    strokeColor?: string;
  } = {}
): string {
  const {
    threshold = 127,
    minPathLength = 3,
    simplification = 2,
    strokeWidth = 1,
    strokeColor = '#000000'
  } = options;

  const paths = extractEdgePaths(data, width, height, threshold, minPathLength);
  const simplifiedPaths = paths.map(path => ({
    points: simplifyPath(path.points, simplification),
    intensity: path.intensity
  }));

  return generateSVG(simplifiedPaths, width, height, strokeWidth, strokeColor);
}

/**
 * Extract continuous edge paths from pixel data
 */
function extractEdgePaths(
  data: Uint8Array,
  width: number,
  height: number,
  threshold: number,
  minPathLength: number
): EdgePath[] {
  const visited = new Uint8Array(width * height);
  const paths: EdgePath[] = [];

  const getPixel = (x: number, y: number): number => {
    if (x < 0 || x >= width || y < 0 || y >= height) return 0;
    const idx = (y * width + x) * 4;
    return data[idx]; // Red channel contains edge intensity
  };

  const isEdge = (x: number, y: number): boolean => {
    return getPixel(x, y) > threshold;
  };

  const markVisited = (x: number, y: number) => {
    visited[y * width + x] = 1;
  };

  const isVisited = (x: number, y: number): boolean => {
    return visited[y * width + x] === 1;
  };

  // Follow edge chain from starting point
  const followEdge = (startX: number, startY: number): EdgePath | null => {
    const points: Point[] = [];
    let x = startX;
    let y = startY;
    let totalIntensity = 0;

    // 8-directional neighbors (prioritize straight lines, then diagonals)
    const directions = [
      [0, -1], [1, 0], [0, 1], [-1, 0], // Cardinal
      [1, -1], [1, 1], [-1, 1], [-1, -1] // Diagonal
    ];

    while (true) {
      if (!isEdge(x, y) || isVisited(x, y)) break;

      points.push({ x, y });
      totalIntensity += getPixel(x, y);
      markVisited(x, y);

      // Find next edge pixel
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

    if (points.length < minPathLength) return null;

    return {
      points,
      intensity: totalIntensity / (points.length * 255) // Normalize to 0-1
    };
  };

  // Scan for edge starting points
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (isEdge(x, y) && !isVisited(x, y)) {
        const path = followEdge(x, y);
        if (path) {
          paths.push(path);
        }
      }
    }
  }

  return paths;
}

/**
 * Simplify path using Ramer-Douglas-Peucker algorithm
 */
function simplifyPath(points: Point[], epsilon: number): Point[] {
  if (points.length <= 2) return points;

  const perpDistance = (point: Point, lineStart: Point, lineEnd: Point): number => {
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
  };

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

/**
 * Generate SVG string from edge paths
 */
function generateSVG(
  paths: EdgePath[],
  width: number,
  height: number,
  strokeWidth: number,
  strokeColor: string
): string {
  const pathElements = paths
    .map(path => {
      if (path.points.length < 2) return '';

      const d = path.points
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
        .join(' ');

      const opacity = Math.max(0.3, path.intensity); // Minimum 30% opacity
      
      return `    <path d="${d}" stroke="${strokeColor}" stroke-width="${strokeWidth}" fill="none" opacity="${opacity.toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/>`;
    })
    .filter(p => p.length > 0)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
  <g id="edges">
${pathElements}
  </g>
</svg>`;
}

/**
 * Read pixels from WebGL framebuffer and convert to SVG
 */
export function readFramebufferToSVG(
  gl: WebGLRenderingContext,
  width: number,
  height: number,
  options?: Parameters<typeof edgeDataToSVG>[3]
): string {
  const pixels = new Uint8Array(width * height * 4);
  gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  
  return edgeDataToSVG(pixels, width, height, options);
}

/**
 * Download SVG file
 */
export function downloadSVG(svgString: string, filename: string = 'edges.svg') {
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
