'use client'
import {
  useRef,
  type FC,
} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useGetWebcam } from '@/hooks/useGetWebcam';
import { useWebGLCanvas } from '@/hooks/useWebGLCanvas';
import type { TCannyEdgeDetectorProps } from '@/types/webgl';

export const EdgeDetector: FC<TCannyEdgeDetectorProps> = ({
  lowThreshold = 0.05,
  highThreshold = 0.15,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { isStreaming } = useGetWebcam({
    facingMode: 'environment',
    height: 480,
    videoRef,
    width: 640,
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
        canvas: {
          border: '1px solid #ccc',
          transform: 'rotate(180deg)',
        },
        video: {
          border: '1px solid #ccc',
          display: 'none', 
        },
      }}>
        <Box>
          <video
            ref={videoRef}
            width={640}
            height={480}
            playsInline
            muted
            autoPlay
          />
        </Box>
        <Box>
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
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