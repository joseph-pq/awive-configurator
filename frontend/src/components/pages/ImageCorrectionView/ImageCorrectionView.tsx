import React, { useContext, useEffect, useCallback, useState } from "react";
import { ImageControls } from "../../features/ImageControls/ImageControls";
import { Container, Select, MenuItem } from "@mui/material";
import { ImagesContext } from "../../../contexts/images";
import { ImageViewer } from "../../shared/ImageViewer/ImageViewer";
import { useImageUpload } from "../../../hooks/useImageUpload";
import { computeImageDimensions } from "../../../hooks/useImageScaling";
import { TabComponentProps } from "../../../types/tabs";

export const ImageCorrectionView: React.FC<TabComponentProps> = ({
  handleNext: handleNextRoot,
  handlePrev,
}) => {
  const [selectedCamera, setSelectedCamera] = useState("cameraA");
  const context = useContext(ImagesContext);
  if (!context) {
    throw new Error("ImagesContext must be used within an ImagesProvider");
  }
  const { imageOriginal: image, session, setSession } = context;

  const handleNext = () => {
    if (!image) {
      alert("Please upload an image");
      return;
    }
    setSession({
      ...session,
      cameraModel: selectedCamera,
    });
    handleNextRoot();
  };

  return (
    <Container sx={{ textAlign: "center", mt: 4 }}>
      <Select
        value={selectedCamera}
        onChange={(event) => setSelectedCamera(event.target.value)}
        sx={{ mb: 2 }}
      >
        <MenuItem value="cameraA">Camera Model A</MenuItem>
      </Select>
      <ImageControls
        rotation={0}
        onRotationChange={null}
        onRotate90={null}
        onPrevious={handlePrev}
        onNext={handleNext}
      />
      <ImageViewer image={image} imageConfig={session.homeView} />
    </Container>
  );
};
