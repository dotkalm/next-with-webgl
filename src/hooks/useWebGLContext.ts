import { useEffect, useState, RefObject } from 'react';

interface UseWebGLContextOptions {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  enabled: boolean;
}

export function useWebGLContext({ canvasRef, enabled }: UseWebGLContextOptions) {
  const [gl, setGl] = useState<WebGLRenderingContext | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !enabled) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('webgl');

    if (!context) {
      setError('WebGL not supported');
      console.error('Failed to get WebGL context');
      return;
    }

    console.log('WebGL context initialized:', context);
    console.log('Canvas:', canvas);
    setGl(context);

    // Cleanup
    return () => {
      // WebGL context cleanup if needed
      setGl(null);
    };
  }, [canvasRef, enabled]);

  return {
    gl,
    error
  };
}