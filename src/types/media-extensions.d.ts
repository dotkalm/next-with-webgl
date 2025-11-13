declare global {
  interface MediaTrackCapabilities {
    zoom?: {
      max: number;
      min: number;
      step?: number;
    };
  }
  
  interface MediaTrackConstraintSet {
    zoom?: ConstrainDouble;
  }
}

export {};