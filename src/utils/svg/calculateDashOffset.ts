/**
 * Calculate looping dash offset based on time
 * Animates continuously in one direction
 */
export function calculateDashOffset(time: number): number {
  const period = 5000; // 5 second cycle
  const min = -4;
  const max = 432;
  const range = max - min;
  
  // Normalize time to 0-1 range within period
  const t = (time % period) / period;
  
  // Linear progression from max to min (loops back)
  return max - (range * t);
}
