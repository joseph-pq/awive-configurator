import { useState } from "react";
import { TabContent } from "../types/tabs";

interface UseTabNavigationProps {
  initialTab: string;
  tabs: TabContent[];
}

export const useTabNavigation = ({
  initialTab,
  tabs,
}: UseTabNavigationProps) => {
  const [currentTab, setCurrentTab] = useState(initialTab);

  const handlePrev = () => {
    setCurrentTab((prev) => {
      const currentIndex = tabs.findIndex((tab) => tab.value === prev);
      const newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      return tabs[newIndex].value;
    });
  };

  const handleNext = () => {
    setCurrentTab((prev) => {
      const currentIndex = tabs.findIndex((tab) => tab.value === prev);
      const newIndex = (currentIndex + 1) % tabs.length;
      return tabs[newIndex].value;
    });
  };

  return {
    currentTab,
    handlePrev,
    handleNext,
  };
};
