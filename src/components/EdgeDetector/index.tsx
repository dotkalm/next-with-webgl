'use client'
import React, {
  useEffect,
  useRef,
  useState,
  type FC,
} from 'react';

import {
  cleanupWebGL,
  initWebGL,
  processFrame,
} from '@/utils';

import type {
  TCannyEdgeDetectorProps,
  TWebGLBuffers,
  TWebGLFramebuffers,
  TWebGLPrograms,
  TWebGLTextures,
} from '@/types/webgl';

export const EdgeDetector: FC<TCannyEdgeDetectorProps> = ({
  lowThreshold = 0.05,
  highThreshold = 0.15,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programsRef = useRef<TWebGLPrograms>({});
  const framebuffersRef = useRef<TWebGLFramebuffers>({});
  const texturesRef = useRef<TWebGLTextures>({ input: null });
  const buffersRef = useRef<TWebGLBuffers>({ position: null, texCoord: null });

  useEffect(() => {
    const initWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setIsStreaming(true);
        }
      } catch (err) {
        console.error('Error accessing webcam:', err);
      }
    };

    initWebcam();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !isStreaming) return;

    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl2');
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    glRef.current = gl;

    // Initialize WebGL programs and resources
    initWebGL(gl, programsRef, framebuffersRef, texturesRef, buffersRef);

    // Animation loop
    let animationId: number;
    const render = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        processFrame(gl, videoRef.current, programsRef.current, framebuffersRef.current, texturesRef.current, buffersRef.current, lowThreshold, highThreshold);
      }
      animationId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(animationId);
      cleanupWebGL(gl, programsRef.current, framebuffersRef.current, texturesRef.current);
    };
  }, [isStreaming, lowThreshold, highThreshold]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <div>
          <h3>Original</h3>
          <video
            ref={videoRef}
            width={640}
            height={480}
            style={{ border: '1px solid #ccc' }}
          />
        </div>
        <div>
          <h3>Canny Edge Detection</h3>
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            style={{ border: '1px solid #ccc' }}
          />
        </div>
      </div>
      <div>
        <p>Low Threshold: {lowThreshold}</p>
        <p>High Threshold: {highThreshold}</p>
      </div>
    </div>
  );
};