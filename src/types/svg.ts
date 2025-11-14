export interface Point {
  x: number;
  y: number;
  intensity?: number;
}

export interface EdgePath {
  points: Point[];
  intensity: number;
  intensities?: number[];
}

export interface SVGGenerationOptions {
  threshold?: number;
  minPathLength?: number;
  simplification?: number;
  strokeWidth?: number;
  strokeColor?: string;
}
