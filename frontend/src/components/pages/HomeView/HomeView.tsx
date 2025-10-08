import React, { useContext, useEffect, useCallback } from "react";
import { ImageControls } from "../../features/ImageControls/ImageControls";
import { Container } from "@mui/material";
import { ImagesContext } from "../../../contexts/images";
import { ImageViewer } from "../../shared/ImageViewer/ImageViewer";
import { UploadButton } from "../../shared/UploadButton/UploadButton";
import { useImageUpload } from "../../../hooks/useImageUpload";
import { computeImageDimensions } from "../../../hooks/useImageScaling";
import { TabComponentProps } from "../../../types/tabs";

export const HomeView: React.FC<TabComponentProps> = ({
  handleNext: handleNextRoot,
}) => {
  const context = useContext(ImagesContext);
  if (!context) {
    throw new Error("ImagesContext must be used within an ImagesProvider");
  }
  const { imageOriginal: image, session, setSession } = context;

  const computeImageDimensionsCB = useCallback(computeImageDimensions, []);
  const { handleImageUpload } = useImageUpload(session);

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

    const newHomeView = computeImageDimensionsCB(
      image.naturalWidth,
      image.naturalHeight,
    );
    setSession({ ...session, homeView: newHomeView });
  }, [image, computeImageDimensionsCB]);

  return (
    <Container sx={{ textAlign: "center", mt: 4 }}>
      <ImageControls
        rotation={0}
        onRotationChange={null}
        onRotate90={null}
        onPrevious={null}
        onNext={handleNext}
      />
      <ImageViewer image={image} imageConfig={session.homeView} />
      <UploadButton onFileSelect={handleImageUpload} />
    </Container>
  );
};
