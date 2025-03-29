import React, { useState, useRef, useContext, useEffect } from "react";
import { ImagesContext } from "./ImagesContext";
import { Stage, Layer, Image as KonvaImage, Circle } from "react-konva";

import useImage from "use-image";
import {
  Toolbar,
  AppBar,
  Button,
  Box,
  Typography,
  Slider,
  Container,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import SaveIcon from "@mui/icons-material/Save";

export default function RotationView({
  handleNext: handleNextRoot,
  handlePrev,
}) {
  const [rotation, setRotation] = useState(0);
  const { image, setImageSrc, imageSrc, imageConfig, setImageConfig } =
    useContext(ImagesContext);
  const handleNext = () => {
    handleNextRoot();
  }

  return (
    <Container sx={{ textAlign: "center", mt: 4 }}>
      <Box sx={{ flexGrow: 1 }}>
        <Button variant="contained" onClick={handlePrev} sx={{ mx: 1 }}>
          Previous
        </Button>
        {/* <Button variant="contained" onClick={handleNext} sx={{ mx: 1 }}> */}
        {/*   Next */}
        {/* </Button> */}
      </Box>

      <Box mt={3} sx={{ display: "flex", justifyContent: "center" }}>
        {image && imageConfig.width > 0 && imageConfig.height > 0 && (
          <Stage width={imageConfig.width} height={imageConfig.height}>
            <Layer>
              <KonvaImage
                image={image}
                x={imageConfig.width / 2}
                y={imageConfig.height / 2}
                width={imageConfig.width}
                height={imageConfig.height}
                rotation={rotation}
                offsetX={imageConfig.width / 2}
                offsetY={imageConfig.height / 2}
              />
            </Layer>
          </Stage>
        )}
      </Box>

      {/* Rotation Slider */}
      <Box sx={{ mt: 2, width: 300, mx: "auto" }}>
        <Typography gutterBottom>Rotation</Typography>
        <Slider
          value={rotation}
          onChange={(e, newValue) => setRotation(newValue)}
          min={0}
          max={360}
          step={1}
          aria-labelledby="rotation-slider"
        />
      </Box>

      {/* Action Buttons */}
      <Box mt={2}>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<RotateRightIcon />}
          onClick={() => setRotation(rotation + 90)}
          sx={{ mx: 1 }}
        >
          Rotate 90°
        </Button>
      </Box>
    </Container>
  );
}
