import { renderPass } from '@/utils';
import type { TProcessFrame } from '@/types';

export const processFrame: TProcessFrame = (
  gl,
  video,
  programs,
  framebuffers,
  textures,
  buffers,
  lowThreshold,
  highThreshold
) => {
  const width = video.videoWidth;
  const height = video.videoHeight;
  console.log(textures, lowThreshold, highThreshold);
  // Upload video frame to input texture
  gl.bindTexture(gl.TEXTURE_2D, textures.input);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);

  // Pass 1: Gaussian Blur
  renderPass(gl, programs.blur, framebuffers.blur, textures.input, buffers, width, height, {
    u_resolution: [width, height]
  });

  // Pass 2: Gradient
  renderPass(gl, programs.gradient, framebuffers.gradient, textures.blur, buffers, width, height, {
    u_resolution: [width, height]
  });

  // Pass 3: Non-Maximum Suppression
  renderPass(gl, programs.nonMax, framebuffers.nonMax, textures.gradient, buffers, width, height, {
    u_resolution: [width, height]
  });

  // Pass 4: Threshold (render to screen)
  renderPass(gl, programs.threshold, null, textures.nonMax, buffers, width, height, {
    u_lowThreshold: lowThreshold,
    u_highThreshold: highThreshold
  });
}
