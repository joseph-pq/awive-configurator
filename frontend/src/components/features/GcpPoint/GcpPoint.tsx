import React from "react";
import { Circle } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";
import { GcpPoint as GcpPointType } from "../../../types/gcp";

interface GcpPointProps {
  point: GcpPointType;
  index: string;
  onDragMove: (e: KonvaEventObject<DragEvent>, index: string) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onContextMenu: (e: KonvaEventObject<PointerEvent>, index: string) => void;
}

export const GcpPoint: React.FC<GcpPointProps> = ({
  point,
  index,
  onDragMove,
  onDragStart,
  onDragEnd,
  onContextMenu,
}) => {
  return (
    <Circle
      x={point.x}
      y={point.y}
      radius={5}
      fill="red"
      draggable
      onDragMove={(e) => onDragMove(e, index)}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onContextMenu={(e) => onContextMenu(e, index)}
    />
  );
};
