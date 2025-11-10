export interface TCannyEdgeDetectorProps {
  lowThreshold?: number;
  highThreshold?: number;
}

export interface TWebGLPrograms {
  blur?: WebGLProgram | null;
  gradient?: WebGLProgram | null;
  nonMax?: WebGLProgram | null;
  threshold?: WebGLProgram | null;
}

export interface TWebGLFramebuffers {
  blur?: WebGLFramebuffer | null;
  gradient?: WebGLFramebuffer | null;
  nonMax?: WebGLFramebuffer | null;
}

export interface TWebGLTextures {
  input: WebGLTexture | null;
  blur?: WebGLTexture | null;
  gradient?: WebGLTexture | null;
  direction?: WebGLTexture | null;
  nonMax?: WebGLTexture | null;
}

export interface TWebGLBuffers {
  position: WebGLBuffer | null;
  texCoord: WebGLBuffer | null;
}

export interface TVideoFrame {
    data: Uint8Array;
    width: number;
    height: number;
    timestamp: number;
}

export type TUniformValue = number | [number, number];

export type TVideoFrameData = {
  data: Uint8Array;
  width: number;
  height: number;
  timestamp: number;
};

export interface TUseVideoTextureOptions {
  gl: WebGLRenderingContext | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  enabled: boolean;
}

export interface TUseVideoTextureReturn {
  texture: WebGLTexture | null;
}

export interface TUseEdgeDetectionOptions {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isStreaming: boolean;
  lowThreshold: number;
  highThreshold: number;
}

export interface TUseWebcamOptions {
  width?: number;
  height?: number;
  facingMode?: 'user' | 'environment';
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export interface TUseWebcamReturn {
  isStreaming: boolean;
  error: string | null;
}

export interface TEdgeFrame {
  data: Uint8Array;
  width: number;
  height: number;
  description: string;
}