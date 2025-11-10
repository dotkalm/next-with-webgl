import { TEdgeFrame } from '../../src/types/webgl';

/**
 * Draws a circle outline on an edge frame
 */
export function createCircleEdgeFrame(
  centerX: number,
  centerY: number,
  radius: number,
  width: number = 320,
  height: number = 240
): TEdgeFrame {
  const data = new Uint8Array(width * height * 4);
  
  // Fill with black (no edges)
  data.fill(0);
  
  // Draw circle using midpoint circle algorithm
  let x = 0;
  let y = radius;
  let d = 1 - radius;
  
  const setPixel = (px: number, py: number) => {
    if (px >= 0 && px < width && py >= 0 && py < height) {
      const index = (py * width + px) * 4;
      data[index] = 255;     // R
      data[index + 1] = 255; // G
      data[index + 2] = 255; // B
      data[index + 3] = 255; // A
    }
  };
  
  const drawCirclePoints = (cx: number, cy: number, x: number, y: number) => {
    setPixel(cx + x, cy + y);
    setPixel(cx - x, cy + y);
    setPixel(cx + x, cy - y);
    setPixel(cx - x, cy - y);
    setPixel(cx + y, cy + x);
    setPixel(cx - y, cy + x);
    setPixel(cx + y, cy - x);
    setPixel(cx - y, cy - x);
  };
  
  while (x <= y) {
    drawCirclePoints(centerX, centerY, x, y);
    
    if (d < 0) {
      d += 2 * x + 3;
    } else {
      d += 2 * (x - y) + 5;
      y--;
    }
    x++;
  }
  
  return {
    data,
    width,
    height,
    description: `Circle at (${centerX}, ${centerY}) with radius ${radius}`
  };
}

/**
 * Draws an ellipse outline
 */
export function createEllipseEdgeFrame(
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
  width: number = 320,
  height: number = 240
): TEdgeFrame {
  const data = new Uint8Array(width * height * 4);
  data.fill(0);
  
  const setPixel = (px: number, py: number) => {
    if (px >= 0 && px < width && py >= 0 && py < height) {
      const index = (py * width + px) * 4;
      data[index] = 255;
      data[index + 1] = 255;
      data[index + 2] = 255;
      data[index + 3] = 255;
    }
  };
  
  // Ellipse using parametric form
  const steps = 360;
  for (let i = 0; i < steps; i++) {
    const angle = (i / steps) * 2 * Math.PI;
    const x = Math.round(centerX + radiusX * Math.cos(angle));
    const y = Math.round(centerY + radiusY * Math.sin(angle));
    setPixel(x, y);
  }
  
  return {
    data,
    width,
    height,
    description: `Ellipse at (${centerX}, ${centerY}) with radii (${radiusX}, ${radiusY})`
  };
}

/**
 * Draws a rectangle outline
 */
export function createRectangleEdgeFrame(
  x: number,
  y: number,
  rectWidth: number,
  rectHeight: number,
  width: number = 320,
  height: number = 240
): TEdgeFrame {
  const data = new Uint8Array(width * height * 4);
  data.fill(0);
  
  const setPixel = (px: number, py: number) => {
    if (px >= 0 && px < width && py >= 0 && py < height) {
      const index = (py * width + px) * 4;
      data[index] = 255;
      data[index + 1] = 255;
      data[index + 2] = 255;
      data[index + 3] = 255;
    }
  };
  
  // Top and bottom edges
  for (let i = x; i < x + rectWidth; i++) {
    setPixel(i, y);
    setPixel(i, y + rectHeight - 1);
  }
  
  // Left and right edges
  for (let i = y; i < y + rectHeight; i++) {
    setPixel(x, i);
    setPixel(x + rectWidth - 1, i);
  }
  
  return {
    data,
    width,
    height,
    description: `Rectangle at (${x}, ${y}) with size ${rectWidth}x${rectHeight}`
  };
}

/**
 * Creates a frame with multiple shapes
 */
export function createMultiShapeFrame(width: number = 320, height: number = 240): TEdgeFrame {
  const data = new Uint8Array(width * height * 4);
  data.fill(0);
  
  // Combine multiple fixtures
  const circle = createCircleEdgeFrame(80, 120, 40, width, height);
  const rectangle = createRectangleEdgeFrame(160, 80, 60, 80, width, height);
  
  // Merge the data
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.max(circle.data[i], rectangle.data[i]);
  }
  
  return {
    data,
    width,
    height,
    description: 'Frame with circle and rectangle'
  };
}

/**
 * Creates an empty frame (no edges)
 */
export function createEmptyFrame(width: number = 320, height: number = 240): TEdgeFrame {
  return {
    data: new Uint8Array(width * height * 4),
    width,
    height,
    description: 'Empty frame with no edges'
  };
}

/**
 * Adds noise to a frame
 */
export function addNoise(frame: TEdgeFrame, noiseLevel: number = 0.05): TEdgeFrame {
  const noisyData = new Uint8Array(frame.data);
  
  for (let i = 0; i < noisyData.length; i += 4) {
    if (Math.random() < noiseLevel) {
      noisyData[i] = 255;
      noisyData[i + 1] = 255;
      noisyData[i + 2] = 255;
      noisyData[i + 3] = 255;
    }
  }
  
  return {
    ...frame,
    data: noisyData,
    description: `${frame.description} (with ${noiseLevel * 100}% noise)`
  };
}