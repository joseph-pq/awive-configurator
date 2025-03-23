import React, { useState, useRef, useContext} from "react";
import { Stage, Layer, Image as KonvaImage, Circle } from "react-konva";

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
import {ImagesContext} from "./ImagesContext";

export default function HomeView() {
  const fileInputRef = useRef(null);
  const { image, setImageSrc } = useContext(ImagesContext);


  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImageSrc(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <Container sx={{ textAlign: "center", mt: 4 }}>
      {/* Upload Button */}
      <input
        type="file"
        accept="image/*"
        hidden
        ref={fileInputRef}
        onChange={handleImageUpload}
      />
      <Button
        variant="contained"
        component="span"
        startIcon={<CloudUploadIcon />}
        onClick={() => fileInputRef.current.click()}
      >
        Upload Image
      </Button>

      <Box mt={3} sx={{ display: "flex", justifyContent: "center" }}>
        {image && (
          <Stage width={500} height={500} >
            <Layer>
              <KonvaImage
                image={image}
                x={250} // Center X (Stage width / 2)
                y={250} // Center Y (Stage height / 2)
                width={500}
                height={500}
                offsetX={250} // Rotate around center X
                offsetY={250} // Rotate around center Y
              />
            </Layer>
          </Stage>
        )}
      </Box>
    </Container>
  );
}
