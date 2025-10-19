import React from "react";
import { useLocalStorage } from "./useLocalStorage";
import useImage from "use-image";
import { ImageConfig, Session } from "../../types/image";
import { GcpPoint, Distance } from "../../types/gcp";

interface ImagesContextProps {
  distances: Distance[];
  setDistances: React.Dispatch<React.SetStateAction<Distance[]>>;
  gcpPoints: Record<string, GcpPoint>;
  setGcpPoints: React.Dispatch<React.SetStateAction<Record<string, GcpPoint>>>;
  imageOriginal: HTMLImageElement | null;
  imageOrthorectified: HTMLImageElement | null;
  imagePreCropped: HTMLImageElement | null;
  imageRotated: HTMLImageElement | null;
  imageCropped: HTMLImageElement | null;
  setImgSrcPreCropped: React.Dispatch<React.SetStateAction<string | null>>;
  setImgSrcRotated: React.Dispatch<React.SetStateAction<string | null>>;
  setImgSrcCropped: React.Dispatch<React.SetStateAction<string | null>>;
  imageConfig: ImageConfig;
  setImageConfig: React.Dispatch<React.SetStateAction<ImageConfig>>;
  imageSrcOriginal: string | null;
  setImgSrcOriginal: React.Dispatch<React.SetStateAction<string | null>>;
  imageSrcOrthorectified: string | null;
  setImgSrcOrthorectified: React.Dispatch<React.SetStateAction<string | null>>;
  session: Session;
  setSession: React.Dispatch<React.SetStateAction<Session>>;
}

const ImagesContext = React.createContext<ImagesContextProps | undefined>(
  undefined,
);

function ImagesProvider({ children }: { children: React.ReactNode }) {
  // step 0: original image
  const [imageSrcOriginal, setImgSrcOriginal] = React.useState<string | null>(null);
  const [imageOriginal] = useImage(imageSrcOriginal || "");
  // step 1: after orthorectification
  const [imageSrcOrthorectified, setImgSrcOrthorectified] = React.useState<string | null>(null);
  const [imageOrthorectified] = useImage(imageSrcOrthorectified || "");
  // step 2: after pre-cropping
  const [imageSrcPreCropped, setImgSrcPreCropped] = React.useState<string | null>(null);
  const [imagePreCropped] = useImage(imageSrcPreCropped || "");
  // step 3: after rotate
  const [imageSrcRotated, setImgSrcRotated] = React.useState<string | null>(null);
  const [imageRotated] = useImage(imageSrcRotated || "");
  // step 4: after crop
  const [imageSrcCropped, setImgSrcCropped] = React.useState<string | null>(null);
  const [imageCropped] = useImage(imageSrcCropped || "");

  const {
    item: imageConfig,
    saveItem: setImageConfig,
    // loading: imageConfigLoading,
    // error: imageConfigError,
  } = useLocalStorage<ImageConfig>("AWIVE_IMAGE_CONFIG", {
    cropArea: { x1: 0, y1: 0, x2: 0, y2: 0, x1Natural: 0, y1Natural: 0, x2Natural: 0, y2Natural: 0 },
    file: null,
    scaledHeight: 0,
    height1: 0,
    height2: 0,
    originalHeight: 0,
    naturalHeight1: 0,
    originalWidth: 0,
    naturalWidth1: 0,
    preCrop: {
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 0,
    },
    scaledWidth: 0,
    width1: 0,
    width2: 0,
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
  const {
    item: session,
    saveItem: setSession,
  } = useLocalStorage<Session>("AWIVEC_SESSION", {
    file: null,
    homeView: {
      scaledWidth: 0,
      scaledHeight: 0,
      originalWidth: 0,
      originalHeight: 0,
    },
    orthoView: {
      scaledWidth: 0,
      scaledHeight: 0,
      originalWidth: 0,
      originalHeight: 0,
    },
    preCropView: {
      scaledWidth: 0,
      scaledHeight: 0,
      originalWidth: 0,
      originalHeight: 0,
    },
    rotationView: {
      scaledWidth: 0,
      scaledHeight: 0,
      originalWidth: 0,
      originalHeight: 0,
    },
    cropView: {
      scaledWidth: 0,
      scaledHeight: 0,
      originalWidth: 0,
      originalHeight: 0,
    },
    crop: { x1: 0, y1: 0, x2: 0, y2: 0, x1Natural: 0, y1Natural: 0, x2Natural: 0, y2Natural: 0 },
    preCrop: { x1: 0, y1: 0, x2: 0, y2: 0, x1Natural: 0, y1Natural: 0, x2Natural: 0, y2Natural: 0 },
    rotation: 0,
    rotationScale: 1,
    depths: [],
  });

  return (
    <ImagesContext.Provider
      value={{
        distances,
        setDistances,
        gcpPoints,
        setGcpPoints,
        imageOriginal: imageOriginal ?? null,
        imageOrthorectified: imageOrthorectified ?? null,
        imagePreCropped: imagePreCropped ?? null,
        imageRotated: imageRotated ?? null,
        imageCropped: imageCropped ?? null,
        imageConfig,
        setImageConfig,
        imageSrcOriginal,
        imageSrcOrthorectified,
        setImgSrcOriginal,
        setImgSrcOrthorectified,
        setImgSrcPreCropped,
        setImgSrcRotated,
        setImgSrcCropped,
        session,
        setSession,
      }}
    >
      {children}
    </ImagesContext.Provider>
  );
}

export { ImagesContext, ImagesProvider };
export type { GcpPoint };
