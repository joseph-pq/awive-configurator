import React from 'react';
import useImage from "use-image";
const ImagesContext = React.createContext();

function ImagesProvider({children}) {
  const [imageSrc, setImageSrc] = React.useState(null);
  const [image] = useImage(imageSrc || "");

  return (
    <ImagesContext.Provider value={{
      image,
      imageSrc,
      setImageSrc
    }}>
      {children}
    </ImagesContext.Provider>
  );
}


export { ImagesContext , ImagesProvider };
