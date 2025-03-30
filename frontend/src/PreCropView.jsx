import React, { useState, useContext, useRef } from "react";
import { ImagesContext } from "./ImagesContext";
import { Stage, Layer, Image as KonvaImage, Rect } from "react-konva";
import { Button, Box, Typography, Slider, Container } from "@mui/material";

export default function RotationView({
  handleNext: handleNextRoot,
  handlePrev,
}) {
  const { image1, imageConfig, setImageConfig } = useContext(ImagesContext);
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
    // check preCrop was set in imageConfig
    if (imageConfig.preCrop) {
      // check if crop area is valid
      if (cropArea.width <= 0 || cropArea.height <= 0) {
        alert("Please define a valid crop area.");
        return;
      }
      const xNatural = cropArea.x / imageConfig.width1 * imageConfig.naturalWidth1;
      const yNatural = cropArea.y / imageConfig.height1 * imageConfig.naturalHeight1;
      const widthNatural = cropArea.width / imageConfig.width1 * imageConfig.naturalWidth1;
      const heightNatural = cropArea.height / imageConfig.height1 * imageConfig.naturalHeight1;
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
      console.log("widthLength", widthLength);
      console.log("heightLength", heightLength);

      setImageConfig({
        ...imageConfig,
        preCrop: {
          x: cropArea.x,
          y: cropArea.y,
          width: cropArea.width,
          height: cropArea.height,
          xNatural: xNatural,
          yNatural: yNatural,
          widthNatural: widthNatural,
          heightNatural: heightNatural,
          widthLengthNatural: widthLengthNatural,
          heightLengthNatural: heightLengthNatural,
          widthLength: widthLength,
          heightLength: heightLength,
        },
      });
    } else {
      alert("Please define a valid crop area.");
      return;
    }
    handleNextRoot();
  };

  const handleMouseDown = (e) => {
    // Get mouse position relative to the stage
    const pos = e.target.getStage().getPointerPosition();
    setIsDrawing(true);
    startPoint.current = { x: pos.x, y: pos.y };

    // Initialize crop area
    setCropArea({
      x: pos.x,
      y: pos.y,
      width: 0,
      height: 0,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;

    // Get mouse position relative to the stage
    const pos = e.target.getStage().getPointerPosition();

    // Calculate new width and height
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

      // Ensure positive width and height (in case user drags from right to left or bottom to top)
      const normalizedCropArea = {
        x: cropArea.width >= 0 ? cropArea.x : cropArea.x + cropArea.width,
        y: cropArea.height >= 0 ? cropArea.y : cropArea.y + cropArea.height,
        width: Math.abs(cropArea.width),
        height: Math.abs(cropArea.height),
      };

      setCropArea(normalizedCropArea);
      setImageConfig({
        ...imageConfig,
        preCrop: normalizedCropArea,
      });
    }
  };

  return (
    <Container sx={{ textAlign: "center", mt: 4 }}>
      <Box sx={{ flexGrow: 1, mb: 2 }}>
        <Button variant="contained" onClick={handlePrev} sx={{ mx: 1 }}>
          Previous
        </Button>
        <Button variant="contained" onClick={handleNext} sx={{ mx: 1 }}>
          Next
        </Button>
      </Box>

      <Box mt={3} sx={{ display: "flex", justifyContent: "center" }}>
        {image1 && imageConfig.width1 > 0 && imageConfig.height1 > 0 && (
          <Stage
            width={imageConfig.width1}
            height={imageConfig.height1}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{ cursor: "crosshair" }}
          >
            <Layer>
              <KonvaImage
                image={image1}
                x={imageConfig.width1 / 2}
                y={imageConfig.height1 / 2}
                width={imageConfig.width1}
                height={imageConfig.height1}
                offsetX={imageConfig.width1 / 2}
                offsetY={imageConfig.height1 / 2}
                // Apply crop only if specifically needed here
                // crop={imageConfig.cropArea}
              />
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
            </Layer>
          </Stage>
        )}
      </Box>

      {cropArea.width !== 0 && cropArea.height !== 0 && (
        <Box mt={2}>
          <Typography variant="body2">
            Crop dimensions: {Math.abs(Math.round(cropArea.width))} x{" "}
            {Math.abs(Math.round(cropArea.height))}
          </Typography>
        </Box>
      )}
    </Container>
  );
}
