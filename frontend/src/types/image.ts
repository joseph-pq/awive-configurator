export interface CropArea {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  x1Natural: number;
  y1Natural: number;
  x2Natural: number;
  y2Natural: number;
}

export interface PreCrop {
  // Upper-Left corner in displayed image coordinates
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  // Size in displayed image coordinates
  // width: number;
  // height: number;
  // heightLength: number;
  // heightLengthNatural: number;
  // heightNatural: number;
  // widthLength: number;
  // widthLengthNatural: number;
  // widthNatural: number;
  // xNatural: number;
  // yNatural: number;
}

export interface ImageConfig {
  cropArea: CropArea;
  file: string | File | null;
  scaledHeight: number;
  height1: number;
  height2: number;
  originalHeight: number;
  naturalHeight1: number;
  originalWidth: number;
  naturalWidth1: number;
  preCrop: PreCrop;
  scaledWidth: number;
  width1: number;
  width2: number;
};



export interface ImageView {
  scaledWidth: number;
  scaledHeight: number;
  originalWidth: number;
  originalHeight: number;
}

export interface Session {
  file: string | File | null;
  homeView: ImageView;
  orthoView: ImageView;
  preCropView: ImageView;
  rotationView: ImageView;
  cropView: ImageView;
  preCrop: CropArea;
  crop: CropArea;
  rotation: number;
  rotationScale: number;
}
