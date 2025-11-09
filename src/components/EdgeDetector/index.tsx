import React, { useEffect, useRef, useState } from 'react';

interface CannyEdgeDetectorProps {
  lowThreshold?: number;
  highThreshold?: number;
}

interface WebGLPrograms {
  blur?: WebGLProgram | null;
  gradient?: WebGLProgram | null;
  nonMax?: WebGLProgram | null;
  threshold?: WebGLProgram | null;
}

interface WebGLFramebuffers {
  blur?: WebGLFramebuffer | null;
  gradient?: WebGLFramebuffer | null;
  nonMax?: WebGLFramebuffer | null;
}

interface WebGLTextures {
  input: WebGLTexture | null;
  blur?: WebGLTexture | null;
  gradient?: WebGLTexture | null;
  direction?: WebGLTexture | null;
  nonMax?: WebGLTexture | null;
}

type UniformValue = number | [number, number];

export const CannyEdgeDetector: React.FC<CannyEdgeDetectorProps> = ({
  lowThreshold = 0.05,
  highThreshold = 0.15,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programsRef = useRef<WebGLPrograms>({});
  const framebuffersRef = useRef<WebGLFramebuffers>({});
  const texturesRef = useRef<WebGLTextures>({ input: null });

  useEffect(() => {
    const initWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setIsStreaming(true);
        }
      } catch (err) {
        console.error('Error accessing webcam:', err);
      }
    };

    initWebcam();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !isStreaming) return;

    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl2');
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    glRef.current = gl;

    // Initialize WebGL programs and resources
    initWebGL(gl, programsRef, framebuffersRef, texturesRef);

    // Animation loop
    let animationId: number;
    const render = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        processFrame(gl, videoRef.current, programsRef.current, framebuffersRef.current, texturesRef.current, lowThreshold, highThreshold);
      }
      animationId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(animationId);
      cleanupWebGL(gl, programsRef.current, framebuffersRef.current, texturesRef.current);
    };
  }, [isStreaming, lowThreshold, highThreshold]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <div>
          <h3>Original</h3>
          <video
            ref={videoRef}
            width={640}
            height={480}
            style={{ border: '1px solid #ccc' }}
          />
        </div>
        <div>
          <h3>Canny Edge Detection</h3>
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            style={{ border: '1px solid #ccc' }}
          />
        </div>
      </div>
      <div>
        <p>Low Threshold: {lowThreshold}</p>
        <p>High Threshold: {highThreshold}</p>
      </div>
    </div>
  );
};

// Vertex shader (used for all passes)
const vertexShaderSource = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;
  
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = a_texCoord;
  }
`;

// Pass 1: Gaussian Blur
const gaussianBlurFragmentShader = `
  precision mediump float;
  uniform sampler2D u_image;
  uniform vec2 u_resolution;
  varying vec2 v_texCoord;
  
  void main() {
    vec2 onePixel = 1.0 / u_resolution;
    
    // 5x5 Gaussian kernel (simplified to 3x3 for performance)
    vec4 color = vec4(0.0);
    color += texture2D(u_image, v_texCoord + vec2(-onePixel.x, -onePixel.y)) * 1.0;
    color += texture2D(u_image, v_texCoord + vec2(0.0, -onePixel.y)) * 2.0;
    color += texture2D(u_image, v_texCoord + vec2(onePixel.x, -onePixel.y)) * 1.0;
    
    color += texture2D(u_image, v_texCoord + vec2(-onePixel.x, 0.0)) * 2.0;
    color += texture2D(u_image, v_texCoord) * 4.0;
    color += texture2D(u_image, v_texCoord + vec2(onePixel.x, 0.0)) * 2.0;
    
    color += texture2D(u_image, v_texCoord + vec2(-onePixel.x, onePixel.y)) * 1.0;
    color += texture2D(u_image, v_texCoord + vec2(0.0, onePixel.y)) * 2.0;
    color += texture2D(u_image, v_texCoord + vec2(onePixel.x, onePixel.y)) * 1.0;
    
    gl_FragColor = color / 16.0;
  }
`;

// Pass 2: Gradient (Sobel) + Direction
const gradientFragmentShader = `
  precision mediump float;
  uniform sampler2D u_image;
  uniform vec2 u_resolution;
  varying vec2 v_texCoord;
  
  void main() {
    vec2 onePixel = 1.0 / u_resolution;
    
    // Sobel kernels
    float tl = texture2D(u_image, v_texCoord + vec2(-onePixel.x, -onePixel.y)).r;
    float tm = texture2D(u_image, v_texCoord + vec2(0.0, -onePixel.y)).r;
    float tr = texture2D(u_image, v_texCoord + vec2(onePixel.x, -onePixel.y)).r;
    
    float ml = texture2D(u_image, v_texCoord + vec2(-onePixel.x, 0.0)).r;
    float mr = texture2D(u_image, v_texCoord + vec2(onePixel.x, 0.0)).r;
    
    float bl = texture2D(u_image, v_texCoord + vec2(-onePixel.x, onePixel.y)).r;
    float bm = texture2D(u_image, v_texCoord + vec2(0.0, onePixel.y)).r;
    float br = texture2D(u_image, v_texCoord + vec2(onePixel.x, onePixel.y)).r;
    
    // Gradient
    float gx = -tl - 2.0*ml - bl + tr + 2.0*mr + br;
    float gy = -tl - 2.0*tm - tr + bl + 2.0*bm + br;
    
    float magnitude = sqrt(gx*gx + gy*gy) / (4.0 * 1.414);
    float direction = atan(gy, gx);
    
    // Store magnitude in r, direction in g (normalized to 0-1)
    gl_FragColor = vec4(magnitude, (direction + 3.14159) / 6.28318, 0.0, 1.0);
  }
