import React from "react";
import { Button, Box, Typography, Slider } from "@mui/material";
import RotateRightIcon from "@mui/icons-material/RotateRight";

interface ImageControlsProps {
  rotation: number;
  onRotationChange: ((value: number) => void) | null;
  onRotate90: (() => void) | null;
  onPrevious: () => void;
  onNext: () => void;
  showNext?: boolean;
}

export const ImageControls: React.FC<ImageControlsProps> = ({
  rotation,
  onRotationChange,
  onRotate90,
  onPrevious,
  onNext,
  showNext = true,
}) => {
  return (
    <Box sx={{ textAlign: "center", mt: 4 }}>
      <Box sx={{ flexGrow: 1, mb: 2 }}>
        <Button variant="contained" onClick={onPrevious} sx={{ mx: 1 }}>
          Previous
        </Button>
        {showNext && (
          <Button variant="contained" onClick={onNext} sx={{ mx: 1 }}>
            Next
          </Button>
        )}
      </Box>

      {onRotationChange && (
        <>
          <Box sx={{ mt: 2, width: 300, mx: "auto" }}>
            <Typography gutterBottom>Rotation</Typography>
            <Slider
              value={rotation}
              onChange={(e, newValue) => onRotationChange(newValue as number)}
              min={0}
              max={360}
              step={1}
              aria-labelledby="rotation-slider"
            />
          </Box>

          {onRotate90 && (
            <Box mt={2}>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<RotateRightIcon />}
                onClick={onRotate90}
                sx={{ mx: 1 }}
              >
                Rotate 90°
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};
