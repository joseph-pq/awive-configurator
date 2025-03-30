import React, { useState, useContext } from "react";
import { ImagesContext } from "./ImagesContext";
import { Stage, Layer, Image as KonvaImage } from "react-konva";
import { Button, Box, Typography, Slider, Container } from "@mui/material";
import RotateRightIcon from "@mui/icons-material/RotateRight";

export default function RotationView({
  handleNext: handleNextRoot,
  handlePrev,
}) {
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const { image1, imageConfig } = useContext(ImagesContext);
  const updateScale = (rot) => {
    setRotation(rot);
    const radians = (Math.PI / 180) * rot;
    const sin = Math.abs(Math.sin(radians));
    const cos = Math.abs(Math.cos(radians));

    const frameWidth = imageConfig.naturalWidth;
    const frameHeight = imageConfig.naturalHeight;

    const boundingBoxWidth = frameWidth * cos + frameHeight * sin;
    const boundingBoxHeight = frameWidth * sin + frameHeight * cos;

    const scaleX = frameWidth / boundingBoxWidth;
    const scaleY = frameHeight / boundingBoxHeight;

    setScale(Math.min(scaleX, scaleY));
  };

  return (
    <Container sx={{ textAlign: "center", mt: 4 }}>
      <Box sx={{ flexGrow: 1 }}>
        <Button variant="contained" onClick={handlePrev} sx={{ mx: 1 }}>
          Previous
        </Button>
      </Box>

      <Box mt={3} sx={{ display: "flex", justifyContent: "center" }}>
        {image1 && imageConfig.width > 0 && imageConfig.height > 0 && (
          <Stage width={imageConfig.width} height={imageConfig.height}>
            <Layer>
              <KonvaImage
                image={image1}
                x={imageConfig.width / 2}
                y={imageConfig.height / 2}
                width={imageConfig.width}
                height={imageConfig.height}
                rotation={rotation}
                offsetX={imageConfig.width / 2}
                offsetY={imageConfig.height / 2}
                scaleX={scale}
                scaleY={scale}
              />
            </Layer>
          </Stage>
        )}
      </Box>

      <Box sx={{ mt: 2, width: 300, mx: "auto" }}>
        <Typography gutterBottom>Rotation</Typography>
        <Slider
          value={rotation}
          onChange={(e, newValue) => {
            updateScale(newValue);
          }}
          min={0}
          max={360}
          step={1}
          aria-labelledby="rotation-slider"
        />
      </Box>

      <Box mt={2}>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<RotateRightIcon />}
          onClick={() => updateScale((rotation + 90) % 360)}
          sx={{ mx: 1 }}
        >
          Rotate 90°
        </Button>
      </Box>
    </Container>
  );
}
