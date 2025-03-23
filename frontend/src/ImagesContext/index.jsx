import React from 'react';
import useImage from "use-image";
const ImagesContext = React.createContext();

function ImagesProvider({children}) {
  const [imageSrc, setImageSrc] = React.useState(null);
  const [image] = useImage(imageSrc || "");
  const [imageConfig, setImageConfig] = React.useState({});

  return (
    <ImagesContext.Provider value={{
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
