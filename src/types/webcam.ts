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
