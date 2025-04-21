import React, { useContext, useEffect } from "react";
import { Stage, Layer, Image as KonvaImage } from "react-konva";
import { Button, Box, Container } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { ImagesContext } from "./ImagesContext";

interface HomeViewProps {
  handleNext: () => void;
}

export default function HomeView({
  handleNext: handleNextRoot,
}: HomeViewProps) {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const context = useContext(ImagesContext);
  if (!context) {
    throw new Error("ImagesContext must be used within an ImagesProvider");
  }
  const {
    image,
    setImageSrc,
    imageSrc,
    imageConfig,
    setImageConfig,
  } = context;

  const handleNext = () => {
    // check image is uploaded
    if (!imageSrc) {
      alert("Please upload an image");
      return;
    }
    handleNextRoot();
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newImageConfig = { ...imageConfig };
    const files = e.target.files;
    if (!files || files.length === 0) return; // bail if null or empty
    const file = files[0];
    newImageConfig.file = file;
    setImageConfig(newImageConfig);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImageSrc(result);
      };
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
            ...imageConfig,
            width: 1024,
            height: (1024 / width) * height,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
          });
        } else {
          setImageConfig({
            ...imageConfig,
            width: (768 / height) * width,
            height: 768,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
          });
        }
      } else {
        setImageConfig({
          ...imageConfig,
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
      <Button variant="contained" onClick={handleNext} sx={{ mx: 1 }}>
        Next
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
        onClick={() => fileInputRef.current?.click()}
      >
        Upload Image
      </Button>
    </Container>
  );
}
