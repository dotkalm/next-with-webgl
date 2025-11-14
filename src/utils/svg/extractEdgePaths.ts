import type { Point, EdgePath } from '@/types/svg';

/**
 * Extract continuous edge paths from pixel data
 */
export function extractEdgePaths(
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
    const intensities: number[] = [];
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

      const pixelIntensity = getPixel(x, y);
      points.push({ x, y, intensity: pixelIntensity });
      intensities.push(pixelIntensity);
      totalIntensity += pixelIntensity;
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
      intensity: totalIntensity / (points.length * 255), // Normalize to 0-1
      intensities
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
