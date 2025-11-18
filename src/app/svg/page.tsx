'use client'
import {
  useRef,
  useState,
  useEffect,
  type FC,
} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useMediaQuery } from '@mui/material';
import { useGetWebcam } from '@/hooks/useGetWebcam';
import { useWebGLCanvas } from '@/hooks/useWebGLCanvas';
import { readFramebufferToSVG, downloadSVG } from '@/utils';

export default function SVGEdgeDetector() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isPortrait = useMediaQuery('(orientation: portrait)');
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 640, height: 480 });
  const [svgContent, setSvgContent] = useState<string>('');

  const { isStreaming } = useGetWebcam({
    facingMode: 'user',
    height: isPortrait ? 640 : 480,
    videoRef,
    width: isPortrait ? 480 : 640,
  });

  // Update canvas dimensions when orientation changes
  useEffect(() => {
    const newDimensions = isPortrait 
      ? { width: 480, height: 640 }
      : { width: 640, height: 480 };
    setCanvasDimensions(newDimensions);
  }, [isPortrait]);

  // Store GL context reference
  useEffect(() => {
    if (canvasRef.current && isStreaming) {
      const gl = canvasRef.current.getContext('webgl2');
      if (gl) {
        glRef.current = gl;
      }
    }
  }, [canvasRef, isStreaming]);

  useWebGLCanvas({
    canvasRef,
    highThreshold: 0.35,
    isStreaming,
    lowThreshold: 0.023,
    videoRef,
  });

  useEffect(() => {
    if (!isStreaming || !glRef.current || !canvasRef.current) {
      return;
    }

    const updateSVG = () => {
      try {
        const { width, height } = canvasRef.current!;
        
        const svg = readFramebufferToSVG(glRef.current!, width, height, {
          threshold: 100,
          minPathLength: 5,
          simplification: 2,
          strokeWidth: 1.5,
          strokeColor: '#000000'
        });

        setSvgContent(svg);
      } catch (error) {
        console.error('Error generating SVG:', error);
      }

      animationFrameRef.current = requestAnimationFrame(updateSVG);
    };

    updateSVG();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isStreaming]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: 'white',
      }}
    >
      {/* Hidden video and canvas */}
      <Box sx={{ display: 'none' }}>
        <video
          ref={videoRef}
          width={isPortrait ? 480 : 640}
          height={isPortrait ? 640 : 480}
          playsInline
          muted
          autoPlay
        />
        <canvas
          ref={canvasRef}
          width={canvasDimensions.width}
          height={canvasDimensions.height}
          key={`${canvasDimensions.width}x${canvasDimensions.height}`}
        />
      </Box>

      {/* Live SVG Output */}
      <Paper elevation={3} sx={{m: 2}}>
        <Typography variant="subtitle2" color="white" gutterBottom>
          Live SVG Edge Detection
        </Typography>
        <Box
          sx={{
            bgcolor: '#fff',
            border: '2px solid #333',
            borderRadius: 1,
            minHeight: isPortrait ? 640 : 400,
            aspectRatio: isPortrait ? '480/640' : '640/480',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            mx: 'auto',
            maxWidth: '100%',
          }}
        >
          <svg 
            height={canvasDimensions.height}
            viewBox={`0 0 ${canvasDimensions.width} ${canvasDimensions.height}`}
            width={canvasDimensions.width}
            xmlns="http://www.w3.org/2000/svg" 
          >
            {svgContent}
          </svg>
        </Box>
      </Paper>
    </Box>
  );
}
