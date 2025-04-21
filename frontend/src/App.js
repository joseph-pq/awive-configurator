import React, { useState } from "react";
import { ImagesProvider } from "./ImagesContext";

import TabContext from "@mui/lab/TabContext";
import TabPanel from "@mui/lab/TabPanel";

import { Toolbar, AppBar, Box, Typography } from "@mui/material";
import { OrthorectificationView } from "./views/OrthorectificationView/OrthorectificationView";
import { HomeView } from "./views/HomeView/HomeView";
import { PreCropView } from "./views/PreCropView/PreCropView";
import { RotationView } from "./views/RotationView/RotationView";

const TABS = [
  { label: "Home", value: "1", component: <HomeView /> },
  // { label: 'Image Correction', value: '2', component: <ImageCorrectionView /> },
  {
    label: "Orthorectification",
    value: "3",
    component: <OrthorectificationView />,
  },
  {
    label: "PreCrop",
    value: "4",
    component: <PreCropView />,
  },
  { label: "Rotation", value: "5", component: <RotationView /> },
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
