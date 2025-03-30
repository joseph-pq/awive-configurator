import React, { useState, useContext } from "react";
import { ImagesContext } from "./ImagesContext";
import { Stage, Layer, Image as KonvaImage } from "react-konva";
import { Button, Box, Typography, Slider, Container } from "@mui/material";
import RotateRightIcon from "@mui/icons-material/RotateRight";

export default function RotationView({
  handleNext: handleNextRoot,
  handlePrev,
}) {
  const { image1, imageConfig } = useContext(ImagesContext);
  const handleNext = () => {handleNextRoot()};
  const cropArea = {
    x: 0,
    y: 0,
    width: imageConfig.naturalWidth1,
    height: imageConfig.naturalHeight1,
  };

  return (
    <Container sx={{ textAlign: "center", mt: 4 }}>
      <Box sx={{ flexGrow: 1 }}>
        <Button variant="contained" onClick={handlePrev} sx={{ mx: 1 }}>
          Previous
        </Button>
        <Button variant="contained" onClick={handleNext} sx={{ mx: 1 }}>
          Next
        </Button>
      </Box>

      <Box mt={3} sx={{ display: "flex", justifyContent: "center" }}>
        {image1 && imageConfig.width1 > 0 && imageConfig.height1 > 0 && (
          <Stage width={imageConfig.width1} height={imageConfig.height1}>
            <Layer>
              <KonvaImage
                image={image1}
                x={imageConfig.width1 / 2}
                y={imageConfig.height1 / 2}
                width={imageConfig.width1}
                height={imageConfig.height1}
                offsetX={imageConfig.width1 / 2}
                offsetY={imageConfig.height1 / 2}
                // crop={cropArea} // Apply crop
              />
            </Layer>
          </Stage>
        )}
      </Box>
    </Container>
  );
}
