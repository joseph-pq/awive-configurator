import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
} from '@mui/material';

interface DistanceDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  distanceValue: string;
  onDistanceChange: (value: string) => void;
}

export const DistanceDialog: React.FC<DistanceDialogProps> = ({
  open,
  onClose,
  onSave,
  distanceValue,
  onDistanceChange,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Enter Distance between GCPs</DialogTitle>
      <DialogContent>
        <TextField
          label="Distance (in meters)"
          value={distanceValue}
          onChange={(e) => onDistanceChange(e.target.value)}
          fullWidth
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={onSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
