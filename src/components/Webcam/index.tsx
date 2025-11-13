'use client';
import { useState, useRef } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import { useWebcam } from '@/hooks/useWebcam';
import { type WebcamCaptureProps } from '@/types';
import { styles } from '@/styles';

export default function WebcamCapture({
  width = 640, 
  height = 480,
}: WebcamCaptureProps) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [maxZoom, setMaxZoom] = useState(3);

  const { videoRef } = useWebcam({
    width,
    height,
    facingMode: 'environment',
    advanced: [{
      zoom: zoomLevel 
    }]
  });

 const updateZoom = async (newZoom: number) => {
    if (!videoRef.current?.srcObject) return;
    
    const stream = videoRef.current.srcObject as MediaStream;
    const videoTrack = stream.getVideoTracks()[0];
    
    if (!videoTrack) return;

    try {
      // Check if zoom is supported
      const capabilities = videoTrack.getCapabilities();
      console.log('Camera Capabilities:', capabilities);
      
      if (capabilities.zoom) {
        setMaxZoom(capabilities.zoom.max || 3);
        
        // Apply zoom constraint
        await videoTrack.applyConstraints({
          zoom: { ideal: newZoom }
        });
        
        setZoomLevel(newZoom);
      }
    } catch (err) {
      console.error('Error applying zoom:', err);
    }
  };
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: {
          xs: 'column',
          sm: 'row'
        }
      }}
    >
      <Paper
        elevation={3}
        sx={styles.webcam}
      >
        <video
          ref={videoRef}
          height='auto'
          width='100%'
          playsInline
          muted
        />
        <Slider
          value={zoomLevel}
          min={1}
          max={maxZoom}
          step={0.1}
          onChange={(_, value) => updateZoom(value as number)}
          sx={{
            color: 'white',
            '& .MuiSlider-thumb': {
              backgroundColor: 'white',
            },
            '& .MuiSlider-track': {
              backgroundColor: 'white',
            },
            '& .MuiSlider-rail': {
              backgroundColor: 'rgba(255,255,255,0.3)',
            }
          }}
        />
        <Typography color="black">
          Camera Zoom: {zoomLevel.toFixed(1)}x
        </Typography>
      </Paper>
    </Box>
  );
}