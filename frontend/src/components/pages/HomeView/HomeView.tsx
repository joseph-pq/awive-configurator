import React, { useContext, useEffect } from "react";
import { ImageControls } from "../../features/ImageControls/ImageControls";
import { Container } from "@mui/material";
import { ImagesContext } from "../../../contexts/images";
import { ImageViewer } from "../../shared/ImageViewer/ImageViewer";
import { UploadButton } from "../../shared/UploadButton/UploadButton";
import { useImageUpload } from "../../../hooks/useImageUpload";
import { useImageScaling } from "../../../hooks/useImageScaling";
import { TabComponentProps } from "../../../types/tabs";

export const HomeView: React.FC<TabComponentProps> = ({
  handleNext: handleNextRoot,
}) => {
  const context = useContext(ImagesContext);
  if (!context) {
    throw new Error("ImagesContext must be used within an ImagesProvider");
  }
  const { image, imageConfig, setImageConfig } = context;

  const { calculateImageDimensions } = useImageScaling();
  const { handleImageUpload } = useImageUpload(imageConfig);

  const handleNext = () => {
    if (!image) {
      alert("Please upload an image");
      return;
    }
    handleNextRoot();
  };

  // Update image configuration when imageSrc changes
  useEffect(() => {
    if (!image) return;

    const dimensions = calculateImageDimensions(
      image.naturalWidth,
      image.naturalHeight,
    );
    setImageConfig({ ...imageConfig, ...dimensions });
  }, [image, setImageConfig, calculateImageDimensions]);

  return (
    <Container sx={{ textAlign: "center", mt: 4 }}>
      <ImageControls
        rotation={0}
        onRotationChange={null}
        onRotate90={null}
        onPrevious={null}
        onNext={handleNext}
      />
      <ImageViewer image={image} imageConfig={imageConfig} />
      <UploadButton onFileSelect={handleImageUpload} />
    </Container>
  );
};
