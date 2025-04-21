import { useCallback } from 'react';
import { ImageConfig } from '../types/image';
import { ImagesContext } from '../contexts/images';
import { useContext } from 'react';

export const useImageUpload = (initialConfig: ImageConfig) => {
  const context = useContext(ImagesContext);
  if (!context) {
    throw new Error("ImagesContext must be used within an ImagesProvider");
  }
  const { setImageSrc, setImageConfig } = context;

  const handleImageUpload = useCallback((file: File) => {
    const newImageConfig = { ...initialConfig, file };
    setImageConfig(newImageConfig);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImageSrc(result);
    };
    reader.readAsDataURL(file);
  }, [initialConfig, setImageConfig, setImageSrc]);

  return {
    handleImageUpload
  };
};
