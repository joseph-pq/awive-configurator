export interface TabComponentProps {
  handleNext: () => void;
  handlePrev: () => void;
}

export interface TabContent {
  label: string;
  value: string;
  component: React.ComponentType<TabComponentProps>;
}
