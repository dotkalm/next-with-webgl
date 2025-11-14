import { type CarDetectionResponse } from "@/types";

export interface WebcamCaptureProps {
  width?: number;
  height?: number;
};

export interface UseWebcamOptions {
  width?: number;
  height?: number;
  facingMode?: 'user' | 'environment';
  advanced?: MediaTrackSettings[];
};

export interface UseFrameCaptureOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef?: React.RefObject<HTMLCanvasElement>;
  width?: number;
  height?: number;
}

export interface UseFrameCaptureReturn {
  captureFrame: () => Promise<CarDetectionResponse | undefined>;
  isUploading: boolean;
  error: string | null;
  lastCaptureTime: Date | null;
}