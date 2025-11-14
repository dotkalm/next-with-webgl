import { edgeDataToSVG } from './edgeDataToSVG';
import type { SVGGenerationOptions } from '@/types/svg';

/**
 * Read pixels from WebGL framebuffer and convert to SVG
 */
export function readFramebufferToSVG(
  gl: WebGLRenderingContext,
  width: number,
  height: number,
  options?: SVGGenerationOptions
): string {
  const pixels = new Uint8Array(width * height * 4);
  gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  
  return edgeDataToSVG(pixels, width, height, options);
}
