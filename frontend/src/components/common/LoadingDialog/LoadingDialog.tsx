import React from 'react';
import { Dialog, DialogContent, Box, CircularProgress } from '@mui/material';

interface LoadingDialogProps {
  open: boolean;
}

export const LoadingDialog: React.FC<LoadingDialogProps> = ({ open }) => {
  return (
    <Dialog open={open}>
      <DialogContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100px',
          }}
        >
          <CircularProgress />
        </Box>
      </DialogContent>
    </Dialog>
  );
}; 