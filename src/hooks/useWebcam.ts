import { useEffect, useRef, useState } from 'react';
import { type UseWebcamOptions } from '@/types';

export function useWebcam({ 
  width = 640, 
  height = 480,
  facingMode = 'user',
  advanced = []
}: UseWebcamOptions = {}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: width },
            height: { ideal: height },
            facingMode,
            advanced,
          }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;

          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setIsStreaming(true);
          };
        }
      } catch (err) {
        console.error('Error accessing webcam:', err);
        setError(err instanceof Error ? err.message : 'Failed to access webcam');
      }
    };

    startWebcam();

    // Cleanup
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [width, height, facingMode]);

  return {
    videoRef,
    streamRef,
    isStreaming,
    error
  };
}