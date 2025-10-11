import React, { useState, useContext, useCallback } from "react";
import { API_URL } from "../../../constants/api";
import { ImageViewer } from "../../shared/ImageViewer/ImageViewer";
import { computeImageDimensions } from "../../../hooks/useImageScaling";
import { ImagesContext } from "../../../contexts/images";
import { ImageControls } from "../../features/ImageControls/ImageControls";
import { TabComponentProps } from "../../../types/tabs";

export const RotationView: React.FC<TabComponentProps> = ({ handlePrev, handleNext: handleNextRoot }) => {
  const context = useContext(ImagesContext);
  const computeImageDimensionsCB = useCallback(computeImageDimensions, []);
  if (!context) {
    throw new Error("ImagesContext must be used within an ImagesProvider");
  }
  const { imagePreCropped, session, setSession, setImgSrcRotated} = context;
  const [rotation, setRotation] = useState(session.rotation || 0);
  const [scale, setScale] = useState(session.rotationScale || 1);

  const updateScale = (rot: number) => {
    setRotation(rot);
    const radians = (Math.PI / 180) * rot;
    const sin = Math.abs(Math.sin(radians));
    const cos = Math.abs(Math.cos(radians));

    const frameWidth = session.preCropView.originalWidth;
    const frameHeight = session.preCropView.originalHeight;

    const boundingBoxWidth = frameWidth * cos + frameHeight * sin;
    const boundingBoxHeight = frameWidth * sin + frameHeight * cos;

    const scaleX = frameWidth / boundingBoxWidth;
    const scaleY = frameHeight / boundingBoxHeight;

    setScale(Math.min(scaleX, scaleY));
  };
  const handleNext = async () => {
    try {
      const formData = new FormData();
      if (!imagePreCropped) {
        alert("No image to process");
        return;
      }
      const imgResponse = await fetch(imagePreCropped.src);
      const imgBlob = await imgResponse.blob();
      formData.append("file", imgBlob, "preCroppedImage.png");
      const rot = -rotation
      formData.append("rotation", rot.toString());
      const response = await fetch(`${API_URL}/process/rotate/`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }
      const blob = await response.blob();
      const rotatedImageUrl = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const dims = computeImageDimensionsCB(img.width, img.height);
        setSession({ ...session, rotationView: dims, rotation, rotationScale: scale });
        setImgSrcRotated(rotatedImageUrl);
        handleNextRoot();
      };
      img.src = rotatedImageUrl;
    } catch (error) {
      console.error("Error during rotation submission:", error);
      alert("An error occurred while processing the image. Please try again.");
    }
  };

  if (!imagePreCropped) {
    return null;
  }

  return (
    <>
      <ImageControls
        rotation={rotation}
        onRotationChange={updateScale}
        onRotate90={() => updateScale((rotation + 90) % 360)}
        onPrevious={handlePrev}
        onNext={handleNext}
      />
      <ImageViewer
        image={imagePreCropped}
        imageConfig={session.preCropView}
        rotation={rotation}
        scale={scale}
      />
    </>
  );
};
