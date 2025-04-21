import React from "react";
import { useLocalStorage } from "./useLocalStorage";
import useImage from "use-image";

interface Distance {
  points: [number, number];
  distance: number;
}

interface GcpPoint {
  x: number;
  y: number;
  x_natural: number;
  y_natural: number;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PreCrop {
  x: number;
  y: number;
  width: number;
  height: number;
  heightLength: number;
  heightLengthNatural: number;
  heightNatural: number;
  widthLength: number;
  widthLengthNatural: number;
  widthNatural: number;
  xNatural: number;
  yNatural: number;
}

interface ImageConfig {
  cropArea: CropArea;
  file: string | File | null;
  height: number;
  height1: number;
  height2: number;
  naturalHeight: number;
  naturalHeight1: number;
  naturalWidth: number;
  naturalWidth1: number;
  preCrop: PreCrop;
  width: number;
  width1: number;
  width2: number;
};

interface ImagesContextProps {
  distances: Distance[];
  setDistances: React.Dispatch<React.SetStateAction<Distance[]>>;
  gcpPoints: Record<string, GcpPoint>;
  setGcpPoints: React.Dispatch<React.SetStateAction<Record<string, GcpPoint>>>;
  image: HTMLImageElement | null;
  image1: HTMLImageElement | null;
  imageConfig: ImageConfig;
  setImageConfig: React.Dispatch<React.SetStateAction<ImageConfig>>;
  imageSrc: string | null;
  setImageSrc: React.Dispatch<React.SetStateAction<string | null>>;
  imageSrc1: string | null;
  setImageSrc1: React.Dispatch<React.SetStateAction<string | null>>;
}

const ImagesContext = React.createContext<ImagesContextProps | undefined>(
  undefined,
);

function ImagesProvider({ children }: { children: React.ReactNode }) {
  const [imageSrc, setImageSrc] = React.useState<string | null>(null);
  const [image] = useImage(imageSrc || "");
  const [imageSrc1, setImageSrc1] = React.useState<string | null>(null);
  const [image1] = useImage(imageSrc1 || "");
  const {
    item: imageConfig,
    saveItem: setImageConfig,
    // loading: imageConfigLoading,
    // error: imageConfigError,
  } = useLocalStorage<ImageConfig>("AWIVE_IMAGE_CONFIG", {
    cropArea: { x: 0, y: 0, width: 0, height: 0 },
    file: null,
    height: 0,
    height1: 0,
    height2: 0,
    naturalHeight: 0,
    naturalHeight1: 0,
    naturalWidth: 0,
    naturalWidth1: 0,
    preCrop: {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      heightLength: 0,
      heightLengthNatural: 0,
      heightNatural: 0,
      widthLength: 0,
      widthLengthNatural: 0,
      widthNatural: 0,
      xNatural: 0,
      yNatural: 0
    },
    width: 0,
    width1: 0,
    width2: 0
  });
  const {
    item: gcpPoints,
    saveItem: setGcpPoints,
    // loading: gcpPointsLoading,
    // error: gcpPointsError,
  } = useLocalStorage("AWIVE_GCP_POINTS", {});
  const {
    item: distances,
    saveItem: setDistances,
    // loading: distancesLoading,
    // error: distancesError,
  } = useLocalStorage<Distance[]>("AWIVE_DISTANCES", []);

  return (
    <ImagesContext.Provider
      value={{
        distances,
        setDistances,
        gcpPoints,
        setGcpPoints,
        image: image ?? null,
        image1: image1 ?? null,
        imageConfig,
        setImageConfig,
        imageSrc,
        imageSrc1,
        setImageSrc,
        setImageSrc1,
      }}
    >
      {children}
    </ImagesContext.Provider>
  );
}

export { ImagesContext, ImagesProvider };
export type { GcpPoint };
