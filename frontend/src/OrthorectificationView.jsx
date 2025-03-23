import React, { useState, useRef, useContext } from "react";
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

export default function OrthorectificationView() {
  const [gcpPoints, setGcpPoints] = useState([]);
  const { image, imageConfig } = useContext(ImagesContext);

  // Handle GCP selection
  const handleCanvasClick = (e) => {
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    setGcpPoints([...gcpPoints, pointer]);
  };
  return (
    <Container sx={{ textAlign: "center", mt: 4 }}>
      {/* Action Buttons */}
      <Box mt={2}>
        <Button
          variant="contained"
          color="success"
          startIcon={<SaveIcon />}
          onClick={() =>
            console.log(
              "Selected GCPs:",
              gcpPoints.map((point) => ({
                x: point.x,
                y: point.y,
                x_real:
                  (point.x / imageConfig.width) * imageConfig.naturalWidth,
                y_real:
                  (point.y / imageConfig.height) * imageConfig.naturalHeight,
              })),
            )
          }
          sx={{ mx: 1 }}
        >
          Save GCPs
        </Button>
      </Box>

      <Box mt={3} sx={{ display: "flex", justifyContent: "center" }}>
        {image && (
          <Stage
            width={imageConfig.width}
            height={imageConfig.height}
            onClick={handleCanvasClick}
          >
            <Layer>
              <KonvaImage
                image={image}
                x={imageConfig.width / 2}
                y={imageConfig.height / 2}
                width={imageConfig.width}
                height={imageConfig.height}
                offsetX={imageConfig.width / 2}
                offsetY={imageConfig.height / 2}
              />
              {gcpPoints.map((point, index) => (
                <Circle
                  key={index}
                  x={point.x}
                  y={point.y}
                  radius={5}
                  fill="red"
                />
              ))}
            </Layer>
          </Stage>
        )}
      </Box>
    </Container>
  );
}
