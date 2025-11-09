import { createMockGL } from '../../__mocks__/webgl';

export function createTestContext(width = 64, height = 64) {
  if (typeof document !== 'undefined') {
    // In jsdom or browser
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    if (gl) return gl as WebGLRenderingContext;

    // Fall back to mock if jsdom doesn't support WebGL
    return createMockGL() as unknown as WebGLRenderingContext;
  }

  // In Node (no DOM)
  try {
    // Try real headless GL (optional later)
    const createGL = require('gl');
    return createGL(width, height);
  } catch {
    // Fall back to mock if not installed or failed
    return createMockGL() as unknown as WebGLRenderingContext;
  }
}
