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

export type TInitWebGL = (
  gl: WebGLRenderingContext,
  programsRef: React.RefObject<TWebGLPrograms>,
  framebuffersRef: React.RefObject<TWebGLFramebuffers>,
  texturesRef: React.RefObject<TWebGLTextures>,
  buffersRef: React.RefObject<TWebGLBuffers>
) => void;

export type TCleanupWebGL = (
  gl: WebGLRenderingContext,
  programs: TWebGLPrograms,
  framebuffers: TWebGLFramebuffers,
  textures: TWebGLTextures
) => void;

export type TCreateFramebuffer = (
  gl: WebGLRenderingContext,
  texture: WebGLTexture | null
) => WebGLFramebuffer | null;

export type TProcessFrame = (
  gl: WebGLRenderingContext,
  video: HTMLVideoElement,
  programs: TWebGLPrograms,
  framebuffers: TWebGLFramebuffers,
  textures: TWebGLTextures,
  buffers: TWebGLBuffers,
  lowThreshold: number,
  highThreshold: number
) => void;

export type TRenderPass = (
  gl: WebGLRenderingContext,
  program: WebGLProgram | null | undefined,
  framebuffer: WebGLFramebuffer | null | undefined,
  inputTexture: WebGLTexture | null | undefined,
  buffers: TWebGLBuffers,
  width: number,
  height: number,
  uniforms: Record<string, TUniformValue>
) => void;

export type TCreateTexture = (
  gl: WebGLRenderingContext,
  width?: number,
  height?: number
) => WebGLTexture | null;

export type TCreateShader = (
  gl: WebGLRenderingContext,
  type: number,
  source: string
) => WebGLShader | null;

export type TCreateProgram = (
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
) => WebGLProgram | null;

export type TCreateVideoTexture = (
  gl: WebGLRenderingContext,
  frame: TVideoFrameData, 
) => WebGLTexture | null;

export type TUpdateVideoTexture = (
  gl: WebGLRenderingContext,
  texture: WebGLTexture,
  frame: TVideoFrameData
) => void;
