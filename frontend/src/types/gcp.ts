export interface GcpPoint {
  x: number;
  y: number;
  x_natural: number;
  y_natural: number;
}

export interface Distance {
  points: [number, number];
  distance: number;
}
