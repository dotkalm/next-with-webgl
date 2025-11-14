'use client'
import {
  useRef,
  useState,
  useEffect,
  type FC,
} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useMediaQuery } from '@mui/material';
import { useGetWebcam } from '@/hooks/useGetWebcam';
import { useWebGLCanvas } from '@/hooks/useWebGLCanvas';
import type { TCannyEdgeDetectorProps } from '@/types/webgl';

export const EdgeDetector: FC<TCannyEdgeDetectorProps> = ({
  lowThreshold = 0.05,
  highThreshold = 0.15,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isPortrait = useMediaQuery('(orientation: portrait)');

  const { isStreaming } = useGetWebcam({
    facingMode: 'environment',
    width: isPortrait ? 480 : 640,
    height: isPortrait ? 640 : 480,
    videoRef,
  });

  useWebGLCanvas({
    canvasRef,
    highThreshold,
    isStreaming,
    lowThreshold,
    videoRef,
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Box sx={{
        display: 'flex',
        gap: '1rem',
        video: {
          border: '1px solid #ccc',
          display: 'none', 
        },
      }}>
        <Box>
          <video
            ref={videoRef}
            width={isPortrait ? 480 : 640}
            height={isPortrait ? 640 : 480}
            playsInline
            muted
            autoPlay
          />
        </Box>
        <Box sx={{ 
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
        }}>
          <canvas
            ref={canvasRef}
            width={isPortrait ? 480 : 640}
            height={isPortrait ? 640 : 480}
            style={{
              border: '1px solid #ccc',
              maxWidth: '100%',
              height: 'auto',
            }}
          />
        </Box>
      </Box>
      <Box
        sx={{
          color: '#fff',
        }}
      >
        <Typography>Low Threshold: {lowThreshold}</Typography>
        <Typography>High Threshold: {highThreshold}</Typography>
      </Box>
    </Box>
  );
};