`;

// Pass 3: Non-Maximum Suppression
const nonMaxSuppressionFragmentShader = `
  precision mediump float;
  uniform sampler2D u_image;
  uniform vec2 u_resolution;
  varying vec2 v_texCoord;
  
  void main() {
    vec2 onePixel = 1.0 / u_resolution;
    vec4 current = texture2D(u_image, v_texCoord);
    float magnitude = current.r;
    float direction = current.g * 6.28318 - 3.14159; // Denormalize
    
    // Round direction to nearest 45 degrees
    float angle = mod(direction + 3.14159, 3.14159);
    vec2 offset;
    
    if (angle < 0.3927 || angle > 2.7489) {
      // 0 degrees - horizontal
      offset = vec2(onePixel.x, 0.0);
    } else if (angle < 1.1781) {
      // 45 degrees
      offset = vec2(onePixel.x, onePixel.y);
    } else if (angle < 1.9635) {
      // 90 degrees - vertical
      offset = vec2(0.0, onePixel.y);
    } else {
      // 135 degrees
      offset = vec2(-onePixel.x, onePixel.y);
    }
    
    float neighbor1 = texture2D(u_image, v_texCoord + offset).r;
    float neighbor2 = texture2D(u_image, v_texCoord - offset).r;
    
    // Keep only if local maximum
    float result = (magnitude >= neighbor1 && magnitude >= neighbor2) ? magnitude : 0.0;
    
    gl_FragColor = vec4(result, result, result, 1.0);
  }
`;

// Pass 4: Double Threshold (simplified - no hysteresis in this version)
const thresholdFragmentShader = `
  precision mediump float;
  uniform sampler2D u_image;
  uniform float u_lowThreshold;
  uniform float u_highThreshold;
  varying vec2 v_texCoord;
  
  void main() {
    float intensity = texture2D(u_image, v_texCoord).r;
    
    float result = 0.0;
    if (intensity > u_highThreshold) {
      result = 1.0; // Strong edge
    } else if (intensity > u_lowThreshold) {
      result = 0.5; // Weak edge (would need hysteresis for proper Canny)
    }
    
    gl_FragColor = vec4(result, result, result, 1.0);
  }
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  
  return shader;
}

function createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram | null {
  const program = gl.createProgram();
  if (!program) return null;
  
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  
  return program;
}

function initWebGL(
  gl: WebGLRenderingContext,
  programsRef: React.MutableRefObject<WebGLPrograms>,
  framebuffersRef: React.MutableRefObject<WebGLFramebuffers>,
  texturesRef: React.MutableRefObject<WebGLTextures>
) {
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

  const texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    0, 1,  1, 1,  0, 0,
    0, 0,  1, 1,  1, 0,
  ]), gl.STATIC_DRAW);

  // Create textures for each pass
  texturesRef.current.input = createTexture(gl);
  texturesRef.current.blur = createTexture(gl);
  texturesRef.current.gradient = createTexture(gl);
  texturesRef.current.nonMax = createTexture(gl);

  // Create framebuffers
  framebuffersRef.current.blur = createFramebuffer(gl, texturesRef.current.blur);
  framebuffersRef.current.gradient = createFramebuffer(gl, texturesRef.current.gradient);
  framebuffersRef.current.nonMax = createFramebuffer(gl, texturesRef.current.nonMax);
}

function createTexture(gl: WebGLRenderingContext): WebGLTexture | null {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  return texture;
}

function createFramebuffer(gl: WebGLRenderingContext, texture: WebGLTexture | null): WebGLFramebuffer | null {
  const framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  return framebuffer;
}

function processFrame(
  gl: WebGLRenderingContext,
  video: HTMLVideoElement,
  programs: WebGLPrograms,
  framebuffers: WebGLFramebuffers,
  textures: WebGLTextures,
  lowThreshold: number,
  highThreshold: number
) {
  const width = video.videoWidth;
  const height = video.videoHeight;

  // Upload video frame to input texture
  gl.bindTexture(gl.TEXTURE_2D, textures.input);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);

  // Pass 1: Gaussian Blur
  renderPass(gl, programs.blur, framebuffers.blur, textures.input, width, height, {
    u_resolution: [width, height]
  });

  // Pass 2: Gradient
  renderPass(gl, programs.gradient, framebuffers.gradient, textures.blur, width, height, {
    u_resolution: [width, height]
  });

  // Pass 3: Non-Maximum Suppression
  renderPass(gl, programs.nonMax, framebuffers.nonMax, textures.gradient, width, height, {
    u_resolution: [width, height]
  });

  // Pass 4: Threshold (render to screen)
  renderPass(gl, programs.threshold, null, textures.nonMax, width, height, {
    u_lowThreshold: lowThreshold,
    u_highThreshold: highThreshold
  });
}

function renderPass(
  gl: WebGLRenderingContext,
  program: WebGLProgram | null | undefined,
  framebuffer: WebGLFramebuffer | null | undefined,
  inputTexture: WebGLTexture | null | undefined,
  width: number,
  height: number,
  uniforms: Record<string, UniformValue>
) {
  if (!program || !inputTexture) return;
  
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer || null);
  gl.viewport(0, 0, width, height);
  
  gl.useProgram(program);

  // Set up attributes
  const positionLocation = gl.getAttribLocation(program, 'a_position');
  const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');

  gl.enableVertexAttribArray(positionLocation);
  gl.enableVertexAttribArray(texCoordLocation);

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

function cleanupWebGL(
  gl: WebGLRenderingContext,
  programs: WebGLPrograms,
  framebuffers: WebGLFramebuffers,
  textures: WebGLTextures
) {
  // Clean up programs
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