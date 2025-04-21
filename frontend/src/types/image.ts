export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PreCrop {
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

export interface ImageConfig {
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
