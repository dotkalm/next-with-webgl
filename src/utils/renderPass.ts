import type { TRenderPass } from '@/types';

export const renderPass: TRenderPass = (
  gl,
  program,
  framebuffer,
  inputTexture,
  buffers,
  width,
  height,
  uniforms
) => {
  if (!program || !inputTexture || !buffers.position || !buffers.texCoord) return;

  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer || null);
  gl.viewport(0, 0, width, height);

  gl.useProgram(program);

  // Set up position attribute
  const positionLocation = gl.getAttribLocation(program, 'a_position');
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  // Set up texCoord attribute
  const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.texCoord);
  gl.enableVertexAttribArray(texCoordLocation);
  gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

  // Bind input texture
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, inputTexture);
  gl.uniform1i(gl.getUniformLocation(program, 'u_image'), 0);

  // Set uniforms
  for (const [name, value] of Object.entries(uniforms)) {
    const location = gl.getUniformLocation(program, name);
    if (Array.isArray(value)) {
      gl.uniform2f(location, value[0], value[1]);
    } else {
      gl.uniform1f(location, value);
    }
  }

  // Draw
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}
