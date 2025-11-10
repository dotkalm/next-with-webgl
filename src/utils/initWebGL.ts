import { type RefObject } from 'react';
import vertexShaderSource from '@/shaders/source.vert';
import gaussianBlurFragmentShader from '@/shaders/gaussian.frag';
import gradientFragmentShader from '@/shaders/gradient.frag';
import nonMaxSuppressionFragmentShader from '@/shaders/nonMax.frag';
import thresholdFragmentShader from '@/shaders/threshold.frag';

import {
    createShader,
    createProgram,
    createTexture,
    createFramebuffer,
} from '@/utils';
import type { TInitWebGL } from '@/types';

export const initWebGL: TInitWebGL = (
  gl,
  programsRef,
  framebuffersRef,
  texturesRef,
  buffersRef,
) => {
  // Create vertex shader (shared)
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  if (!vertexShader) return;

  // Create fragment shaders and programs
  const blurFragShader = createShader(gl, gl.FRAGMENT_SHADER, gaussianBlurFragmentShader);
  const gradientFragShader = createShader(gl, gl.FRAGMENT_SHADER, gradientFragmentShader);
  const nonMaxFragShader = createShader(gl, gl.FRAGMENT_SHADER, nonMaxSuppressionFragmentShader);
  const thresholdFragShader = createShader(gl, gl.FRAGMENT_SHADER, thresholdFragmentShader);

  if (blurFragShader) programsRef.current.blur = createProgram(gl, vertexShader, blurFragShader);
  if (gradientFragShader) programsRef.current.gradient = createProgram(gl, vertexShader, gradientFragShader);
  if (nonMaxFragShader) programsRef.current.nonMax = createProgram(gl, vertexShader, nonMaxFragShader);
  if (thresholdFragShader) programsRef.current.threshold = createProgram(gl, vertexShader, thresholdFragShader);

  // Create geometry (full-screen quad)
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,  1, -1,  -1, 1,
    -1, 1,   1, -1,  1, 1,
  ]), gl.STATIC_DRAW);
  buffersRef.current.position = positionBuffer;

  const texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    0, 1,  1, 1,  0, 0,
    0, 0,  1, 1,  1, 0,
  ]), gl.STATIC_DRAW);
  buffersRef.current.texCoord = texCoordBuffer;

  // Create textures for each pass
  texturesRef.current.input = createTexture(gl);
  texturesRef.current.blur = createTexture(gl, 640, 480);
  texturesRef.current.gradient = createTexture(gl, 640, 480);
  texturesRef.current.nonMax = createTexture(gl, 640, 480);

  // Create framebuffers
  framebuffersRef.current.blur = createFramebuffer(gl, texturesRef.current.blur);
  framebuffersRef.current.gradient = createFramebuffer(gl, texturesRef.current.gradient);
  framebuffersRef.current.nonMax = createFramebuffer(gl, texturesRef.current.nonMax);
}
