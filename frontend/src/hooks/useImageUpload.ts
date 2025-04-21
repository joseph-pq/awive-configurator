import { useState, useCallback } from 'react';
import { ImageConfig } from '../types/image';

export const useImageUpload = (initialConfig: ImageConfig) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageConfig, setImageConfig] = useState<ImageConfig>(initialConfig);

  const handleImageUpload = useCallback((file: File) => {
    const newImageConfig = { ...imageConfig, file };
    setImageConfig(newImageConfig);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImageSrc(result);
    };
    reader.readAsDataURL(file);
  }, [imageConfig]);

  return {
    imageSrc,
    imageConfig,
    setImageConfig,
    handleImageUpload
  };
};
