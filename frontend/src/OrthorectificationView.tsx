import React, { useState, useContext } from "react";
import { ImagesContext, GcpPoint } from "./ImagesContext";
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Circle,
  Line,
  Text,
} from "react-konva";

import {
  Button,
  Box,
  Typography,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  TextField,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { KonvaEventObject } from "konva/lib/Node";

const ZOOM_SCALE = 2;
const API_URL = process.env.REACT_APP_API_URL + "/api/v1";

interface OrthorectificationViewProps {
  handlePrev: () => void;
  handleNext: () => void;
}
interface CursorPosition {
  x: number;
  y: number;
}

export default function OrthorectificationView({
  handlePrev,
  handleNext: handleNextRoot,
}: OrthorectificationViewProps) {

  const [cursorPos, setCursorPos] = useState<CursorPosition>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false); // Track if a GCP is being dragged
  const [openDistanceDialog, setOpenDistanceDialog] = useState<boolean>(false); // Distance dialog visibility
  const [selectedGcpPair, setSelectedGcpPair] = useState<[number, number] | null>(null); // Selected GCP pair for distance input
  const [distanceValue, setDistanceValue] = useState(""); // Input distance value
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

  const [loading, setLoading] = useState(false); // Loading state

  const handleNext = async () => {
    if (Object.keys(gcpPoints).length !== 4) {
      alert("Please select 4 GCPs before proceeding");
      return;
    }
    // check all distances are not 0
    for (let i = 0; i < distances.length; i++) {
      if (distances[i].distance === 0) {
        alert("Please enter all distances before proceeding");
        return;
      }
    }
    setLoading(true);

    try {
      const out_gcps = Object.entries(gcpPoints).map(([key, point]) => [
        point.x_natural,
        point.y_natural,
      ]);
      const out_distances: Record<string, number> = {};
      distances.forEach((dist) => {
        const key = `${dist.points[0]},${dist.points[1]}`;
        out_distances[key] = dist.distance;
      });
      const formData = new FormData();
      formData.append("file", imageConfig.file as Blob); // Get the actual file
      formData.append("gcps", JSON.stringify(out_gcps)); // Convert list to JSON string
      formData.append("distances", JSON.stringify(out_distances)); // Convert dict to JSON string

      const response = await fetch(`${API_URL}/process/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob); // Create a URL for the blob

      const img = new Image();

      // Set up an onload handler to get the dimensions once the image is loaded
      img.onload = () => {
        const width = img.width;
        const height = img.height;
        if (width > 1024 || height > 698) {
          if (width / 1024 > height / 698) {
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
              width1: (698 / height) * width,
              height1: 698,
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
        console.log("Image loaded with dimensions:", width, height);
        setImageSrc1(imageUrl);
        // Continue with your existing flow
        handleNextRoot();
      };
      img.src = imageUrl; // Set the source of the image to the blob URL
    } catch (error) {
      console.error("Error during fetch:", error);
      alert("An error occurred while processing the request.");
    }
    setLoading(false);
  };
  // Handle GCP selection
  const handleCanvasClick = (e: KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const newPointer = {
      x: pointer.x,
      y: pointer.y,
      x_natural: (pointer.x / imageConfig.height) * imageConfig.naturalHeight,
      y_natural: (pointer.y / imageConfig.width) * imageConfig.naturalWidth
    };

    // check if there are already 4 points
    if (Object.keys(gcpPoints).length >= 4) {
      return;
    }
    // Check if the click is near any existing line
    const isNearLine = distances.some((dist) => {
      const { points: points_ } = dist;
      const points = points_.map((point) => gcpPoints[point]);
      const distanceToLine =
        Math.abs(
          (points[1].y - points[0].y) * pointer.x -
          (points[1].x - points[0].x) * pointer.y +
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
    setGcpPoints({ ...gcpPoints, [key]: newPointer });
  };

  // Update distances when GCPs change
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

  // Handle GCP drag
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
    setIsDragging(true); // Start dragging
  };

  const handleDragEnd = () => {
    setIsDragging(false); // End dragging
  };

  // Handle right-click to remove a GCP
  const handleGcpRightClick = (e: KonvaEventObject<MouseEvent>, index: string) => {
    e.evt.preventDefault(); // Prevent the default right-click menu
    const newGcpPoints = { ...gcpPoints };
    delete newGcpPoints[index]; // Remove the GCP at the specified index
    setGcpPoints(newGcpPoints);
  };

  // Handle opening the distance input dialog
  const handleOpenDistanceDialog = (gcpIdx1: number, gcpIdx2: number) => {
    setSelectedGcpPair([gcpIdx1, gcpIdx2]);
    setOpenDistanceDialog(true);
  };

  // Handle saving the distance value
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
      setDistanceValue(""); // Reset distance input
    }
  };

  // Calculate the midpoint between two points for text positioning
  const getMidpoint = (point1: GcpPoint, point2: GcpPoint) => {
    return {
      x: (point1.x + point2.x) / 2,
      y: (point1.y + point2.y) / 2,
    };
  };

  return (
    <Container sx={{ textAlign: "center", mt: 4 }}>
      <Box sx={{ flexGrow: 1 }}>
        <Button variant="contained" onClick={handlePrev} sx={{ mx: 1 }}>
          Previous
        </Button>
        <Button variant="contained" onClick={handleNext} sx={{ mx: 1 }}>
          Next
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
              {distances.map((dist, index) => {
                if (!gcpPoints[dist.points[0]] || !gcpPoints[dist.points[1]]) {
                  return null;
                }
                const midpoint = getMidpoint(
                  gcpPoints[dist.points[0]],
                  gcpPoints[dist.points[1]],
                );
                return (
                  <React.Fragment key={index}>
                    <Line
                      points={[
                        gcpPoints[dist.points[0]].x,
                        gcpPoints[dist.points[0]].y,
                        gcpPoints[dist.points[1]].x,
                        gcpPoints[dist.points[1]].y,
                      ]}
                      stroke="yellow"
                      strokeWidth={4}
                      onClick={() =>
                        handleOpenDistanceDialog(dist.points[0], dist.points[1])
                      }
                    />
                    {/* Text box showing distance */}
                    <Text
                      x={midpoint.x - 30} // Offset to center the text box
                      y={midpoint.y - 10} // Offset to center the text box
                      text={dist.distance.toString()} // Display distance with 2 decimal places
                      fontSize={14}
                      fontStyle="bold"
                      fill="white" // Text color
                      width={60}
                      height={20}
                      align="center"
                      verticalAlign="middle"
                      listening={false} // Make it non-interactive
                    />
                    {/* Background for the text */}
                    <Circle
                      x={midpoint.x}
                      y={midpoint.y}
                      radius={20}
                      fill="rgba(0, 0, 0, 0.6)" // Semi-transparent background
                      stroke="white"
                      strokeWidth={1}
                      perfectDrawEnabled={false}
                      listening={false} // Make it non-interactive
                    />
                    {/* Text on top of background */}
                    <Text
                      x={midpoint.x - 30}
                      y={midpoint.y - 10}
                      text={dist.distance.toString()}
                      fontSize={14}
                      fontStyle="bold"
                      fill="white"
                      width={60}
                      height={20}
                      align="center"
                      verticalAlign="middle"
                      listening={false}
                    />
                  </React.Fragment>
                );
              })}
              {Object.entries(gcpPoints).map(([index, point]) => (
                <Circle
                  key={index}
                  x={point.x}
                  y={point.y}
                  radius={5}
                  fill="red"
                  draggable
                  onDragMove={(e) => handleDragMove(e, index)}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onContextMenu={(e) => handleGcpRightClick(e, index)} // Right-click to remove
                />
              ))}
            </Layer>
          </Stage>
        )}
      </Box>

      {/* Zoomed-in view (Floating next to the cursor only when dragging) */}
      {image && isDragging && (
        <Box
          sx={{
            position: "absolute",
            top: cursorPos.y + 10, // Position relative to cursor
            left: cursorPos.x + 10, // Position relative to cursor
            width: 200,
            height: 200,
            border: "2px solid black",
            overflow: "hidden",
            pointerEvents: "none", // Disable interaction with the zoom box
          }}
        >
          <Stage
            width={200}
            height={200}
            x={-cursorPos.x * 2 + 100} // Center the zoomed view on cursor
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
              {/* Add a cross at the center */}
              <Line
                x={cursorPos.x * ZOOM_SCALE - 100}
                y={cursorPos.y * ZOOM_SCALE - 100}
                points={[100, 0, 100, 200]} // Vertical line
                stroke="black"
                strokeWidth={2}
              />
              <Line
                x={cursorPos.x * ZOOM_SCALE - 100}
                y={cursorPos.y * ZOOM_SCALE - 100}
                points={[0, 100, 200, 100]} // Horizontal line
                stroke="black"
                strokeWidth={2}
              />
            </Layer>
          </Stage>
        </Box>
      )}

      {/* Distance Input Dialog */}
      <Dialog
        open={openDistanceDialog}
        onClose={() => setOpenDistanceDialog(false)}
      >
        <DialogContent>
          <Typography variant="h6" mb={2}>
            Enter Distance between GCPs
          </Typography>
          <TextField
            label="Distance (in pixels)"
            value={distanceValue}
            onChange={(e) => setDistanceValue(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenDistanceDialog(false)}
            color="secondary"
          >
            Cancel
          </Button>
          <Button onClick={handleSaveDistance} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      {/* Loading Spinner Dialog */}
      <Dialog open={loading}>
        <DialogContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
}
