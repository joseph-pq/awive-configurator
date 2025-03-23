import React, { useState, useRef, useContext, useEffect } from "react";
import { Stage, Layer, Image as KonvaImage } from "react-konva";
import { Button, Box, Container } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { ImagesContext } from "./ImagesContext";

export default function HomeView() {
  const fileInputRef = useRef(null);
  const { image, setImageSrc, imageSrc, imageConfig, setImageConfig } =
    useContext(ImagesContext);

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImageSrc(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Update image configuration when imageSrc changes
  useEffect(() => {
    if (!imageSrc) return;

    const img = new window.Image();
    img.src = imageSrc;
    img.onload = () => {
      // max width is 1024px and max height is 768px. Scale image to fit
      // the most restrictive dimension
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      if (width > 1024 || height > 768) {
        if (width / 1024 > height / 768) {
          setImageConfig({
            width: 1024,
            height: (1024 / width) * height,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
          });
        } else {
          setImageConfig({
            width: (768 / height) * width,
            height: 768,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
          });
        }
      } else {
        setImageConfig({
          width: width,
          height: height,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
        });
      }
    };
  }, [imageSrc, setImageConfig]);

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
        {image && imageConfig.width > 0 && imageConfig.height > 0 && (
          <Stage width={imageConfig.width} height={imageConfig.height}>
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
            </Layer>
          </Stage>
        )}
      </Box>
    </Container>
  );
}
