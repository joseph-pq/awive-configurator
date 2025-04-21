import React, { useState } from "react";
import { ImagesProvider } from "./contexts/images";
import { AppHeader } from "./components/layout/AppHeader";
import { TabLayout } from "./components/layout/TabLayout";
import { HomeView } from "./components/pages/HomeView/HomeView";
import { OrthorectificationView } from "./components/pages/OrthorectificationView/OrthorectificationView";
import { PreCropView } from "./components/pages/PreCropView/PreCropView";
import { RotationView } from "./components/pages/RotationView/RotationView";

const TABS = [
  { label: "Home", value: "1", component: HomeView },
  // { label: 'Image Correction', value: '2', component: <ImageCorrectionView /> },
  {
    label: "Orthorectification",
    value: "3",
    component: OrthorectificationView,
  },
  {
    label: "PreCrop",
    value: "4",
    component: PreCropView,
  },
  { label: "Rotation", value: "5", component: RotationView },
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
      <AppHeader />
      <TabLayout
        currentTab={currentTab}
        tabs={TABS}
        handleNext={handleNext}
        handlePrev={handlePrev}
      />
    </ImagesProvider>
  );
}
