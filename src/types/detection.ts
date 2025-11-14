// Bounding box coordinates and dimensions
export interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  height: number;
}

export interface Detection {
  class: string;
  confidence: number;
  bbox: BoundingBox;
}

export interface CarDetection {
  car_id: number;
  car: Detection;
  wheels: Detection[];
  wheel_count: number;
}

export interface CarDetectionResponse {
  filename: string;
  width: number;
  height: number;
  total_cars: number;
  detections: CarDetection[];
}