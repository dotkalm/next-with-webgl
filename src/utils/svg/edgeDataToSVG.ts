import type { SVGGenerationOptions } from '@/types/svg';
import { extractEdgePaths } from './extractEdgePaths';
import { simplifyPath } from './simplifyPath';
import { generateSVG } from './generateSVG';

/**
 * Convert Uint8Array edge data to SVG paths
 * @param data - RGBA pixel data from WebGL readPixels
 * @param width - Image width
 * @param height - Image height
 * @param options - SVG generation options
 */
export function edgeDataToSVG(
  data: Uint8Array,
  width: number,
  height: number,
  options: SVGGenerationOptions = {}
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
    intensity: path.intensity,
    intensities: path.intensities // Preserve intensities array
  }));

  // Get current time for animation
  const time = typeof performance !== 'undefined' ? performance.now() : Date.now();

  return generateSVG(simplifiedPaths, width, height, strokeWidth, strokeColor, time);
}
