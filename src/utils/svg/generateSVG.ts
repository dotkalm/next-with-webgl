import type { EdgePath } from '@/types/svg';
import { calculateDashOffset } from './calculateDashOffset';

/**
 * Generate SVG string from edge paths
 */
export function generateSVG(
  paths: EdgePath[],
  width: number,
  height: number,
  strokeWidth: number,
  strokeColor: string,
  time?: number
): string {
  // Calculate oscillating dash offset based on time
  const dashOffset = time !== undefined 
    ? calculateDashOffset(time)
    : 0;

  const pathElements = paths
    .map(path => {
      if (path.points.length < 2) return '';

      // Flip Y coordinates since WebGL origin is bottom-left
      const d = path.points
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${(height - p.y).toFixed(2)}`)
        .join(' ');

      const opacity = Math.max(0.3, path.intensity); // Minimum 30% opacity
      
      // Create dash array from actual pixel intensity values
      // Sample every few points to avoid too many values
      const intensities = path.intensities || [];
      const sampleRate = Math.max(1, Math.floor(intensities.length / 20));
      const dashArray = intensities.length > 0
        ? intensities
            .filter((_, i) => i % sampleRate === 0)
            .map(intensity => {
              // Map intensity (0-255) to dash length (1-30)
              return Math.max(1, Math.floor(intensity / 255 * 30));
            })
            .join(' ')
        : '5 5'; // Fallback dash pattern
      
      return `    <path d="${d}" stroke="${strokeColor}" stroke-width="${strokeWidth}" fill="none" opacity="${opacity.toFixed(2)}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${dashArray}" stroke-dashoffset="${dashOffset.toFixed(2)}"/>`;
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
