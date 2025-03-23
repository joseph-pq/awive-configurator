import React, { useState, useRef } from "react";
import { Stage, Layer, Image as KonvaImage, Circle } from "react-konva";
import {ImagesProvider} from "./ImagesContext";

import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";

import useImage from "use-image";
import {
  Toolbar,
  AppBar,
  Button,
  Box,
  Typography,
  Slider,
  Tab,
  Container,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import SaveIcon from "@mui/icons-material/Save";
import HomeView from "./HomeView";
import OrthorectificationView from "./OrthorectificationView";

const TABS = [
  { label: "Home", value: "1", component: <HomeView /> },
  // { label: 'Image Correction', value: '2', component: <ImageCorrectionView /> },
  { label: 'Orthorectification', value: '3', component: <OrthorectificationView /> },
  // { label: 'Rotation', value: '4', component: <RotationView /> },
];

export default function App() {
  const [currentTab, setCurrentTab] = useState("1");
  const handleTabChange = (_, newValue) => setCurrentTab(newValue);

  return (
    <ImagesProvider>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: "center" }}>
            AWIVE Configurator
          </Typography>
        </Toolbar>
      </AppBar>
      <TabContext value={currentTab}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <TabList onChange={handleTabChange} aria-label="App navigation tabs">
            {TABS.map(({ label, value }) => (
              <Tab key={value} label={label} value={value} />
            ))}
          </TabList>
        </Box>
        {TABS.map(({ value, component }) => (
          <TabPanel key={value} value={value}>
            {component}
          </TabPanel>
        ))}
      </TabContext>
    </ImagesProvider>
  );
}
