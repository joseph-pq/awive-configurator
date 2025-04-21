import React from "react";
import { Box, Typography } from "@mui/material";
import TabContext from "@mui/lab/TabContext";
import TabPanel from "@mui/lab/TabPanel";
import { TabContent } from "../../types/tabs";

interface TabLayoutProps {
  currentTab: string;
  tabs: TabContent[];
  handleNext: () => void;
  handlePrev: () => void;
}

export const TabLayout: React.FC<TabLayoutProps> = ({
  currentTab,
  tabs,
  handleNext,
  handlePrev,
}) => {
  return (
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
          {tabs.find((tab) => tab.value === currentTab)?.label}
        </Typography>
      </Box>
      {tabs.map(({ value, component: Component }) => (
        <TabPanel key={value} value={value}>
          <Component handleNext={handleNext} handlePrev={handlePrev} />
        </TabPanel>
      ))}
    </TabContext>
  );
};
