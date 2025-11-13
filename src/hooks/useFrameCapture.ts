'use client';
import { useState, useCallback } from 'react';
import { canvasToBlob } from '@/utils';
import type {
    UseFrameCaptureOptions,
    UseFrameCaptureReturn
} from '@/types'

export function useFrameCapture({
    canvasRef,
    height = 480,
    videoRef,
    width = 640,
}: UseFrameCaptureOptions): UseFrameCaptureReturn {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastCaptureTime, setLastCaptureTime] = useState<Date | null>(null);

    const captureFrame = useCallback(async () => {
        if (!videoRef.current) {
            setError('Video element not available');
            return;
        }

        if (!process.env.NEXT_PUBLIC_BOOTED_SERVER) {
            setError('Server endpoint not configured');
            return;
        }

        try {
            setIsUploading(true);
            setError(null);

            // Create a temporary canvas for frame capture
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                throw new Error('Could not get canvas context');
            }

            // Set canvas size to match video
            canvas.width = videoRef.current.videoWidth || width;
            canvas.height = videoRef.current.videoHeight || height;

            // Draw current video frame to canvas
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

            // Convert canvas to blob
            const blob = await canvasToBlob(canvas, 'image/jpeg', 0.9);

            // Create FormData for upload
            const formData = new FormData();
            formData.append('file', blob, `frame-${Date.now()}.jpg`);
            formData.append('timestamp', new Date().toISOString());
            formData.append('width', canvas.width.toString());
            formData.append('height', canvas.height.toString());

            // Send to server
            const response = await fetch(process.env.NEXT_PUBLIC_BOOTED_SERVER, {
                method: 'POST',
                body: formData,
            });
            console.log('Upload response status:', response);

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            console.log('Frame uploaded successfully:', result);

            setLastCaptureTime(new Date());

            // Clean up temporary canvas
            canvas.remove();

        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to capture frame';
            console.error('Frame capture error:', err);
            setError(errorMsg);
        } finally {
            setIsUploading(false);
        }
    }, [videoRef, canvasRef, width, height]);

    return {
        captureFrame,
        isUploading,
        error,
        lastCaptureTime
    };
}