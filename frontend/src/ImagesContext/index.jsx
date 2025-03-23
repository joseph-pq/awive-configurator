import React from 'react';
import { useLocalStorage } from './useLocalStorage';
import useImage from "use-image";
const ImagesContext = React.createContext();

function ImagesProvider({children}) {
  const [imageSrc, setImageSrc] = React.useState(null);
  const [image] = useImage(imageSrc || "");
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
      imageConfig,
      setImageConfig,
      imageSrc,
      setImageSrc
    }}>
      {children}
    </ImagesContext.Provider>
  );
}


export { ImagesContext , ImagesProvider };
