import { ImageView } from '../types/image';
import { MAX_IMAGE_WIDTH, MAX_IMAGE_HEIGHT } from '../constants/image';


/**
  * Compute the scaled dimensions of an image to fit within max width and
  * height while maintaining aspect ratio.
  * @param originalWidth - The original width of the image.
  * @param originalHeight - The original height of the image.
  * @returns An object containing the scaled width, scaled height,
  *          original width, and original height.
  */
export const computeImageDimensions = (
  originalWidth: number,
  originalHeight: number,
): ImageView => {
  if (originalWidth > MAX_IMAGE_WIDTH || originalHeight > MAX_IMAGE_HEIGHT) {
    if (originalWidth / MAX_IMAGE_WIDTH > originalHeight / MAX_IMAGE_HEIGHT) {
      return {
        scaledWidth: MAX_IMAGE_WIDTH,
        scaledHeight: (MAX_IMAGE_WIDTH / originalWidth) * originalHeight,
        originalWidth,
        originalHeight,
      };
    } else {
      return {
        scaledWidth: (MAX_IMAGE_HEIGHT / originalHeight) * originalWidth,
        scaledHeight: MAX_IMAGE_HEIGHT,
        originalWidth,
        originalHeight,
      };
    }
  } else {
    return {
      scaledWidth: originalWidth,
      scaledHeight: originalHeight,
      originalWidth,
      originalHeight,
    };
  }
};
