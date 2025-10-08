import React, { useState, useContext, useRef, useEffect } from "react";
import { Box, Typography, Slider, TextField, Button } from "@mui/material";
import { Stage, Layer, Line, Circle } from "react-konva";
import { ImagesContext } from "../../../contexts/images";
import { ImageViewer } from "../../shared/ImageViewer/ImageViewer";
import { ImageControls } from "../../features/ImageControls/ImageControls";
import { TabComponentProps } from "@/types/tabs";
import { KonvaEventObject } from "konva/lib/Node";

interface Point {
  x: number;
  y: number;
}

interface ProfilePoint extends Point {
  distance: number;
}

export const RiverProfileView: React.FC<TabComponentProps> = ({
  handlePrev,
  handleNext: handleNextRoot,
}) => {
  // Context and state
  const context = useContext(ImagesContext);
  if (!context) {
    throw new Error("ImagesContext must be used within an ImagesProvider");
  }
  const { imageOrthorectified: image1, imageConfig, distances: contextDistances, setDistances: setContextDistances } = context;

  // State for line drawing
  const [linePoints, setLinePoints] = useState<Point[]>([]);

  // State for equidistant points
  const [numPoints, setNumPoints] = useState<number>(3);
  const [profilePoints, setProfilePoints] = useState<ProfilePoint[]>([]);
  const [distances, setDistances] = useState<Record<number, string>>({});

  // Handle clicking to place line points
  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    // If we already have a complete line (2 points), clear it
    if (linePoints.length === 2) {
      setLinePoints([]);
      setProfilePoints([]);
      setDistances({});

      // Add the first point of the new line
      setLinePoints([{ x: pos.x, y: pos.y }]);
      return;
    }

    // If we're starting a new line
    if (linePoints.length === 0) {
      setLinePoints([{ x: pos.x, y: pos.y }]);
      return;
    }

    // If we already have the first point, add the second point to complete the line
    if (linePoints.length === 1) {
      setLinePoints([linePoints[0], { x: pos.x, y: pos.y }]);
    }
  };

  // These are not needed for two-click approach, but keeping them as empty functions
  // to avoid changing the component interface
  const handleMouseMove = () => {};
  const handleMouseUp = () => {};

  // Load saved configuration on mount
  useEffect(() => {
    if (contextDistances && contextDistances.length > 0) {
      // Calculate how many points we have (number of distances + 1)
      const pointCount = contextDistances.length + 1;
      setNumPoints(pointCount);

      // We need to wait for the image to load before we can calculate positions
      if (!image1) return;

      // Since we don't store the actual line points, we'll create a default line
      // across the middle of the image for visualization purposes
      const imageWidth = imageConfig.width1;
      const imageHeight = imageConfig.height1;
      const start = { x: imageWidth * 0.25, y: imageHeight * 0.5 };
      const end = { x: imageWidth * 0.75, y: imageHeight * 0.5 };

      setLinePoints([start, end]);
    }
  }, [contextDistances, image1]);

  // Calculate equidistant points along the line
  useEffect(() => {
    if (linePoints.length !== 2) return;

    const [start, end] = linePoints;
    const newProfilePoints: ProfilePoint[] = [];

    // Calculate the total length of the line
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const lineLength = Math.sqrt(dx * dx + dy * dy);

    // Create equidistant points
    for (let i = 0; i < numPoints; i++) {
      const ratio = i / (numPoints - 1);
      const x = start.x + dx * ratio;
      const y = start.y + dy * ratio;

      newProfilePoints.push({
        x,
        y,
        distance: 0, // Default distance
      });
    }

    setProfilePoints(newProfilePoints);

    // Only reset distances if we don't have saved data
    if (contextDistances && contextDistances.length > 0) {
      // Restore saved distances
      const newDistances: Record<number, string> = {};
      contextDistances.forEach((dist, idx) => {
        newDistances[idx + 1] = dist.distance.toString();
      });
      setDistances(newDistances);
    } else {
      // Reset distances when line changes
      setDistances({});
    }
  }, [linePoints, numPoints, contextDistances]);

  // Handle distance input changes
  const handleDistanceChange = (index: number, value: string) => {
    setDistances({
      ...distances,
      [index]: value,
    });
  };

  const handleNext = () => {
    // Validate that all distances are filled
    const allDistancesFilled = profilePoints.every((_, index) =>
      index === 0 || distances[index] !== undefined
    );

    if (!allDistancesFilled) {
      alert("Please fill in all distances between points");
      return;
    }

    // Convert our profile points and distances to the format expected by context
    const distanceData = profilePoints.slice(1).map((point, idx) => {
      const prevIdx = idx;
      const currIdx = idx + 1;
      return {
        points: [prevIdx, currIdx],
        distance: parseFloat(distances[currIdx] || "0")
      };
    });

    // Save to context
    // setContextDistances(distanceData);

    // Process data and move to next step
    handleNextRoot();
  };

  if (!image1) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
      <Box sx={{ flex: 1 }}>
        <ImageControls
          rotation={0}
          onRotationChange={null}
          onRotate90={null}
          onPrevious={handlePrev}
          onNext={handleNext}
        />
        <ImageViewer
          image={image1}
          imageConfig={{
            ...imageConfig,
            scaledWidth: imageConfig.width1,
            scaledHeight: imageConfig.height1,
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {/* Line between the two points */}
          {linePoints.length === 2 && (
            <Line
              points={[linePoints[0].x, linePoints[0].y, linePoints[1].x, linePoints[1].y]}
              stroke="white"
              strokeWidth={2}
              lineCap="round"
              lineJoin="round"
            />
          )}

          {/* Equidistant points along the line - only shown when line drawing is complete */}
          {linePoints.length === 2 && profilePoints.map((point, index) => (
            <Circle
              key={index}
              x={point.x}
              y={point.y}
              radius={6}
              fill={distances[index] ? "green" : "red"}
              stroke="white"
              strokeWidth={1}
            />
          ))}
        </ImageViewer>
      </Box>
      <Box sx={{ width: 300, p: 2, borderLeft: '1px solid #ddd' }}>
        <Typography variant="h6" gutterBottom>
          River Profile Settings
        </Typography>

        {linePoints.length === 2 && (
          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              color="error"
              fullWidth
              onClick={() => {
                setLinePoints([]);
                setProfilePoints([]);
                setDistances({});
              }}
            >
              Reset Line
            </Button>
          </Box>
        )}

        <Box sx={{ mb: 4 }}>
          <Typography gutterBottom>
            Number of Points: {numPoints}
          </Typography>
          <Slider
            value={numPoints}
            onChange={(_, value) => setNumPoints(value as number)}
            min={2}
            max={10}
            step={1}
            marks
            valueLabelDisplay="auto"
            disabled={linePoints.length !== 2}
          />
        </Box>

        {profilePoints.length > 0 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Enter distances between points:
            </Typography>

            {profilePoints.map((_, index) => {
              if (index === 0) return null; // Skip first point, no distance to previous

              return (
                <Box key={index} sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    Point {index} distance from Point {index - 1}:
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    value={distances[index] || ""}
                    onChange={(e) => handleDistanceChange(index, e.target.value)}
                    placeholder="Enter distance"
                    InputProps={{
                      endAdornment: <Typography variant="body2">m</Typography>,
                    }}
                  />
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
};
