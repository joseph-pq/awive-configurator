import React from 'react';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import { Box } from '@mui/material';
import { ImageView, PreCrop } from '../../../types/image';
import { KonvaEventObject } from 'konva/lib/Node';

interface ImageViewerProps {
  image: HTMLImageElement | null;
  imageConfig: ImageView;
  children?: React.ReactNode;
  onClick?: (e: KonvaEventObject<MouseEvent>) => void;
  onMouseDown?: (e: KonvaEventObject<MouseEvent>) => void;
  onMouseMove?: (e: KonvaEventObject<MouseEvent>) => void;
  onMouseUp?: () => void;
  rotation?: number;
  scale?: number;
  crop?: PreCrop,
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  image,
  imageConfig,
  children,
  onClick,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  rotation = 0,
  scale = 1,
  crop = null,
}) => {
  if (!image || !imageConfig.scaledWidth || !imageConfig.scaledHeight) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Stage
        width={imageConfig.scaledWidth}
        height={imageConfig.scaledHeight}
        onClick={onClick}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
      >
        <Layer>
          <KonvaImage
            image={image}
            x={imageConfig.scaledWidth / 2}
            y={imageConfig.scaledHeight / 2}
            width={imageConfig.scaledWidth}
            height={imageConfig.scaledHeight}
            rotation={rotation}
            offsetX={imageConfig.scaledWidth / 2}
            offsetY={imageConfig.scaledHeight / 2}
            scaleX={scale}
            scaleY={scale}
            {...(crop
              ? {
                  crop: {
                    x: crop.x1,
                    y: crop.y1,
                    width: crop.x2 - crop.x1,
                    height: crop.y2 - crop.y1,
                  },
                }
              : {})
            }
          />
          {children}
        </Layer>
      </Stage>
    </Box>
  );
};
