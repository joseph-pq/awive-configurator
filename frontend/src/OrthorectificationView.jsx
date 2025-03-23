import React, { useState, useRef } from "react";
import { Stage, Layer, Image as KonvaImage, Circle } from "react-konva";

import useImage from "use-image";
import {
  Toolbar,
  AppBar,
  Button,
  Box,
  Typography,
  Slider,
  Container,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import SaveIcon from "@mui/icons-material/Save";

export default function OrthorectificationView() {
  // const [imageSrc, setImageSrc] = useState(null);
  // const [gcpPoints, setGcpPoints] = useState([]);
  // const fileInputRef = useRef(null);
  // const [image] = useImage(imageSrc || "");

  // // Handle image upload
  // const handleImageUpload = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onload = () => setImageSrc(reader.result);
  //     reader.readAsDataURL(file);
  //   }
  // };

  // // Handle GCP selection
  // const handleCanvasClick = (e) => {
  //   const stage = e.target.getStage();
  //   const pointer = stage.getPointerPosition();
  //   setGcpPoints([...gcpPoints, pointer]);
  // };
  return (
    <Container sx={{ textAlign: "center", mt: 4 }}>
      {/* {/1* Upload Button *1/} */}
      {/* <input */}
      {/*   type="file" */}
      {/*   accept="image/*" */}
      {/*   hidden */}
      {/*   ref={fileInputRef} */}
      {/*   onChange={handleImageUpload} */}
      {/* /> */}
      {/* <Button */}
      {/*   variant="contained" */}
      {/*   component="span" */}
      {/*   startIcon={<CloudUploadIcon />} */}
      {/*   onClick={() => fileInputRef.current.click()} */}
      {/* > */}
      {/*   Upload Image */}
      {/* </Button> */}

      {/* <Box mt={3} sx={{ display: "flex", justifyContent: "center" }}> */}
      {/*   {image && ( */}
      {/*     <Stage width={500} height={500} onClick={handleCanvasClick}> */}
      {/*       <Layer> */}
      {/*         <KonvaImage */}
      {/*           image={image} */}
      {/*           x={250} // Center X (Stage width / 2) */}
      {/*           y={250} // Center Y (Stage height / 2) */}
      {/*           width={500} */}
      {/*           height={500} */}
      {/*           rotation={rotation} */}
      {/*           offsetX={250} // Rotate around center X */}
      {/*           offsetY={250} // Rotate around center Y */}
      {/*         /> */}
      {/*         {gcpPoints.map((point, index) => ( */}
      {/*           <Circle */}
      {/*             key={index} */}
      {/*             x={point.x} */}
      {/*             y={point.y} */}
      {/*             radius={5} */}
      {/*             fill="red" */}
      {/*           /> */}
      {/*         ))} */}
      {/*       </Layer> */}
      {/*     </Stage> */}
      {/*   )} */}
      {/* </Box> */}

      {/* {/1* Rotation Slider *1/} */}
      {/* <Box sx={{ mt: 2, width: 300, mx: "auto" }}> */}
      {/*   <Typography gutterBottom>Rotation</Typography> */}
      {/*   <Slider */}
      {/*     value={rotation} */}
      {/*     onChange={(e, newValue) => setRotation(newValue)} */}
      {/*     min={0} */}
      {/*     max={360} */}
      {/*     step={1} */}
      {/*     aria-labelledby="rotation-slider" */}
      {/*   /> */}
      {/* </Box> */}

      {/* {/1* Action Buttons *1/} */}
      {/* <Box mt={2}> */}
      {/*   <Button */}
      {/*     variant="contained" */}
      {/*     color="secondary" */}
      {/*     startIcon={<RotateRightIcon />} */}
      {/*     onClick={() => setRotation(rotation + 90)} */}
      {/*     sx={{ mx: 1 }} */}
      {/*   > */}
      {/*     Rotate 90° */}
      {/*   </Button> */}

      {/*   <Button */}
      {/*     variant="contained" */}
      {/*     color="success" */}
      {/*     startIcon={<SaveIcon />} */}
      {/*     onClick={() => console.log("Selected GCPs:", gcpPoints)} */}
      {/*     sx={{ mx: 1 }} */}
      {/*   > */}
      {/*     Save GCPs */}
      {/*   </Button> */}
      </Box>
    </Container>
  );
}
