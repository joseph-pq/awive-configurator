import React, { useContext, useState, useCallback } from "react";
import { LoadingDialog } from "../../shared/LoadingDialog/LoadingDialog";
import { computeImageDimensions } from "../../../hooks/useImageScaling";
import { API_URL } from "../../../constants/api";
import { ImageControls } from "../../features/ImageControls/ImageControls";
import { Container, Select, MenuItem } from "@mui/material";
import { ImagesContext } from "../../../contexts/images";
import { ImageViewer } from "../../shared/ImageViewer/ImageViewer";
import { TabComponentProps } from "../../../types/tabs";

export const ImageCorrectionView: React.FC<TabComponentProps> = ({
  handleNext: handleNextRoot,
  handlePrev,
}) => {
  const [selectedCamera, setSelectedCamera] = useState("cameraA");
  const context = useContext(ImagesContext);
  const [loading, setLoading] = useState<boolean>(false);
  const computeImageDimensionsCB = useCallback(computeImageDimensions, []);
  if (!context) {
    throw new Error("ImagesContext must be used within an ImagesProvider");
  }
  const { imageOriginal: image, session, setSession, setImgSrcUndistorted } = context;

  const handleNext = async () => {
    if (!image) {
      alert("Please upload an image");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("camera", selectedCamera);
      const imgResponse = await fetch(image.src);
      const imgBlob = await imgResponse.blob();
      formData.append("file", imgBlob, "image.png");
      const response = await fetch(`${API_URL}/process/undistort/`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const dims = computeImageDimensionsCB(img.width, img.height);
        setSession({
          ...session,
          undistortView: dims,
          cameraModel: selectedCamera,
        });
        setImgSrcUndistorted(imageUrl);
        handleNextRoot();
      };
      img.src = imageUrl;
    } catch (error) {
      console.error("Failed to fetch the undistorted image:", error);
      alert("An error occurred while fetching the undistorted image. Please try again.");
    }
    setLoading(false);
  };

  return (
    <>
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
      <LoadingDialog open={loading} />
    </>
  );
};
