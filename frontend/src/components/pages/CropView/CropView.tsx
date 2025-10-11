import React, { useState, useContext, useCallback } from "react";
import { LoadingDialog } from "../../shared/LoadingDialog/LoadingDialog";
import { computeImageDimensions } from "../../../hooks/useImageScaling";
import { API_URL } from "../../../constants/api";
import { ImagesContext } from "../../../contexts/images";
import { ImageViewer } from "../../shared/ImageViewer/ImageViewer";
import { ImageControls } from "../../features/ImageControls/ImageControls";
import { Rect } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";
import { TabComponentProps } from "../../../types/tabs";


export const CropView: React.FC<TabComponentProps> = ({
  handleNext: handleNextRoot,
  handlePrev,
}) => {
  const context = useContext(ImagesContext);
  if (!context) {
    throw new Error("ImagesContext must be used within an ImagesProvider");
  }
  const { imageRotated, session, setSession, setImgSrcCropped } = context;
  const toOriginalWidth = useCallback((width: number) => (width / session.rotationView.scaledWidth) * session.rotationView.originalWidth, [session.rotationView]);
  const [loading, setLoading] = useState<boolean>(false);
  const computeImageDimensionsCB = useCallback(computeImageDimensions, []);
  const toOriginalHeight = useCallback((height: number) => (height / session.rotationView.scaledHeight) * session.rotationView.originalHeight, [session.rotationView]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [cropArea, setCropArea] = useState({
    x1: Math.min(session.crop.x1 || 0, session.crop.x2 || 0),
    y1: Math.min(session.crop.y1 || 0, session.crop.y2 || 0),
    x2: Math.max(session.crop.x1 || 0, session.crop.x2 || 0),
    y2: Math.max(session.crop.y1 || 0, session.crop.y2 || 0),
  });

  const handleNext = async () => {
    if (!session.preCrop) {
      alert("Please define a valid crop area.");
      return;
    }
    if (cropArea.x2 - cropArea.x1 <= 0 || cropArea.y2 - cropArea.y1 <= 0) {
      alert("Please define a valid crop area.");
      return;
    }

    const x1Natural = toOriginalWidth(cropArea.x1);
    const y1Natural = toOriginalHeight(cropArea.y1);
    const x2Natural = toOriginalWidth(cropArea.x2);
    const y2Natural = toOriginalHeight(cropArea.y2);

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("x1", x1Natural.toString());
      formData.append("y1", y1Natural.toString());
      formData.append("x2", x2Natural.toString());
      formData.append("y2", y2Natural.toString());
      // Given imageRotated is an HTMLImageElement, we need to convert it to a Blob
      if (!imageRotated) {
        throw new Error("No orthorectified image available");
      }
      const imgResponse = await fetch(imageRotated.src);
      const imgBlob = await imgResponse.blob();
      formData.append("file", imgBlob, "rotated_image.png");

      const response = await fetch(`${API_URL}/process/crop/`, {
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
					cropView: dims,
					crop: {
						x1: cropArea.x1,
						y1: cropArea.y1,
						x2: cropArea.x2,
						y2: cropArea.y2,
						x1Natural,
						y1Natural,
						x2Natural,
						y2Natural,
					},
				});
        setImgSrcCropped(imageUrl);
        handleNextRoot();
      };
      img.src = imageUrl;

    } catch (error) {
      console.error("Error during fetch:", error);
      alert("An error occurred while processing the request.");
    }
    setLoading(false);
  };

  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;
    setIsDrawing(true);

    setCropArea({
      x1: pos.x,
      y1: pos.y,
      x2: pos.x,
      y2: pos.y,
    });
  };

  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (!isDrawing) return;
    const stage = e.target.getStage();
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;

    setCropArea({
      ...cropArea,
      x2: pos.x,
      y2: pos.y,
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const normalizedCropArea = {
      x1: Math.min(cropArea.x1, cropArea.x2),
      y1: Math.min(cropArea.y1, cropArea.y2),
      x2: Math.max(cropArea.x1, cropArea.x2),
      y2: Math.max(cropArea.y1, cropArea.y2),
    };

    setCropArea(normalizedCropArea);
  };

  if (!imageRotated) {
    return null;
  }

  return (
    <>
      <ImageControls
        rotation={0}
        onRotationChange={null}
        onRotate90={null}
        onPrevious={handlePrev}
        onNext={handleNext}
      />
      <ImageViewer
        image={imageRotated}
        imageConfig={session.rotationView}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {cropArea.x2 !== 0 && cropArea.y2 !== 0 && (
          <Rect
            x={cropArea.x1}
            y={cropArea.y1}
            width={cropArea.x2 - cropArea.x1}
            height={cropArea.y2 - cropArea.y1}
            stroke="white"
            strokeWidth={2}
            dash={[5, 5]}
            fill="rgba(0,0,255,0.3)"
          />
        )}
      </ImageViewer>
      <LoadingDialog open={loading} />
    </>
  );
};
