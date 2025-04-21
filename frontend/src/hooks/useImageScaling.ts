import { useCallback } from 'react';
import { ImageConfig } from '../types/image';
import { MAX_IMAGE_WIDTH, MAX_IMAGE_HEIGHT } from '../constants/image';

export const useImageScaling = () => {
  const calculateImageDimensions = useCallback((naturalWidth: number, naturalHeight: number): Partial<ImageConfig> => {
    if (naturalWidth > MAX_IMAGE_WIDTH || naturalHeight > MAX_IMAGE_HEIGHT) {
      if (naturalWidth / MAX_IMAGE_WIDTH > naturalHeight / MAX_IMAGE_HEIGHT) {
        return {
          width: MAX_IMAGE_WIDTH,
          height: (MAX_IMAGE_WIDTH / naturalWidth) * naturalHeight,
          naturalWidth,
          naturalHeight,
        };
      } else {
        return {
          width: (MAX_IMAGE_HEIGHT / naturalHeight) * naturalWidth,
          height: MAX_IMAGE_HEIGHT,
          naturalWidth,
          naturalHeight,
        };
      }
    } else {
      return {
        width: naturalWidth,
        height: naturalHeight,
        naturalWidth,
        naturalHeight,
      };
    }
  }, []);

  return { calculateImageDimensions };
}; 