import { useCallback } from 'react';
import { Session } from '../types/image';
import { ImagesContext } from '../contexts/images';
import { useContext } from 'react';

export const useImageUpload = (session: Session) => {
  const context = useContext(ImagesContext);
  if (!context) {
    throw new Error("ImagesContext must be used within an ImagesProvider");
  }
  const { setImgSrcOriginal: setImageSrc, setSession } = context;

  const handleImageUpload = useCallback((file: File) => {
    const newSession = { ...session, file };
    setSession(newSession);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImageSrc(result);
    };
    reader.readAsDataURL(file);
  }, [session, setSession, setImageSrc]);

  return {
    handleImageUpload
  };
};
