import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';

export const AppHeader: React.FC = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, textAlign: "center" }}>
          AWIVE Configurator
        </Typography>
      </Toolbar>
    </AppBar>
  );
}; 