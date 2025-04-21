import React, { useState, useContext } from "react";
import { ImagesContext } from "../../contexts/images";
import { ImageControls } from "../../components/features/ImageControls/ImageControls";
import {  Box, Container } from "@mui/material";
import { Stage, Layer, Image as KonvaImage } from "react-konva";

interface RotationViewProps {
  handlePrev: () => void;
}

export const RotationView: React.FC<RotationViewProps> = ({ handlePrev }) => {
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const context = useContext(ImagesContext);
  if (!context) {
    throw new Error("ImagesContext must be used within an ImagesProvider");
  }
  const { image1, imageConfig } = context;

  const updateScale = (rot: number) => {
    setRotation(rot);
    const radians = (Math.PI / 180) * rot;
    const sin = Math.abs(Math.sin(radians));
    const cos = Math.abs(Math.cos(radians));

    const frameWidth = imageConfig.preCrop.widthLengthNatural;
    const frameHeight = imageConfig.preCrop.heightLengthNatural;

    const boundingBoxWidth = frameWidth * cos + frameHeight * sin;
    const boundingBoxHeight = frameWidth * sin + frameHeight * cos;

    const scaleX = frameWidth / boundingBoxWidth;
    const scaleY = frameHeight / boundingBoxHeight;

    setScale(Math.min(scaleX, scaleY));
  };

  if (!image1) {
    return null;
  }

  return (
    <>
      <ImageControls
        rotation={rotation}
        onRotationChange={updateScale}
        onRotate90={() => updateScale((rotation + 90) % 360)}
        onPrevious={handlePrev}
        onNext={null}
      />
      <Box mt={3} sx={{ display: "flex", justifyContent: "center" }}>
        {image1 &&
          imageConfig.preCrop.widthLength > 0 &&
          imageConfig.preCrop.heightLength > 0 && (
            <Stage
              width={imageConfig.preCrop.widthLength}
              height={imageConfig.preCrop.heightLength}
            >
              <Layer>
                <KonvaImage
                  image={image1}
                  x={imageConfig.preCrop.widthLength / 2}
                  y={imageConfig.preCrop.heightLength / 2}
                  width={imageConfig.preCrop.widthLength}
                  height={imageConfig.preCrop.heightLength}
                  rotation={rotation}
                  offsetX={imageConfig.preCrop.widthLength / 2}
                  offsetY={imageConfig.preCrop.heightLength / 2}
                  scaleX={scale}
                  scaleY={scale}
                  crop={{
                    x: imageConfig.preCrop.xNatural,
                    y: imageConfig.preCrop.yNatural,
                    width: imageConfig.preCrop.widthNatural,
                    height: imageConfig.preCrop.heightNatural,
                  }}
                />
              </Layer>
            </Stage>
          )}
      </Box>
    </>
  );
};
