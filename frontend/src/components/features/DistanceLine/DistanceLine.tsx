import React from 'react';
import { Line, Circle, Text } from 'react-konva';
import { Distance as DistanceType, GcpPoint } from '../../../types/gcp';

interface DistanceLineProps {
  distance: DistanceType;
  points: Record<string, GcpPoint>;
  onClick: () => void;
}

export const DistanceLine: React.FC<DistanceLineProps> = ({ distance, points, onClick }) => {
  if (!points[distance.points[0]] || !points[distance.points[1]]) {
    return null;
  }

  const point1 = points[distance.points[0]];
  const point2 = points[distance.points[1]];
  const midpoint = {
    x: (point1.x + point2.x) / 2,
    y: (point1.y + point2.y) / 2,
  };

  return (
    <>
      <Line
        points={[point1.x, point1.y, point2.x, point2.y]}
        stroke="yellow"
        strokeWidth={4}
        onClick={onClick}
      />
      <Circle
        x={midpoint.x}
        y={midpoint.y}
        radius={20}
        fill="rgba(0, 0, 0, 0.6)"
        stroke="white"
        strokeWidth={1}
        perfectDrawEnabled={false}
        listening={false}
      />
      <Text
        x={midpoint.x - 30}
        y={midpoint.y - 10}
        text={distance.distance.toString()}
        fontSize={14}
        fontStyle="bold"
        fill="white"
        width={60}
        height={20}
        align="center"
        verticalAlign="middle"
        listening={false}
      />
    </>
  );
}; 