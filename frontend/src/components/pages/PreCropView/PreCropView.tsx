import React, { useState, useContext, useRef } from "react";
import { ImagesContext } from "../../../contexts/images";
import { ImageViewer } from "../../shared/ImageViewer/ImageViewer";
import { ImageControls } from "../../features/ImageControls/ImageControls";
import { Rect } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";

interface PreCropViewProps {
  handleNext: () => void;
  handlePrev: () => void;
}

export const PreCropView: React.FC<PreCropViewProps> = ({
  handleNext: handleNextRoot,
  handlePrev,
}) => {
  const context = useContext(ImagesContext);
  if (!context) {
    throw new Error("ImagesContext must be used within an ImagesProvider");
  }
  const { image1, imageConfig, setImageConfig } = context;
  const [isDrawing, setIsDrawing] = useState(false);
  const [cropArea, setCropArea] = useState({
    x: Math.min(imageConfig.preCrop.x || 0, imageConfig.preCrop.width || 0),
    y: Math.min(imageConfig.preCrop.y || 0, imageConfig.preCrop.height || 0),
    width: Math.max(imageConfig.preCrop.x || 0, imageConfig.preCrop.width || 0),
    height: Math.max(
      imageConfig.preCrop.y || 0,
      imageConfig.preCrop.height || 0,
    ),
  });
  const startPoint = useRef({ x: 0, y: 0 });

  const handleNext = () => {
    if (!imageConfig.preCrop) {
      alert("Please define a valid crop area.");
      return;
    }
    if (cropArea.width <= 0 || cropArea.height <= 0) {
      alert("Please define a valid crop area.");
      return;
    }

    const xNatural =
      (cropArea.x / imageConfig.width1) * imageConfig.naturalWidth1;
    const yNatural =
      (cropArea.y / imageConfig.height1) * imageConfig.naturalHeight1;
    const widthNatural =
      (cropArea.width / imageConfig.width1) * imageConfig.naturalWidth1;
    const heightNatural =
      (cropArea.height / imageConfig.height1) * imageConfig.naturalHeight1;
    const widthLengthNatural = widthNatural - xNatural;
    const heightLengthNatural = heightNatural - yNatural;

    let widthLength, heightLength;
    if (widthLengthNatural > 1024 || heightLengthNatural > 768) {
      if (widthLengthNatural / 1024 > heightLengthNatural / 768) {
        widthLength = 1024;
        heightLength = (1024 / widthLengthNatural) * heightLengthNatural;
      } else {
        widthLength = (768 / heightLengthNatural) * widthLengthNatural;
        heightLength = 768;
      }
    } else {
      widthLength = widthLengthNatural;
      heightLength = heightLengthNatural;
    }

    setImageConfig({
      ...imageConfig,
      preCrop: {
        ...imageConfig.preCrop,
        x: cropArea.x,
        y: cropArea.y,
        width: cropArea.width,
        height: cropArea.height,
        xNatural,
        yNatural,
        widthNatural,
        heightNatural,
        widthLengthNatural,
        heightLengthNatural,
        widthLength,
        heightLength,
      },
    });
    handleNextRoot();
  };

  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;
    setIsDrawing(true);
    startPoint.current = { x: pos.x, y: pos.y };

    setCropArea({
      x: pos.x,
      y: pos.y,
      width: 0,
      height: 0,
    });
  };

  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (!isDrawing) return;
    const stage = e.target.getStage();
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;

    const newWidth = pos.x - startPoint.current.x;
    const newHeight = pos.y - startPoint.current.y;

    setCropArea({
      x: startPoint.current.x,
      y: startPoint.current.y,
      width: newWidth,
      height: newHeight,
    });
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false);

      const normalizedCropArea = {
        x: cropArea.width >= 0 ? cropArea.x : cropArea.x + cropArea.width,
        y: cropArea.height >= 0 ? cropArea.y : cropArea.y + cropArea.height,
        width: Math.abs(cropArea.width),
        height: Math.abs(cropArea.height),
      };

      setCropArea(normalizedCropArea);
      setImageConfig({
        ...imageConfig,
        preCrop: {
          ...imageConfig.preCrop,
          x: normalizedCropArea.x,
          y: normalizedCropArea.y,
          width: normalizedCropArea.width,
          height: normalizedCropArea.height,
        },
      });
    }
  };

  if (!image1) {
    return null;
  }

  return (
    <>
      <ImageControls
        rotation={0}
        onRotationChange={null}
        onRotate90={null}
        onPrevious={handlePrev}
        onNext={handleNext}
      />
      <ImageViewer
        image={image1}
        imageConfig={{
          ...imageConfig,
          width: imageConfig.width1,
          height: imageConfig.height1,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {cropArea.width !== 0 && cropArea.height !== 0 && (
          <Rect
            x={cropArea.x}
            y={cropArea.y}
            width={cropArea.width}
            height={cropArea.height}
            stroke="white"
            strokeWidth={2}
            dash={[5, 5]}
            fill="rgba(0,0,255,0.3)"
          />
        )}
      </ImageViewer>
    </>
  );
};
