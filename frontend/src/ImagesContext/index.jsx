import React from 'react';
import { useLocalStorage } from './useLocalStorage';
import useImage from "use-image";
const ImagesContext = React.createContext();

function ImagesProvider({children}) {
  const [imageSrc, setImageSrc] = React.useState(null);
  const [image] = useImage(imageSrc || "");
  const [imageSrc1, setImageSrc1] = React.useState(null);
  const [image1] = useImage(imageSrc1 || "");
  const {
    item: imageConfig,
    saveItem: setImageConfig,
    loading: imageConfigLoading,
    error: imageConfigError,
  } = useLocalStorage('AWIVE_IMAGE_CONFIG', {});
  const {
    item: gcpPoints,
    saveItem: setGcpPoints,
    loading: gcpPointsLoading,
    error: gcpPointsError,
  } = useLocalStorage('AWIVE_GCP_POINTS', {});
  const {
    item: distances,
    saveItem: setDistances,
    loading: distancesLoading,
    error: distancesError,
  } = useLocalStorage('AWIVE_DISTANCES', []);

  return (
    <ImagesContext.Provider value={{
      distances,
      setDistances,
      gcpPoints,
      setGcpPoints,
      image,
      image1,
      imageConfig,
      setImageConfig,
      imageSrc,
      setImageSrc,
      setImageSrc1,
    }}>
      {children}
    </ImagesContext.Provider>
  );
}


export { ImagesContext , ImagesProvider };
