'use client';
import { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import { useMediaQuery } from '@mui/material';

import { useWebcam } from '@/hooks/useWebcam';
import { type WebcamCaptureProps, Orientation } from '@/types';
import { styles } from '@/styles';

export default function WebcamCapture({
  width = 640,
  height = 480,
}: WebcamCaptureProps) {
  const isLandscape = useMediaQuery('(orientation: landscape)');
  const [orientation, setOrientation] = useState<Orientation>(Orientation.PORTRAIT);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [maxZoom, setMaxZoom] = useState(3);
  const isApplyingZoomRef = useRef(false);

  const { videoRef } = useWebcam({
    advanced: [{ zoom: zoomLevel }],
    facingMode: 'environment',
    height,
    width,
  });

  const applyZoomToCamera = async (newZoom: number) => {
    if (!videoRef.current?.srcObject || isApplyingZoomRef.current) return;

    const stream = videoRef.current.srcObject as MediaStream;
    const videoTrack = stream.getVideoTracks()[0];

    if (!videoTrack) return;

    isApplyingZoomRef.current = true;

    try {
      const capabilities = videoTrack.getCapabilities();
      console.log('Camera Capabilities:', capabilities);

      if (capabilities.zoom) {
        setMaxZoom(capabilities.zoom.max || 3);

        // Apply zoom constraint
        await videoTrack.applyConstraints({
          advanced: [{ zoom: newZoom }] as any
        });

        console.log('Zoom applied successfully:', newZoom);
      }
    } catch (err) {
      console.error('Error applying zoom:', err);
    } finally {
      isApplyingZoomRef.current = false;
    }
  };

  useEffect(() => {
    const newOrientation = isLandscape ? Orientation.LANDSCAPE : Orientation.PORTRAIT;
    setOrientation(newOrientation);
  }, [isLandscape]);

  const handleSliderChange = (event: Event, value: unknown) => {
    const newZoom = value as number;
    console.log('Slider changed:', { value: newZoom });
    // Update UI state immediately for responsive slider
    setZoomLevel(newZoom);
  };

  const handleSliderChangeCommitted = (event: Event | React.SyntheticEvent, value: unknown) => {
    const newZoom = value as number;
    console.log('Slider committed:', { value: newZoom });
    // Apply actual camera zoom when user finishes dragging
    applyZoomToCamera(newZoom);
  };

  return (
    <Box sx={styles.webcamContainer}>
      <Paper elevation={3} sx={styles.webcam}>
        <Box
          component="video"
          ref={videoRef}
          playsInline
          muted
          autoPlay
          sx={styles.video}
        />
        <Slider
          max={maxZoom}
          min={1}
          onChange={handleSliderChange}
          onChangeCommitted={handleSliderChangeCommitted}
          orientation={isLandscape ? 'vertical' : 'horizontal'}
          step={0.1}
          sx={isLandscape ? styles.sliderVertical : styles.sliderHorizontal}
          value={zoomLevel}
        />
        <Box sx={styles.zoomInfoContainer}>
          <Box sx={styles.shutterContainer}>
            {orientation === Orientation.PORTRAIT && (
              <Typography sx={styles.zoomInfo}>
                Camera Zoom: {zoomLevel.toFixed(1)}x
              </Typography>
            )}
          </Box>
          <Box sx={{
            ...styles.shutterContainer,
          }}>
            <Box sx={styles.shutter} />
          </Box>
          <Box sx={styles.shutterContainer}>
            {orientation === Orientation.LANDSCAPE && (
              <Typography sx={styles.zoomInfo}>
                Camera Zoom: {zoomLevel.toFixed(1)}x
              </Typography>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}