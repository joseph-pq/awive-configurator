import React, { useState, useRef } from "react";
import { Stage, Layer, Image as KonvaImage, Circle } from "react-konva";
import { ImagesProvider } from "./ImagesContext";

import TabContext from "@mui/lab/TabContext";
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
  {
    label: "Orthorectification",
    value: "3",
    component: <OrthorectificationView />,
  },
  // { label: 'Rotation', value: '4', component: <RotationView /> },
];

export default function App() {
  const [currentTab, setCurrentTab] = useState("1");
  const handlePrev = () => {
    setCurrentTab((prev) => {
      const currentIndex = TABS.findIndex((tab) => tab.value === prev);
      const newIndex = (currentIndex - 1 + TABS.length) % TABS.length;
      return TABS[newIndex].value;
    });
  };

  const handleNext = () => {
    setCurrentTab((prev) => {
      const currentIndex = TABS.findIndex((tab) => tab.value === prev);
      const newIndex = (currentIndex + 1) % TABS.length;
      return TABS[newIndex].value;
    });
  };

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
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" sx={{ mx: 1 }}>
            {TABS.find((tab) => tab.value === currentTab).label}
          </Typography>
          {/* <Box sx={{ flexGrow: 1 }}> */}
          {/*   {currentTab !== "1" && ( */}
          {/*     <Button variant="contained" onClick={handlePrev} sx={{ mx: 1 }}> */}
          {/*       Previous */}
          {/*     </Button> */}
          {/*   )} */}
          {/*   {currentTab !== TABS[TABS.length - 1].value && ( */}
          {/*   )} */}
          {/* </Box> */}
        </Box>
        {TABS.map(({ value, component }) => (
          <TabPanel key={value} value={value}>
            {React.cloneElement(component, { handleNext, handlePrev })}
          </TabPanel>
        ))}
      </TabContext>
    </ImagesProvider>
  );
}
