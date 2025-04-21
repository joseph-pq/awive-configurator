import React, { useState, useContext } from "react";
import { Box } from "@mui/material";
import { Stage, Layer, Line, Image as KonvaImage } from "react-konva";
import { ImagesContext } from "../../../contexts/images";
import { ImageViewer } from "../../shared/ImageViewer/ImageViewer";
import { ImageControls } from "../../features/ImageControls/ImageControls";
import { DistanceDialog } from "../../features/DistanceDialog/DistanceDialog";
import { LoadingDialog } from "../../shared/LoadingDialog/LoadingDialog";
import { GcpPoint as GcpPointComponent } from "../../features/GcpPoint/GcpPoint";
import { DistanceLine } from "../../features/DistanceLine/DistanceLine";
import { API_URL } from "../../../constants/api";
import { ZOOM_SCALE } from "../../../constants/image";
import { KonvaEventObject } from "konva/lib/Node";
import { Node } from "konva/lib/Node";
import { NodeConfig } from "konva/lib/Node";
import { GcpPoint } from "../../../types/gcp";

interface OrthorectificationViewProps {
  handlePrev: () => void;
  handleNext: () => void;
}

interface CursorPosition {
  x: number;
  y: number;
}

export const OrthorectificationView: React.FC<OrthorectificationViewProps> = ({
  handlePrev,
  handleNext: handleNextRoot,
}) => {
  const [cursorPos, setCursorPos] = useState<CursorPosition>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [openDistanceDialog, setOpenDistanceDialog] = useState<boolean>(false);
  const [selectedGcpPair, setSelectedGcpPair] = useState<[number, number] | null>(null);
  const [distanceValue, setDistanceValue] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const context = useContext(ImagesContext);
  if (!context) {
    throw new Error("ImagesContext must be used within an ImagesProvider");
  }
  const {
    image,
    imageConfig,
    setImageConfig,
    gcpPoints,
    setGcpPoints,
    distances,
    setDistances,
    setImageSrc1,
  } = context;

  const handleNext = async () => {
    if (Object.keys(gcpPoints).length !== 4) {
      alert("Please select 4 GCPs before proceeding");
      return;
    }
    for (const distance of distances) {
      if (distance.distance === 0) {
        alert("Please enter all distances before proceeding");
        return;
      }
    }
    setLoading(true);

    try {
      const out_gcps = Object.entries(gcpPoints).map(([, point]) => [
        point.x_natural,
        point.y_natural,
      ]);
      const out_distances: Record<string, number> = {};
      distances.forEach((dist) => {
        const key = `${dist.points[0]},${dist.points[1]}`;
        out_distances[key] = dist.distance;
      });
      const formData = new FormData();
      formData.append("file", imageConfig.file as Blob);
      formData.append("gcps", JSON.stringify(out_gcps));
      formData.append("distances", JSON.stringify(out_distances));

      const response = await fetch(`${API_URL}/process/`, {
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
        const width = img.width;
        const height = img.height;
        if (width > 1024 || height > 768) {
          if (width / 1024 > height / 768) {
            setImageConfig({
              ...imageConfig,
              width1: 1024,
              height1: (1024 / width) * height,
              naturalWidth1: width,
              naturalHeight1: height,
            });
          } else {
            setImageConfig({
              ...imageConfig,
              width1: (768 / height) * width,
              height1: 768,
              naturalWidth1: width,
              naturalHeight1: height,
            });
          }
        } else {
          setImageConfig({
            ...imageConfig,
            width1: width,
            height1: height,
            naturalWidth1: width,
            naturalHeight1: height,
          });
        }
        setImageSrc1(imageUrl);
        handleNextRoot();
      };
      img.src = imageUrl;
    } catch (error) {
      console.error("Error during fetch:", error);
      alert("An error occurred while processing the request.");
    }
    setLoading(false);
  };

  const handleCanvasClick = (e: KonvaEventObject<MouseEvent, Node<NodeConfig>>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    const point = stage.getPointerPosition();
    if (!point) return;

    const newPoint: GcpPoint = {
      x: point.x,
      y: point.y,
      x_natural: (point.x / imageConfig.height) * imageConfig.naturalHeight,
      y_natural: (point.y / imageConfig.width) * imageConfig.naturalWidth
    };
    if (Object.keys(gcpPoints).length >= 4) {
      return;
    }
    // Check if the click is near any existing line
    const isNearLine = distances.some((dist) => {
      const { points: points_ } = dist;
      const points = points_.map((point_) => gcpPoints[point_]);
      const distanceToLine =
        Math.abs(
          (points[1].y - points[0].y) * point.x -
          (points[1].x - points[0].x) * point.y +
          points[1].x * points[0].y -
          points[1].y * points[0].x,
        ) /
        Math.sqrt(
          (points[1].y - points[0].y) ** 2 + (points[1].x - points[0].x) ** 2,
        );
      return distanceToLine < 10; // Threshold distance to consider "near"
    });
    if (isNearLine) {
      return;
    }
    // pick lowest available key in gcpPoints
    let key = 0;
    while (gcpPoints[key] !== undefined) {
      key++;
    }
    setGcpPoints({ ...gcpPoints, [key]: newPoint });
  };

React.useEffect(() => {
    const newDistances = [];
    for (let i = 0; i < 3; i++) {
      for (let j = i + 1; j < 4; j++) {
        if (gcpPoints[i.toString()] && gcpPoints[j.toString()]) {
          const distance =
            distances.find(
              (dist) =>
                (dist.points[0] === i && dist.points[1] === j) ||
                (dist.points[0] === j && dist.points[1] === i),
            )?.distance || 0;
          newDistances.push({
            points: [i, j] as [number, number],
            distance,
          });
        }
      }
    }
    setDistances(newDistances);
  }, [gcpPoints]);

  const handleDragMove = (e: KonvaEventObject<MouseEvent>, index: string) => {
    const newGcpPoints = { ...gcpPoints };
    newGcpPoints[index] = {
      ...newGcpPoints[index],
      x: e.target.x(),
      y: e.target.y(),
    };
    setGcpPoints(newGcpPoints);
    // Track cursor position during drag
    setCursorPos({ x: e.target.x(), y: e.target.y() });
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  /**
   * Handles right-click on a GCP point to remove it
   *
   * @param e - The Konva mouse event
   * @param index - The index of the GCP point to remove
   */
  const handleGcpRightClick = (e: KonvaEventObject<MouseEvent>, index: string) => {
    e.evt.preventDefault();
    const rest = Object.fromEntries(
      Object.entries(gcpPoints).filter(([key]) => key !== index)
    );
    setGcpPoints(rest);
  };

  const handleOpenDistanceDialog = (gcpIdx1: number, gcpIdx2: number) => {
    setSelectedGcpPair([gcpIdx1, gcpIdx2]);
    setOpenDistanceDialog(true);
  };

  const handleSaveDistance = () => {
    if (selectedGcpPair && distanceValue) {
      const newDistances = distances.map((dist) => {
        const [p1, p2] = dist.points;
        const [s1, s2] = selectedGcpPair;
        if (
          (p1 === s1 && p2 === s2) ||
          (p1 === s2 && p2 === s1)
        ) {
          return { ...dist, distance: Number(distanceValue) };
        }
        return dist;
      });
      setDistances(newDistances);
      setOpenDistanceDialog(false);
      setSelectedGcpPair(null);
      setDistanceValue("");
    }
  };

  if (!image) {
    return null;
  }

  return (
    <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
      <ImageControls
        rotation={0}
        onRotationChange={null}
        onRotate90={null}
        onPrevious={handlePrev}
        onNext={handleNext}
      />
      <ImageViewer
        image={image}
        imageConfig={imageConfig}
        onClick={handleCanvasClick}
      >
        {distances.map((dist, index) => (
          <DistanceLine
            key={index}
            distance={dist}
            points={gcpPoints}
            onClick={() => handleOpenDistanceDialog(dist.points[0], dist.points[1])}
          />
        ))}
        {Object.entries(gcpPoints).map(([index, point]) => (
          <GcpPointComponent
            key={index}
            point={point}
            index={index}
            onDragMove={(e) => handleDragMove(e, index)}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onContextMenu={(e) => handleGcpRightClick(e, index)}
          />
        ))}
      </ImageViewer>

      {isDragging && (
        <Box
          sx={{
            position: "absolute",
            top: cursorPos.y + 10,
            left: cursorPos.x + 10,
            width: 200,
            height: 200,
            border: "2px solid black",
            overflow: "hidden",
            pointerEvents: "none",
          }}
        >
          <Stage
            width={200}
            height={200}
            x={-cursorPos.x * 2 + 100}
            y={-cursorPos.y * 2 + 100}
          >
            <Layer>
              <KonvaImage
                image={image}
                x={cursorPos.x}
                y={cursorPos.y}
                width={imageConfig.width}
                height={imageConfig.height}
                offsetX={cursorPos.x / ZOOM_SCALE}
                offsetY={cursorPos.y / ZOOM_SCALE}
                scaleX={ZOOM_SCALE} // Zoom in the floating window
                scaleY={ZOOM_SCALE} // Zoom in the floating window
              />
              <Line
                x={cursorPos.x * ZOOM_SCALE - 100}
                y={cursorPos.y * ZOOM_SCALE - 100}
                points={[100, 0, 100, 200]}
                stroke="black"
                strokeWidth={2}
              />
              <Line
                x={cursorPos.x * ZOOM_SCALE - 100}
                y={cursorPos.y * ZOOM_SCALE - 100}
                points={[0, 100, 200, 100]}
                stroke="black"
                strokeWidth={2}
              />
            </Layer>
          </Stage>
        </Box>
      )}

      <DistanceDialog
        open={openDistanceDialog}
        onClose={() => setOpenDistanceDialog(false)}
        onSave={handleSaveDistance}
        distanceValue={distanceValue}
        onDistanceChange={setDistanceValue}
      />
      <LoadingDialog open={loading} />
    </Box>
  );
};
