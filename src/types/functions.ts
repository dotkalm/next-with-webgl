import type {
  TUniformValue,
  TUseEdgeDetectionOptions,
  TUseVideoTextureOptions,
  TUseVideoTextureReturn,
  TUseWebcamOptions,
  TUseWebcamReturn,
  TVideoFrameData,
  TWebGLBuffers,
  TWebGLFramebuffers,
  TWebGLPrograms,
  TWebGLTextures,
} from './webgl';

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

export type TUseVideoTexture = (
  options: TUseVideoTextureOptions
) => TUseVideoTextureReturn;

export type TUseWebGLCanvas = (
  options: TUseEdgeDetectionOptions
) => void;

export type TUseGetWebcam = (options: TUseWebcamOptions) => TUseWebcamReturn;

export type TInitWebGL = (
  gl: WebGLRenderingContext,
  programsRef: React.RefObject<TWebGLPrograms>,
  framebuffersRef: React.RefObject<TWebGLFramebuffers>,
  texturesRef: React.RefObject<TWebGLTextures>,
  buffersRef: React.RefObject<TWebGLBuffers>,
) => void;
