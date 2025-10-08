import React from "react";
import { ImagesProvider } from "./contexts/images";
import { AppHeader } from "./components/layout/AppHeader";
import { TabLayout } from "./components/layout/TabLayout";
import { HomeView } from "./components/pages/HomeView/HomeView";
import { OrthorectificationView } from "./components/pages/OrthorectificationView/OrthorectificationView";
import { PreCropView } from "./components/pages/PreCropView/PreCropView";
import { CropView } from "./components/pages/CropView/CropView";
import { RotationView } from "./components/pages/RotationView/RotationView";
import { FinalView } from "./components/pages/FinalView/FinalView";
// import { RiverProfileView } from "./components/pages/RiverProfileView/RiverProfileView";
import { useTabNavigation } from "./hooks/useTabNavigation";

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
  { label: "Crop", value: "6", component: CropView },
  // { label: "River Profile", value: "7", component: RiverProfileView },
  { label: "Final", value: "8", component: FinalView },
];

export default function App() {
  const { currentTab, handlePrev, handleNext } = useTabNavigation({
    initialTab: "1",
    tabs: TABS,
  });

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
