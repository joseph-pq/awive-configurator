import React, { useState, useContext, useEffect } from "react";
import { Box, Typography, Slider, TextField, Button } from "@mui/material";
import { Line, Circle } from "react-konva";
import { ImagesContext } from "../../../contexts/images";
import { ImageViewer } from "../../shared/ImageViewer/ImageViewer";
import { ImageControls } from "../../features/ImageControls/ImageControls";
import { TabComponentProps } from "@/types/tabs";
import { KonvaEventObject } from "konva/lib/Node";
import { Point, ProfilePoint } from '../../../types/image';


export const RiverProfileView: React.FC<TabComponentProps> = ({
  handlePrev,
  handleNext: handleNextRoot,
}) => {
  // Context and state
  const context = useContext(ImagesContext);
  if (!context) {
    throw new Error("ImagesContext must be used within an ImagesProvider");
  }
  const { imageCropped, session, setSession } = context;

  // State for line drawing: endpoints of the profile line
  const [endpoints, setEndpoints] = useState<Point[]>([]);

  // State for equidistant points
  const [numPoints, setNumPoints] = useState<number>(3);
  const [profilePoints, setProfilePoints] = useState<Record<number, ProfilePoint>>({});
  const [validPoints, setValidPoints] = useState<Record<number, boolean>>({});

  // Handle clicking to place line points
  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;

    if (endpoints.length === 2) { // Reset for new line
      setProfilePoints({});
      setValidPoints({});
      setEndpoints([{ x: pos.x, y: pos.y }]);
    } else if (endpoints.length === 0) { // Starting a new line
      setEndpoints([{ x: pos.x, y: pos.y }]);
    } else if (endpoints.length === 1) { // Completing the line
      setEndpoints([endpoints[0], { x: pos.x, y: pos.y }]);
    }
  };

  // Calculate equidistant points along the line
  useEffect(() => {
    if (endpoints.length !== 2) return;
    const [start, end] = endpoints;
    const newProfilePoints: ProfilePoint[] = [];
    // Calculate the total length of the line
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    // Create equidistant points
    for (let i = 0; i < numPoints; i++) {
      const ratio = i / (numPoints - 1);
      const x = start.x + dx * ratio;
      const y = start.y + dy * ratio;
      newProfilePoints.push({
        x,
        y,
        depth: 0, // Default distance
      });
    }
    setProfilePoints(newProfilePoints);
  }, [endpoints, numPoints]);

  // Handle depth input changes
  const handleDepthWrite = (index: number, value: string) => {
    const valid = value == "" ? false : !isNaN(Number(value))
    setValidPoints({
      ...validPoints,
      [index]: valid
    });
    setProfilePoints({
      ...profilePoints,
      [index]: {
        ...profilePoints[index],
        depth: Number(value)
      }
    });
  };

  const handleNext = () => {
    // Validate that all distances are filled
    // const allDepthsFilled = profilePoints.every((_, index) =>
    //   index === 0 || depths[index] !== undefined
    // );

    // if (!allDepthsFilled) {
    //   alert("Please fill in all distances between points");
    //   return;
    // }

    // // Convert our profile points and distances to the format expected by context
    // const naturalDepths: ProfilePoint[] = profilePoints.map((profilePoint: ProfilePoint, idx: number) => {
    //   // TODO: convert x, y from scaled to natural image coordinates if needed
    //   return {
    //     depth: profilePoint.depth
    //   };
    // });
    // setSession({
    //   ...session,
    //   depths: naturalDepths,
    // });

    // Process data and move to next step
    handleNextRoot();
  };

  if (!imageCropped) {
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
          image={imageCropped}
          imageConfig={session.cropView}
          onMouseDown={handleMouseDown}
        >
          {/* Line between the endpoints */}
          {endpoints.length === 2 && (
            <Line
              points={[endpoints[0].x, endpoints[0].y, endpoints[1].x, endpoints[1].y]}
              stroke="white"
              strokeWidth={2}
              lineCap="round"
              lineJoin="round"
            />
          )}

          {/* Equidistant points along the line - only shown when line drawing is complete */}
          {endpoints.length === 2 &&
            Object.entries(profilePoints).map(([key, point], index) => (
              <Circle
                key={key}
                x={point.x}
                y={point.y}
                radius={6}
                fill={validPoints[index] ? "green" : "red"}
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

        {endpoints.length === 2 && (
          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              color="error"
              fullWidth
              onClick={() => {
                setEndpoints([]);
                setProfilePoints({});
                setValidPoints({});
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
            max={15}
            step={1}
            marks
            valueLabelDisplay="auto"
            disabled={endpoints.length !== 2}
          />
        </Box>
        {Object.keys(profilePoints).length > 0 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Enter distances between points:
            </Typography>

            {Object.entries(profilePoints).map(([key, point]) => {
              const index = Number(key);
              return (
                <Box key={index} sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    Depth of point {index}:
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    value={validPoints[index] ? profilePoints[index].depth : ""}
                    onChange={(e) => handleDepthWrite(index, e.target.value)}
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
