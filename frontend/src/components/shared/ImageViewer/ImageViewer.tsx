import React from 'react';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import { Box } from '@mui/material';
import { ImageConfig } from '../../../types/image';
import { KonvaEventObject } from 'konva/lib/Node';

interface ImageViewerProps {
  image: HTMLImageElement | null;
  imageConfig: ImageConfig;
  children?: React.ReactNode;
  onClick?: (e: KonvaEventObject<MouseEvent>) => void;
  onMouseDown?: (e: KonvaEventObject<MouseEvent>) => void;
  onMouseMove?: (e: KonvaEventObject<MouseEvent>) => void;
  onMouseUp?: () => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  image,
  imageConfig,
  children,
  onClick,
  onMouseDown,
  onMouseMove,
  onMouseUp,
}) => {
  if (!image || !imageConfig.width || !imageConfig.height) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Stage
        width={imageConfig.width}
        height={imageConfig.height}
        onClick={onClick}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
      >
        <Layer>
          <KonvaImage
            image={image}
            x={imageConfig.width / 2}
            y={imageConfig.height / 2}
            width={imageConfig.width}
            height={imageConfig.height}
            offsetX={imageConfig.width / 2}
            offsetY={imageConfig.height / 2}
          />
          {children}
        </Layer>
      </Stage>
    </Box>
  );
}; 