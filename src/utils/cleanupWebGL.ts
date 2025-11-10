import type { TCleanupWebGL } from '@/types';

export const cleanupWebGL: TCleanupWebGL = (
  gl,
  programs,
  framebuffers,
  textures,
) => {
  Object.values(programs).forEach(program => {
    if (program) gl.deleteProgram(program);
  });

  // Clean up framebuffers
  Object.values(framebuffers).forEach(fb => {
    if (fb) gl.deleteFramebuffer(fb);
  });

  // Clean up textures
  Object.values(textures).forEach(texture => {
    if (texture) gl.deleteTexture(texture);
  });
}
