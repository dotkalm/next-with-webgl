import type { EdgePath } from '@/types/svg';
import { calculateDashOffset } from './calculateDashOffset';

export function generateSVG(
  paths: EdgePath[],
  height: number,
  strokeWidth: number,
  strokeColor: string,
  time?: number
) {

  const dashOffset = time !== undefined 
    ? calculateDashOffset(time)
    : 0;

  const pathElements = paths
    .map(path => {
      if (path.points.length < 2) return null;

      const d = path.points
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${(height - p.y).toFixed(2)}`)
        .join(' ');

      const opacity = Math.max(0.3, path.intensity); // Minimum 30% opacity
      
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
        : '5 5';
      
      return (
        <path
          d={d}
          opacity={opacity.toFixed(2)}
          stroke={strokeColor}
          strokeDasharray={dashArray}
          strokeDashoffset={dashOffset.toFixed(2)}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokeWidth}
        />
      );
    })

  return(<g id="edges">{pathElements}</g>);
}
