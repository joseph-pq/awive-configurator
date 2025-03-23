import React, { useState, useRef, useContext } from "react";
import { ImagesContext } from "./ImagesContext";
import { Stage, Layer, Image as KonvaImage, Circle, Line } from "react-konva";

import useImage from "use-image";
import {
  Toolbar,
  AppBar,
  Button,
  Box,
  Typography,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  TextField,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import SaveIcon from "@mui/icons-material/Save";

const ZOOM_SCALE = 2;

export default function OrthorectificationView() {
  const [gcpPoints, setGcpPoints] = useState([]);
  const [distances, setDistances] = useState([]); // Store distances between GCPs
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false); // Track if a GCP is being dragged
  const [openDistanceDialog, setOpenDistanceDialog] = useState(false); // Distance dialog visibility
  const [selectedGcpPair, setSelectedGcpPair] = useState(null); // Selected GCP pair for distance input
  const [distanceValue, setDistanceValue] = useState(""); // Input distance value
  const { image, imageConfig } = useContext(ImagesContext);

  // Handle GCP selection
  const handleCanvasClick = (e) => {
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();

    // Check if the click is near any existing line
    const isNearLine = distances.some((dist) => {
      const { points } = dist;
      const distanceToLine = Math.abs(
        (points[1].y - points[0].y) * pointer.x -
        (points[1].x - points[0].x) * pointer.y +
        points[1].x * points[0].y -
        points[1].y * points[0].x
      ) / Math.sqrt((points[1].y - points[0].y) ** 2 + (points[1].x - points[0].x) ** 2);
      return distanceToLine < 10; // Threshold distance to consider "near"
    });

    if (!isNearLine) {
      setGcpPoints([...gcpPoints, pointer]);
    }
  };

  // Handle GCP drag
  const handleDragMove = (e, index) => {
    const newGcpPoints = [...gcpPoints];
    newGcpPoints[index] = { x: e.target.x(), y: e.target.y() };
    setGcpPoints(newGcpPoints);

    // Recalculate distances dynamically
    const updatedDistances = [];
    for (let i = 0; i < newGcpPoints.length - 1; i++) {
      for (let j = i + 1; j < newGcpPoints.length; j++) {
        const distance = calculateDistance(newGcpPoints[i], newGcpPoints[j]);
        updatedDistances.push({
          points: [newGcpPoints[i], newGcpPoints[j]],
          distance,
        });
      }
    }
    setDistances(updatedDistances);

    // Track cursor position during drag
    setCursorPos({ x: e.target.x(), y: e.target.y() });
  };

  const handleDragStart = () => {
    setIsDragging(true); // Start dragging
  };

  const handleDragEnd = () => {
    setIsDragging(false); // End dragging
  };

  // Function to calculate distance between two points
  const calculateDistance = (point1, point2) => {
    return Math.sqrt((point2.x - point1.x) ** 2 + (point2.y - point1.y) ** 2);
  };

  // Handle line connection between GCPs and calculate distances
  const handleConnectGCPs = () => {
    const newDistances = [];
    for (let i = 0; i < gcpPoints.length - 1; i++) {
      for (let j = i + 1; j < gcpPoints.length; j++) {
        const distance = calculateDistance(gcpPoints[i], gcpPoints[j]);
        newDistances.push({ points: [gcpPoints[i], gcpPoints[j]], distance });
      }
    }
    setDistances(newDistances);
  };

  // Handle saving GCPs and distances
  const handleSaveGCPs = () => {
    console.log("Selected GCPs:", gcpPoints);
    console.log("Distances:", distances);
  };

  // Handle right-click to remove a GCP
  const handleGcpRightClick = (e, index) => {
    e.evt.preventDefault(); // Prevent the default right-click menu
    const newGcpPoints = [...gcpPoints];
    newGcpPoints.splice(index, 1); // Remove the GCP at the specified index
    setGcpPoints(newGcpPoints);
  };

  // Handle opening the distance input dialog
  const handleOpenDistanceDialog = (gcp1, gcp2) => {
    setSelectedGcpPair([gcp1, gcp2]);
    setOpenDistanceDialog(true);
  };

  // Handle saving the distance value
  const handleSaveDistance = () => {
    if (selectedGcpPair && distanceValue) {
      const newDistances = distances.map((dist) => {
        if (
          (dist.points[0] === selectedGcpPair[0] &&
            dist.points[1] === selectedGcpPair[1]) ||
          (dist.points[0] === selectedGcpPair[1] &&
            dist.points[1] === selectedGcpPair[0])
        ) {
          return { ...dist, distance: distanceValue };
        }
        return dist;
      });
      setDistances(newDistances);
      setOpenDistanceDialog(false);
      setSelectedGcpPair(null);
      setDistanceValue(""); // Reset distance input
    }
  };

  return (
    <Container sx={{ textAlign: "center", mt: 4 }}>
      {/* Action Buttons */}
      <Box mt={2}>
        <Button
          variant="contained"
          color="success"
          startIcon={<SaveIcon />}
          onClick={handleSaveGCPs}
          sx={{ mx: 1 }}
        >
          Save GCPs
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleConnectGCPs}
          sx={{ mx: 1 }}
        >
          Connect GCPs
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
              {distances.map((dist, index) => (
                <Line
                  key={index}
                  points={[
                    dist.points[0].x,
                    dist.points[0].y,
                    dist.points[1].x,
                    dist.points[1].y,
                  ]}
                  stroke="yellow"
                  strokeWidth={4}
                  onClick={() =>
                    handleOpenDistanceDialog(dist.points[0], dist.points[1])
                  } // Open distance dialog
                />
              ))}
              {gcpPoints.map((point, index) => (
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
    </Container>
  );
}
